import { REGIONS } from "@/data/sampleData";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function scoreClass(score: number) {
  if (score >= 80) return "score-high";
  if (score >= 60) return "score-mid";
  return "score-low";
}

export default function TopOpportunities() {
  const navigate = useNavigate();
  const top = [...REGIONS].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="section-heading">Top Opportunities</p>
        <button
          onClick={() => navigate("/regions")}
          className="text-xs text-gold hover:text-gold-light flex items-center gap-0.5 transition-colors"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-4 text-[11px] text-muted-foreground px-2 pb-1 border-b border-border font-semibold tracking-wide">
        <span>REGION</span>
        <span className="text-center">SCORE</span>
        <span className="text-center">ROI</span>
        <span className="text-center">RISK</span>
      </div>

      <div className="flex flex-col divide-y divide-border flex-1">
        {top.map((r, i) => (
          <div
            key={r.id}
            className="grid grid-cols-4 px-2 py-3 hover:bg-secondary cursor-pointer transition-colors items-center"
            onClick={() => navigate("/regions")}
          >
            <div className="flex items-center gap-2">
              <span className="font-data text-[11px] text-muted-foreground w-4">{i + 1}</span>
              <span className="text-sm font-medium text-foreground">{r.name}</span>
            </div>
            <span className={`text-center font-data ${scoreClass(r.score)}`}>{r.score}</span>
            <span className="text-center font-data text-sm text-rwandaGreen font-semibold">{r.roi}%</span>
            <span className={`text-center font-data text-sm ${r.riskPercent > 20 ? "text-destructive" : r.riskPercent > 15 ? "text-gold" : "text-rwandaGreen"}`}>
              {r.riskPercent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
