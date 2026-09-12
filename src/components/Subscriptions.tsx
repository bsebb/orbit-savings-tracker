import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  useFinance,
  currencySymbols,
  type Currency,
} from "../context/FinanceContext";
import { RefreshCw, Trash2 } from "lucide-react";

const ICONS = ["📺", "🎵", "☁️", "📦", "🎮", "📰", "🏋️", "🔐", "🌐", "⚡"];
const CURRENCIES: Currency[] = ["USD", "EUR", "MDL"];

const PRESETS = [
  { icon: "📺", name: "Netflix", currency: "USD" as Currency },
  { icon: "🎵", name: "Spotify", currency: "USD" as Currency },
  { icon: "☁️", name: "iCloud", currency: "USD" as Currency },
  { icon: "📦", name: "Amazon Prime", currency: "USD" as Currency },
  { icon: "🎮", name: "Xbox / PS Plus", currency: "USD" as Currency },
];

export const Subscriptions = () => {
  const {
    subscriptions,
    addSubscription,
    removeSubscription,
    totalSubscriptions,
    currency,
  } = useFinance();
  const appSym = currencySymbols[currency];
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [icon, setIcon] = useState("📺");
  const [subCurrency, setSubCurrency] = useState<Currency>(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    addSubscription({
      name: name.trim(),
      amount: Number(amount),
      icon,
      currency: subCurrency,
    });
    toast.success(`${icon} ${name.trim()} subscription added`);
    setName("");
    setAmount("");
  };

  const handlePreset = (p: (typeof PRESETS)[0]) => {
    addSubscription({
      name: p.name,
      amount: 0,
      icon: p.icon,
      currency: p.currency,
    });
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <RefreshCw size={20} className="text-purple-500" /> Subscriptions
        </h2>
        {subscriptions.length > 0 && (
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            ≈ {appSym}
            {Math.round(totalSubscriptions).toLocaleString()}/mo
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        Fixed recurring costs — auto-deducted from savings. Each can have its
        own billing currency.
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
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 mb-6 flex-wrap items-center"
      >
        {/* Emoji picker */}
        <select
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
        >
          {ICONS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Service name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[120px] bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* Amount + currency pill */}
        <div className="flex rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSubCurrency(c)}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors border-r border-gray-200 dark:border-gray-700 last:border-0 ${subCurrency === c ? "bg-purple-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              {currencySymbols[c]}
            </button>
          ))}
          <div className="relative flex items-center">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24 bg-transparent pl-3 pr-3 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            />
          </div>
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
            subscriptions.map((s) => {
              const sCur = s.currency ?? currency;
              const sSym = currencySymbols[sCur];
              return (
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
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400">
                          Recurring monthly
                        </span>
                        {sCur !== currency && (
                          <span className="text-xs px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">
                            {sCur}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        -{sSym}
                        {s.amount.toLocaleString()}/mo
                      </p>
                      {sCur !== currency && (
                        <p className="text-xs text-gray-400">
                          ≈ {appSym}
                          {Math.round(
                            s.amount *
                              (RATES_TO_USD_EXPORT[sCur] /
                                RATES_TO_USD_EXPORT[currency]),
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
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
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Duplicate of context rates needed here for inline display conversion
const RATES_TO_USD_EXPORT: Record<Currency, number> = {
  USD: 1,
  EUR: 1 / 0.92,
  MDL: 1 / 17.8,
};
