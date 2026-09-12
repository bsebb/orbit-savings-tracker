import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import {
  LayoutGrid,
  Trash2,
  Pencil,
  Check,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Receipt,
  X,
} from "lucide-react";

type PresetEnvelope = {
  emoji: string;
  name: string;
  suggestedPct: number; // Suggested % of monthly income
  description: string;
};

const ENVELOPE_CATALOG: PresetEnvelope[] = [
  {
    emoji: "🍔",
    name: "Food & Groceries",
    suggestedPct: 0.25,
    description: "Supermarkets, daily meals, pantry & dining",
  },
  {
    emoji: "🚌",
    name: "Transport & Transit",
    suggestedPct: 0.1,
    description: "Commute, fuel, public transit & ride-sharing",
  },
  {
    emoji: "🏠",
    name: "Housing & Utilities",
    suggestedPct: 0.3,
    description: "Rent, maintenance, electricity & water",
  },
  {
    emoji: "🎓",
    name: "University & Studies",
    suggestedPct: 0.1,
    description: "Tuition, textbooks, courses & materials",
  },
  {
    emoji: "🎉",
    name: "Leisure & Fun",
    suggestedPct: 0.1,
    description: "Concerts, cinema, hobbies & weekend outings",
  },
  {
    emoji: "👕",
    name: "Clothing & Style",
    suggestedPct: 0.05,
    description: "Apparel, seasonal footwear & accessories",
  },
  {
    emoji: "💊",
    name: "Health & Wellness",
    suggestedPct: 0.05,
    description: "Pharmacy, doctor checkups & personal care",
  },
  {
    emoji: "💻",
    name: "Tech & Equipment",
    suggestedPct: 0.05,
    description: "Hardware, electronics, accessories & gear",
  },
];

