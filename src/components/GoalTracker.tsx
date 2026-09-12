import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { Target } from "lucide-react";

export const GoalTracker = () => {
  const { goals, addGoal } = useFinance();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;
    addGoal({ name, targetAmount: Number(target) });
    setName("");
    setTarget("");
  };

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <Target className="text-purple-500" /> Savings Goals
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex gap-4 mb-8 bg-white/60 dark:bg-gray-900/60 p-4 rounded-2xl border border-white/50 dark:border-gray-700/50"
      >
        <input
          type="text"
          placeholder="Goal (e.g. MacBook Pro)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent dark:text-gray-100 border-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
        />
        <input
          type="number"
          placeholder="Target Amount"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="flex-1 bg-transparent dark:text-gray-100 border-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition active:scale-95"
        >
          Create
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((g) => {
          const progress = Math.min(
            (g.currentAmount / g.targetAmount) * 100,
            100,
          );
          return (
            <div
              key={g.id}
              className="p-5 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-sm relative overflow-hidden"
            >
              <div
                className="absolute left-0 bottom-0 top-0 bg-purple-100/50 dark:bg-purple-900/30 -z-10 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {g.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${g.currentAmount.toLocaleString()} / $
                    {g.targetAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
