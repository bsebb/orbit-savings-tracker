import React, { useState } from "react";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { LayoutGrid, Trash2 } from "lucide-react";

export const Buckets = () => {
  const { buckets, addBucket, removeBucket, getBucketSpent, currency } =
    useFinance();
  const [name, setName] = useState("");
  const [allocated, setAllocated] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !allocated) return;
    addBucket({ name, allocated: Number(allocated) });
    setName("");
    setAllocated("");
  };

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <LayoutGrid className="text-indigo-500" /> Expense Buckets
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex gap-4 mb-8 bg-white/60 dark:bg-gray-900/60 p-4 rounded-2xl border border-white/50 dark:border-gray-700/50"
      >
        <input
          type="text"
          placeholder="Bucket Name (e.g. Groceries)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent dark:text-gray-100 border-none focus:ring-0 outline-none placeholder-gray-400 dark:placeholder-gray-500"
        />
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
            {currencySymbols[currency]}
          </span>
          <input
            type="number"
            placeholder="Monthly Limit"
            value={allocated}
            onChange={(e) => setAllocated(e.target.value)}
            className="w-full bg-transparent pl-6 dark:text-gray-100 border-none focus:ring-0 outline-none placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition active:scale-95"
        >
          Add
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {buckets.map((b) => {
          const spent = getBucketSpent(b.id);
          const progress = Math.min((spent / b.allocated) * 100, 100);
          const isOver = spent > b.allocated;

          return (
            <div
              key={b.id}
              className="p-5 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-sm relative overflow-hidden group"
            >
              <div
                className={`absolute left-0 bottom-0 top-0 -z-10 transition-all duration-1000 ease-out ${isOver ? "bg-red-200/50 dark:bg-red-900/30" : "bg-indigo-100/50 dark:bg-indigo-900/30"}`}
                style={{ width: `${progress}%` }}
              />
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {b.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currencySymbols[currency]}
                    {spent.toLocaleString()} spent / {currencySymbols[currency]}
                    {b.allocated.toLocaleString()}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <button
                    onClick={() => removeBucket(b.id)}
                    className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500 mb-2"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span
                    className={`text-xl font-bold ${isOver ? "text-red-600 dark:text-red-400" : "text-indigo-600 dark:text-indigo-400"}`}
                  >
                    {currencySymbols[currency]}
                    {(b.allocated - spent).toLocaleString()} left
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
