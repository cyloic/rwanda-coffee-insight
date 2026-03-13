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
  const [streaming, setStreaming] = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...next, assistantMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, context }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;
          try {
            const { text, error } = JSON.parse(payload);
            if (error) throw new Error(error);
            if (text) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + text,
                };
                return updated;
              });
            }
          } catch { /* skip malformed chunk */ }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Sorry, something went wrong. Please try again.',
        };
        return updated;
      });
    } finally {
      setStreaming(false);
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
            <div
              key={i}
              className={`text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {m.role === 'user' && (
                <span className="text-[10px] uppercase tracking-widest text-rwandaGreen mr-1">You</span>
              )}
              {m.role === 'assistant' && (
                <span className="text-[10px] uppercase tracking-widest text-gold mr-1">Advisor</span>
              )}
              <span className={streaming && i === messages.length - 1 && m.role === 'assistant' && m.content === '' ? 'inline-block w-1.5 h-3 bg-muted-foreground animate-pulse' : ''}>
                {m.content}
                {streaming && i === messages.length - 1 && m.role === 'assistant' && m.content && (
                  <span className="inline-block w-1.5 h-3 ml-0.5 bg-muted-foreground animate-pulse align-middle" />
                )}
              </span>
            </div>
          ))
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
            disabled={streaming}
          />
          <button
            onClick={() => send(input)}
            disabled={streaming || !input.trim()}
            className="p-2 rounded bg-rwandaGreen text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
