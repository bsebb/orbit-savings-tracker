import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { RefreshCw, Trash2 } from "lucide-react";

const ICONS = ["📺", "🎵", "☁️", "📦", "🎮", "📰", "🏋️", "🔐", "🌐", "⚡"];

const PRESETS = [
  { icon: "📺", name: "Netflix" },
  { icon: "🎵", name: "Spotify" },
  { icon: "☁️", name: "iCloud" },
  { icon: "📦", name: "Amazon Prime" },
  { icon: "🎮", name: "Xbox / PS Plus" },
];

export const Subscriptions = () => {
  const {
    subscriptions,
    addSubscription,
    removeSubscription,
    totalSubscriptions,
    currency,
  } = useFinance();
  const sym = currencySymbols[currency];
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [icon, setIcon] = useState("📺");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    addSubscription({ name: name.trim(), amount: Number(amount), icon });
    toast.success(`${icon} ${name.trim()} subscription added`);
    setName("");
    setAmount("");
  };

  const handlePreset = (p: (typeof PRESETS)[0]) => {
    addSubscription({ name: p.name, amount: 0, icon: p.icon });
    toast.success(`${p.icon} ${p.name} added — set the amount`);
  };

  const existingNames = new Set(subscriptions.map((s) => s.name.toLowerCase()));
  const availablePresets = PRESETS.filter(
    (p) => !existingNames.has(p.name.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <RefreshCw size={20} className="text-purple-500" /> Subscriptions
        </h2>
        {subscriptions.length > 0 && (
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            {sym}
            {totalSubscriptions.toLocaleString()}/mo
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        Fixed recurring costs deducted automatically from your savings — no
        manual logging needed.
      </p>

      {/* Preset chips */}
      {availablePresets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {availablePresets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handlePreset(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all active:scale-95"
            >
              {p.icon} {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6 flex-wrap">
        {/* Icon picker */}
        <div className="relative">
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="appearance-none bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
          >
            {ICONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Service name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[120px] bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {sym}
          </span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-7 pr-3 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-all"
        >
          Add
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence>
          {subscriptions.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">
              No subscriptions yet.
            </p>
          ) : (
            subscriptions.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-gray-900/60 rounded-2xl border border-white/30 dark:border-gray-700/30 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400">Recurring monthly</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    -{sym}
                    {s.amount.toLocaleString()}/mo
                  </span>
                  <button
                    onClick={() => {
                      removeSubscription(s.id);
                      toast.error(`${s.name} removed`);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
