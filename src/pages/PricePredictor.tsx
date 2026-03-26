import PriceChart from "@/components/PriceChart";
import CoffeeChat from "@/components/CoffeeChat";
import { Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { usePriceHistory, computeSignal } from "@/hooks/usePriceHistory";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function PricePredictor() {
  const { currency, rwfToUsd } = useCurrency();
  const { history, forecast, isLive, forecastSource, volatility, validation } = usePriceHistory();
  const lastPrice = history[history.length - 1].price;
  const predictedPrice = forecast[forecast.length - 1].price;
  const priceChange = ((predictedPrice - lastPrice) / lastPrice * 100).toFixed(1);
  const { recommendation, direction, peakDay } = computeSignal(forecast, lastPrice);

  const avgConfidence = Math.round(forecast.reduce((sum, d) => sum + (d.confidence ?? 70), 0) / forecast.length);

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
            Forecast: {formatPrice(currency === "USD" ? rwfToUsd(payload[0].value) : payload[0].value, currency)}
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
          30-day momentum trend forecast · FRED Other Mild Arabica · interpolated daily
        </p>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Current Price", value: formatPrice(currency === "USD" ? rwfToUsd(lastPrice) : lastPrice, currency), sub: `per kg (${currency})`, color: "text-gold" },
          { label: "30-Day Forecast", value: formatPrice(currency === "USD" ? rwfToUsd(predictedPrice) : predictedPrice, currency), sub: `per kg (${currency})`, color: "text-rwandaGreen" },
          { label: "Expected Change", value: `+${priceChange}%`, sub: "over 30 days", color: "text-rwandaGreen" },
          { label: "Trend Certainty", value: `${avgConfidence}%`, sub: "decays over horizon", color: "text-foreground" },
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
            {direction === 'up'
              ? ` Delay disbursement until the peak window (approx. Day ${Math.max(1, peakDay - 2)}–${peakDay + 2}) to maximize loan-to-value ratio.`
              : direction === 'down'
              ? " Consider accelerating disbursement before further decline."
              : " Market is stable — proceed at your discretion."}
          </p>
        </div>
      </div>

      {/* Historical chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <PriceChart
          title={`Historical Price (${currency}/kg)${isLive ? " · Live" : ""}`}
          showForecast={false}
          height={240}
          history={history}
          historyDays={isLive ? 180 : 90}
        />
      </div>

      {/* Forecast chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="section-heading">
            30-Day Trend Forecast with Uncertainty Bands
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="rounded border border-border px-2 py-0.5 font-data text-[10px] uppercase tracking-wider">
              Source: FRED · Trend
            </span>
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
              tickFormatter={(v) => currency === "USD" ? `$${rwfToUsd(v).toFixed(2)}` : `${Math.round(v / 1000)}K RWF`}
              axisLine={false}
              tickLine={false}
              width={currency === "USD" ? 55 : 65}
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

      {/* Methodology note */}
      <div className="rounded border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground leading-relaxed space-y-2">
        <p>
          <span className="text-foreground font-semibold">Methodology: </span>
          Price history is sourced from FRED (Federal Reserve Economic Data) — Other Mild Arabica monthly series, published by the ICO with a ~4–6 week lag. Daily values are linearly interpolated between monthly observations. The 30-day forecast uses momentum trend extrapolation: a weighted linear regression on the trailing 90 days, with uncertainty bands that widen over the horizon. Directional signals are most reliable within the first 14 days; treat Day 15–30 as indicative only.
        </p>
        {validation && validation.mape > 0 && (
          <p className="border-t border-border pt-2 font-mono">
            <span className="text-foreground font-semibold">Back-validation </span>
            <span className="text-muted-foreground">(last 30 days held out, trained on prior data) — </span>
            <span className="text-rwandaGreen font-semibold">MAPE: {validation.mape}%</span>
            <span className="text-muted-foreground"> · </span>
            <span className="text-rwandaGreen font-semibold">RMSE: {validation.rmse.toLocaleString()} RWF/kg</span>
            <span className="text-muted-foreground"> · Direction: </span>
            <span className={validation.direction === 'correct' ? 'text-rwandaGreen font-semibold' : 'text-destructive font-semibold'}>
              {validation.direction}
            </span>
          </p>
        )}
      </div>

      {/* AI Advisor */}
      <div className="rounded-lg border border-border bg-card p-4 flex flex-col" style={{ minHeight: 340 }}>
        <p className="section-heading mb-3">AI Market Advisor</p>
        <CoffeeChat
          context={{
            currentPriceRwf: lastPrice,
            currentPriceUsd: Number(rwfToUsd(lastPrice).toFixed(2)),
            forecastDirection: direction,
            signal: recommendation,
            forecastSource,
            volatilityPct: volatility,
            peakDay,
            avgConfidence,
            priceChangePct: Number(priceChange),
            forecastPriceUsd: Number(rwfToUsd(predictedPrice).toFixed(2)),
          }}
        />
      </div>
    </div>
  );
}
