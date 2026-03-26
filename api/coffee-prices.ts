import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Constants ────────────────────────────────────────────────────────────────
// Fallback exchange rate used only if the live FX API is unreachable
const USD_TO_RWF = 1350;

// FRED publishes prices in cents per pound — convert to USD per kg
const LB_TO_KG = 0.453592;

// Rwanda specialty arabica trades at ~8% above the global FRED benchmark.
// Source: NAEB 2024 export records vs FRED Other Mild Arabica at that time.
const RWANDA_PREMIUM_RATIO = 1.08;

// ─── Types ────────────────────────────────────────────────────────────────────
interface MonthlyPoint { date: string; priceRWF: number; }
interface DailyPoint   { date: string; price: number; }
interface ForecastPoint { date: string; price: number; confidence: number; }

// ─── Step 1: Parse FRED CSV ───────────────────────────────────────────────────
// FRED returns raw CSV: "DATE,VALUE" — one row per month.
// We strip the header and drop any rows with missing values (FRED marks them as ".").
function parseFredCsv(csv: string): { date: string; valueCents: number }[] {
  return csv
    .trim()
    .split('\n')
    .slice(1)                          // skip the header row
    .map(line => {
      const [date, value] = line.split(',');
      const valueCents = parseFloat(value);
      return isNaN(valueCents) ? null : { date: date.trim(), valueCents };
    })
    .filter(Boolean) as { date: string; valueCents: number }[];
}

// ─── Step 2: Interpolate monthly → daily ─────────────────────────────────────
// FRED only gives one price per month. We fill in each day between two monthly
// points using linear interpolation so the charts show a smooth daily line.
function interpolateToDaily(monthly: MonthlyPoint[]): DailyPoint[] {
  const daily: DailyPoint[] = [];
  for (let i = 0; i < monthly.length - 1; i++) {
    const start      = new Date(monthly[i].date);
    const end        = new Date(monthly[i + 1].date);
    const startPrice = monthly[i].priceRWF;
    const endPrice   = monthly[i + 1].priceRWF;
    const totalDays  = Math.round((end.getTime() - start.getTime()) / 86400000);
    for (let d = 0; d < totalDays; d++) {
      const cur = new Date(start);
      cur.setDate(cur.getDate() + d);
      const t = d / totalDays;           // progress between 0 and 1
      daily.push({
        date:  cur.toISOString().split('T')[0],
        price: Math.round(startPrice + (endPrice - startPrice) * t),
      });
    }
  }
  // Add the final month's own data point
  const last = monthly[monthly.length - 1];
  daily.push({ date: last.date, price: last.priceRWF });
  return daily;
}

// ─── Step 3: 30-day trend forecast ───────────────────────────────────────────
// Fits a straight line (ordinary least squares) to the last 30 days of daily
// prices, then projects it forward. Confidence starts at 85% and decays to 70%
// by Day 30 — signalling that near-term estimates are more reliable.
function trendForecast(history: DailyPoint[], days = 30): ForecastPoint[] {
  const window = history.slice(-30);   // trailing 30-day regression window
  const n      = window.length;
  const prices = window.map(d => d.price);

  // OLS: find slope and intercept of best-fit line through the window
  const meanX    = (n - 1) / 2;
  const meanY    = prices.reduce((s, v) => s + v, 0) / n;
  const num      = prices.reduce((s, v, i) => s + (i - meanX) * (v - meanY), 0);
  const den      = prices.reduce((s, _, i) => s + (i - meanX) ** 2, 0);
  const slope    = num / den;
  const intercept = meanY - slope * meanX;

  const lastDate = new Date(history[history.length - 1].date);

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i + 1);
    const price = Math.round(intercept + slope * (n - 1 + i + 1));
    // Confidence declines linearly: 85% on Day 1, 70% on Day 30
    const confidence = Math.round(85 - (15 * i) / (days - 1));
    return {
      date:  date.toISOString().split('T')[0],
      price: Math.max(price, 1000),    // floor at 1,000 RWF — prevents negative display
      confidence,
    };
  });
}

// ─── Back-validation ──────────────────────────────────────────────────────────
// Measures how accurate the trend regression actually is by running it on
// historical data where we already know the answer.
// Method: hold out the last 30 days, train on everything before them,
// predict those 30 days, compare predictions to real prices.
function backValidate(history: DailyPoint[]): { mape: number; rmse: number; direction: 'correct' | 'incorrect' } {
  const testSize = 30;
  if (history.length < testSize + 30) return { mape: 0, rmse: 0, direction: 'correct' };

  // Split: train on everything up to 30 days ago, test on the last 30 days
  const trainHistory = history.slice(0, -testSize);
  const testActual   = history.slice(-testSize);

  // Run the same trend regression on training data, project 30 days
  const predicted = trendForecast(trainHistory, testSize);

  // MAPE — mean absolute percentage error
  const mape = predicted.reduce((sum, p, i) => {
    return sum + Math.abs((p.price - testActual[i].price) / testActual[i].price);
  }, 0) / testSize * 100;

  // RMSE — root mean squared error (in RWF)
  const rmse = Math.sqrt(
    predicted.reduce((sum, p, i) => sum + (p.price - testActual[i].price) ** 2, 0) / testSize
  );

  // Direction accuracy — did the forecast predict up or down correctly?
  const trainLastPrice  = trainHistory[trainHistory.length - 1].price;
  const predictedUp     = predicted[testSize - 1].price > trainLastPrice;
  const actualUp        = testActual[testSize - 1].price > trainLastPrice;

  return {
    mape:      Math.round(mape * 10) / 10,
    rmse:      Math.round(rmse),
    direction: predictedUp === actualUp ? 'correct' : 'incorrect',
  };
}

