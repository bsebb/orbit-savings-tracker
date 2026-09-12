import React from "react";
import {
  useFinance,
  currencySymbols,
  type Currency,
} from "../context/FinanceContext";
import { Settings as SettingsIcon } from "lucide-react";

export const Settings = () => {
  const {
    monthlyIncome,
    setMonthlyIncome,
    currency,
    setCurrency,
    geminiKey,
    setGeminiKey,
  } = useFinance();

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <SettingsIcon className="text-gray-500" /> Settings
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Base Currency
          </label>
          <div className="flex gap-2">
            {(Object.keys(currencySymbols) as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${currency === c ? "bg-indigo-600 text-white" : "bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border border-white/50 dark:border-gray-700/50"}`}
              >
                {c} ({currencySymbols[c]})
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expected Monthly Income
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              {currencySymbols[currency]}
            </span>
            <input
              type="number"
              value={monthlyIncome || ""}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="e.g. 5000"
              className="w-full bg-white/60 dark:bg-gray-900/60 border border-white/50 dark:border-gray-700/50 rounded-2xl pl-10 pr-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            All unallocated income automatically becomes guaranteed savings.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gemini API Key (For AI Accountant)
          </label>
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AI Studio Key..."
            className="w-full bg-white/60 dark:bg-gray-900/60 border border-white/50 dark:border-gray-700/50 rounded-2xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
