import React, { useState } from "react";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { Minus } from "lucide-react";

export const Ledger = () => {
  const { transactions, addTransaction, buckets, currency } = useFinance();
  const [amount, setAmount] = useState("");
  const [bucketId, setBucketId] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !bucketId) return;
    addTransaction({ amount: Number(amount), bucketId, note });
    setAmount("");
    setNote("");
  };

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Log Expense
      </h2>

      {buckets.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          Please create a Bucket first to log expenses.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex gap-4 mb-8 bg-white/60 dark:bg-gray-900/60 p-4 rounded-2xl border border-white/50 dark:border-gray-700/50"
        >
          <select
            value={bucketId}
            onChange={(e) => setBucketId(e.target.value)}
            className="bg-transparent dark:text-gray-100 border-none focus:ring-0 font-medium text-gray-700 outline-none w-1/3"
            required
          >
            <option value="" disabled className="dark:bg-gray-800">
              Select Bucket
            </option>
            {buckets.map((b) => (
              <option key={b.id} value={b.id} className="dark:bg-gray-800">
                {b.name}
              </option>
            ))}
          </select>
          <div className="relative w-1/4">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
              {currencySymbols[currency]}
            </span>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent pl-6 dark:text-gray-100 border-none focus:ring-0 outline-none placeholder-gray-400"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 bg-transparent dark:text-gray-100 border-none focus:ring-0 outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition active:scale-95"
          >
            Log
          </button>
        </form>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No expenses logged yet.
          </p>
        ) : (
          transactions.map((t) => {
            const b = buckets.find((b) => b.id === t.bucketId);
            if (!b) return null;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Minus size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {b.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(t.date).toLocaleDateString()}{" "}
                      {t.note && `- ${t.note}`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  -{currencySymbols[currency]}
                  {t.amount.toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
