import { useState } from "react";
import { REGIONS, Region } from "@/data/sampleData";
import { ArrowUpDown, ChevronDown, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

type SortKey = "score" | "roi" | "riskPercent" | "farmerCount";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-rwandaGreen border-rwandaGreen/40 bg-rwandaGreen/10"
    : score >= 60 ? "text-gold border-gold/40 bg-gold/10"
    : "text-destructive border-destructive/40 bg-destructive/10";
  return (
    <span className={`font-data text-sm font-bold px-2 py-0.5 rounded border ${color}`}>
      {score}
    </span>
  );
}

function RiskBadge({ risk }: { risk: number }) {
  if (risk <= 15) return <span className="text-xs font-semibold text-rwandaGreen">LOW</span>;
  if (risk <= 22) return <span className="text-xs font-semibold text-gold">MEDIUM</span>;
  return <span className="text-xs font-semibold text-destructive">HIGH</span>;
}

export default function RegionalAnalysis() {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Region | null>(null);
  const [filter, setFilter] = useState<"all" | "high" | "mid" | "low">("all");

  const sorted = [...REGIONS]
    .filter((r) => {
      if (filter === "high") return r.score >= 80;
      if (filter === "mid") return r.score >= 60 && r.score < 80;
      if (filter === "low") return r.score < 60;
      return true;
    })
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      return (a[sortKey] - b[sortKey]) * dir;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => handleSort(k)}
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortKey === k ? "text-gold" : ""}`} />
    </button>
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-6 animate-fade-in">
      <div className="border-b border-border pb-4">
        <p className="section-heading mb-1">Portfolio Intelligence</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Regional Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comparative investment scoring across Rwanda's primary coffee districts
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "high", "mid", "low"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
              filter === f
                ? "bg-gold text-gold-foreground border-gold"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {f === "all" ? "All Regions" : f === "high" ? "High (≥80)" : f === "mid" ? "Medium (60–79)" : "Low (<60)"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold tracking-wide">REGION</th>
                <th className="text-center px-4 py-3 text-xs text-muted-foreground font-semibold tracking-wide">
                  <SortBtn k="score" label="SCORE" />
                </th>
                <th className="text-center px-4 py-3 text-xs text-muted-foreground font-semibold tracking-wide">
                  <SortBtn k="roi" label="ROI %" />
                </th>
                <th className="text-center px-4 py-3 text-xs text-muted-foreground font-semibold tracking-wide">
                  <SortBtn k="riskPercent" label="RISK" />
                </th>
                <th className="text-center px-4 py-3 text-xs text-muted-foreground font-semibold tracking-wide">
                  <SortBtn k="farmerCount" label="FARMERS" />
                </th>
                <th className="text-center px-4 py-3 text-xs text-muted-foreground font-semibold tracking-wide">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((r) => (
                <tr key={r.id} className="data-row">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-xs line-clamp-1">{r.description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center"><ScoreBadge score={r.score} /></td>
                  <td className="px-4 py-3 text-center font-data font-semibold text-rwandaGreen">{r.roi}%</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <RiskBadge risk={r.riskPercent} />
                      <span className="font-data text-xs text-muted-foreground">{r.riskPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-data text-muted-foreground">{r.farmerCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelected(r)}
                      className="px-3 py-1 rounded text-xs font-semibold border border-gold/50 text-gold hover:bg-gold hover:text-gold-foreground transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="rounded-lg border border-border bg-card w-full max-w-lg shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="section-heading mb-0.5">Region Detail</p>
                <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Score breakdown */}
              <div>
                <p className="section-heading mb-3">Score Breakdown</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Weather & Climate", value: selected.weatherScore },
                    { label: "Infrastructure", value: selected.infrastructureScore },
                    { label: "Yield Potential", value: selected.yieldScore },
                    { label: "Accessibility", value: selected.accessibilityScore },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${value}%`,
                            background: value >= 80 ? "hsl(152 100% 33%)" : value >= 60 ? "hsl(43 65% 52%)" : "hsl(0 72% 51%)",
                          }}
                        />
                      </div>
                      <span className="font-data text-xs text-foreground w-8 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Investment Score", value: `${selected.score}/100` },
                  { label: "Projected ROI", value: `${selected.roi}%` },
                  { label: "Default Risk", value: `${selected.riskPercent}%` },
                  { label: "Active Farmers", value: selected.farmerCount.toLocaleString() },
                ].map((m) => (
                  <div key={m.label} className="rounded bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="font-data text-lg font-bold text-foreground mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
