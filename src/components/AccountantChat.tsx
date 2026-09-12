import React, { useState } from "react";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { askAccountant } from "../utils/gemini";
import { Bot, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const AccountantChat = () => {
  const {
    monthlyIncome,
    guaranteedSavings,
    transactions,
    buckets,
    geminiKey,
    currency,
  } = useFinance();
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !geminiKey) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    const reply = await askAccountant(geminiKey, userMsg, {
      currency: currencySymbols[currency],
      monthlyIncome,
      guaranteedSavings,
      buckets,
      transactions: transactions.slice(0, 10),
    });

    setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    setLoading(false);
  };

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto my-8 flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Bot className="text-blue-500" /> AI Accountant
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-2">
            <Bot size={48} className="opacity-20" />
            <p>Ask me if you can afford your next purchase.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 shadow-sm border border-white/40 dark:border-gray-700/40 prose prose-sm dark:prose-invert max-w-none"}`}
              >
                {m.role === "ai" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-gray-900/80 text-gray-400 shadow-sm border border-white/40 dark:border-gray-700/40 rounded-2xl px-5 py-3 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            geminiKey
              ? "Ask a financial question..."
              : "Enter API Key in Settings first..."
          }
          disabled={!geminiKey}
          className="w-full bg-white/70 dark:bg-gray-900/70 border border-white/50 dark:border-gray-700/50 rounded-2xl pl-6 pr-14 py-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!geminiKey || !input || loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