export const Buckets = () => {
  const {
    buckets,
    addBucket,
    removeBucket,
    updateBucket,
    getBucketSpent,
    currency,
    monthlyIncome,
    unbudgetedExpenses,
    addTransaction,
    undo,
  } = useFinance();

  const totalAllocated = buckets.reduce((acc, b) => acc + b.allocated, 0);

  const sym = currencySymbols[currency];
  const [showCatalog, setShowCatalog] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Custom Form state
  const [name, setName] = useState("");
  const [allocated, setAllocated] = useState("");

  // Edit inline allocation
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  // Inline Log Expense on a specific bucket
  const [loggingBucketId, setLoggingBucketId] = useState<string | null>(null);
  const [logAmount, setLogAmount] = useState("");
  const [logNote, setLogNote] = useState("");

  const existingNames = new Set(
    buckets.map((b) => b.name.toLowerCase().trim()),
  );

  const filteredCatalog = ENVELOPE_CATALOG.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddPreset = (preset: PresetEnvelope) => {
    const suggestedAmount =
      monthlyIncome > 0
        ? Math.round((monthlyIncome * preset.suggestedPct) / 50) * 50
        : 200;

    addBucket({
      name: `${preset.emoji} ${preset.name}`,
      allocated: suggestedAmount,
    });
    toast.success(
      `Envelope "${preset.name}" created with ${sym}${suggestedAmount.toLocaleString()} budget`,
    );
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !allocated) return;
    addBucket({ name: name.trim(), allocated: Number(allocated) });
    toast.success(`Envelope "${name.trim()}" created`);
    setName("");
    setAllocated("");
    setShowCustomForm(false);
  };

  const handleEditSave = (id: string, currentName: string) => {
    const val = Number(editVal);
    if (!isNaN(val) && val >= 0) {
      updateBucket(id, { allocated: val });
      toast.success(`${currentName} budget updated`);
    }
    setEditingId(null);
    setEditVal("");
  };

  const handleInlineLogExpense = (
    e: React.FormEvent,
    bucketId: string,
    bucketName: string,
  ) => {
    e.preventDefault();
    const num = Number(logAmount);
    if (isNaN(num) || num <= 0) return;

    addTransaction({
      amount: num,
      type: "expense",
      bucketId,
      note: logNote.trim() || undefined,
    });

    toast.success(`Logged ${sym}${num.toLocaleString()} to ${bucketName}`, {
      action: {
        label: "Undo",
        onClick: () => undo(),
      },
    });
    setLogAmount("");
    setLogNote("");
    setLoggingBucketId(null);
  };

  const allocationPct =
    monthlyIncome > 0
      ? Math.min(Math.round((totalAllocated / monthlyIncome) * 100), 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-4 sm:p-6 w-full max-w-2xl mx-auto overflow-hidden space-y-5"
    >
      {/* Header & Allocation Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <LayoutGrid size={20} className="text-indigo-500 shrink-0" />{" "}
            Expense Envelopes
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Zero-based envelope budgeting. Allocate income before you spend.
          </p>
        </div>

        <div className="self-start sm:self-auto px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <span>Allocated:</span>
          <span>
            {sym}
            {totalAllocated.toLocaleString()}
          </span>
          {monthlyIncome > 0 && (
            <span className="text-[10px] text-gray-400 font-normal">
              ({allocationPct}% of income)
            </span>
          )}
        </div>
      </div>

      {/* Allocation Progress Meter */}
      {monthlyIncome > 0 && (
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-gray-200/70 dark:bg-gray-700/60 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                totalAllocated > monthlyIncome
                  ? "bg-red-500"
                  : allocationPct > 90
                    ? "bg-amber-500"
                    : "bg-indigo-500"
              }`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((totalAllocated / monthlyIncome) * 100, 100)}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-medium">
            <span>{allocationPct}% allocated to envelopes</span>
            <span>
              {totalAllocated <= monthlyIncome
                ? `${sym}${(monthlyIncome - totalAllocated).toLocaleString()} compounds as savings`
                : `${sym}${(totalAllocated - monthlyIncome).toLocaleString()} over total income`}
            </span>
          </div>
        </div>
      )}

      {/* Envelope Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {buckets.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white/40 dark:bg-gray-900/30 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                No expense envelopes created yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tap below to choose recommended categories or add a custom
                envelope.
              </p>
            </div>
          ) : (
            buckets.map((b) => {
              const spent = getBucketSpent(b.id);
              const progress =
                b.allocated > 0
                  ? Math.min((spent / b.allocated) * 100, 100)
                  : 0;
              const isOver = b.allocated > 0 && spent > b.allocated;
              const remaining = b.allocated - spent;
              const isLoggingHere = loggingBucketId === b.id;

              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className="relative p-4 sm:p-5 bg-white/70 dark:bg-gray-900/60 rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-sm overflow-hidden group space-y-3"
                >
                  <motion.div
                    className={`absolute inset-y-0 left-0 -z-10 ${
                      isOver
                        ? "bg-red-100 dark:bg-red-900/20"
                        : "bg-indigo-100/70 dark:bg-indigo-900/20"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />

                  {/* Top Bar: Name + Edit/Trash */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {b.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {sym}
                        {spent.toLocaleString()} spent
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
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
                            className="w-20 bg-white dark:bg-gray-800 border border-indigo-400 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
                          />
                          <button
                            onClick={() => handleEditSave(b.id, b.name)}
                            className="p-1 text-indigo-500 hover:text-indigo-700"
                            title="Save"
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
                            title="Edit allocation"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => {
                              removeBucket(b.id);
                              toast.info(`${b.name} removed`, {
                                action: {
                                  label: "Undo",
                                  onClick: () => undo(),
                                },
                              });
                            }}
                            className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                            title="Delete envelope"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mid Bar: Budget vs Remaining */}
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-xs text-gray-400">
                      {sym}
                      {b.allocated.toLocaleString()} budget
                    </span>
                    <span
                      className={`text-base font-extrabold ${
                        isOver
                          ? "text-red-500 dark:text-red-400"
                          : remaining === 0
                            ? "text-gray-400"
                            : "text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {isOver ? "-" : ""}
                      {sym}
                      {Math.abs(remaining).toLocaleString()}{" "}
                      {isOver ? "over" : "left"}
                    </span>
                  </div>

                  {/* Bottom Action: Inline Quick Log Expense */}
                  <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
                    {!isLoggingHere ? (
                      <button
                        onClick={() => {
                          setLoggingBucketId(b.id);
                          setLogAmount("");
                          setLogNote("");
                        }}
                        className="w-full flex items-center justify-center gap-1 py-1.5 bg-white/60 dark:bg-gray-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-gray-200/60 dark:border-gray-700/50 rounded-xl text-[11px] font-semibold transition-all"
                      >
                        <Plus size={12} /> Log Expense
                      </button>
                    ) : (
                      <form
                        onSubmit={(e) =>
                          handleInlineLogExpense(e, b.id, b.name)
                        }
                        className="space-y-2 pt-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white dark:bg-gray-800 border border-indigo-400 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-400 w-32 shrink-0">
                            <span className="text-xs font-bold text-gray-400 select-none mr-1.5 shrink-0">
                              {sym.trim()}
                            </span>
                            <input
                              autoFocus
                              type="number"
                              step="any"
                              placeholder="0.00"
                              value={logAmount}
                              onChange={(e) => setLogAmount(e.target.value)}
                              required
                              className="w-full min-w-0 bg-transparent text-xs font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="Note (optional)"
                            value={logNote}
                            onChange={(e) => setLogNote(e.target.value)}
                            className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setLoggingBucketId(null)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                          >
                            Log
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}

          {unbudgetedExpenses > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="relative p-4 sm:p-5 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 shadow-sm overflow-hidden group space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <span>📦</span> Uncategorized / Miscellaneous
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                    {sym}
                    {unbudgetedExpenses.toLocaleString()} spent this month
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
                  Unbudgeted
                </span>
              </div>
              <div className="flex justify-between items-end pt-1 text-xs">
                <span className="text-gray-400">No envelope limit</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Deducted from savings buffer
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Catalog & Quick Add Drawer Trigger */}
      <div className="pt-2">
        <button
          onClick={() => setShowCatalog((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 hover:from-indigo-500/20 hover:to-purple-500/15 border border-indigo-500/20 dark:border-indigo-500/30 rounded-2xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            <span>
              {showCatalog
                ? "Hide Envelope Catalog"
                : "+ Browse Envelope Catalog (Food, Commute, Rent, Health)"}
            </span>
          </div>
          {showCatalog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Envelope Catalog Table */}
      <AnimatePresence>
        {showCatalog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-4 pt-1 pb-3 px-1"
          >
            {/* Search Input */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search food, rent, university, leisure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400"
              />
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredCatalog.map((item) => {
                const isAdded =
                  existingNames.has(item.name.toLowerCase().trim()) ||
                  existingNames.has(
                    `${item.emoji} ${item.name}`.toLowerCase().trim(),
                  );

                const suggestedAmount =
                  monthlyIncome > 0
                    ? Math.round((monthlyIncome * item.suggestedPct) / 50) * 50
                    : 200;

                return (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isAdded
                        ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/40 dark:border-indigo-800/40 opacity-70"
                        : "bg-white/80 dark:bg-gray-900/70 border-gray-200/70 dark:border-gray-700/60 hover:border-indigo-300 dark:hover:border-indigo-600"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{item.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        {sym}
                        {suggestedAmount.toLocaleString()}
                      </span>

                      <button
                        onClick={() => handleAddPreset(item)}
                        disabled={isAdded}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isAdded
                            ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={12} /> Active
                          </>
                        ) : (
                          <>
                            <Plus size={12} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Envelope Dropdown Toggle */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowCustomForm((prev) => !prev)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Don't see your category? Add custom envelope</span>
                {showCustomForm ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>

              {/* Custom Envelope Form */}
              <AnimatePresence>
                {showCustomForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCustomSubmit}
                    className="pt-3 pb-2 px-1 flex flex-col sm:flex-row gap-2.5"
                  >
                    <input
                      type="text"
                      placeholder="Envelope name (e.g. Pet Care, Gaming)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 min-w-0 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400"
                    />

                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="flex items-center bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-400/40 focus-within:border-indigo-400 flex-1 sm:w-32 sm:flex-none">
                        <span className="text-xs text-gray-400 font-semibold select-none mr-1.5 shrink-0">
                          {sym.trim()}
                        </span>
                        <input
                          type="number"
                          placeholder="Budget"
                          value={allocated}
                          onChange={(e) => setAllocated(e.target.value)}
                          className="w-full min-w-0 bg-transparent text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0"
                      >
                        Create
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
