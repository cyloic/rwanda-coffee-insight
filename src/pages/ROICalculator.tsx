import { useState } from "react";
import { REGIONS } from "@/data/sampleData";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { Calculator, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

interface Results {
  bestCase: number;
  expected: number;
  worstCase: number;
  annualizedROI: number;
  totalReturn: number;
  breakEvenMonths: number | null;
}

// World Bank Rwanda smallholder production cost (2023, MDPI sustainability study)
const PROD_COST_USD_PER_KG = 1.75;
// Investor participation rate in cooperative profit margin (agricultural fund benchmark)
const INVESTOR_PARTICIPATION = 0.15;
// Rwanda specialty premium over global benchmark (NAEB 2024)
const RWANDA_PREMIUM = 1.08;

function liveBaseROI(exportPriceUSD: number, altitudeFactor: number): number {
  const profitPerKg = exportPriceUSD - PROD_COST_USD_PER_KG;
  const grossMargin = Math.max(0, profitPerKg / exportPriceUSD);
  return grossMargin * INVESTOR_PARTICIPATION * altitudeFactor;
}

function calcResults(
  amount: number, regionId: string, term: number,
  exportPriceUSD: number, bestCaseMult: number
): Results {
  const region = REGIONS.find((r) => r.id === regionId)!;
  const baseROI = liveBaseROI(exportPriceUSD, region.altitudeFactor);
  const risk = region.riskPercent / 100;

  // Risk materializes at 10% (best), 50% (expected), 100% (worst)
  const bestNetROI  = baseROI * bestCaseMult - risk * 0.1;
  const expNetROI   = baseROI - risk * 0.5;
  const worstNetROI = baseROI - risk;

  const best     = amount * (1 + bestNetROI  * (term / 12));
  const expected = amount * (1 + expNetROI   * (term / 12));
  const worst    = amount * (1 + worstNetROI * (term / 12));

  return {
    bestCase: Math.round(best),
    expected: Math.round(expected),
    worstCase: Math.round(worst),
    annualizedROI: Math.round(expNetROI * 100 * (12 / term) * 10) / 10,
    totalReturn: Math.round((expected - amount) / amount * 100 * 10) / 10,
    breakEvenMonths: expNetROI > 0 ? Math.round(12 / expNetROI) : null,
  };
}

function TrafficLight({ value, thresholds }: { value: number; thresholds: [number, number] }) {
  const color =
    value >= thresholds[1] ? "bg-rwandaGreen" :
    value >= thresholds[0] ? "bg-gold" : "bg-destructive";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color} flex-shrink-0`} />;
}

export default function ROICalculator() {
  const { currency, rwfToUsd, usdToRwf } = useCurrency();
  const [rawInput, setRawInput] = useState("150000");
  const { history, volatility, bestCaseMultiplier } = usePriceHistory();
  const [amount, setAmount] = useState(202500000); // 150,000 USD * 1350
  const [regionId, setRegionId] = useState("huye");
  const [term, setTerm] = useState(12);
  const [results, setResults] = useState<Results | null>(null);

  // Live Rwanda export price: last FRED price × 8% Rwanda specialty premium
  const lastPriceRwf = history[history.length - 1]?.price;
  const exportPriceUSD = lastPriceRwf ? rwfToUsd(lastPriceRwf) * RWANDA_PREMIUM : 8.5;

  const region = REGIONS.find((r) => r.id === regionId)!;
  const liveROIPct = (r: typeof region) => Math.round(liveBaseROI(exportPriceUSD, r.altitudeFactor) * 100);

  const handleCalculate = () => {
    setResults(calcResults(amount, regionId, term, exportPriceUSD, bestCaseMultiplier));
  };

  const fmt = (n: number) => formatPrice(currency === "USD" ? rwfToUsd(n) : n, currency);

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6 animate-fade-in">
      <div className="border-b border-border pb-4">
        <p className="section-heading mb-1">Investment Modelling</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">ROI Calculator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Model expected returns under best, expected, and worst-case scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input form */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 space-y-6">
          <p className="section-heading">Input Parameters</p>

          {/* Investment amount input */}
          <div className="space-y-3">
            <label className="text-sm text-foreground font-medium">Investment Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-data">
                {currency === "USD" ? "$" : "RWF"}
              </span>
              <input
                type="number"
                min={currency === "USD" ? 50000 : 64000000}
                max={currency === "USD" ? 300000 : 384000000}
                value={rawInput}
                onChange={(e) => {
                  setRawInput(e.target.value);
                  const n = Number(e.target.value);
                  if (!isNaN(n) && n > 0) {
                    setAmount(currency === "USD" ? usdToRwf(n) : n);
                  }
                }}
                className="w-full rounded border border-border bg-secondary pl-12 pr-4 py-2 font-data text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder={currency === "USD" ? "e.g. 150000" : "e.g. 202500000"}
              />
            </div>
            {/* Quick-select presets */}
            <div className="grid grid-cols-3 gap-2">
              {(currency === "USD"
                ? [50000, 75000, 100000, 150000, 200000, 300000]
                : [64000000, 101000000, 135000000, 202000000, 270000000, 384000000]
              ).map((preset) => {
                const label = currency === "USD"
                  ? `$${(preset / 1000).toFixed(0)}K`
                  : `${(preset / 1000000).toFixed(0)}M`;
                const isActive = Math.abs(amount - (currency === "USD" ? usdToRwf(preset) : preset)) < 1000000;
                return (
                  <button
                    key={preset}
                    onClick={() => {
                      setRawInput(String(preset));
                      setAmount(currency === "USD" ? usdToRwf(preset) : preset);
                    }}
                    className={`rounded border px-2 py-1.5 text-xs font-data transition-colors ${
                      isActive
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border bg-secondary text-muted-foreground hover:border-gold hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region dropdown */}
          <div className="space-y-2">
            <label className="text-sm text-foreground font-medium">Target Region</label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — Score {r.score} | ROI {liveROIPct(r)}%
                </option>
              ))}
            </select>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div>
                Risk rate: <span className="font-data text-foreground">{region.riskPercent}%</span> ·{" "}
                Altitude: <span className="font-data text-foreground">{region.altitudeM.toLocaleString()}m</span>
              </div>
              <div>
                Farmers: <span className="font-data text-foreground">{region.farmerCount.toLocaleString()}</span>{" "}
                <span className="text-muted-foreground/60">(NAEB est.)</span>
              </div>
            </div>
          </div>

          {/* Loan term dropdown */}
          <div className="space-y-2">
            <label className="text-sm text-foreground font-medium">Loan Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value={6}>6 months (Short-term)</option>
              <option value={12}>12 months (Annual)</option>
              <option value={18}>18 months (Extended)</option>
              <option value={24}>24 months (Long-term)</option>
            </select>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full flex items-center justify-center gap-2 rounded bg-gold py-2.5 text-sm font-bold text-gold-foreground hover:bg-gold-light transition-colors"
          >
            <Calculator className="h-4 w-4" />
            Calculate Returns
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {!results ? (
            <div className="h-full rounded-lg border border-dashed border-border bg-card flex items-center justify-center min-h-[320px]">
              <div className="text-center text-muted-foreground">
                <Calculator className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Configure parameters and click Calculate</p>
              </div>
            </div>
          ) : (
            <>
              {/* Scenario cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Best Case", value: results.bestCase, icon: TrendingUp, color: "text-rwandaGreen", borderColor: "border-rwandaGreen/30 bg-rwandaGreen/5" },
                  { label: "Expected", value: results.expected, icon: TrendingUp, color: "text-gold", borderColor: "border-gold/30 bg-gold/5" },
                  { label: "Worst Case", value: results.worstCase, icon: TrendingDown, color: "text-destructive", borderColor: "border-destructive/30 bg-destructive/5" },
                ].map(({ label, value, icon: Icon, color, borderColor }) => (
                  <div key={label} className={`rounded-lg border p-4 ${borderColor}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                    <p className={`font-data text-xl font-bold ${color}`}>{fmt(value)}</p>
                    <p className="text-xs text-muted-foreground font-data mt-1">
                      {value > amount ? "+" : ""}{fmt(value - amount)} return
                    </p>
                  </div>
                ))}
              </div>

              {/* Key metrics */}
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="section-heading mb-3">Return Metrics</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Return", value: `${results.totalReturn}%` },
                    { label: "Annualized ROI", value: `${results.annualizedROI}%` },
                    { label: "Break-even", value: results.breakEvenMonths !== null ? `${results.breakEvenMonths}mo` : "N/A" },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="font-data text-lg font-bold text-foreground">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk breakdown */}
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="section-heading mb-3">Risk Breakdown</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Credit Risk", value: region.riskPercent, thresholds: [15, 25] as [number, number], desc: `Altitude-derived: ${region.altitudeM}m avg (Rwanda Met. Agency)` },
                    { label: "Weather Risk", value: 100 - region.weatherScore, thresholds: [20, 30] as [number, number], desc: `Altitude & rainfall variance — Rwanda Met. Agency (${region.altitudeM}m)` },
                    { label: "Infrastructure Risk", value: 100 - region.infrastructureScore, thresholds: [20, 30] as [number, number], desc: "Road access & processing capacity" },
                    { label: "Market Risk", value: Math.round(volatility), thresholds: [15, 25] as [number, number], desc: `Annualized price volatility (FRED)` },
                  ].map(({ label, value, thresholds, desc }) => (
                    <div key={label} className="flex items-center gap-3">
                      <TrafficLight value={100 - value} thresholds={[100 - thresholds[1], 100 - thresholds[0]]} />
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-foreground font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <span className="font-data text-sm text-muted-foreground">{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Breakdown */}
              {(() => {
                const profitPerKg = exportPriceUSD - PROD_COST_USD_PER_KG;
                const grossMargin = Math.max(0, profitPerKg / exportPriceUSD);
                const baseROI = grossMargin * INVESTOR_PARTICIPATION * region.altitudeFactor;
                const risk = region.riskPercent / 100;
                const bestNetROI  = baseROI * bestCaseMultiplier - risk * 0.1;
                const expNetROI   = baseROI - risk * 0.5;
                const worstNetROI = baseROI - risk;
                const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
                const usd = (n: number) => `$${n.toFixed(2)}`;
                const rows: { label: string; formula: string; value: string; note?: string }[] = [
                  {
                    label: "Live Export Price",
                    formula: `FRED global price × 1.08 Rwanda premium`,
                    value: usd(exportPriceUSD),
                    note: "Live FRED benchmark + 8% specialty premium (NAEB 2024 data)",
                  },
                  {
                    label: "Profit per kg",
                    formula: `${usd(exportPriceUSD)} − $${PROD_COST_USD_PER_KG} production cost`,
                    value: usd(profitPerKg),
                    note: "Production cost: World Bank Rwanda smallholder estimate (2023)",
                  },
                  {
                    label: "Gross Margin",
                    formula: `$${profitPerKg.toFixed(2)} ÷ ${usd(exportPriceUSD)}`,
                    value: pct(grossMargin),
                    note: "Share of export price that is profit after farmer costs",
                  },
                  {
                    label: "Base ROI",
                    formula: `${pct(grossMargin)} × ${INVESTOR_PARTICIPATION * 100}% participation × ${region.altitudeFactor} altitude factor`,
                    value: pct(baseROI),
                    note: `15% = agricultural fund participation rate · ${region.altitudeFactor} = ${region.altitudeM}m altitude quality multiplier`,
                  },
                  {
                    label: "Risk Rate",
                    formula: `${region.riskPercent}% — derived from ${region.altitudeM}m altitude`,
                    value: pct(risk),
                    note: "Higher altitude → lower disease & climate risk (Rwanda Met. Agency data)",
                  },
                  {
                    label: "Expected Net ROI",
                    formula: `${pct(baseROI)} − ${pct(risk)} × 50%`,
                    value: pct(expNetROI),
                    note: "Base assumption — half of credit risk materializes",
                  },
                  {
                    label: "Expected Payout",
                    formula: `${fmt(amount)} × (1 + ${pct(expNetROI)} × ${term}/12)`,
                    value: fmt(results.expected),
                    note: "Simple interest over loan term",
                  },
                ];
                return (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="section-heading mb-1">How your return is calculated</p>
                    <p className="text-[11px] text-muted-foreground mb-4">
                      {region.name} · {term}-month term · live FRED price
                    </p>

                    {/* 3-step flow */}
                    <div className="flex items-stretch gap-2">
                      {/* Step 1 */}
                      <div className="flex-1 rounded-lg bg-secondary p-3 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Profit / kg</p>
                        <p className="font-data text-xl font-bold text-gold">{usd(profitPerKg)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{usd(exportPriceUSD)} export − ${PROD_COST_USD_PER_KG} cost</p>
                      </div>

                      <div className="flex items-center text-muted-foreground text-sm">→</div>

                      {/* Step 2 */}
                      <div className="flex-1 rounded-lg bg-secondary p-3 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Net ROI</p>
                        <p className="font-data text-xl font-bold text-rwandaGreen">{pct(expNetROI)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{pct(baseROI)} base − {region.riskPercent}% risk</p>
                      </div>

                      <div className="flex items-center text-muted-foreground text-sm">→</div>

                      {/* Step 3 */}
                      <div className="flex-1 rounded-lg bg-secondary p-3 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Expected Payout</p>
                        <p className="font-data text-xl font-bold text-foreground">{fmt(results.expected)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">+{pct(expNetROI)} on {fmt(amount)}</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-3">
                      Sources: FRED (export price) · World Bank 2023 (production cost) · Rwanda Met. Agency (risk via altitude) · NAEB (8% specialty premium)
                    </p>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
