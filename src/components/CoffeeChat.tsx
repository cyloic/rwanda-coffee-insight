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

  async function send(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, context }),
      });

      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error ?? 'Request failed');

      setMessages([...next, { role: 'assistant', content: data.text }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Ask anything about Rwanda coffee prices, regions, or timing.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11px] rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground hover:border-rwandaGreen transition-colors"
                >
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
            <span className="inline-flex gap-1">
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
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
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="p-2 rounded bg-rwandaGreen text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
