import React from "react";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { PiggyBank } from "lucide-react";

export const Dashboard = () => {
  const { monthlyIncome, guaranteedSavings, currency, buckets } = useFinance();

  const totalAllocated = buckets.reduce((sum, b) => sum + b.allocated, 0);
  const progress =
    monthlyIncome > 0 ? (totalAllocated / monthlyIncome) * 100 : 0;
  const isOverAllocated = totalAllocated > monthlyIncome;

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-10 w-full max-w-2xl mx-auto my-8 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <PiggyBank size={160} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest text-sm">
          Guaranteed Monthly Savings
        </h1>
        <h2
          className={`text-6xl sm:text-7xl font-bold tracking-tight mb-8 ${isOverAllocated ? "text-red-600 dark:text-red-500" : "text-gray-900 dark:text-white"}`}
        >
          {currencySymbols[currency]}
          {guaranteedSavings.toLocaleString()}
        </h2>

        <div className="w-full max-w-md bg-white/60 dark:bg-gray-900/60 rounded-full h-4 mb-2 overflow-hidden border border-white/50 dark:border-gray-700/50 relative">
          <div
            className={`h-full transition-all duration-1000 ${isOverAllocated ? "bg-red-500" : "bg-indigo-500"}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between w-full max-w-md text-sm font-medium">
          <span className="text-indigo-600 dark:text-indigo-400">
            {currencySymbols[currency]}
            {totalAllocated.toLocaleString()} allocated
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {currencySymbols[currency]}
            {monthlyIncome.toLocaleString()} income
          </span>
        </div>
      </div>
    </div>
  );
};