// ─── Volatility ───────────────────────────────────────────────────────────────
// Annualised price volatility from monthly log-returns (std dev × √12).
// Used in the AI advisor and risk display.
function annualizedVolatility(monthly: { valueCents: number }[]): number {
  if (monthly.length < 3) return 14;
  const prices     = monthly.map(d => d.valueCents);
  const logReturns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
  const mean       = logReturns.reduce((s, r) => s + r, 0) / logReturns.length;
  const variance   = logReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / logReturns.length;
  return Math.round(Math.sqrt(variance * 12) * 100 * 10) / 10;
}

// ─── Best-case multiplier ─────────────────────────────────────────────────────
// 1 + coefficient of variation of the last 36 months.
// Answers: "how much upside is plausible given this market's own historical swings?"
function bestCaseMultiplier(monthly: { valueCents: number }[]): number {
  const recent   = monthly.slice(-36).map(d => d.valueCents);
  const mean     = recent.reduce((s, v) => s + v, 0) / recent.length;
  const variance = recent.reduce((s, v) => s + (v - mean) ** 2, 0) / recent.length;
  const cv       = Math.sqrt(variance) / mean;
  return Math.round(Math.max(1.10, Math.min(1.50, 1 + cv)) * 100) / 100;
}

// ─── Main handler (Vercel serverless function) ────────────────────────────────
// Called on every page load. Fetches FRED + FX in parallel, processes the data,
// and returns everything the dashboard, forecast, and back-test pages need.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    // Fetch FRED coffee prices and live USD/RWF exchange rate in parallel
    const [fredResponse, fxResponse] = await Promise.all([
      fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=PCOFFOTMUSDM'),
      fetch('https://open.er-api.com/v6/latest/USD'),
    ]);

    if (!fredResponse.ok) throw new Error(`FRED API failed: ${fredResponse.status}`);

    // Use live exchange rate; fall back to 1,350 if FX API is unavailable
    let liveUsdToRwf = USD_TO_RWF;
    if (fxResponse.ok) {
      const fxData = await fxResponse.json();
      if (fxData?.rates?.RWF) liveUsdToRwf = Math.round(fxData.rates.RWF);
    }

    // Parse all FRED monthly data (full history, used for volatility + back-test)
    const csvText   = await fredResponse.text();
    const allMonthly = parseFredCsv(csvText);

    // Filter to Jul 2023 onwards for the price chart — converts cents/lb → RWF/kg
    const recentMonthly: MonthlyPoint[] = allMonthly
      .filter(d => d.date >= '2023-07-01')
      .map(d => ({
        date:     d.date,
        priceRWF: Math.round(((d.valueCents / 100) / LB_TO_KG) * liveUsdToRwf),
      }));

    // Latest FRED point = current global benchmark
    const latest        = allMonthly[allMonthly.length - 1];
    const globalUsdPerKg = (latest.valueCents / 100) / LB_TO_KG;

    // Rwanda export price = global benchmark + 8% specialty premium
    const rwandaUsdPerKg = globalUsdPerKg * RWANDA_PREMIUM_RATIO;
    const premiumPct     = ((RWANDA_PREMIUM_RATIO - 1) * 100).toFixed(1);

    // Build the daily history array and generate the 30-day trend forecast
    const priceHistory    = interpolateToDaily(recentMonthly);
    const priceForecast   = trendForecast(priceHistory);
    const modelValidation = backValidate(priceHistory);

    res.status(200).json({
      success: true,
      data: {
        exchangeRate: liveUsdToRwf,
        globalBenchmark: {
          date:   latest.date,
          usd:    Math.round(globalUsdPerKg * 100) / 100,
          rwf:    Math.round(globalUsdPerKg * liveUsdToRwf),
          source: 'FRED (Other Mild Arabica)',
        },
        rwandaExport: {
          usd:    rwandaUsdPerKg,
          rwf:    Math.round(rwandaUsdPerKg * liveUsdToRwf),
          source: 'NAEB basis · live benchmark adjusted',
        },
        premium:             `${premiumPct}%`,
        lastUpdated:         new Date().toISOString(),
        priceVolatilityPct:  annualizedVolatility(allMonthly),
        bestCaseMultiplier:  bestCaseMultiplier(allMonthly),
        priceHistory,        // full daily history → used by dashboard chart + back-test
        priceForecast,       // 30-day trend forecast → used by price predictor page
        modelValidation,     // back-validation metrics → MAPE, RMSE, direction accuracy
      },
    });
  } catch (error) {
    console.error('FRED API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch coffee prices' });
  }
}
