import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { Plus, Minus } from "lucide-react";

export const Ledger = () => {
  const { transactions, addTransaction, categories } = useFinance();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    addTransaction({ amount: Number(amount), categoryId, note });
    setAmount("");
    setNote("");
  };

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Transactions
      </h2>

      {categories.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          Please create a Category first.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex gap-4 mb-8 bg-white/60 dark:bg-gray-900/60 p-4 rounded-2xl border border-white/50 dark:border-gray-700/50"
        >
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-transparent dark:text-gray-100 border-none focus:ring-0 font-medium text-gray-700 outline-none w-1/3"
            required
          >
            <option value="" disabled className="dark:bg-gray-800">
              Select Category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="dark:bg-gray-800">
                {c.name} ({c.type})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-1/4 bg-transparent dark:text-gray-100 border-none focus:ring-0 outline-none placeholder-gray-400"
            required
          />
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

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No transactions yet.
          </p>
        ) : (
          transactions.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            if (!cat) return null;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${cat.type === "income" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}
                  >
                    {cat.type === "income" ? (
                      <Plus size={20} />
                    ) : (
                      <Minus size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {cat.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(t.date).toLocaleDateString()}{" "}
                      {t.note && `- ${t.note}`}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-lg font-semibold ${cat.type === "income" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}
                >
                  {cat.type === "income" ? "+" : "-"}$
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
