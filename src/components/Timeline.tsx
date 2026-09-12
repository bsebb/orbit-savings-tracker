import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  useFinance,
  currencySymbols,
  formatMonthKey,
} from "../context/FinanceContext";
import {
  Calendar,
  Search,
  Trash2,
  Download,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export const Timeline = () => {
  const {
    transactions,
    removeTransaction,
    buckets,
    currency,
    selectedMonth,
    setSelectedMonth,
    allMonths,
  } = useFinance();

  const sym = currencySymbols[currency];
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBucket, setFilterBucket] = useState<string>("all");

  // Month navigation
  const [currentYear, currentMonthNum] = selectedMonth.split("-").map(Number);
  const dateObj = new Date(currentYear, currentMonthNum - 1, 1);
  const monthName = dateObj.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    const prev = new Date(currentYear, currentMonthNum - 2, 1);
    setSelectedMonth(formatMonthKey(prev));
  };

  const handleNextMonth = () => {
    const next = new Date(currentYear, currentMonthNum, 1);
    setSelectedMonth(formatMonthKey(next));
  };

  // Month-filtered transactions
  const monthTransactions = transactions.filter(
    (t) => t.date.slice(0, 7) === selectedMonth,
  );

  // Filtered by search and bucket
  const filtered = monthTransactions.filter((t) => {
    const bucket = buckets.find((b) => b.id === t.bucketId);
    const nameMatch = (bucket?.name || "Income")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const noteMatch = (t.note || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || noteMatch;

    if (filterBucket === "all") return matchesSearch;
    if (filterBucket === "income") return matchesSearch && t.type === "income";
    return matchesSearch && t.bucketId === filterBucket;
  });

  const totalIn = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netMonth = totalIn - totalOut;

  // Export CSV
  const handleExportCSV = () => {
    if (monthTransactions.length === 0) {
      toast.error("No transactions in this month to export");
      return;
    }

    const headers = "Date,Type,Category,Amount,Note\n";
    const rows = monthTransactions
      .map((t) => {
        const cat =
          t.type === "income"
            ? "Income"
            : buckets.find((b) => b.id === t.bucketId)?.name || "General";
        const note = `"${(t.note || "").replace(/"/g, '""')}"`;
        return `${t.date.slice(0, 10)},${t.type},${cat},${t.amount},${note}`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orbit-ledger-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported CSV for ${selectedMonth}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-4 sm:p-6 w-full max-w-2xl mx-auto space-y-6 overflow-hidden"
    >
      {/* Header & Month Navigator */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500" /> Transaction
            Ledger
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Temporal audit trail with multi-year historical logs
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all active:scale-95"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Month Picker Bar */}
      <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-900/60 rounded-2xl border border-white/40 dark:border-gray-700/40">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {monthName}
          </p>
          <p className="text-[11px] text-gray-400">
            {monthTransactions.length} transactions logged
          </p>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="p-3 bg-green-50/70 dark:bg-green-950/20 rounded-2xl border border-green-200/50 dark:border-green-900/30">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
            Total In
          </p>
          <p className="text-base font-bold text-green-700 dark:text-green-300 mt-0.5">
            +{sym}
            {totalIn.toLocaleString()}
          </p>
        </div>

        <div className="p-3 bg-red-50/70 dark:bg-red-950/20 rounded-2xl border border-red-200/50 dark:border-red-900/30">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Total Out
          </p>
          <p className="text-base font-bold text-red-700 dark:text-red-300 mt-0.5">
            -{sym}
            {totalOut.toLocaleString()}
          </p>
        </div>

        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/30">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Net Flow
          </p>
          <p
            className={`text-base font-bold mt-0.5 ${netMonth >= 0 ? "text-indigo-700 dark:text-indigo-300" : "text-red-600"}`}
          >
            {netMonth >= 0 ? "+" : ""}
            {sym}
            {netMonth.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search note or envelope..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <select
          value={filterBucket}
          onChange={(e) => setFilterBucket(e.target.value)}
          className="bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Categories</option>
          <option value="income">Only Income</option>
          {buckets.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No transactions recorded for this period.
              </p>
            </div>
          ) : (
            filtered.map((t) => {
              const b = buckets.find((b) => b.id === t.bucketId);
              const isIncome = t.type === "income";

              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  className="flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-gray-900/60 rounded-2xl border border-white/30 dark:border-gray-700/30 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isIncome
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}
                    >
                      {isIncome ? <Plus size={15} /> : <Minus size={15} />}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {isIncome
                          ? "One-off Income"
                          : b?.name || "General Expense"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {t.date.slice(0, 10)}
                        {t.note ? ` · ${t.note}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        isIncome
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {sym}
                      {t.amount.toLocaleString()}
                    </span>

                    <button
                      onClick={() => {
                        removeTransaction(t.id);
                        toast.error("Transaction removed");
                      }}
                      className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="Delete Transaction"
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
