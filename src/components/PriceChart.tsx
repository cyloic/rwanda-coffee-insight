import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { generatePriceHistory, generateForecast } from "@/data/sampleData";
import { formatPrice, rwfToUsd } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import type { PricePoint, ForecastPoint } from "@/hooks/usePriceHistory";

interface PriceChartProps {
  showForecast?: boolean;
  height?: number;
  title?: string;
  history?: PricePoint[];
  forecast?: ForecastPoint[];
  // How many most-recent history days to display (default 90)
  historyDays?: number;
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any) => (
        entry.value && (
          <p key={entry.dataKey} style={{ color: entry.color }} className="font-data font-semibold">
            {entry.name}: {formatPrice(currency === "USD" ? rwfToUsd(typeof entry.value === "number" ? entry.value : 0) : (typeof entry.value === "number" ? entry.value : 0), currency)}
          </p>
        )
      ))}
    </div>
  );
};

export default function PriceChart({
  showForecast = true,
  height = 260,
  title,
  history: historyProp,
  forecast: forecastProp,
  historyDays = 90,
}: PriceChartProps) {
  const { currency } = useCurrency();

  // Use live props if provided, otherwise fall back to static data
  const staticHistory = generatePriceHistory();
  const staticForecast = generateForecast(staticHistory[staticHistory.length - 1].price);
  const rawHistory = historyProp ?? staticHistory;
  const forecast = forecastProp ?? staticForecast;

  // Limit history to most recent N days for chart readability
  const history = rawHistory.slice(-historyDays);

  const combined = [
    ...history.map((d) => ({ ...d, historical: d.price, predicted: undefined, upperBand: undefined, lowerBand: undefined })),
    ...forecast.map((d) => ({ ...d, historical: undefined, predicted: d.price })),
  ];

  const today = new Date().toISOString().split("T")[0];
  const allDates = combined.map((d) => d.date);
  const tickDates = allDates.filter((_, i) => i % 15 === 0);

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-3">
          <p className="section-heading">{title}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 bg-gold" />Historical
            </span>
            {showForecast && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 bg-rwandaGreen" />Forecast
              </span>
            )}
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={showForecast ? combined : history.map(d => ({ ...d, historical: d.price }))} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="hsl(24 12% 18%)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(40 10% 55%)", fontSize: 10, fontFamily: "monospace" }}
            ticks={tickDates}
            tickFormatter={(v) => v.slice(5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "hsl(40 10% 55%)", fontSize: 10, fontFamily: "monospace" }}
            tickFormatter={(v) => currency === "USD" ? `$${rwfToUsd(v).toFixed(2)}` : `${Math.round(v / 1000)}K RWF`}
            axisLine={false}
            tickLine={false}
            width={currency === "USD" ? 55 : 65}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          {showForecast && (
            <ReferenceLine
              x={today}
              stroke="hsl(40 10% 40%)"
              strokeDasharray="4 4"
              label={{ value: "Today", fill: "hsl(40 10% 55%)", fontSize: 10 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="historical"
            name="Historical"
            stroke="hsl(43 65% 52%)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          {showForecast && (
            <Line
              type="monotone"
              dataKey="predicted"
              name="Forecast"
              stroke="hsl(152 100% 45%)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              connectNulls={false}
            />
          )}
          {showForecast && (
            <Line
              type="monotone"
              dataKey="upperBand"
              name="Upper CI"
              stroke="hsl(152 100% 45%)"
              strokeWidth={0}
              dot={false}
              connectNulls={false}
            />
          )}
          {showForecast && (
            <Line
              type="monotone"
              dataKey="lowerBand"
              name="Lower CI"
              stroke="hsl(152 100% 45%)"
              strokeWidth={0}
              dot={false}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
