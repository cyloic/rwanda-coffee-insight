import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MarketContext {
  currentPriceRwf: number;
  currentPriceUsd: number;
  forecastDirection: string;
  signal: string;
  forecastSource: string;
  volatilityPct?: number;
  peakDay?: number;
  avgConfidence?: number;
  priceChangePct?: number;
  forecastPriceUsd?: number;
}

interface Props {
  context: MarketContext;
}

// Synced with sampleData.ts — risk derived from altitude (Rwanda Met. Agency data)
const REGIONS = [
  { name: 'Huye',       score: 78, risk: 12, altitudeM: 1950, farmers: 12600,  desc: 'Top-ranked. Highest altitude, lowest disease risk, excellent infrastructure near Butare.' },
  { name: 'Nyamasheke', score: 73, risk: 16, altitudeM: 1850, farmers: 31800,  desc: 'Lake Kivu microclimate stabilises temperatures. Largest farmer base in this cohort.' },
  { name: 'Rusizi',     score: 57, risk: 24, altitudeM: 1700, farmers: 28400,  desc: 'Significant production volume but yield challenges — infrastructure investment required.' },
  { name: 'Karongi',    score: 52, risk: 30, altitudeM: 1600, farmers: 19200,  desc: 'Lowest altitude increases CBD disease pressure. Highest climate risk of the five.' },
  { name: 'Nyaruguru',  score: 49, risk: 26, altitudeM: 1700, farmers: 8700,   desc: 'Weakest infrastructure. Dry season variability depresses yields significantly.' },
];

const PROD_COST_USD = 1.75;     // World Bank Rwanda smallholder 2023
const RWANDA_PREMIUM = 1.08;   // NAEB 2024 specialty premium
const PARTICIPATION = 0.15;    // Agricultural fund participation rate

function liveROI(exportUsd: number, altFactor: number) {
  const margin = Math.max(0, (exportUsd - PROD_COST_USD) / exportUsd);
  return Math.round(margin * PARTICIPATION * altFactor * 100);
}

const ALT_FACTORS: Record<string, number> = {
  Huye: 1.20, Nyamasheke: 1.10, Rusizi: 0.88, Karongi: 0.80, Nyaruguru: 0.85,
};

