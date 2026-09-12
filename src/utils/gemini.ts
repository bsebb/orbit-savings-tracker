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

export type SuggestedMilestone = {
  title: string;
  amount: number;
  tagline?: string;
};

export function getContextualDefaultMilestones(
  _currency?: string,
  guaranteedSavings: number = 0,
  monthlyIncome: number = 0,
): SuggestedMilestone[] {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const pace =
    guaranteedSavings > 0 ? guaranteedSavings : monthlyIncome * 0.25 || 1000;
  const roundVal = (n: number) => Math.max(100, Math.round(n / 50) * 50);

  return [
    {
      title: "🛡️ 1-Month Emergency Buffer",
      amount: roundVal(pace),
      tagline: "1 mo safety reserve",
    },
    {
      title: `✈️ ${currentMonth} ${currentYear} Seasonal Getaway`,
      amount: roundVal(pace * 1.5),
      tagline: "Seasonal vacation fund",
    },
    {
      title: "📱 Flagship Hardware & Tech Upgrade",
      amount: roundVal(pace * 2.2),
      tagline: "Next-gen gear upgrade",
    },
    {
      title: "🚀 Long-Term Financial Freedom Fund",
      amount: roundVal(pace * 5),
      tagline: "Compounding cushion",
    },
  ];
}

export async function generateSmartMilestones(
  apiKey: string,
  ctx: {
    currency: string;
    monthlyIncome: number;
    guaranteedSavings: number;
    buckets?: string[];
  },
): Promise<SuggestedMilestone[]> {
  if (!apiKey) {
    return getContextualDefaultMilestones(
      ctx.currency,
      ctx.guaranteedSavings,
      ctx.monthlyIncome,
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const currentDate = new Date().toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const prompt = `You are a personalized wealth advisor in the Orbit savings tracker app.
Current date: ${currentDate}.
The user's real-time financial stats:
- Currency: ${ctx.currency}
- Monthly Income: ${ctx.currency}${ctx.monthlyIncome}
- Guaranteed Monthly Savings Rate: ${ctx.currency}${ctx.guaranteedSavings}/month
- Active Budget Envelopes: ${ctx.buckets?.join(", ") || "None"}

Generate exactly 4 realistic, motivating, timely savings milestones tailored specifically for this user's exact pace and current timeframe (${currentDate}).
For example: season-specific goals (travel, holidays), upcoming device upgrades, emergency buffer, or investment seed.
Target amounts must be scaled proportionally between 0.5x and 6x their monthly savings pace (${ctx.currency}${ctx.guaranteedSavings}/mo).

Output ONLY a valid JSON array of 4 items with NO markdown formatting, NO backticks, and NO conversational filler:
[
  {
    "title": "Emoji + Goal Name (e.g. 📱 Next-Gen Flagship Phone)",
    "amount": integer amount in ${ctx.currency},
    "tagline": "Brief 3-5 word rationale (e.g. 2 months savings pace)"
  }
]`;

  const models = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-3.6-flash",
  ];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text?.trim() || "";
      const cleaned = text
        .replace(/```(?:json)?/gi, "")
        .replace(/```/g, "")
        .trim();
      const jsonStart = cleaned.indexOf("[");
      const jsonEnd = cleaned.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 4).map((item: any) => ({
            title: String(item.title || "Custom Goal"),
            amount: Number(item.amount) || 1000,
            tagline: item.tagline ? String(item.tagline) : undefined,
          }));
        }
      }
    } catch {
      continue;
    }
  }

  return getContextualDefaultMilestones(
    ctx.currency,
    ctx.guaranteedSavings,
    ctx.monthlyIncome,
  );
}
