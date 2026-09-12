import { GoogleGenAI } from "@google/genai";

export async function askAccountant(
  apiKey: string,
  prompt: string,
  contextData: any,
): Promise<string> {
  if (!apiKey)
    return "Please enter your Gemini API key in the settings to use the Accountant.";

  try {
    const ai = new GoogleGenAI({ apiKey });

    const context = `
      You are a smart, professional, Apple-styled AI Financial Accountant.
      The user is asking you for financial advice.
      We are using a Zero-Based Budgeting paradigm.
      Here is their current financial state:
      - Monthly Income: ${contextData.currency}${contextData.monthlyIncome}
      - Guaranteed Monthly Savings (Income - Allocated Buckets): ${contextData.currency}${contextData.guaranteedSavings}
      - Expense Buckets (Allocations): ${JSON.stringify(contextData.buckets)}
      - Recent Transactions: ${JSON.stringify(contextData.transactions)}
      
      Provide a concise, helpful answer formatted in Markdown. If they want to buy something, evaluate if they can afford it based on their guaranteed savings or bucket allocations. Don't be too preachy, keep it modern and clean.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
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
