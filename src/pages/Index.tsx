import StatCards from "@/components/StatCards";
import RwandaMap from "@/components/RwandaMap";
import TopOpportunities from "@/components/TopOpportunities";
import PriceChart from "@/components/PriceChart";
import { REGIONS, Region, generatePriceHistory, generateForecast } from "@/data/sampleData";
import { useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";

export default function Index() {
  const [selected, setSelected] = useState<Region | null>(null);

  const history = useMemo(() => generatePriceHistory(), []);
  const lastPrice = history[history.length - 1].price;
  const forecast = useMemo(() => generateForecast(lastPrice), [lastPrice]);
  const predictedPrice = forecast[forecast.length - 1].price;
  const priceChange = ((predictedPrice - lastPrice) / lastPrice * 100).toFixed(1);

  // Find optimal sell day (peak price in forecast)
  const peakDay = forecast.reduce((best, d, i) => d.price > best.price ? { price: d.price, day: i + 1 } : best, { price: 0, day: 0 });
  const signal = Number(priceChange) > 1 ? `HOLD — Wait ${peakDay.day} days` : Number(priceChange) < -1 ? "SELL NOW" : "NEUTRAL";

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
        <PriceChart title="Coffee Price: Historical + 30-Day Forecast" showForecast={true} height={240} />
        <div className="mt-3 flex flex-wrap gap-6 border-t border-border pt-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Current Price</p>
            <p className="font-data text-lg font-bold text-gold">${lastPrice.toFixed(2)}/kg</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">30-Day Forecast</p>
            <p className="font-data text-lg font-bold text-rwandaGreen">${predictedPrice.toFixed(2)}/kg</p>
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
