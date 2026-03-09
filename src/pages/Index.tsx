import StatCards from "@/components/StatCards";
import RwandaMap from "@/components/RwandaMap";
import TopOpportunities from "@/components/TopOpportunities";
import PriceChart from "@/components/PriceChart";
import { REGIONS, Region, LSTM_7_DAY_PREDICTIONS } from "@/data/sampleData";
import { formatPrice } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { useState, useEffect } from "react";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import "leaflet/dist/leaflet.css";

interface CoffeePrices {
  globalBenchmark: { date: string; usd: number; rwf: number; source: string };
  rwandaExport: { usd: number; rwf: number; source: string };
  premium: string;
  lastUpdated: string;
}

export default function Index() {
  const { currency, rwfToUsd } = useCurrency();
  const [selected, setSelected] = useState<Region | null>(null);
  const [livePrices, setLivePrices] = useState<CoffeePrices | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  // Live price history + forecast (falls back to static data locally)
  const { history, forecast, isLive } = usePriceHistory();

  const lastPrice = history[history.length - 1].price;
  const predictedPrice = forecast[forecast.length - 1].price;
  const priceChange = ((predictedPrice - lastPrice) / lastPrice * 100).toFixed(1);
  const peakDay = forecast.reduce((best, d, i) => d.price > best.price ? { price: d.price, day: i + 1 } : best, { price: 0, day: 0 });
  const signal = Number(priceChange) > 1 ? `HOLD — Wait ${peakDay.day} days` : Number(priceChange) < -1 ? "SELL NOW" : "NEUTRAL";

  // Fetch current benchmark + premium prices (separate concern from history)
  useEffect(() => {
    async function fetchLivePrices() {
      try {
        setPricesLoading(true);
        const response = await fetch('/api/coffee-prices');
        if (response.ok) {
          const result = await response.json();
          if (result.success) setLivePrices(result.data);
        }
      } catch {
        // Fallback shown only when API is unavailable (local dev)
        setLivePrices({
          globalBenchmark: { date: '2026-01-01', usd: 3.64, rwf: 4913, source: 'FRED (Other Mild Arabica)' },
          rwandaExport: { usd: 6.20, rwf: 8370, source: 'NAEB (Rwanda Official)' },
          premium: '70.0%',
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setPricesLoading(false);
      }
    }
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6 animate-fade-in">
      {/* Hero title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="section-heading mb-1">Rwanda Coffee Intelligence</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Investment Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time risk-adjusted opportunity scoring across 5 primary coffee districts
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-data">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-rwandaGreen animate-pulse" />
          Last updated: {new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </div>
      </div>

      {/* Live Market Prices */}
      {livePrices && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Global Benchmark */}
          <div className="stat-card">
            <p className="section-heading mb-2">Global Benchmark</p>
            {pricesLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="font-data text-3xl font-bold text-foreground tracking-tight">
                  {currency === "USD" 
                    ? `$${livePrices.globalBenchmark.usd.toFixed(2)}`
                    : `${livePrices.globalBenchmark.rwf.toLocaleString()} RWF`
                  }/kg
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currency === "USD" 
                    ? `${livePrices.globalBenchmark.rwf.toLocaleString()} RWF`
                    : `$${livePrices.globalBenchmark.usd.toFixed(2)} USD`
                  }
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">{livePrices.globalBenchmark.source}</p>
              </>
            )}
          </div>

          {/* Rwanda Export Price */}
          <div className="stat-card">
            <p className="section-heading mb-2">Rwanda Export Price</p>
            {pricesLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="font-data text-3xl font-bold text-gold tracking-tight">
                  {currency === "USD" 
                    ? `$${livePrices.rwandaExport.usd.toFixed(2)}`
                    : `${livePrices.rwandaExport.rwf.toLocaleString()} RWF`
                  }/kg
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currency === "USD" 
                    ? `${livePrices.rwandaExport.rwf.toLocaleString()} RWF`
                    : `$${livePrices.rwandaExport.usd.toFixed(2)} USD`
                  }
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">{livePrices.rwandaExport.source}</p>
              </>
            )}
          </div>

          {/* Rwanda Premium */}
          <div className="stat-card">
            <p className="section-heading mb-2">Rwanda Premium</p>
            {pricesLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="font-data text-3xl font-bold text-rwandaGreen tracking-tight">
                  {livePrices.premium}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  above global benchmark
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-rwandaGreen">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                  <span className="text-xs font-data text-rwandaGreen">Specialty-grade Arabica</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* LSTM Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card">
          <p className="section-heading mb-2">LSTM Prediction (Next Day)</p>
          <p className="font-data text-3xl font-bold text-rwandaGreen tracking-tight">
            {currency === "USD" 
              ? `$${LSTM_7_DAY_PREDICTIONS[0].priceUSD}`
              : `${LSTM_7_DAY_PREDICTIONS[0].priceRWF.toLocaleString()} RWF`
            }/kg
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {currency === "USD" 
              ? `${LSTM_7_DAY_PREDICTIONS[0].priceRWF.toLocaleString()} RWF`
              : `$${LSTM_7_DAY_PREDICTIONS[0].priceUSD} USD`
            }
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs font-data text-green-600">
              Confidence: {LSTM_7_DAY_PREDICTIONS[0].confidence}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <p className="section-heading mb-2">7-Day LSTM Forecast</p>
          <p className="font-data text-3xl font-bold text-foreground tracking-tight">
            {currency === "USD" 
              ? `$${LSTM_7_DAY_PREDICTIONS[6].priceUSD}`
              : `${LSTM_7_DAY_PREDICTIONS[6].priceRWF.toLocaleString()} RWF`
            }/kg
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Day 7 prediction
          </p>
          <div className="mt-3">
            <span className="text-xs text-muted-foreground">
              Trend: 
              {LSTM_7_DAY_PREDICTIONS[6].priceRWF > LSTM_7_DAY_PREDICTIONS[0].priceRWF 
                ? " Increasing" 
                : " Declining"
              }
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatCards />

      {/* Map + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card overflow-hidden" style={{ minHeight: 440 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="section-heading">Interactive Region Map</p>
            <span className="text-xs text-muted-foreground">Click a region for details</span>
          </div>
          <div style={{ height: 400 }}>
            <RwandaMap
              regions={REGIONS}
              onRegionClick={setSelected}
              selectedRegion={selected}
            />
          </div>
        </div>

        {/* Top opportunities sidebar */}
        <div className="rounded-lg border border-border bg-card p-4">
          <TopOpportunities />
          {selected && (
            <div className="mt-4 pt-4 border-t border-border animate-fade-in">
              <p className="section-heading mb-2">Selected: {selected.name}</p>
              <div className="space-y-1.5 text-sm">
                {[
                  { label: "Investment Score", value: `${selected.score}/100` },
                  { label: "Projected ROI", value: `${selected.roi}%` },
                  { label: "Risk Rate", value: `${selected.riskPercent}%` },
                  { label: "Farmers", value: selected.farmerCount.toLocaleString() },
                  { label: "Weather Score", value: `${selected.weatherScore}/100` },
                  { label: "Infrastructure", value: `${selected.infrastructureScore}/100` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-muted-foreground text-xs">{row.label}</span>
                    <span className="font-data text-xs font-semibold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{selected.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Price forecast chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <PriceChart
          title={`Coffee Price: Historical + 30-Day Forecast (${currency}/kg)${isLive ? " · Live" : ""}`}
          showForecast={true}
          height={240}
          history={history}
          forecast={forecast}
        />
        <div className="mt-3 flex flex-wrap gap-6 border-t border-border pt-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Current Price</p>
            <p className="font-data text-lg font-bold text-gold">{formatPrice(currency === "USD" ? rwfToUsd(lastPrice) : lastPrice, currency)}/kg</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">30-Day Forecast</p>
            <p className="font-data text-lg font-bold text-rwandaGreen">{formatPrice(currency === "USD" ? rwfToUsd(predictedPrice) : predictedPrice, currency)}/kg</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Signal</p>
            <p className="font-data text-lg font-bold text-foreground">{signal}</p>
          </div>
        </div>
      </div>
    </div>
  );
}