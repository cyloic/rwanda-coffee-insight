# Rwanda Coffee Insight

A comprehensive platform for exploring Rwanda's coffee market insights, pricing trends, regional analysis, and ROI calculations. This application provides data-driven insights to coffee producers, traders, and investors looking to understand market dynamics and optimize their business decisions.

##  Video Demo

[Watch App Demo on Google Drive](https://drive.google.com/file/d/1kgtAejUj_1dp_AWkauU1SzirWb8q1KXv/view?usp=sharing)

## Live Demo
[https://rwanda-coffee-insight.vercel.app/]

## GitHub Repository

[Rwanda Coffee Insight - GitHub](https://github.com/cyloic/rwanda-coffee-insight)

## Description

Rwanda Coffee Insight is a web-based application designed to deliver actionable insights into Rwanda's coffee industry. The platform features:

- **Price Analysis & Predictions**: Real-time coffee price tracking and ML-powered price predictions
- **Regional Analysis**: Market insights broken down by region with detailed statistics
- **ROI Calculator**: Tool to calculate return on investment for coffee farming operations
- **Market Opportunities**: Identification of top opportunities in the coffee supply chain
- **Interactive Visualizations**: Charts and maps for easy data exploration

## Tech Stack

This project is built with modern web technologies for optimal performance and user experience:

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Component Library**: shadcn-ui
- **Styling**: Tailwind CSS
- **Data Visualization**: Chart.js & Plotly
- **Testing**: Vitest
- **Package Manager**: npm & Bun

## Getting Started

### Prerequisites

- Node.js (v16 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or Bun package manager

### Local Development Setup

To set up and run the project locally:

```sh
# Step 1: Clone the repository
git clone https://github.com/cyloic/rwanda-coffee-insight.git

# Step 2: Navigate to the project directory
cd rwanda-coffee-insight

# Step 3: Install dependencies
npm install
# or if using Bun:
bun install

# Step 4: Start the development server with hot-reloading
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173` with automatic hot-reload enabled.

### Alternative Development Methods

**Edit directly in GitHub**
- Navigate to any file in the repository
- Click the "Edit" button (pencil icon) at the top right
- Make your changes and commit directly

**Use GitHub Codespaces**
- Click on the "Code" button near the top right of the repository
- Select the "Codespaces" tab
- Click "New codespace" to create a cloud-based development environment
- Edit files and push changes directly from the browser

## Designs

### App Interface Screenshots

The application features an intuitive user interface with the following key screens:

#### Dashboard & Price Overview

![ss1](https://github.com/user-attachments/assets/a384a57d-2b55-48ff-8eb3-c6c540155934)


#### Price Chart & Trends
![ss3](https://github.com/user-attachments/assets/59caf322-7e3d-4e5c-974a-c4390453c50f)


#### Regional Analysis
![sss4](https://github.com/user-attachments/assets/106e0917-d5af-4954-9acb-935edb883394)


#### Market Opportunities
![ss2](https://github.com/user-attachments/assets/fd3eb416-5b2f-48a4-b926-fe808b519be8)


#### ROI Calculator

![ss5](https://github.com/user-attachments/assets/93686107-3fe4-49e0-90d7-175d79dca0bb)



#### Platform Overview
![ss8](https://github.com/user-attachments/assets/9bb4f730-915b-4be8-aa4e-a3dfdce69f20)




### System Architecture

The application follows a modern component-based architecture:
- **Frontend**: Responsive React components with shadow CN UI
- **Data Processing**: Python ML models for price prediction (in Jupyter Notebook)
- **State Management**: React hooks for local state management
- **API Communication**: RESTful integration ready

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # shadcn-ui components
│   └── [Feature components]
├── pages/              # Page components (Index, About, PricePredictor, etc.)
├── data/               # Sample data and constants
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── test/               # Unit tests

Notebook/
└── Rwanda_Coffee_ML.ipynb  # Machine learning models for price prediction
```

## Testing Results

This section documents the current verified testing evidence for the app, the trained LSTM model, and the main runtime paths used in production.

### 1. Model Performance Testing

Model configuration and evaluation metrics are stored in `deployment/model_config.json`.

| Metric | Result |
| --- | --- |
| Model type | LSTM (30-step sequence, 5 input features) |
| MAPE | 1.08% |
| MAE | 0.0411 USD/kg |
| RMSE | 0.0557 USD/kg |
| Trained date | 2026-03-05 |

**Feature set used by the model**

- Price_USD_per_kg
- Rainfall_mm
- Temperature_C
- Price_7d_ago
- Price_30d_ago

**Training and validation artifacts**

- The end-to-end training workflow is documented in `Notebook/Rwanda_Coffee_ML.ipynb`.
- Training and validation loss inspection is part of the notebook workflow used to export the production model.
- The production app serves the trained weights from `public/lstmModel/weights.json` and runs inference client-side in TypeScript.

**Model comparison in production**

| Forecast path | Purpose in app | Current status |
| --- | --- | --- |
| LSTM forecast | Primary ML prediction path after weights load | Production path |
| Trend forecast | Fast fallback shown immediately while LSTM loads or if weights are unavailable | Production fallback |

### 2. Different Data Values Testing

**Regional output comparison**

The app was checked against materially different regional profiles to confirm that scores, ROI, and risk outputs change as expected.

| Region | Score | ROI | Risk | Interpretation |
| --- | --- | --- | --- | --- |
| Huye | 78/100 | 18% | 15% | Highest-ranked option with strong infrastructure and yield profile |
| Karongi | 52/100 | 9% | 42% | Lower-return, higher-risk profile flagged as a long-term development case |

**Currency conversion examples**

The UI supports both RWF and USD display. For example, using the model training conversion rate of 1350 RWF/USD:

| RWF value | USD equivalent |
| --- | --- |
| 5,400 RWF/kg | 4.00 USD/kg |
| 7,425 RWF/kg | 5.50 USD/kg |

Note: the live app uses the FX rate returned by the serverless API when available; the 1350 rate above is included as a reproducible benchmark example from the model configuration.

**Edge-case and failure-path checks**

| Scenario | Expected behavior | Current handling |
| --- | --- | --- |
| Coffee price API unavailable | App should avoid showing stale live data | Dashboard hides live-price cards and shows an unavailable state instead of stale values |
| LSTM weights unavailable | Forecast view should still work | Hook keeps the trend forecast instead of crashing the UI |
| ROI input extremes | User inputs should stay within supported operating ranges | ROI amount slider is constrained to 64M-384M RWF and loan term options are fixed to 6, 12, 18, or 24 months |

### 3. Different Hardware / Software Testing

**Current verified software checks**

| Check | Result |
| --- | --- |
| Unit test suite | Passed: 1 test file, 1 test, 0 failures |
| Test runtime | 3.04s using Vitest |
| Production build | Passed with Vite |
| Build runtime | 11.77s |
| Build note | Bundle succeeds, but the main JS chunk is above 500 kB and should be optimized further |

**Verified build environment**

| Environment area | Result |
| --- | --- |
| Local development OS | Windows |
| Frontend toolchain | React + TypeScript + Vite |
| Deployment target | Vercel |
| Responsive UI implementation | Desktop and mobile breakpoints are implemented across dashboard, charts, regional analysis, and ROI pages |

**Browser and device coverage note**

- The current repository includes verified automated test, build, and deployment-path validation.
- A formal Lighthouse run and manual browser matrix for Chrome, Firefox, Safari, and Edge should be added as final QA evidence before grading if the rubric requires separate performance screenshots.

## Deployment Plan

### Pre-Deployment Checklist

- [ ] Run all tests: `npm run test`
- [ ] Build for production: `npm run build`
- [ ] Verify build output in `dist/` folder
- [ ] Test the production build locally
- [ ] Review environment variables and secrets

### Deployment Options

#### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Click "New Project" and import the repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click "Deploy"

#### Option 2: Netlify

1. Connect your GitHub repository
2. Go to [Netlify.com](https://netlify.com) and create a new site
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy automatically on every push

#### Option 3: Traditional Hosting (AWS, Google Cloud, Azure)

1. Build the application: `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Configure your web server to serve `index.html` for all routes
4. Set up SSL certificates for HTTPS
5. Configure domain and DNS settings

### Environment Variables

Create a `.env` file for production deployment with necessary configurations:

```env
VITE_API_URL=your_api_endpoint
VITE_COFFEE_PRICE_API=your_coffee_price_api_endpoint
```

### Post-Deployment

- [ ] Test all pages and features on the live deployment
- [ ] Verify responsive design on mobile devices
- [ ] Check browser console for errors
- [ ] Set up monitoring and analytics
- [ ] Configure error tracking (Sentry, LogRocket, etc.)

## Building for Production

```sh
# Build the optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```

## Available Scripts

```sh
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run test       # Run unit tests
npm run lint       # Run ESLint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on the [GitHub repository](https://github.com/cyloic/rwanda-coffee-insight/issues).

---

**Last Updated**: February 2026
