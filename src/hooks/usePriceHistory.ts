import { useState, useEffect } from 'react';
import { generatePriceHistory, generateForecast } from '@/data/sampleData';

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

export function usePriceHistory() {
  const staticHistory = generatePriceHistory();
  const staticForecast = generateForecast(staticHistory[staticHistory.length - 1].price);

  const [history, setHistory] = useState<PricePoint[]>(staticHistory);
  const [forecast, setForecast] = useState<ForecastPoint[]>(staticForecast);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/coffee-prices')
      .then(r => r.json())
      .then(result => {
        if (result.success && result.data.priceHistory?.length) {
          setHistory(result.data.priceHistory);
          setForecast(addBands(result.data.priceForecast));
          setIsLive(true);
        }
      })
      .catch(() => {
        // API unavailable locally — static fallback stays active silently
      })
      .finally(() => setLoading(false));
  }, []);

  return { history, forecast, isLive, loading };
}
