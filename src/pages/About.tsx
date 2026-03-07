import { Database, BarChart3, Users, Mail } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-8 animate-fade-in max-w-4xl">
      <div className="border-b border-border pb-4">
        <p className="section-heading mb-1">Platform Overview</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">About CaféInvest Rwanda</h1>
      </div>

      {/* Problem statement */}
      <div className="rounded-lg border border-gold/30 bg-gold/5 p-5">
        <h2 className="text-lg font-bold text-gold mb-2">The $36M Credit Gap Problem</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Rwanda's coffee sector employs over 211,000 smallholder farmers, yet the majority lack access to
          formal credit. Financial institutions estimate a <span className="text-foreground font-semibold">$36 million annual credit gap</span> between
          what's needed for inputs, labor, and processing equipment and what's actually disbursed. This gap
          results in sub-optimal yields, lost export value, and farmer poverty — despite Rwanda coffee being
          among the highest-rated specialty grades globally.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          Traditional lenders struggle to assess agricultural risk at the smallholder level. CaféInvest bridges
          this gap by combining satellite imagery, weather data, price forecasting, and cooperative performance
          metrics into a single, interpretable investment score.
        </p>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">How The Platform Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: BarChart3,
              title: "ML Price Forecasting",
              desc: "A gradient boosting model trained on ICO commodity data, East African weather patterns, and Rwanda export records generates 30-day price forecasts with confidence intervals.",
            },
            {
              icon: Database,
              title: "Risk Scoring Engine",
              desc: "Regional investment scores (0–100) aggregate: historical default rates, cooperative membership density, road infrastructure quality, altitude/rainfall suitability, and yield trend data.",
            },
            {
              icon: Users,
              title: "Farmer Data Layer",
              desc: "Cooperative-level data from NAEB (National Agricultural Export Development Board) and Rwanda Cooperative Agency provides farmer counts, loan histories, and crop certification status.",
            },
            {
              icon: BarChart3,
              title: "ROI Modelling",
              desc: "Scenario-based return projections incorporate regional risk rates, loan term dynamics, and commodity price volatility to produce conservative, expected, and optimistic return estimates.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-4 flex gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded bg-gold/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Data Sources</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold tracking-wide">SOURCE</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold tracking-wide">DATA TYPE</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-semibold tracking-wide">UPDATE FREQUENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[                ["FRED API", "Global benchmark coffee prices (Other Mild Arabica)", "Daily"],                ["ICO — Intl. Coffee Organization", "Global commodity prices, export data", "Monthly"],
                ["NAEB Rwanda", "Farmer registration, cooperative data", "Quarterly"],
                ["Rwanda Meteorological Agency", "Rainfall, temperature, weather risk", "Daily"],
                ["World Bank Open Data", "Infrastructure, rural road quality", "Annual"],
                ["RCA — Rwanda Cooperative Agency", "Loan performance, default rates", "Quarterly"],
              ].map(([src, type, freq]) => (
                <tr key={src} className="data-row">
                  <td className="px-4 py-3 font-medium text-foreground">{src}</td>
                  <td className="px-4 py-3 text-muted-foreground">{type}</td>
                  <td className="px-4 py-3 font-data text-xs text-muted-foreground">{freq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-bold text-foreground">Contact & Research Collaboration</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This platform is developed under the <span className="text-foreground font-semibold">African Leadership University (ALU)</span> research initiative in partnership with Rwandan financial institutions. For API access, investment inquiries, or research collaboration:
        </p>
        <div className="mt-3 font-data text-sm text-gold">l.cyusa@alustudent.com / cyusaloic078@gmail.com</div>
        <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
          <strong className="text-foreground">Disclaimer:</strong> Investment scores and price forecasts are provided for analytical and research purposes only. They do not constitute financial advice. Historical performance does not guarantee future results. All investments carry risk.
        </p>
      </div>
    </div>
  );
}
