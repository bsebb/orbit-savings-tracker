import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { Plus, Minus } from "lucide-react";

export const Ledger = () => {
  const { transactions, addTransaction } = useFinance();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    addTransaction({ amount: Number(amount), category, type });
    setAmount("");
    setCategory("");
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Transactions
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex gap-4 mb-8 bg-white/60 p-4 rounded-2xl border border-white/50"
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          className="bg-transparent border-none focus:ring-0 font-medium text-gray-700 outline-none"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 placeholder-gray-400 outline-none"
        />
        <input
          type="text"
          placeholder="Category (e.g. Groceries)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 placeholder-gray-400 outline-none"
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition active:scale-95"
        >
          Add
        </button>
      </form>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions yet.</p>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-white/30 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${t.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                >
                  {t.type === "income" ? (
                    <Plus size={20} />
                  ) : (
                    <Minus size={20} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.category}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(t.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p
                className={`text-lg font-semibold ${t.type === "income" ? "text-green-600" : "text-gray-900"}`}
              >
                {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