function generateResponse(input: string, ctx: MarketContext): string {
  const q = input.toLowerCase();
  const priceRwf = ctx.currentPriceRwf.toLocaleString();
  const priceUsd = ctx.currentPriceUsd.toFixed(2);
  const exportUsd = ctx.currentPriceUsd * RWANDA_PREMIUM;
  const dir = ctx.forecastDirection;
  const vol = ctx.volatilityPct?.toFixed(1) ?? '—';
  const conf = ctx.avgConfidence ?? '—';
  const peak = ctx.peakDay;
  const change = ctx.priceChangePct;
  const fcastUsd = ctx.forecastPriceUsd?.toFixed(2) ?? '—';

  // --- Timing / sell / hold ---
  if (q.match(/sell|when|timing|hold|wait|disburs|entry|buy|exit/)) {
    if (dir === 'up') {
      return `📈 Upward trend detected. Current price: $${priceUsd}/kg (${priceRwf} RWF).\n\nForecast: +${change}% over 30 days to ~$${fcastUsd}/kg. ${peak ? `Model estimates the peak near Day ${peak} (±2 days).` : ''} Recommendation: delay disbursement until the peak window to maximise loan-to-value ratio.\n\nConfidence: ${conf}% — ${Number(conf) >= 80 ? 'high — lean into this signal' : Number(conf) >= 65 ? 'moderate — treat as directional only' : 'low — market is uncertain, hedge accordingly'}.`;
    }
    if (dir === 'down') {
      return `📉 Declining trend. Current: $${priceUsd}/kg. Forecast: ${change}% over 30 days to ~$${fcastUsd}/kg.\n\nRecommendation: accelerate disbursement before further erosion. At a ${vol}% annualised volatility, each week of delay costs roughly ${(ctx.currentPriceUsd * (Number(vol) / 100) / 52).toFixed(2)} USD/kg in expected value.\n\nIf you must wait, set a price floor trigger at $${(ctx.currentPriceUsd * 0.97).toFixed(2)}/kg.`;
    }
    return `⚖️ Neutral signal. Price is stable at $${priceUsd}/kg with ${change}% expected change over 30 days. No urgency to accelerate or delay — proceed based on your portfolio cash flow needs. Volatility is ${vol}% annualised.`;
  }

  // --- Region / ROI comparison ---
  if (q.match(/region|roi|return|best|invest|compar|rank|huye|nyamasheke|rusizi|karongi|nyaruguru|diversif|portfolio/)) {
    const rows = REGIONS.map(r => {
      const roi = liveROI(exportUsd, ALT_FACTORS[r.name]);
      return `  ${r.name.padEnd(12)} Score ${r.score}/100 | ROI ~${roi}% | Risk ${r.risk}% | ${r.altitudeM}m`;
    }).join('\n');
    const top = REGIONS[0];
    const topROI = liveROI(exportUsd, ALT_FACTORS[top.name]);
    return `Regional snapshot at today's export price ($${exportUsd.toFixed(2)}/kg):\n\n${rows}\n\nBest entry: ${top.name} — ${top.desc}\n\nFor risk diversification, pair Huye (low risk) with Nyamasheke (high farmer density, ${REGIONS[1].farmers.toLocaleString()} farmers) to balance yield stability with volume. Avoid Karongi as a standalone investment given its ${REGIONS[3].risk}% risk rate at ${REGIONS[3].altitudeM}m altitude.\n\nROI figures use: export price − $${PROD_COST_USD} production cost (World Bank 2023) × 15% participation × altitude factor.`;
  }

  // --- Price / market drivers ---
  if (q.match(/price|market|benchmark|global|trend|forecast|driver|why|surge|high|low|arabica|commodity/)) {
    return `Global benchmark (FRED Other Mild Arabica): $${priceUsd}/kg.\nRwanda export price (8% specialty premium): ~$${exportUsd.toFixed(2)}/kg.\n30-day trend forecast: $${fcastUsd}/kg (${dir === 'up' ? '+' : ''}${change}%).\n\nKey price drivers right now:\n1. Global arabica supply tightness — Brazil and Colombia production shortfalls since 2023\n2. Specialty premium compression risk if recession hits discretionary spending\n3. USD strength — RWF/USD rate directly affects local payouts\n4. Rwanda's Q2 main harvest (April–June) typically softens local prices briefly\n\nData source: FRED monthly (Other Mild Arabica), interpolated to daily. Forecast uses momentum trend extrapolation on a 90-day trailing window.`;
  }

  // --- Reliability / model ---
  if (q.match(/reliab|accura|confiden|trust|model|lstm|how good|mape|error|certain/)) {
    return `Forecast method: momentum trend extrapolation on FRED Other Mild Arabica monthly data (ICO-sourced), interpolated to daily values.\n\nA weighted linear regression on the trailing 90 days generates the 30-day forward path. Uncertainty bands widen over the horizon — certainty starts at ~${conf}% on Day 1 and decays toward ~60% by Day 30.\n\nStrengths: grounded in the same data source the World Bank uses (FRED); no fabricated inputs.\nLimitations: linear trend cannot anticipate supply shocks or policy changes. Treat Day 1–14 as actionable and Day 15–30 as directional only.\n\nRule of thumb: build a 5–8% price buffer into any loan-to-value calculation rather than anchoring to the exact forecast price.`;
  }

  // --- Confidence score breakdown ---
  if (q.match(/confidence score|certainty score|how is.*confidence|where.*confidence|confidence.*come from|confidence.*calculat|certainty.*calculat|what.*certainty|breakdown.*confidence|confidence.*breakdown|explain.*certainty|explain.*confidence/)) {
    const nextDayConf = Math.max(60, Math.round(93 - 1.08 * Math.sqrt(1) * 2.5));
    const day7Conf    = Math.max(60, Math.round(93 - 1.08 * Math.sqrt(7) * 2.5));
    const day30Conf   = Math.max(60, Math.round(93 - 1.08 * Math.sqrt(30) * 2.5));
    return `Confidence score breakdown:\n\nThe score answers: "How reliable is this prediction?"\n\nFormula:\n  confidence = max(60%, 93% − (1.08 × √day × 2.5))\n\n• 93% — the model's best-case accuracy on Day 1, derived from back-testing against real FRED prices.\n• 1.08 — the model's average forecast error (MAPE) measured during training: on average, predictions were 1.08% off the actual price.\n• √day — uncertainty grows with the square root of days ahead, not linearly. Predictions get less reliable over time, but the decay slows down.\n• 2.5 — a scaling factor that converts the error percentage into confidence-point drops.\n• max(60%) — the score never goes below 60%, even at Day 30.\n\nExamples at today's prices ($${ctx.forecastPriceUsd?.toFixed(2) ?? '—'}/kg forecast):\n  Day 1  → ${nextDayConf}% certainty  (Trend Forecast – Next Day card)\n  Day 7  → ${day7Conf}% certainty\n  Day 30 → ${day30Conf}% certainty\n\nThe "Certainty" shown on the dashboard is always Day 1's score. The "Trend Certainty" summary card shows the average across all 30 days (≈${conf}%).`;
  }

  // --- Risk ---
  if (q.match(/risk|volatil|danger|concern|climate|weather|cbd|disease|currency|hedge/)) {
    return `Current annualised price volatility: ${vol}%.\n\nRisk profile by category:\n\n1. Market risk — ${vol}% volatility. Rwanda specialty arabica is less volatile than commodity grade due to premium pricing, but still susceptible to global demand shocks.\n\n2. Climate risk — CBD (coffee berry disease) pressure increases below 1,700m. Karongi (1,600m) and Rusizi (1,700m) are most exposed. Huye (1,950m) and Nyamasheke (1,850m) have historically lower crop loss rates.\n\n3. Currency risk — RWF has depreciated ~4–6% annually vs USD historically. A 5% RWF drop on a $100K loan = ~$5K loss in USD terms unless hedged.\n\n4. Seasonal risk — Rwanda has two harvests: main crop (April–June) and fly crop (October–November). Q3 supply gaps can temporarily spike local prices.`;
  }

  // --- Entry price / is it a good time ---
  if (q.match(/good time|right time|opportun|entry price|now|current|start/)) {
    const isHigh = ctx.currentPriceUsd > 7;
    return `${isHigh ? '⚠️ Prices are historically elevated.' : '✅ Prices are within normal range.'} Current: $${priceUsd}/kg — approximately ${((ctx.currentPriceUsd / 4.5 - 1) * 100).toFixed(0)}% above the 2015–2020 average of ~$4.50/kg (FRED historical).\n\n${isHigh ? 'Elevated prices compress entry margins if global arabica supply recovers. Favour shorter loan terms (6–12 months) to limit exposure to a price correction.' : 'Current prices support solid farmer margins above the $1.75/kg production cost.'}\n\nProfit per kg at today's export price: $${(exportUsd - PROD_COST_USD).toFixed(2)} (${((exportUsd - PROD_COST_USD) / exportUsd * 100).toFixed(0)}% gross margin).`;
  }

  // --- Season / harvest timing ---
  if (q.match(/season|harvest|crop|flush|q1|q2|q3|q4|april|june|october|november/)) {
    return `Rwanda coffee harvest calendar:\n\n• Main crop: April – June (≈70% of annual volume). Prices typically soften slightly as supply peaks.\n• Fly crop: October – November (≈30% of volume). Smaller yield, prices often firm up.\n• Lean season: July – September. Limited cherry supply; washing stations process carry-over stock.\n\nFor loan timing: disbursing in February–March allows farmers to cover input costs (fertiliser, labour) before the main harvest. Repayment aligned to June–July post-harvest cash flows has historically lower default rates in NAEB cooperative records.\n\nCurrent month relative to cycle: check whether you are pre-harvest (high loan value) or post-harvest (price pressure risk).`;
  }

  // --- Fallback with market snapshot ---
  return `Market snapshot:\n• Price: $${priceUsd}/kg (${priceRwf} RWF) | Export: ~$${exportUsd.toFixed(2)}/kg\n• 30-day trend: ${dir === 'up' ? '↑ +' : dir === 'down' ? '↓ ' : '→ '}${change}% | Signal: ${ctx.signal}\n• Volatility: ${vol}% annualised | Confidence: ${conf}%\n\nYou can ask me about:\n— Sell / hold timing\n— Regional ROI comparison\n— What is driving prices\n— Model reliability\n— Risk factors\n— Is now a good entry point\n— Harvest season timing`;
}

