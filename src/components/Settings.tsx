import { motion } from "framer-motion";
import {
  useFinance,
  currencySymbols,
  type Currency,
} from "../context/FinanceContext";
import { Settings as SettingsIcon } from "lucide-react";

const CURRENCIES: Currency[] = ["USD", "EUR", "MDL"];

export const Settings = () => {
  const {
    monthlyIncome,
    setMonthlyIncome,
    currency,
    setCurrency,
    geminiKey,
    setGeminiKey,
  } = useFinance();
  const sym = currencySymbols[currency];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <SettingsIcon size={20} className="text-gray-400" /> Settings
      </h2>

      <div className="space-y-5">
        {/* Currency */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Base Currency
          </label>
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currency === c
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : "bg-white/60 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-400"
                }`}
              >
                {c} <span className="opacity-70">{currencySymbols[c]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Income */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Expected Monthly Income
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
              {sym}
            </span>
            <input
              type="number"
              value={monthlyIncome || ""}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="5,000"
              className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-9 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            Anything not allocated to a bucket automatically becomes guaranteed
            savings.
          </p>
        </div>

        {/* Gemini Key */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Gemini API Key (AI Accountant)
          </label>
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="Paste your key from AI Studio..."
            className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>
    </motion.div>
  );
};
