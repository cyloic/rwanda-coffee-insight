# Rwanda Coffee Insight

A data-driven investment intelligence platform for Rwanda's specialty coffee sector. Built for agricultural lenders, cooperative financiers, and impact investors who need live market data, regional scoring, and on-ground infrastructure visibility before deploying capital.

## Video Demo

[Watch App Demo on Google Drive](https://drive.google.com/file/d/1kgtAejUj_1dp_AWkauU1SzirWb8q1KXv/view?usp=sharing)

## Live Demo

[https://rwanda-coffee-insight.vercel.app/](https://rwanda-coffee-insight.vercel.app/)

## GitHub Repository

[https://github.com/cyloic/rwanda-coffee-insight](https://github.com/cyloic/rwanda-coffee-insight)

---

## Platform Features

### Dashboard
Live market prices fetched from the FRED Other Mild Arabica series (ICO-sourced). Shows global benchmark, Rwanda export price (8% specialty premium per NAEB 2024), and the live RWF/USD exchange rate. Price cards only render when live data is confirmed — no stale fallback values shown.

### Price Predictor
30-day momentum trend forecast on FRED monthly data, interpolated to daily values. Uses a weighted linear regression on a 90-day trailing window. Uncertainty bands widen over the horizon — Day 1–14 signals are actionable; Day 15–30 are directional only. Includes a methodology disclosure panel so the approach is fully transparent.

### Regional Analysis
Comparative investment scoring across 5 primary coffee districts (Huye, Nyamasheke, Rusizi, Karongi, Nyaruguru). Scores derived from the ML model in `Notebook/Rwanda_Coffee_ML.ipynb`. Risk percentages tied to altitude data from the Rwanda Meteorological Agency — higher altitude correlates with lower CBD disease pressure and lower default risk. Drill-down detail modal with score breakdown and a direct link to washing stations per district.

### ROI Calculator
Models best-case, expected, and worst-case returns using:
- Live export price (FRED × 1.08 Rwanda premium)
- Production cost: $1.75/kg (World Bank Rwanda smallholder 2023)
- Altitude factor per region
- 15% agricultural fund participation rate
- Risk materialisation at 10% / 50% / 100% across scenarios

Investment amount is entered via a free-text input with USD quick-select presets ($50K–$300K), converted to RWF using the live exchange rate.

### Back-Test
Validates the ROI model against real historical FRED prices. Select a region, amount, and look-back period (6 / 12 / 18 / 24 months). The entry and exit prices are actual FRED data points — no modelled values. Includes a step-by-step calculation breakdown panel so every number is traceable.

### Washing Stations
28 verified coffee washing stations across all 5 districts, sourced from NAEB, the Alliance for Coffee Excellence (Cup of Excellence Rwanda), and specialty importers (Sustainable Harvest, Covoya, Buf Coffee, Kopakama). Each station shows altitude, farmer count, varietals, processing methods, certifications, and verified CoE results where applicable. Interactive Leaflet map with district colour-coding and CoE winner markers. Clicking a station opens an inline detail panel — the map stays fully visible. Direct Google Maps and importer profile links included.

### AI Market Advisor
Rule-based advisor on the Price Predictor page using live context (current price, forecast direction, peak day, volatility, confidence). Handles questions on timing, regional ROI comparison, price drivers, forecast reliability, risk factors, entry-point analysis, and harvest seasonality. No external API dependency — works instantly with zero cost.

---

## Data Sources

| Data | Source | Update frequency |
|---|---|---|
| Global arabica benchmark | FRED — Other Mild Arabica (`PCOFFOTMUSDM`) | Monthly (ICO, ~4–6 week lag) |
| RWF/USD exchange rate | open.er-api.com | Live on page load |
| Rwanda specialty premium | NAEB Annual Report 2024 | Annual |
| Production cost | World Bank Rwanda smallholder 2023 | Annual |
| Regional investment scores | ML model — `Notebook/Rwanda_Coffee_ML.ipynb` | Model output |
| Risk rates | Altitude proxy — Rwanda Meteorological Agency | Static |
| Farmer counts | NAEB cooperative registry 2022/23 | Annual |
| Washing station data | NAEB, Cup of Excellence, specialty importers | Last verified March 2026 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| UI components | shadcn-ui |
| Charts | Recharts |
| Maps | Leaflet |
| Serverless functions | Vercel Edge Functions (Node.js) |
| ML notebook | Python — scikit-learn, pandas, FRED API |
| Package manager | Bun |

---

## Project Structure

```
src/
├── components/
│   ├── CoffeeChat.tsx       # Rule-based AI market advisor
│   ├── Navbar.tsx
│   ├── RwandaMap.tsx        # Leaflet region map (dashboard)
│   └── ui/                  # shadcn-ui primitives
├── pages/
│   ├── Index.tsx            # Dashboard
│   ├── PricePredictor.tsx   # Trend forecast + AI advisor
│   ├── RegionalAnalysis.tsx # Sortable region table + detail modal
│   ├── ROICalculator.tsx    # Scenario modeller
│   ├── Backtest.tsx         # Historical return validation
│   └── Stations.tsx         # Washing station map + directory
├── data/
│   ├── sampleData.ts        # Region definitions (scores, risk, farmers)
│   └── washingStations.ts   # 28 verified CWS records
├── hooks/
│   └── usePriceHistory.ts   # FRED data fetch + trend forecast
├── lib/
│   └── lstmInference.ts     # LSTM forward-pass (browser TypeScript)
└── context/
    └── CurrencyContext.tsx  # Live RWF/USD toggle

api/
├── coffee-prices.ts         # Vercel function — FRED fetch + trend forecast
└── exchange-rate.ts         # Vercel function — live FX rate

Notebook/
└── Rwanda_Coffee_ML.ipynb   # ML training: regional scoring, LSTM

public/
└── lstmModel/weights.json   # Trained LSTM weights (1.1 MB)

deployment/
└── scaler_params.json       # MinMaxScaler params from sklearn
```

---

## Getting Started

### Prerequisites

- Node.js v18+ or Bun

### Local Development

```sh
git clone https://github.com/cyloic/rwanda-coffee-insight.git
cd rwanda-coffee-insight
bun install
bun run dev
```

App runs at `http://localhost:5173`. The serverless API functions (`/api/*`) require Vercel CLI for local execution:

```sh
npm i -g vercel
vercel dev
```

### Production Build

```sh
bun run build
bun run preview
```

---

## Testing Results

### Model Performance

Trained model metrics stored in `deployment/model_config.json`:

| Metric | Result |
|---|---|
| Model type | LSTM — 30-step sequence, 5 input features |
| MAPE | 1.08% |
| MAE | 0.0411 USD/kg |
| RMSE | 0.0557 USD/kg |
| Trained | 2026-03-05 |

Note: current coffee prices (~$8.68/kg) exceed the LSTM training ceiling ($5.70/kg). The app runs a trend forecast in production. The LSTM weights are shipped and the inference engine is live — retraining on 2024–2026 data would re-enable the LSTM path.

### Forecast Method

| Path | Method | Status |
|---|---|---|
| Trend forecast | Weighted linear regression on 90-day FRED window | Active (production) |
| LSTM forecast | Two-layer LSTM, 64 units × 2, browser TypeScript | OOD guard active — prices above training ceiling |

### Edge Cases

| Scenario | Behaviour |
|---|---|
| FRED API unavailable | Live price cards hidden; no stale data shown |
| LSTM out-of-distribution | Silently falls back to trend forecast |
| Exchange rate API unavailable | Falls back to 1,350 RWF/USD |
| Look-back period exceeds history | Back-test shows "not enough data" message |

### Build

| Check | Result |
|---|---|
| Unit tests | 1 file, 1 test, 0 failures (Vitest) |
| Production build | Passing (Vite + Bun) |
| TypeScript | 0 errors |
| Deployment | Vercel — auto-deploy on push to `main` |

---

## Deployment

Deployed on Vercel. Auto-deploys on every push to `main`. No environment variables required for the frontend. The `/api/coffee-prices` serverless function calls FRED and open.er-api.com — both are public endpoints with no API key required.

---

**Last Updated**: March 2026
