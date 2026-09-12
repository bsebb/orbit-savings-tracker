import { GoogleGenAI } from "@google/genai";

export async function askAccountant(
  apiKey: string,
  prompt: string,
  balance: number,
  transactions: any[],
  goals: any[],
): Promise<string> {
  if (!apiKey)
    return "Please enter your Gemini API key in the settings to use the Accountant.";

  try {
    const ai = new GoogleGenAI({ apiKey });

    const context = `
      You are a smart, professional, Apple-styled AI Financial Accountant.
      The user is asking you for financial advice.
      Here is their current financial state:
      - Total Balance: $${balance}
      - Goals: ${JSON.stringify(goals)}
      - Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}
      
      Provide a concise, helpful answer. If they want to buy something, evaluate if they can afford it based on their balance and goals. Don't be too preachy, keep it modern and clean.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: context }] },
        { role: "user", parts: [{ text: prompt }] },
      ],
    });

    return response.text || "I couldn't generate a response.";
  } catch (error: any) {
    console.error(error);
    return "Error communicating with AI Accountant. Check your API key.";
  }
}
