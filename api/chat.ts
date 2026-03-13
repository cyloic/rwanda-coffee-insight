import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, context } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

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
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      systemInstruction: systemPrompt,
    });

    // Convert message history for Gemini (all but the last user message)
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return res.status(200).json({ text });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Gemini API error:', msg);
    return res.status(500).json({ error: msg });
  }
}
