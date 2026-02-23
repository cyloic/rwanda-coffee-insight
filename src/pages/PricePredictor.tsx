import PriceChart from "@/components/PriceChart";
import { useMemo } from "react";
import { generatePriceHistory, generateForecast } from "@/data/sampleData";
import { TrendingUp, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

export default function PricePredictor() {
  const history = useMemo(() => generatePriceHistory(), []);
  const lastPrice = history[history.length - 1].price;
  const firstPrice = history[0].price;
  const forecast = useMemo(() => generateForecast(lastPrice), [lastPrice]);
  const predictedPrice = forecast[forecast.length - 1].price;
  const priceChange = ((predictedPrice - lastPrice) / lastPrice * 100).toFixed(1);
  const peakDay = forecast.reduce((best, d, i) => d.price > best.price ? { price: d.price, day: i + 1 } : best, { price: 0, day: 0 });
  const recommendation = Number(priceChange) > 1 ? `WAIT ${peakDay.day} DAYS` : Number(priceChange) < -1 ? "SELL NOW" : "HOLD";
  const today = new Date().toISOString().split("T")[0];

  const forecastData = forecast.map((d) => ({
    date: d.date.slice(5),
    price: d.price,
    upper: d.upperBand,
    lower: d.lowerBand,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded border border-border bg-card px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload[0] && (
          <p className="font-data font-semibold text-rwandaGreen">
            Forecast: ${payload[0].value?.toFixed(2)}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6 animate-fade-in">
      <div className="border-b border-border pb-4">
        <p className="section-heading mb-1">Market Intelligence</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Price Predictor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ML-powered 30-day price forecast with confidence intervals
        </p>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Current Price", value: `$${lastPrice.toFixed(2)}`, sub: "per kg (USD)", color: "text-gold" },
          { label: "30-Day Forecast", value: `$${predictedPrice.toFixed(2)}`, sub: "per kg (USD)", color: "text-rwandaGreen" },
          { label: "Expected Change", value: `+${priceChange}%`, sub: "over 30 days", color: "text-rwandaGreen" },
          { label: "Confidence", value: `${Math.max(70, Math.min(95, Math.round(85 - Math.abs(Number(priceChange)) * 0.5)))}%`, sub: "model accuracy", color: "text-foreground" },
        ].map((card) => (
          <div key={card.label} className="stat-card">
            <p className="section-heading mb-2">{card.label}</p>
            <p className={`font-data text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recommendation banner */}
      <div className="rounded-lg border border-rwandaGreen/40 bg-rwandaGreen/10 p-4 flex items-start gap-3">
        <Clock className="h-5 w-5 text-rwandaGreen flex-shrink-0 mt-0.5" />
        <div>
        <p className="text-sm font-bold text-rwandaGreen">RECOMMENDATION: {recommendation}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Model predicts a {Number(priceChange) > 0 ? "+" : ""}{priceChange}% price change over the next 30 days.
            {Number(priceChange) > 1
              ? ` Delay disbursement until the peak window (approx. Day ${Math.max(1, peakDay.day - 2)}–${peakDay.day + 2}) to maximize loan-to-value ratio.`
              : Number(priceChange) < -1
              ? " Consider accelerating disbursement before further decline."
              : " Market is stable — proceed at your discretion."}
          </p>
        </div>
      </div>

      {/* Historical chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <PriceChart title="90-Day Historical Price (USD/kg)" showForecast={false} height={240} />
      </div>

      {/* Forecast chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="section-heading">30-Day Price Forecast with Confidence Interval</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-5 rounded-sm bg-rwandaGreen/20 border border-rwandaGreen/40" />
              95% CI Band
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 bg-rwandaGreen" />
              Forecast
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={forecastData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="hsl(24 12% 18%)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(40 10% 55%)", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "hsl(40 10% 55%)", fontSize: 10, fontFamily: "monospace" }}
              tickFormatter={(v) => `$${v}`}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="hsl(152 100% 33% / 0.15)"
              name="Upper CI"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="hsl(24 15% 8%)"
              name="Lower CI"
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(152 100% 45%)"
              strokeWidth={2}
              fill="none"
              name="Forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk factors */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="section-heading mb-4">Forecast Risk Factors</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: CheckCircle2, color: "text-rwandaGreen", bg: "bg-rwandaGreen/10", title: "Seasonal Pattern", desc: "Strong harvest season correlation. Q1 typically shows price strength." },
            { icon: AlertTriangle, color: "text-gold", bg: "bg-gold/10", title: "Currency Volatility", desc: "RWF/USD fluctuation may impact local payout rates by ±3%." },
            { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", title: "Climate Risk", desc: "La Niña pattern increases rainfall variability in Nov–Dec window." },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className={`rounded-lg p-3 ${bg} flex gap-3`}>
              <Icon className={`h-4 w-4 ${color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`font-semibold ${color} text-xs mb-1`}>{title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
