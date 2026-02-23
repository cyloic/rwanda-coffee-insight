import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from "recharts";
import { useMemo } from "react";
import { generatePriceHistory, generateForecast } from "@/data/sampleData";

interface PriceChartProps {
  showForecast?: boolean;
  height?: number;
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any) => (
        entry.value && (
          <p key={entry.dataKey} style={{ color: entry.color }} className="font-data font-semibold">
            {entry.name}: ${typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
          </p>
        )
      ))}
    </div>
  );
};

export default function PriceChart({ showForecast = true, height = 260, title }: PriceChartProps) {
  const history = useMemo(() => generatePriceHistory(), []);
  const lastPrice = history[history.length - 1].price;
  const forecast = useMemo(() => generateForecast(lastPrice), [lastPrice]);

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
            tickFormatter={(v) => `$${v}`}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
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
