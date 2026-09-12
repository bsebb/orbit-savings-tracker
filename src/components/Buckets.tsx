import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { LayoutGrid, Trash2, Pencil, Check } from "lucide-react";

const PRESETS = [
  { emoji: "🍔", name: "Food" },
  { emoji: "🚌", name: "Transport" },
  { emoji: "🎓", name: "University" },
  { emoji: "🏠", name: "Housing" },
  { emoji: "🎉", name: "Fun" },
  { emoji: "👕", name: "Clothing" },
  { emoji: "💊", name: "Health" },
];

export const Buckets = () => {
  const {
    buckets,
    addBucket,
    removeBucket,
    updateBucket,
    getBucketSpent,
    currency,
  } = useFinance();
  const sym = currencySymbols[currency];
  const [name, setName] = useState("");
  const [allocated, setAllocated] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const existingNames = new Set(buckets.map((b) => b.name.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !allocated) return;
    addBucket({ name: name.trim(), allocated: Number(allocated) });
    toast.success(`Bucket "${name.trim()}" created`);
    setName("");
    setAllocated("");
  };

  const handlePreset = (presetName: string) => {
    addBucket({ name: presetName, allocated: 0 });
    toast.success(`${presetName} bucket added`);
  };

  const handleEditSave = (id: string, currentName: string) => {
    const val = Number(editVal);
    if (!isNaN(val) && val >= 0) {
      updateBucket(id, { allocated: val });
      toast.success(`${currentName} updated`);
    }
    setEditingId(null);
    setEditVal("");
  };

  const availablePresets = PRESETS.filter(
    (p) => !existingNames.has(p.name.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-4 sm:p-6 w-full max-w-2xl mx-auto overflow-hidden"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
        <LayoutGrid size={20} className="text-indigo-500" /> Expense Buckets
      </h2>

      {/* Preset chips */}
      {availablePresets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {availablePresets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handlePreset(p.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
            >
              <span>{p.emoji}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Custom bucket form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Custom bucket name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-0 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-28 sm:flex-none">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {sym}
            </span>
            <input
              type="number"
              placeholder="0"
              value={allocated}
              onChange={(e) => setAllocated(e.target.value)}
              className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-7 pr-3 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-all shrink-0"
          >
            Add
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {buckets.map((b) => {
            const spent = getBucketSpent(b.id);
            const progress =
              b.allocated > 0 ? Math.min((spent / b.allocated) * 100, 100) : 0;
            const isOver = b.allocated > 0 && spent > b.allocated;
            const remaining = b.allocated - spent;

            return (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative p-5 bg-white/70 dark:bg-gray-900/60 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-sm overflow-hidden group"
              >
                <motion.div
                  className={`absolute inset-y-0 left-0 -z-10 ${isOver ? "bg-red-100 dark:bg-red-900/20" : "bg-indigo-100/70 dark:bg-indigo-900/20"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />

                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {b.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {sym}
                      {spent.toLocaleString()} spent
                    </p>
                  </div>

                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    {editingId === b.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">{sym}</span>
                        <input
                          autoFocus
                          type="number"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleEditSave(b.id, b.name)
                          }
                          className="w-20 bg-white dark:bg-gray-800 border border-indigo-400 rounded-lg px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                        />
                        <button
                          onClick={() => handleEditSave(b.id, b.name)}
                          className="p-1 text-indigo-500 hover:text-indigo-700"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(b.id);
                            setEditVal(String(b.allocated));
                          }}
                          className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => {
                            removeBucket(b.id);
                            toast.error(`${b.name} removed`);
                          }}
                          className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-3">
                  <span className="text-xs text-gray-400">
                    {sym}
                    {b.allocated.toLocaleString()} budget
                  </span>
                  <span
                    className={`text-lg font-bold ${isOver ? "text-red-500 dark:text-red-400" : remaining === 0 && b.allocated === 0 ? "text-gray-400" : remaining === 0 ? "text-gray-400" : "text-indigo-600 dark:text-indigo-400"}`}
                  >
                    {isOver ? "-" : ""}
                    {sym}
                    {Math.abs(remaining).toLocaleString()}{" "}
                    {isOver ? "over" : "left"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
