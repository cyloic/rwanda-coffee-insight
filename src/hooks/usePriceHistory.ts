import { useState, useEffect } from 'react';
import { generatePriceHistory, generateForecast } from '@/data/sampleData';
import { generateLSTMForecast, LSTMWeights } from '@/lib/lstmInference';

export interface PricePoint   { date: string; price: number; }
export interface ForecastPoint { date: string; price: number; confidence: number; upperBand: number; lowerBand: number; }

// ─── Uncertainty bands ────────────────────────────────────────────────────────
// Converts a raw forecast (price + confidence) into upper/lower bands.
// Band width = (1 - confidence) × 15% of price — wider as confidence decays.
function addBands(points: { date: string; price: number; confidence: number }[]): ForecastPoint[] {
  return points.map(d => {
    const bandPct = (100 - d.confidence) / 100 * 0.15;
    return {
      ...d,
      upperBand: Math.round(d.price * (1 + bandPct)),
      lowerBand: Math.round(d.price * (1 - bandPct)),
    };
  });
}

// ─── Investment signal ────────────────────────────────────────────────────────
// Derives a buy/hold/sell signal from the forecast without any hardcoded threshold.
// Signal fires only when the 30-day price change exceeds the model's own average
// uncertainty band — meaning the trend is stronger than the noise.
export function computeSignal(forecast: ForecastPoint[], lastPrice: number): {
  recommendation: string;
  direction: 'up' | 'down' | 'neutral';
  thresholdPct: number;
  peakDay: number;
} {
  if (!forecast.length || !lastPrice) {
    return { recommendation: 'NEUTRAL', direction: 'neutral', thresholdPct: 0, peakDay: 0 };
  }

  const predictedPrice = forecast[forecast.length - 1].price;
  const priceChangePct = (predictedPrice - lastPrice) / lastPrice * 100;

  // Noise floor = average CI half-width as % of price across all 30 days
  const thresholdPct = forecast.reduce((sum, d) => {
    return sum + (d.upperBand - d.lowerBand) / 2 / d.price * 100;
  }, 0) / forecast.length;

  // Day of the highest forecast price (optimal disbursement window)
  const peakDay = forecast.reduce(
    (best, d, i) => d.price > best.price ? { price: d.price, day: i + 1 } : best,
    { price: 0, day: 0 }
  ).day;

  if (priceChangePct > thresholdPct)  return { recommendation: `WAIT ${peakDay} DAYS`, direction: 'up',      thresholdPct, peakDay };
  if (priceChangePct < -thresholdPct) return { recommendation: 'SELL NOW',              direction: 'down',    thresholdPct, peakDay };
                                      return { recommendation: 'NEUTRAL',               direction: 'neutral', thresholdPct, peakDay };
}

// ─── Baseline price ───────────────────────────────────────────────────────────
// Used to compute priceMultiplier: how much prices have moved vs. the
// reference point when regional ROI values were originally calibrated.
const BASE_PRICE_RWF = 7845; // FRED Other Mild Arabica, August 2023

// ─── Main hook ────────────────────────────────────────────────────────────────
// Single entry point for all pages — returns live price history + forecast.
export function usePriceHistory() {
  return useLSTMPriceHistory();
}

export function useLSTMPriceHistory() {
  // Start with static data so the UI renders instantly before the API responds
  const staticHistory  = generatePriceHistory();
  const staticForecast = generateForecast(staticHistory[staticHistory.length - 1].price);

  const [history,            setHistory]            = useState<PricePoint[]>(staticHistory);
  const [forecast,           setForecast]           = useState<ForecastPoint[]>(staticForecast);
  const [isLive,             setIsLive]             = useState(false);
  const [loading,            setLoading]            = useState(true);
  const [volatility,         setVolatility]         = useState(14);
  const [bestCaseMultiplier, setBestCaseMultiplier] = useState(1.35);
  const [forecastSource,     setForecastSource]     = useState<'static' | 'trend' | 'lstm'>('static');

  useEffect(() => {
    let liveHistory: PricePoint[] = [];
    let liveRate = 1350;

    // Phase 1 — fetch live FRED data and trend forecast from our Vercel API
    fetch('/api/coffee-prices')
      .then(r => r.json())
      .then(result => {
        if (result.success && result.data.priceHistory?.length) {
          liveHistory = result.data.priceHistory;
          liveRate    = result.data.exchangeRate ?? 1350;

          setHistory(liveHistory);
          setForecast(addBands(result.data.priceForecast)); // show trend forecast immediately
          if (result.data.priceVolatilityPct) setVolatility(result.data.priceVolatilityPct);
          if (result.data.bestCaseMultiplier) setBestCaseMultiplier(result.data.bestCaseMultiplier);
          setIsLive(true);
          setForecastSource('trend');

          // Phase 2 — attempt to upgrade to LSTM forecast (loads weights in background)
          return fetch('/lstmModel/weights.json');
        }
      })
      .then(weightsRes => {
        if (!weightsRes?.ok) return;
        return weightsRes.json();
      })
      .then((weights: LSTMWeights | undefined) => {
        if (!weights || !liveHistory.length) return;

        const prices   = liveHistory.map(p => p.price);
        const lastDate = liveHistory[liveHistory.length - 1].date;

        // OOD guard: LSTM trained on data up to ~$5.70/kg (Aug 2023 ceiling).
        // Current prices (~$8.68/kg) are outside that range — running the model
        // would extrapolate back toward its training range, producing a fake crash signal.
        // We stay on the trend forecast instead and label it honestly.
        const LSTM_TRAINING_MAX_USD = 5.696;
        const recentAvgUsd = prices.slice(-5).reduce((s, p) => s + p / liveRate, 0) / 5;
        if (recentAvgUsd > LSTM_TRAINING_MAX_USD) return; // skip LSTM, keep trend

        const raw: ForecastPoint[] = generateLSTMForecast(prices, liveRate, weights, lastDate).map(d => {
          const bandPct = (100 - d.confidence) / 100 * 0.15;
          return { date: d.date, price: d.price, confidence: d.confidence, upperBand: Math.round(d.price * (1 + bandPct)), lowerBand: Math.round(d.price * (1 - bandPct)) };
        });
        setForecast(raw);
        setForecastSource('lstm');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // priceMultiplier reflects how far current prices have moved from the Aug 2023 baseline
  const livePrice       = history[history.length - 1]?.price ?? BASE_PRICE_RWF;
  const priceMultiplier = livePrice / BASE_PRICE_RWF;

  return { history, forecast, isLive, loading, priceMultiplier, volatility, bestCaseMultiplier, forecastSource };
}
