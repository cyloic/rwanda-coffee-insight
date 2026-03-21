import { useState, useMemo } from "react";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { useCurrency } from "@/context/CurrencyContext";
import { REGIONS } from "@/data/sampleData";
import { formatPrice } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

const PROD_COST_USD   = 1.75;   // World Bank Rwanda smallholder 2023
const RWANDA_PREMIUM  = 1.08;   // NAEB specialty premium
const PARTICIPATION   = 0.15;   // Agri-fund participation rate
const ALT_FACTORS: Record<string, number> = {
  huye: 1.20, nyamasheke: 1.10, rusizi: 0.88, karongi: 0.80, nyaruguru: 0.85,
};

const PERIODS = [
  { label: "6 months",  months: 6  },
  { label: "12 months", months: 12 },
  { label: "18 months", months: 18 },
  { label: "24 months", months: 24 },
];

function monthsAgoDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

export default function Backtest() {
  const { currency, rwfToUsd, usdToRwf, exchangeRate } = useCurrency();
  const { history, isLive, loading } = usePriceHistory();

  const [regionId,  setRegionId]  = useState("huye");
  const [months,    setMonths]    = useState(12);
  const [rawInput,  setRawInput]  = useState("150000");
  const [amountRwf, setAmountRwf] = useState(usdToRwf(150000));

  const region = REGIONS.find(r => r.id === regionId)!;

  const result = useMemo(() => {
    if (!history.length) return null;

    const targetDate = monthsAgoDate(months);
    // Find the closest data point at or after the target date
    const entryIdx = history.findIndex(p => p.date >= targetDate);
    if (entryIdx < 0 || entryIdx >= history.length - 1) return null;

    const entryPoint = history[entryIdx];
    const exitPoint  = history[history.length - 1];

    const entryUsd = entryPoint.price / exchangeRate;
    const exitUsd  = exitPoint.price  / exchangeRate;

    const priceChangePct   = ((exitUsd - entryUsd) / entryUsd) * 100;
    const priceMultiplier  = exitUsd / entryUsd;

    // ROI derived from actual price movement at entry
    const exportAtEntry    = entryUsd * RWANDA_PREMIUM;
    const marginAtEntry    = Math.max(0, (exportAtEntry - PROD_COST_USD) / exportAtEntry);
    const annualROI        = marginAtEntry * PARTICIPATION * ALT_FACTORS[regionId];
    // Scale by actual price movement — if prices rose, returns were better
    const adjustedAnnualROI = annualROI * priceMultiplier;
    const risk             = region.riskPercent / 100;
    const expNetROI        = adjustedAnnualROI - risk * 0.5;
    const periodReturn     = expNetROI * (months / 12);
    const payout           = Math.round(amountRwf * (1 + periodReturn));
    const profit           = payout - amountRwf;
    const roiPct           = Math.round(periodReturn * 1000) / 10;

    // Slice history for chart
    const slice = history.slice(entryIdx).map(p => ({
      date:  p.date.slice(5),     // MM-DD
      price: currency === "USD" ? rwfToUsd(p.price) : p.price,
    }));

    return {
      entryDate:  entryPoint.date,
      exitDate:   exitPoint.date,
      entryUsd,
      exitUsd,
      entryRwf:   entryPoint.price,
      exitRwf:    exitPoint.price,
      priceChangePct,
      roiPct,
      payout,
      profit,
      expNetROI,
      slice,
      annualROIPct: Math.round(annualROI * 100 * 10) / 10,
    };
  }, [history, months, regionId, amountRwf, exchangeRate, currency, region, rwfToUsd]);

  const fmt = (rwf: number) => formatPrice(currency === "USD" ? rwfToUsd(rwf) : rwf, currency);

  const PRESETS_USD = [50000, 75000, 100000, 150000, 200000, 300000];

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <p className="section-heading mb-1">Historical Validation</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Back-Test</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See what your investment would have returned using <span className="text-foreground font-medium">actual FRED price data</span> — no projections
        </p>
      </div>

      {!isLive && !loading && (
        <div className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Live price data required for back-testing. Check your connection and reload.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 space-y-5">
          <p className="section-heading">Parameters</p>

          {/* Amount */}
          <div className="space-y-3">
            <label className="text-sm text-foreground font-medium">Investment Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-data">
                {currency === "USD" ? "$" : "RWF"}
              </span>
              <input
                type="number"
                value={rawInput}
                onChange={e => {
                  setRawInput(e.target.value);
                  const n = Number(e.target.value);
                  if (!isNaN(n) && n > 0)
                    setAmountRwf(currency === "USD" ? usdToRwf(n) : n);
                }}
                className="w-full rounded border border-border bg-secondary pl-12 pr-4 py-2 font-data text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder="e.g. 150000"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS_USD.map(p => {
                const label = `$${(p / 1000).toFixed(0)}K`;
                const rwfVal = usdToRwf(p);
                const isActive = Math.abs(amountRwf - rwfVal) < 1000000;
                return (
                  <button key={p} onClick={() => { setRawInput(String(p)); setAmountRwf(rwfVal); }}
                    className={`rounded border px-2 py-1.5 text-xs font-data transition-colors ${isActive
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-secondary text-muted-foreground hover:border-gold hover:text-foreground"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <label className="text-sm text-foreground font-medium">Region</label>
            <select value={regionId} onChange={e => setRegionId(e.target.value)}
              className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold">
              {REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name} — Score {r.score} | Risk {r.riskPercent}%</option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <label className="text-sm text-foreground font-medium">Look-back Period</label>
            <div className="grid grid-cols-2 gap-2">
              {PERIODS.map(p => (
                <button key={p.months} onClick={() => setMonths(p.months)}
                  className={`rounded border px-3 py-2 text-sm font-data transition-colors ${months === p.months
                    ? "border-gold bg-gold/10 text-gold font-semibold"
                    : "border-border bg-secondary text-muted-foreground hover:border-gold hover:text-foreground"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data source note */}
          <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-3">
            Price data: FRED Other Mild Arabica (monthly, interpolated daily).<br />
            ROI model: export margin × 15% participation × altitude factor.<br />
            Production cost: $1.75/kg (World Bank Rwanda 2023).
          </p>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {loading && (
            <div className="rounded-lg border border-border bg-card p-6 animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-48" />
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted rounded" />)}
              </div>
              <div className="h-48 bg-muted rounded" />
            </div>
          )}

          {!loading && result && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Entry Price",
                    value: currency === "USD" ? `$${result.entryUsd.toFixed(2)}` : `${result.entryRwf.toLocaleString()} RWF`,
                    sub: result.entryDate,
                    color: "text-foreground",
                  },
                  {
                    label: "Exit Price",
                    value: currency === "USD" ? `$${result.exitUsd.toFixed(2)}` : `${result.exitRwf.toLocaleString()} RWF`,
                    sub: result.exitDate,
                    color: "text-gold",
                  },
                  {
                    label: "Price Movement",
                    value: `${result.priceChangePct >= 0 ? "+" : ""}${result.priceChangePct.toFixed(1)}%`,
                    sub: `over ${months} months (actual FRED)`,
                    color: result.priceChangePct >= 0 ? "text-rwandaGreen" : "text-destructive",
                  },
                  {
                    label: "Estimated Return",
                    value: `${result.roiPct >= 0 ? "+" : ""}${result.roiPct}%`,
                    sub: `${months}-month period`,
                    color: result.roiPct >= 0 ? "text-rwandaGreen" : "text-destructive",
                  },
                ].map(c => (
                  <div key={c.label} className="stat-card">
                    <p className="section-heading mb-1">{c.label}</p>
                    <p className={`font-data text-2xl font-bold ${c.color}`}>{c.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* Payout breakdown */}
              <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="section-heading mb-1">Investment Outcome</p>
                  <p className="text-sm text-muted-foreground">
                    {fmt(amountRwf)} invested in <span className="text-foreground font-medium">{region.name}</span> {months} months ago
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-data text-3xl font-bold text-rwandaGreen">{fmt(result.payout)}</p>
                  <p className={`text-sm font-data font-semibold ${result.profit >= 0 ? "text-rwandaGreen" : "text-destructive"}`}>
                    {result.profit >= 0 ? "+" : ""}{fmt(Math.abs(result.profit))} {result.profit >= 0 ? "profit" : "loss"}
                  </p>
                </div>
              </div>

              {/* Actual price chart */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="section-heading">Actual Price Path ({currency}/kg)</p>
                  <span className="text-[10px] text-muted-foreground border border-border rounded px-2 py-0.5 font-data uppercase tracking-wider">
                    FRED · Real Data
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.slice} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="btGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(152 100% 45%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(152 100% 45%)" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="hsl(24 12% 18%)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "hsl(40 10% 55%)", fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis domain={["auto", "auto"]} tick={{ fill: "hsl(40 10% 55%)", fontSize: 10, fontFamily: "monospace" }}
                      tickFormatter={v => currency === "USD" ? `$${v.toFixed(2)}` : `${Math.round(v / 1000)}K`}
                      axisLine={false} tickLine={false} width={currency === "USD" ? 55 : 60} />
                    <Tooltip
                      contentStyle={{ background: "hsl(24 15% 8%)", border: "1px solid hsl(24 12% 18%)", borderRadius: 6 }}
                      labelStyle={{ color: "hsl(40 10% 55%)", fontSize: 11 }}
                      formatter={(v: number) => [currency === "USD" ? `$${v.toFixed(2)}/kg` : `${Math.round(v).toLocaleString()} RWF/kg`, "Price"]}
                    />
                    <ReferenceLine x={result.slice[0]?.date} stroke="hsl(40 60% 50%)" strokeDasharray="4 2"
                      label={{ value: "Entry", fill: "hsl(40 60% 50%)", fontSize: 10, position: "insideTopRight" }} />
                    <Area type="monotone" dataKey="price" stroke="hsl(152 100% 45%)" strokeWidth={2} fill="url(#btGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Formula breakdown */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <p className="section-heading mb-2">How This Was Calculated</p>
                <div className="space-y-1.5 text-xs font-data">
                  {[
                    ["Export price at entry", `$${(result.entryUsd * RWANDA_PREMIUM).toFixed(2)}/kg (FRED × 1.08 premium)`],
                    ["Production cost",       `$${PROD_COST_USD}/kg (World Bank Rwanda 2023)`],
                    ["Gross margin at entry", `${((result.entryUsd * RWANDA_PREMIUM - PROD_COST_USD) / (result.entryUsd * RWANDA_PREMIUM) * 100).toFixed(1)}%`],
                    ["Participation rate",    `${(PARTICIPATION * 100).toFixed(0)}% of farmer margin`],
                    ["Altitude factor",       `${ALT_FACTORS[regionId]}× (${region.name} at ${regionId === 'huye' ? '1,950m' : regionId === 'nyamasheke' ? '1,850m' : regionId === 'rusizi' ? '1,700m' : regionId === 'nyaruguru' ? '1,700m' : '1,600m'})`],
                    ["Base annual ROI",       `${result.annualROIPct}%`],
                    ["Price movement bonus",  `${result.priceChangePct >= 0 ? "+" : ""}${result.priceChangePct.toFixed(1)}% (actual FRED)`],
                    ["Risk deduction",        `−${(region.riskPercent * 0.5).toFixed(1)}% (50% expected materialisation)`],
                    ["Period return",         `${result.roiPct}% over ${months} months`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-border/50 pb-1 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-semibold text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!loading && !result && isLive && (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Not enough historical data for the selected period. Try a shorter look-back.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
