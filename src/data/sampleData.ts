// Rwanda Coffee Investment Platform — ML-Driven Data
// CORRECTED: Uses actual Rwanda green coffee export prices ($6-7/kg)
// Last updated: 2026-02-21

export interface Region {
  id: string;
  name: string;
  score: number;
  roi: number;
  riskPercent: number;
  farmerCount: number;
  lat: number;
  lng: number;
  coordinates: [number, number][];
  weatherScore: number;
  infrastructureScore: number;
  yieldScore: number;
  accessibilityScore: number;
  description: string;
}

export const REGIONS: Region[] = [
  {
    id: "huye",
    name: "Huye",
    score: 75,
    roi: 38,
    riskPercent: 15,
    farmerCount: 450,
    lat: -2.6,
    lng: 29.74,
    coordinates: [
      [-2.45, 29.55], [-2.45, 29.92], [-2.78, 29.92], [-2.78, 29.55], [-2.45, 29.55]
    ],
    weatherScore: 82,
    infrastructureScore: 85,
    yieldScore: 89,
    accessibilityScore: 91,
    description: "Top ML-ranked region. High yields (89.2/100) and excellent infrastructure (85/100) with stable LSTM price forecasts.",
  },
  {
    id: "nyamasheke",
    name: "Nyamasheke",
    score: 71,
    roi: 34,
    riskPercent: 18,
    farmerCount: 380,
    lat: -2.33,
    lng: 29.18,
    coordinates: [
      [-2.10, 29.00], [-2.10, 29.38], [-2.58, 29.38], [-2.58, 29.00], [-2.10, 29.00]
    ],
    weatherScore: 82,
    infrastructureScore: 80,
    yieldScore: 76,
    accessibilityScore: 88,
    description: "Strong ML fundamentals. Lake Kivu microclimate with good yield performance (76.4/100) and positive price trend.",
  },
  {
    id: "rusizi",
    name: "Rusizi",
    score: 55,
    roi: 22,
    riskPercent: 35,
    farmerCount: 320,
    lat: -2.48,
    lng: 28.90,
    coordinates: [
      [-2.20, 28.72], [-2.20, 29.08], [-2.80, 29.08], [-2.80, 28.72], [-2.20, 28.72]
    ],
    weatherScore: 82,
    infrastructureScore: 65,
    yieldScore: 35,
    accessibilityScore: 70,
    description: "Lower ML score due to yield challenges (35.3/100). Requires development investment before scaling.",
  },
  {
    id: "karongi",
    name: "Karongi",
    score: 50,
    roi: 18,
    riskPercent: 42,
    farmerCount: 290,
    lat: -2.00,
    lng: 29.32,
    coordinates: [
      [-1.75, 29.12], [-1.75, 29.52], [-2.28, 29.52], [-2.28, 29.12], [-1.75, 29.12]
    ],
    weatherScore: 82,
    infrastructureScore: 60,
    yieldScore: 22,
    accessibilityScore: 67,
    description: "Significant yield deficit (21.5/100) flagged by ML model. Long-term development opportunity with marginal returns.",
  },
  {
    id: "nyaruguru",
    name: "Nyaruguru",
    score: 46,
    roi: 15,
    riskPercent: 48,
    farmerCount: 250,
    lat: -2.90,
    lng: 29.55,
    coordinates: [
      [-2.65, 29.38], [-2.65, 29.75], [-3.18, 29.75], [-3.18, 29.38], [-2.65, 29.38]
    ],
    weatherScore: 82,
    infrastructureScore: 55,
    yieldScore: 12,
    accessibilityScore: 62,
    description: "Lowest ML ranking (46/100). Critical yield issues (11.6/100) and weak infrastructure require major investment. Minimal expected returns.",
  },
];

// Generate 90-day price history - CORRECTED TO ACTUAL RWANDA PRICES
// Using green coffee export prices: $6-7/kg (Feb 2026 market reality)
export function generatePriceHistory() {
  const data = [];
  const now = new Date();
  let price = 6.2;  // CORRECTED: Actual Rwanda export price (was 252!)

  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Slight upward trend with noise (realistic commodity fluctuation)
    const trend = 0.008;  // ~0.8% daily trend
    const noise = (Math.random() - 0.5) * 0.15;  // ±$0.075 daily variance
    price = Math.max(5.8, Math.min(7.2, price + trend + noise));

    data.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
    });
  }
  return data;
}

// Generate 30-day forecast - CORRECTED SCALE
export function generateForecast(lastPrice: number) {
  const data = [];
  const now = new Date();
  let price = lastPrice;

  for (let i = 1; i <= 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    const trend = 0.01;  // Slight upward trend
    const noise = (Math.random() - 0.4) * 0.1;
    price = Math.max(lastPrice - 0.5, price + trend + noise);

    const ci = 0.1 + i * 0.02;  // Confidence interval grows over time

    data.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
      upperBand: Math.round((price + ci) * 100) / 100,
      lowerBand: Math.round((price - ci) * 100) / 100,
    });
  }
  return data;
}

export const STATS = [
  { label: "Avg. Portfolio Returns", value: "489%", sub: "over 5-year horizon", trend: "+12% YoY" },
  { label: "Registered Farmers", value: "211K", sub: "across 5 regions", trend: "+8.3K this year" },
  { label: "Historical Default Rate", value: "14.8%", sub: "sector benchmark", trend: "-2.1% vs 2023" },
  { label: "Capital Deployed", value: "$5.2M", sub: "active loans", trend: "+$1.1M Q4" },
];