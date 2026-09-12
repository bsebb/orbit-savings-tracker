import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  useFinance,
  currencySymbols,
  formatMonthKey,
} from "../context/FinanceContext";
import {
  PiggyBank,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Target,
  Sparkles,
} from "lucide-react";
import { Select } from "./ui/Select";

interface OverviewProps {
  onNavigate: (
    tab: "envelopes" | "timeline" | "runway" | "ai" | "settings",
  ) => void;
}

export const Overview = ({ onNavigate }: OverviewProps) => {
  const {
    monthlyIncome,
    guaranteedSavings,
    oneOffIncome,
    totalSubscriptions,
    currency,
    buckets,
    getBucketSpent,
    selectedMonth,
    setSelectedMonth,
    addTransaction,
    milestones,
  } = useFinance();

  const sym = currencySymbols[currency];

  // Quick Log form state
  const [quickAmount, setQuickAmount] = useState("");
  const [quickBucket, setQuickBucket] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [quickType, setQuickType] = useState<"expense" | "income">("expense");

  const totalAllocated = buckets.reduce((sum, b) => sum + b.allocated, 0);
  const totalOut = totalAllocated + totalSubscriptions;
  const isOverAllocated = totalOut > monthlyIncome && monthlyIncome > 0;

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

  // Month navigation
  const [currentYear, currentMonthNum] = selectedMonth.split("-").map(Number);
  const dateObj = new Date(currentYear, currentMonthNum - 1, 1);
  const monthName = dateObj.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    const prev = new Date(currentYear, currentMonthNum - 2, 1);
    setSelectedMonth(formatMonthKey(prev));
  };

  const handleNextMonth = () => {
    const next = new Date(currentYear, currentMonthNum, 1);
    setSelectedMonth(formatMonthKey(next));
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAmount) return;
    if (quickType === "expense" && !quickBucket) {
      toast.error("Select an expense bucket");
      return;
    }

    addTransaction({
      amount: Number(quickAmount),
      bucketId: quickType === "expense" ? quickBucket : null,
      type: quickType,
      note: quickNote,
      date: new Date().toISOString(),
    });

    toast.success(
      quickType === "expense"
        ? `${sym}${quickAmount} logged to ${buckets.find((b) => b.id === quickBucket)?.name}`
        : `${sym}${quickAmount} one-off income recorded`,
      { icon: quickType === "expense" ? "💸" : "💰" },
    );

    setQuickAmount("");
    setQuickNote("");
  };

  const bucketOptions = buckets.map((b) => ({ value: b.id, label: b.name }));

  // Next active milestone
  const nextMilestone = milestones.find((m) => !m.completed);

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Month Navigator Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all text-gray-600 dark:text-gray-300"
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 px-3 py-1.5 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-white/40 dark:border-gray-700/40">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all text-gray-600 dark:text-gray-300"
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {selectedMonth !== formatMonthKey() && (
          <button
            onClick={() => setSelectedMonth(formatMonthKey())}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Jump to Current Month
          </button>
        )}
      </div>

      {/* Guaranteed Savings Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
      >
        <div className="absolute -top-6 -right-6 opacity-[0.06] dark:opacity-[0.04]">
          <PiggyBank size={200} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
            Guaranteed Monthly Savings
          </p>

          <AnimatePresence mode="wait">
            <motion.h2
              key={guaranteedSavings}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={`text-6xl sm:text-7xl font-bold tracking-tight mb-2 ${
                isOverAllocated
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {sym}
              {Math.round(guaranteedSavings).toLocaleString()}
            </motion.h2>
          </AnimatePresence>

          {oneOffIncome > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green-600 dark:text-green-400 font-medium mb-3 flex items-center gap-1"
            >
              <TrendingUp size={14} /> includes {sym}
              {Math.round(oneOffIncome).toLocaleString()} one-off income
            </motion.p>
          )}

          {/* Allocation Progress Bar */}
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

          <div className="flex justify-between w-full max-w-md text-xs font-medium text-gray-400 dark:text-gray-500 gap-2 flex-wrap">
            <span className="text-indigo-500 font-semibold">
              {sym}
              {totalAllocated.toLocaleString()} buckets
            </span>
            {totalSubscriptions > 0 && (
              <span className="text-purple-500 font-semibold">
                {sym}
                {Math.round(totalSubscriptions).toLocaleString()} subs
              </span>
            )}
            <span className="ml-auto font-semibold">
              {sym}
              {monthlyIncome.toLocaleString()} income
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick Log Transaction Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 24,
          delay: 0.05,
        }}
        className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-5 relative z-30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <Plus size={16} className="text-indigo-500" /> Quick Log Transaction
          </h3>
          <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 gap-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setQuickType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  quickType === t
                    ? t === "expense"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "bg-green-500 text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {t === "expense" ? "Expense" : "Income"}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleQuickSubmit}
          className="flex gap-2.5 flex-wrap items-center"
        >
          {quickType === "expense" && (
            <Select
              options={bucketOptions}
              value={quickBucket}
              onChange={setQuickBucket}
              placeholder="Pick bucket"
              className="flex-1 min-w-[140px]"
            />
          )}

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {sym}
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              required
              className="w-24 sm:w-28 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-7 pr-3 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <input
            type="text"
            placeholder="Note (optional)"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="flex-1 min-w-[110px] bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 text-white ${
              quickType === "expense"
                ? "bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-white"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Log
          </button>
        </form>
      </motion.div>

      {/* Top Envelopes Snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.1 }}
        className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Top Expense Envelopes
          </h3>
          <button
            onClick={() => onNavigate("envelopes")}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Manage all <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {buckets.slice(0, 4).map((b) => {
            const spent = getBucketSpent(b.id, selectedMonth);
            const progress =
              b.allocated > 0 ? Math.min((spent / b.allocated) * 100, 100) : 0;
            const isOver = b.allocated > 0 && spent > b.allocated;
            const remaining = b.allocated - spent;

            return (
              <div
                key={b.id}
                className="p-4 bg-white/70 dark:bg-gray-900/60 rounded-2xl border border-white/40 dark:border-gray-700/40 relative overflow-hidden"
              >
                <div
                  className={`absolute inset-y-0 left-0 -z-10 ${
                    isOver
                      ? "bg-red-100 dark:bg-red-900/20"
                      : "bg-indigo-100/70 dark:bg-indigo-900/20"
                  }`}
                  style={{ width: `${progress}%` }}
                />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {b.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sym}
                      {spent.toLocaleString()} spent
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${isOver ? "text-red-500" : "text-indigo-600 dark:text-indigo-400"}`}
                  >
                    {isOver ? "-" : ""}
                    {sym}
                    {Math.abs(remaining).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Next Milestone Card */}
      {nextMilestone && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 24,
            delay: 0.15,
          }}
          className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl p-6 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-md shadow-indigo-500/25">
              <Target size={22} />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Target Milestone
              </span>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {nextMilestone.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {sym}
                {nextMilestone.targetAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate("runway")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
          >
            View Runway <ArrowRight size={12} />
          </button>
        </motion.div>
      )}
    </div>
  );
};
