import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const sym = currencySymbols[currency];
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !geminiKey) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    const reply = await askAccountant(geminiKey, userMsg, {
      currency: sym,
      monthlyIncome,
      guaranteedSavings,
      buckets,
      transactions: transactions.slice(0, 15),
    });
    setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.25 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto flex flex-col"
      style={{ height: "560px" }}
    >
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700/50">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Bot size={18} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          AI Accountant
        </h2>
        {!geminiKey && (
          <span className="ml-auto text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
            API key needed in Settings
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 space-y-2"
            >
              <Bot size={48} />
              <p className="text-sm">Ask me anything about your finances.</p>
            </motion.div>
          ) : (
            messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-gray-700/50 rounded-bl-sm prose prose-sm dark:prose-invert max-w-none"
                  }`}
                >
                  {m.role === "ai" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.text}
                    </ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-1 px-5 py-4 bg-white/90 dark:bg-gray-900/80 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700/50 shadow-sm">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            geminiKey
              ? "Ask a financial question..."
              : "Add API key in Settings first..."
          }
          disabled={!geminiKey}
          className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-5 pr-14 py-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!geminiKey || !input.trim() || loading}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all active:scale-95"
        >
          <Send size={16} />
        </button>
      </form>
    </motion.div>
  );
};
