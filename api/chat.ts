import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, context } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are a Rwanda coffee investment advisor with deep knowledge of the East African specialty arabica market.

Live market data as of right now:
${context ? JSON.stringify(context, null, 2) : 'Live data unavailable — use general knowledge.'}

Your role:
- Help investors, cooperatives, and farmers make informed decisions
- Explain what the current price trend and forecast mean for selling timing
- Discuss Rwanda's five main coffee regions: Huye, Nyamasheke, Rusizi, Karongi, Nyaruguru
- Give context on global dynamics (exchange rates, ICO benchmarks, La Niña/El Niño, supply shocks)
- Be honest about uncertainty — never overstate forecast precision

Style: concise and data-driven. Under 120 words unless a detailed breakdown is requested.`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Claude API error:', err);
    return res.status(500).json({ error: 'Failed to get response' });
  }
}
