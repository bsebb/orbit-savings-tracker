import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { askAccountant, type GeminiTurn } from "../utils/gemini";
import { Bot, Send, Trash2, Sparkles, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SUGGESTED_PROMPTS = [
  "Can I afford a $1,200 emergency expense right now?",
  "How can I optimize my expense envelopes to save $400 more?",
  "Audit my subscriptions and tell me where I am leaking money.",
  "What will my savings look like in 3 years at this pace?",
];

export const AccountantChat = () => {
  const {
    monthlyIncome,
    guaranteedSavings,
    transactions,
    buckets,
    geminiKey,
    currency,
    chatHistory,
    addChatMessage,
    clearChatHistory,
  } = useFinance();

  const sym = currencySymbols[currency];
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || !geminiKey || loading) return;

    const userPrompt = textToSend.trim();
    addChatMessage({ role: "user", text: userPrompt });
    setInput("");
    setLoading(true);

    try {
      // Build API history from persistent chatHistory
      const historyTurns: GeminiTurn[] = chatHistory.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const { reply } = await askAccountant(
        geminiKey,
        userPrompt,
        {
          currency: sym,
          monthlyIncome,
          guaranteedSavings,
          buckets,
          transactions: transactions.slice(0, 20),
        },
        historyTurns,
      );

      addChatMessage({ role: "model", text: reply });
    } catch {
      addChatMessage({
        role: "model",
        text: "⚠️ Communication failure with AI Accountant. Please retry in a few moments.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto flex flex-col h-[650px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-500 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              AI Financial Co-Pilot
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Persistent memory across sessions · Powered by Gemini 3.6
            </p>
          </div>
        </div>

        {chatHistory.length > 0 && (
          <button
            onClick={() => {
              clearChatHistory();
              toast.success("Chat memory cleared");
            }}
            className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {!geminiKey && (
        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            Enter your Gemini API Key in <strong>Settings</strong> to activate
            co-pilot intelligence.
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 py-4"
      >
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-3xl text-indigo-500">
              <Sparkles size={36} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Your Personal Financial Advisor
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm">
                Ask about affordability, budget cutbacks, long-term goals, or
                multi-year wealth building.
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(prompt)}
                  disabled={!geminiKey}
                  className="text-left p-3 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-white/40 dark:border-gray-700/40 hover:border-indigo-400 text-xs text-gray-700 dark:text-gray-300 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-600/20"
                    : "bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-gray-700/50 rounded-bl-sm prose prose-sm dark:prose-invert max-w-none"
                }`}
              >
                {m.role === "model" ? (
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

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 px-5 py-4 bg-white/90 dark:bg-gray-900/80 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700/50 shadow-sm">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            geminiKey
              ? "Ask a financial question..."
              : "Add API key in Settings first..."
          }
          disabled={!geminiKey || loading}
          className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-5 pr-14 py-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!geminiKey || !input.trim() || loading}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-indigo-600/25"
        >
          <Send size={16} />
        </button>
      </form>
    </motion.div>
  );
};
