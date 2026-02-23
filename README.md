# Rwanda Coffee Insight

A comprehensive platform for exploring Rwanda's coffee market insights, pricing trends, regional analysis, and ROI calculations. This application provides data-driven insights to coffee producers, traders, and investors looking to understand market dynamics and optimize their business decisions.

## 🎥 Video Demo

[Watch App Demo on Google Drive](https://drive.google.com/file/d/1ndsd2jQ5vSCpl_OijlOeY2ozMqLyhQJc/view?usp=sharing)

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
(https://github.com/user-attachments/assets/0dd3010b-03e0-4e44-bff5-7781720b3243)


#### Price Chart & Trends
![Price Chart](https://raw.githubusercontent.com/cyloic/rwanda-coffee-insight/main/Coffee%20UI%20Screenshots/ss2.jpg)
*Interactive price trend analysis and visualization*

#### Regional Analysis
![Regional Analysis](https://raw.githubusercontent.com/cyloic/rwanda-coffee-insight/main/Coffee%20UI%20Screenshots/ss3.jpg)
*Regional breakdown of market data with location mapping*

#### Market Opportunities
![Opportunities](https://raw.githubusercontent.com/cyloic/rwanda-coffee-insight/main/Coffee%20UI%20Screenshots/sss4.jpg)
*Top opportunities in the coffee supply chain*

#### ROI Calculator
![ROI Calculator](https://raw.githubusercontent.com/cyloic/rwanda-coffee-insight/main/Coffee%20UI%20Screenshots/ss5.jpg)
*Return on investment calculation tool*

#### Market Analytics
![Analytics](https://raw.githubusercontent.com/cyloic/rwanda-coffee-insight/main/Coffee%20UI%20Screenshots/ss77.jpg)
*Detailed market analytics and statistics*

#### Data Management
![Data View](https://raw.githubusercontent.com/cyloic/rwanda-coffee-insight/main/Coffee%20UI%20Screenshots/ss8.jpg)
*Comprehensive data tables and export options*

### Figma Design

[View complete design mockups on Figma](https://figma.com) *(Design link to be updated)*

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
