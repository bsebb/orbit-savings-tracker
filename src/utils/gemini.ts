import { GoogleGenAI } from "@google/genai";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateWithRetry(
  ai: GoogleGenAI,
  contents: { role: string; parts: { text: string }[] }[],
  maxRetries = 3,
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
      });
      return response.text ?? "I couldn't generate a response.";
    } catch (err: any) {
      const status = err?.error?.code ?? err?.status ?? 0;
      const isRetryable = status === 503 || status === 429 || status === 500;

      if (isRetryable && attempt < maxRetries) {
        const backoff = 800 * Math.pow(2, attempt); // 800ms, 1.6s, 3.2s
        await sleep(backoff);
        continue;
      }

      // Non-retryable or exhausted — surface a clean message
      if (status === 503)
        return "⚠️ Gemini is experiencing high demand right now. Try again in a moment.";
      if (status === 429)
        return "⚠️ Rate limit reached. Wait a few seconds and try again.";
      if (status === 401 || status === 403)
        return "⚠️ Invalid API key. Check your key in Settings.";
      throw err;
    }
  }
  return "⚠️ Gemini is unavailable after several retries. Please try again shortly.";
}

export async function askAccountant(
  apiKey: string,
  prompt: string,
  contextData: {
    currency: string;
    monthlyIncome: number;
    guaranteedSavings: number;
    buckets: unknown;
    transactions: unknown;
  },
): Promise<string> {
  if (!apiKey)
    return "Please enter your Gemini API key in Settings to use the AI Accountant.";

  const ai = new GoogleGenAI({ apiKey });

  const systemContext = `You are a smart, professional AI Financial Accountant.
The user uses Zero-Based Budgeting. Here is their current state:
- Monthly Income: ${contextData.currency}${contextData.monthlyIncome}
- Guaranteed Monthly Savings: ${contextData.currency}${contextData.guaranteedSavings}
- Expense Buckets: ${JSON.stringify(contextData.buckets)}
- Recent Transactions: ${JSON.stringify(contextData.transactions)}

Provide concise, helpful advice in Markdown. Be direct and modern — not preachy.`;

  return generateWithRetry(ai, [
    { role: "user", parts: [{ text: systemContext }] },
    { role: "user", parts: [{ text: prompt }] },
  ]);
}
