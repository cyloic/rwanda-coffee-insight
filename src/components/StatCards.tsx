import { STATS } from "@/data/sampleData";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map((stat, i) => (
        <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
          <p className="section-heading mb-2">{stat.label}</p>
          <p className="font-data text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          <div className="mt-3 flex items-center gap-1.5">
            {stat.trend.startsWith("+") ? (
              <TrendingUp className="h-3 w-3 text-rwandaGreen" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={`text-xs font-data ${stat.trend.startsWith("+") || stat.trend.startsWith("-2") ? "text-rwandaGreen" : "text-destructive"}`}>
              {stat.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
