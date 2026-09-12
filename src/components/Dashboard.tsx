import { motion, AnimatePresence } from "framer-motion";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { PiggyBank, TrendingUp } from "lucide-react";

export const Dashboard = () => {
  const {
    monthlyIncome,
    guaranteedSavings,
    oneOffIncome,
    totalSubscriptions,
    currency,
    buckets,
  } = useFinance();
  const sym = currencySymbols[currency];
  const totalAllocated = buckets.reduce((sum, b) => sum + b.allocated, 0);
  const totalOut = totalAllocated + totalSubscriptions;
  const isOverAllocated = totalOut > monthlyIncome && monthlyIncome > 0;

  // Bar segments as percentages of income
  const bucketPct =
    monthlyIncome > 0
      ? Math.min((totalAllocated / monthlyIncome) * 100, 100)
      : 0;
  const subPct =
    monthlyIncome > 0
      ? Math.min(
          (totalSubscriptions / monthlyIncome) * 100,
          Math.max(0, 100 - bucketPct),
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-10 w-full max-w-2xl mx-auto text-center relative overflow-hidden"
    >
      <div className="absolute -top-6 -right-6 opacity-[0.06] dark:opacity-[0.04]">
        <PiggyBank size={200} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Guaranteed Monthly Savings
        </p>

        <AnimatePresence mode="wait">
          <motion.h2
            key={guaranteedSavings}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className={`text-6xl sm:text-7xl font-bold tracking-tight mb-2 ${isOverAllocated ? "text-red-500 dark:text-red-400" : "text-gray-900 dark:text-white"}`}
          >
            {sym}
            {guaranteedSavings.toLocaleString()}
          </motion.h2>
        </AnimatePresence>

        {oneOffIncome > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-green-600 dark:text-green-400 font-medium mb-2 flex items-center gap-1"
          >
            <TrendingUp size={14} /> includes {sym}
            {oneOffIncome.toLocaleString()} one-off income
          </motion.p>
        )}

        {/* Segmented bar: buckets (indigo) + subscriptions (purple) */}
        <div className="w-full max-w-md bg-black/5 dark:bg-white/5 rounded-full h-3 mb-3 overflow-hidden mt-4 flex">
          <motion.div
            className="h-full bg-indigo-500 rounded-l-full"
            initial={{ width: 0 }}
            animate={{ width: `${bucketPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${subPct}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
          />
        </div>

        <div className="flex justify-between w-full max-w-md text-xs font-medium text-gray-400 dark:text-gray-500 gap-4 flex-wrap">
          <span className="text-indigo-500">
            {sym}
            {totalAllocated.toLocaleString()} buckets
          </span>
          {totalSubscriptions > 0 && (
            <span className="text-purple-500">
              {sym}
              {totalSubscriptions.toLocaleString()} subs
            </span>
          )}
          <span className="ml-auto">
            {sym}
            {monthlyIncome.toLocaleString()} income
          </span>
        </div>
      </div>
    </motion.div>
  );
};
