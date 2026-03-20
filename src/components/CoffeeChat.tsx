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
}

interface Props {
  context: MarketContext;
}

// Synced with sampleData.ts — risk derived from altitude (Rwanda Met. Agency data)
const REGIONS = [
  { name: 'Huye',       score: 78, roi: 18, risk: 12, altitudeM: 1950, desc: 'Top-ranked. High yields and excellent infrastructure near Butare.' },
  { name: 'Nyamasheke', score: 73, roi: 15, risk: 16, altitudeM: 1850, desc: 'Lake Kivu microclimate produces exceptional washed arabica.' },
  { name: 'Rusizi',     score: 57, roi: 11, risk: 24, altitudeM: 1700, desc: 'Yield challenges. Requires infrastructure investment before scaling.' },
  { name: 'Karongi',    score: 52, roi: 9,  risk: 30, altitudeM: 1600, desc: 'Significant yield deficit. Long-term development opportunity.' },
  { name: 'Nyaruguru',  score: 49, roi: 7,  risk: 26, altitudeM: 1700, desc: 'Lowest ranking. Critical yield issues and weak infrastructure.' },
];

function generateResponse(input: string, ctx: MarketContext): string {
  const q = input.toLowerCase();
  const priceRwf = ctx.currentPriceRwf.toLocaleString();
  const priceUsd = ctx.currentPriceUsd.toFixed(2);
  const dir = ctx.forecastDirection;
  const signal = ctx.signal;

  // Sell / timing questions
  if (q.match(/sell|when|timing|hold|wait|disburs/)) {
    if (signal === 'NEUTRAL') {
      return `Current price is ${priceRwf} RWF ($${priceUsd}/kg) with a neutral 30-day outlook. The forecast trend is flat — no strong signal to accelerate or delay. Proceed at your discretion based on your cash flow needs.`;
    }
    if (dir === 'up') {
      return `Forecast shows upward pressure from ${priceRwf} RWF. The model suggests holding — prices are expected to rise over the next 30 days. If your signal reads "WAIT X DAYS", that's the estimated peak window. Delay disbursement if operationally feasible.`;
    }
    return `Price is at ${priceRwf} RWF ($${priceUsd}/kg) with a declining 30-day trend. The model recommends selling now to avoid further erosion. Consider accelerating disbursement before the forecasted drop materialises.`;
  }

  // Region / ROI questions
  if (q.match(/region|roi|return|best|invest|huye|nyamasheke|rusizi|karongi|nyaruguru/)) {
    const top = REGIONS[0];
    const second = REGIONS[1];
    return `Best ROI: ${top.name} (score ${top.score}/100, risk ${top.risk}% at ${top.altitudeM}m altitude). ${top.desc} Runner-up: ${second.name} — ${second.desc} Avoid Nyaruguru and Karongi for near-term returns — lower altitude increases climate and disease risk.`;
  }

  // Price / market questions
  if (q.match(/price|market|benchmark|global|trend|forecast/)) {
    return `Global benchmark (FRED Other Mild Arabica) is currently $${priceUsd}/kg (${priceRwf} RWF). Rwanda specialty arabica trades at ~8% above this benchmark. The 30-day trend forecast is ${dir === 'up' ? 'upward' : dir === 'down' ? 'downward' : 'flat'}. Data source: FRED monthly data, interpolated to daily.`;
  }

  // Reliability / model questions
  if (q.match(/reliab|accura|confiden|trust|model|lstm|forecast|how good/)) {
    return `The forecast uses linear trend regression on FRED monthly data (interpolated to daily). It's useful for directional signals over 30 days but not precise to the RWF. LSTM inference is currently bypassed because global prices ($${priceUsd}/kg) exceed the model's training ceiling ($5.70/kg). Treat forecasts as directional guidance, not exact predictions.`;
  }

  // Risk questions
  if (q.match(/risk|volatil|danger|concern|climate|weather/)) {
    return `Key risks: (1) Currency — RWF/USD fluctuations directly affect local payouts. (2) Supply — Rwanda's arabica is weather-sensitive; El Niño/La Niña patterns affect Q4 yields. (3) Global demand — specialty coffee premiums compress during recessions. Current annualised volatility is elevated given global price surge since 2024.`;
  }

  // Generic fallback
  return `Current market: ${priceRwf} RWF/kg ($${priceUsd}) | Trend: ${dir} | Signal: ${signal}. Ask me about selling timing, regional ROI, price drivers, or forecast reliability.`;
}

const SUGGESTIONS = [
  'Is now a good time to sell?',
  'Which region has the best ROI?',
  'What is driving current prices?',
  'How reliable is the 30-day forecast?',
];

export default function CoffeeChat({ context }: Props) {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
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
            <p className="text-xs text-muted-foreground">Ask anything about Rwanda coffee prices, regions, or timing.</p>
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
              <span className={m.role === 'user' ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {m.content}
              </span>
            </div>
          ))
        )}
        {loading && (
          <div className="text-sm text-muted-foreground">
            <span className="text-[10px] uppercase tracking-widest text-gold mr-1">Advisor</span>
            <span className="inline-flex gap-1 align-middle">
              {[0,150,300].map(d => (
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
            placeholder="Ask about prices, timing, regions…"
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