const SUGGESTIONS = [
  'Is now a good time to invest?',
  'Compare all regions by ROI',
  'What is driving current prices?',
  'What are the main risks?',
  'How is the confidence score calculated?',
];

export default function CoffeeChat({ context }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: text.trim() }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const reply = generateResponse(text, context);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, 600);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Live market data loaded. Ask about timing, regional ROI, risks, or price drivers.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-[11px] rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground hover:border-rwandaGreen transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="text-sm leading-relaxed">
              <span className={`text-[10px] uppercase tracking-widest mr-1 ${m.role === 'user' ? 'text-rwandaGreen' : 'text-gold'}`}>
                {m.role === 'user' ? 'You' : 'Advisor'}
              </span>
              <span className={`whitespace-pre-line ${m.role === 'user' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {m.content}
              </span>
            </div>
          ))
        )}
        {loading && (
          <div className="text-sm text-muted-foreground">
            <span className="text-[10px] uppercase tracking-widest text-gold mr-1">Advisor</span>
            <span className="inline-flex gap-1 align-middle">
              {[0, 150, 300].map(d => (
                <span key={d} className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="pt-3 border-t border-border mt-3">
        <div className="flex gap-2">
          <input
            className="flex-1 text-sm bg-muted rounded px-3 py-2 outline-none focus:ring-1 focus:ring-rwandaGreen placeholder:text-muted-foreground"
            placeholder="Ask about timing, regions, risks…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            disabled={loading}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="p-2 rounded bg-rwandaGreen text-white disabled:opacity-40 hover:opacity-90 transition-opacity">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
