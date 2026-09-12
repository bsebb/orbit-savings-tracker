import { GoogleGenAI } from "@google/genai";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type GeminiTurn = { role: "user" | "model"; parts: { text: string }[] };

const SYSTEM_PROMPT = (ctx: FinanceContext) =>
  `You are a smart, concise AI Financial Accountant inside the Orbit app.
The user uses Zero-Based Budgeting. Current snapshot:
- Monthly Income: ${ctx.currency}${ctx.monthlyIncome}
- Guaranteed Monthly Savings: ${ctx.currency}${ctx.guaranteedSavings}
- Expense Buckets: ${JSON.stringify(ctx.buckets)}
- Recent Transactions: ${JSON.stringify(ctx.transactions)}

Reply in Markdown. Be direct, modern, and helpful — not preachy.`;

type FinanceContext = {
  currency: string;
  monthlyIncome: number;
  guaranteedSavings: number;
  buckets: unknown;
  transactions: unknown;
};

async function generateWithRetry(
  ai: GoogleGenAI,
  contents: GeminiTurn[],
  maxRetries = 3,
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
      });
      return response.text ?? "I couldn't generate a response.";
    } catch (err: any) {
      const status = err?.error?.code ?? err?.status ?? 0;
      const isRetryable = status === 503 || status === 429 || status === 500;
      if (isRetryable && attempt < maxRetries) {
        await sleep(800 * Math.pow(2, attempt));
        continue;
      }
      if (status === 503)
        return "⚠️ Gemini is experiencing high demand right now. Try again in a moment.";
      if (status === 429)
        return "⚠️ Rate limit reached. Wait a few seconds and try again.";
      if (status === 401 || status === 403)
        return "⚠️ Invalid API key. Check your key in Settings.";
      if (status === 404)
        return "⚠️ Model not found. Please check the Gemini model configuration.";
      throw err;
    }
  }
  return "⚠️ Gemini is unavailable after several retries. Please try again shortly.";
}

export async function askAccountant(
  apiKey: string,
  userMessage: string,
  ctx: FinanceContext,
  history: GeminiTurn[] = [],
): Promise<{ reply: string; updatedHistory: GeminiTurn[] }> {
  if (!apiKey) {
    return {
      reply:
        "Please enter your Gemini API key in Settings to use the AI Accountant.",
      updatedHistory: history,
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build contents: system prompt as first user turn (if history is empty), then full history, then new message
  const systemTurn: GeminiTurn = {
    role: "user",
    parts: [{ text: SYSTEM_PROMPT(ctx) }],
  };
  const newUserTurn: GeminiTurn = {
    role: "user",
    parts: [{ text: userMessage }],
  };

  const contents: GeminiTurn[] =
    history.length === 0
      ? [systemTurn, newUserTurn]
      : [...history, newUserTurn];

  const reply = await generateWithRetry(ai, contents);

  const modelTurn: GeminiTurn = { role: "model", parts: [{ text: reply }] };
  const updatedHistory: GeminiTurn[] = [
    ...(history.length === 0 ? [systemTurn] : history),
    newUserTurn,
    modelTurn,
  ];

  return { reply, updatedHistory };
}
