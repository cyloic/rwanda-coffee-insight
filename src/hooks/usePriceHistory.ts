import { useState, useEffect } from 'react';
import { generatePriceHistory, generateForecast } from '@/data/sampleData';
import { generateLSTMForecast, LSTMWeights } from '@/lib/lstmInference';
export interface PricePoint {
  date: string;
  price: number;
}

export interface ForecastPoint {
  date: string;
  price: number;
  confidence: number;
  upperBand: number;
  lowerBand: number;
}

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

// Derive buy/sell signal from model's own confidence intervals — no hardcoded threshold.
// A signal fires only when the 30-day forecast change exceeds the average CI half-width,
// meaning the trend is distinguishable from the model's own noise floor.
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

  // Noise floor = average CI half-width across all 30 forecast days (as % of price)
  const thresholdPct = forecast.reduce((sum, d) => {
    return sum + (d.upperBand - d.lowerBand) / 2 / d.price * 100;
  }, 0) / forecast.length;

  const peakDay = forecast.reduce(
    (best, d, i) => d.price > best.price ? { price: d.price, day: i + 1 } : best,
    { price: 0, day: 0 }
  ).day;

  if (priceChangePct > thresholdPct) {
    return { recommendation: `WAIT ${peakDay} DAYS`, direction: 'up', thresholdPct, peakDay };
  }
  if (priceChangePct < -thresholdPct) {
    return { recommendation: 'SELL NOW', direction: 'down', thresholdPct, peakDay };
  }
  return { recommendation: 'NEUTRAL', direction: 'neutral', thresholdPct, peakDay };
}

// Baseline RWF price at end of model training data (2023-08-04)
const BASE_PRICE_RWF = 7845;

export function usePriceHistory() {
  // Delegates to the LSTM-enhanced implementation — all callers automatically get real LSTM inference.
  return useLSTMPriceHistory();
}

export function useLSTMPriceHistory() {
  const staticHistory = generatePriceHistory();
  const staticForecast = generateForecast(staticHistory[staticHistory.length - 1].price);

  const [history, setHistory]                     = useState<PricePoint[]>(staticHistory);
  const [forecast, setForecast]                   = useState<ForecastPoint[]>(staticForecast);
  const [isLive, setIsLive]                       = useState(false);
  const [loading, setLoading]                     = useState(true);
  const [volatility, setVolatility]               = useState(14);
  const [bestCaseMultiplier, setBestCaseMultiplier] = useState(1.35);
  const [forecastSource, setForecastSource]       = useState<'static' | 'trend' | 'lstm'>('static');

  useEffect(() => {
    let liveHistory: PricePoint[] = [];
    let liveRate = 1350;

    fetch('/api/coffee-prices')
      .then(r => r.json())
      .then(result => {
        if (result.success && result.data.priceHistory?.length) {
          liveHistory = result.data.priceHistory;
          liveRate    = result.data.exchangeRate ?? 1350;

          setHistory(liveHistory);
          setForecast(addBands(result.data.priceForecast)); // trend forecast — shown immediately
          if (result.data.priceVolatilityPct) setVolatility(result.data.priceVolatilityPct);
          if (result.data.bestCaseMultiplier) setBestCaseMultiplier(result.data.bestCaseMultiplier);
          setIsLive(true);
          setForecastSource('trend');

          // Phase 2: upgrade to real LSTM forecast
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
        const raw      = generateLSTMForecast(prices, liveRate, weights, lastDate);
        const bands: ForecastPoint[] = raw.map(d => {
          const bandPct = (100 - d.confidence) / 100 * 0.15;
          return {
            date:       d.date,
            price:      d.price,
            confidence: d.confidence,
            upperBand:  Math.round(d.price * (1 + bandPct)),
            lowerBand:  Math.round(d.price * (1 - bandPct)),
          };
        });
        setForecast(bands);
        setForecastSource('lstm');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const livePrice      = history[history.length - 1]?.price ?? BASE_PRICE_RWF;
  const priceMultiplier = livePrice / BASE_PRICE_RWF;

  return { history, forecast, isLive, loading, priceMultiplier, volatility, bestCaseMultiplier, forecastSource };
}
