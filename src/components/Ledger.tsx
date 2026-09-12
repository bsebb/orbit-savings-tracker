import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { ArrowDownLeft, ArrowUpRight, Minus, Plus } from "lucide-react";

export const Ledger = () => {
  const { transactions, addTransaction, buckets, currency } = useFinance();
  const sym = currencySymbols[currency];
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [bucketId, setBucketId] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    if (type === "expense" && !bucketId) return;
    addTransaction({
      amount: Number(amount),
      bucketId: type === "expense" ? bucketId : null,
      type,
      note,
    });
    const label =
      type === "expense"
        ? `${sym}${amount} logged to ${buckets.find((b) => b.id === bucketId)?.name}`
        : `${sym}${amount} income added`;
    type === "expense"
      ? toast.success(label)
      : toast.success(label, { icon: "💰" });
    setAmount("");
    setNote("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.2 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto"
    >
      {/* Header + type toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Transactions
        </h2>
        <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 gap-1">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                type === t
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

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6 flex-wrap">
        {type === "expense" && (
          <select
            value={bucketId}
            onChange={(e) => setBucketId(e.target.value)}
            required
            className="flex-1 min-w-[140px] bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="" disabled className="dark:bg-gray-800">
              Select bucket
            </option>
            {buckets.map((b) => (
              <option key={b.id} value={b.id} className="dark:bg-gray-800">
                {b.name}
              </option>
            ))}
          </select>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {sym}
          </span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-28 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-7 pr-3 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 min-w-[120px] bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 text-white ${type === "expense" ? "bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-white" : "bg-green-500 hover:bg-green-600"}`}
        >
          Log
        </button>
      </form>

      {/* Transaction list */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        <AnimatePresence>
          {transactions.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">
              No transactions yet.
            </p>
          ) : (
            transactions.map((t) => {
              const b = buckets.find((b) => b.id === t.bucketId);
              const isIncome = t.type === "income";
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-gray-900/60 rounded-2xl border border-white/30 dark:border-gray-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${isIncome ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
                    >
                      {isIncome ? <Plus size={16} /> : <Minus size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {isIncome ? "Income" : (b?.name ?? "Unknown")}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(t.date).toLocaleDateString()}
                        {t.note ? ` · ${t.note}` : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${isIncome ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {isIncome ? "+" : "-"}
                    {sym}
                    {t.amount.toLocaleString()}
                  </span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
