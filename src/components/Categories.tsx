import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { LayoutGrid } from "lucide-react";

export const Categories = () => {
  const { categories, addCategory, transactions } = useFinance();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    addCategory({ name, targetAmount: Number(targetAmount), type });
    setName("");
    setTargetAmount("");
  };

  const getSpent = (catId: string) => {
    const currentMonth = new Date().getMonth();
    return transactions
      .filter(
        (t) =>
          t.categoryId === catId &&
          new Date(t.date).getMonth() === currentMonth,
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <LayoutGrid className="text-indigo-500" /> Envelopes
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex gap-4 mb-8 bg-white/60 dark:bg-gray-900/60 p-4 rounded-2xl border border-white/50 dark:border-gray-700/50"
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          className="bg-transparent dark:text-gray-100 border-none focus:ring-0 font-medium text-gray-700 outline-none"
        >
          <option value="expense" className="dark:bg-gray-800">
            Expense
          </option>
          <option value="income" className="dark:bg-gray-800">
            Income
          </option>
        </select>
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent dark:text-gray-100 border-none focus:ring-0 outline-none placeholder-gray-400 dark:placeholder-gray-500"
        />
        <input
          type="number"
          placeholder="Monthly Budget"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="flex-1 bg-transparent dark:text-gray-100 border-none focus:ring-0 outline-none placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition active:scale-95"
        >
          Add
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((c) => {
          const spent = getSpent(c.id);
          const progress = Math.min((spent / c.targetAmount) * 100, 100);
          const isOver = spent > c.targetAmount;

          return (
            <div
              key={c.id}
              className="p-5 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-sm relative overflow-hidden"
            >
              <div
                className={`absolute left-0 bottom-0 top-0 -z-10 transition-all duration-1000 ease-out ${c.type === "expense" ? (isOver ? "bg-red-200/50 dark:bg-red-900/30" : "bg-indigo-100/50 dark:bg-indigo-900/30") : "bg-green-100/50 dark:bg-green-900/30"}`}
                style={{ width: `${progress}%` }}
              />
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {c.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${spent.toLocaleString()} / $
                    {c.targetAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xl font-bold ${c.type === "expense" ? (isOver ? "text-red-600 dark:text-red-400" : "text-indigo-600 dark:text-indigo-400") : "text-green-600 dark:text-green-400"}`}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
