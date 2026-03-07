import type { VercelRequest, VercelResponse } from '@vercel/node';

const USD_TO_RWF = 1350;
const LB_TO_KG = 0.453592;
// Official NAEB (Rwanda) average export price for green coffee — updated from 2025 report
const RWANDA_EXPORT_USD_PER_KG = 6.20;

interface MonthlyPoint { date: string; priceRWF: number; }
interface DailyPoint { date: string; price: number; }
interface ForecastPoint { date: string; price: number; confidence: number; }

function parseFredCsv(csv: string): { date: string; valueCents: number }[] {
  return csv
    .trim()
    .split('\n')
    .slice(1) // skip header row
    .map(line => {
      const [date, value] = line.split(',');
      const valueCents = parseFloat(value);
      return isNaN(valueCents) ? null : { date: date.trim(), valueCents };
    })
    .filter(Boolean) as { date: string; valueCents: number }[];
}

// Converts FRED cents/lb to RWF/kg (global benchmark — no Rwanda premium applied)
function toGlobalRWF(valueCents: number): number {
  const usdPerKg = (valueCents / 100) / LB_TO_KG;
  return Math.round(usdPerKg * USD_TO_RWF);
}

function interpolateToDaily(monthly: MonthlyPoint[]): DailyPoint[] {
  const daily: DailyPoint[] = [];
  for (let i = 0; i < monthly.length - 1; i++) {
    const start = new Date(monthly[i].date);
    const end = new Date(monthly[i + 1].date);
    const startPrice = monthly[i].priceRWF;
    const endPrice = monthly[i + 1].priceRWF;
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000);
    for (let d = 0; d < totalDays; d++) {
      const cur = new Date(start);
      cur.setDate(cur.getDate() + d);
      const t = d / totalDays;
      daily.push({
        date: cur.toISOString().split('T')[0],
        price: Math.round(startPrice + (endPrice - startPrice) * t),
      });
    }
  }
  const last = monthly[monthly.length - 1];
  daily.push({ date: last.date, price: last.priceRWF });
  return daily;
}

function trendForecast(history: DailyPoint[], days = 30): ForecastPoint[] {
  // Use last 30 data points for the regression window
  const window = history.slice(-30);
  const n = window.length;
  const prices = window.map(d => d.price);

  // Ordinary least squares linear regression
  const meanX = (n - 1) / 2;
  const meanY = prices.reduce((s, v) => s + v, 0) / n;
  const num = prices.reduce((s, v, i) => s + (i - meanX) * (v - meanY), 0);
  const den = prices.reduce((s, _, i) => s + (i - meanX) ** 2, 0);
  const slope = num / den;
  const intercept = meanY - slope * meanX;

  const lastDate = new Date(history[history.length - 1].date);

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i + 1);
    const price = Math.round(intercept + slope * (n - 1 + i + 1));
    // Confidence declines from 85% (day 1) to 70% (day 30)
    const confidence = Math.round(85 - (15 * i) / (days - 1));
    return {
      date: date.toISOString().split('T')[0],
      price: Math.max(price, 1000),
      confidence,
    };
  });
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch(
      'https://fred.stlouisfed.org/graph/fredgraph.csv?id=PCOFFOTMUSDM'
    );

    if (!response.ok) throw new Error(`FRED API failed: ${response.status}`);

    const csvText = await response.text();
    const allMonthly = parseFredCsv(csvText);

    // Filter from July 2023 onwards — price history shows global benchmark
    const recentMonthly: MonthlyPoint[] = allMonthly
      .filter(d => d.date >= '2023-07-01')
      .map(d => ({ date: d.date, priceRWF: toGlobalRWF(d.valueCents) }));

    // Current global benchmark from latest FRED data point
    const latest = allMonthly[allMonthly.length - 1];
    const globalUsdPerKg = (latest.valueCents / 100) / LB_TO_KG;

    // Rwanda export price from NAEB official figure (not derived from FRED)
    const rwandaUsdPerKg = RWANDA_EXPORT_USD_PER_KG;
    const premiumPct = ((rwandaUsdPerKg / globalUsdPerKg - 1) * 100).toFixed(1);

    // Build daily global benchmark history and 30-day trend forecast
    const priceHistory = interpolateToDaily(recentMonthly);
    const priceForecast = trendForecast(priceHistory);

    res.status(200).json({
      success: true,
      data: {
        globalBenchmark: {
          date: latest.date,
          usd: Math.round(globalUsdPerKg * 100) / 100,
          rwf: Math.round(globalUsdPerKg * USD_TO_RWF),
          source: 'FRED (Other Mild Arabica)',
        },
        rwandaExport: {
          usd: rwandaUsdPerKg,
          rwf: Math.round(rwandaUsdPerKg * USD_TO_RWF),
          source: 'NAEB 2025 Report',
        },
        premium: `${premiumPct}%`,
        lastUpdated: new Date().toISOString(),
        priceHistory,
        priceForecast,
      },
    });
  } catch (error) {
    console.error('FRED API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch coffee prices' });
  }
}
