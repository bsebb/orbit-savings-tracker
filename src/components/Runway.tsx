import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import {
  TrendingUp,
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

export const Runway = () => {
  const {
    guaranteedSavings,
    currency,
    milestones,
    addMilestone,
    toggleMilestone,
    removeMilestone,
  } = useFinance();

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sym = currencySymbols[currency];

  const [monthsAhead, setMonthsAhead] = useState(48); // Up to 4 years
  const [annualApy, setAnnualApy] = useState(5); // 5% default return
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");

  // 4-year compounding projection
  const monthlyRate = annualApy / 100 / 12;
  const labels: string[] = [];
  const projectionData: number[] = [];

  let accumulated = 0;
  const now = new Date();

  for (let m = 1; m <= monthsAhead; m++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const label =
      m % 6 === 0 || m === 1 || m === monthsAhead
        ? futureDate.toLocaleDateString(undefined, {
            month: "short",
            year: "2-digit",
          })
        : "";
    labels.push(label);

    accumulated = (accumulated + guaranteedSavings) * (1 + monthlyRate);
    projectionData.push(Math.round(accumulated));
  }

  const finalNetWorth = projectionData[projectionData.length - 1] || 0;

  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        data: projectionData,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: isDark
          ? "rgba(99, 102, 241, 0.15)"
          : "rgba(99, 102, 241, 0.08)",
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark
          ? "rgba(17, 24, 39, 0.94)"
          : "rgba(255, 255, 255, 0.94)",
        borderColor: isDark
          ? "rgba(99, 102, 241, 0.3)"
          : "rgba(99, 102, 241, 0.25)",
        borderWidth: 1,
        titleColor: isDark ? "#e5e7eb" : "#111827",
        bodyColor: isDark ? "#a5b4fc" : "#4f46e5",
        padding: { x: 14, y: 10 },
        cornerRadius: 14,
        displayColors: false,
        callbacks: {
          title: (items: { dataIndex: number }[]) => {
            const idx = items[0]?.dataIndex ?? 0;
            const target = new Date(
              now.getFullYear(),
              now.getMonth() + idx + 1,
              1,
            );
            return target.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            });
          },
          label: (item: { raw: unknown }) =>
            `${sym}${Number(item.raw).toLocaleString()} Net Runway`,
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (v: number | string) =>
            `${sym}${Number(v) >= 1000 ? `${Math.round(Number(v) / 1000)}k` : v}`,
          color: "#9ca3af",
          font: { size: 10 },
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", font: { size: 10 } },
      },
    },
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget) return;
    addMilestone({ title: newTitle.trim(), targetAmount: Number(newTarget) });
    toast.success(`Milestone "${newTitle.trim()}" created`);
    setNewTitle("");
    setNewTarget("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="space-y-6 w-full max-w-2xl mx-auto"
    >
      {/* 4-Year Runway Projection Card */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" /> 4-Year Wealth
              Runway
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Compounded trajectory based on your {sym}
              {Math.round(guaranteedSavings).toLocaleString()} monthly savings
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Projected Portfolio
            </span>
            <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {sym}
              {finalNetWorth.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 dark:border-gray-700/30">
          <div>
            <label className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              <span>Time horizon</span>
              <span className="text-indigo-500">
                {monthsAhead} mos ({Math.round((monthsAhead / 12) * 10) / 10}{" "}
                yrs)
              </span>
            </label>
            <input
              type="range"
              min="6"
              max="48"
              step="3"
              value={monthsAhead}
              onChange={(e) => setMonthsAhead(Number(e.target.value))}
              className="w-full bg-gray-200 dark:bg-gray-700 accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              <span>Yield / APY</span>
              <span className="text-purple-500">{annualApy}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={annualApy}
              onChange={(e) => setAnnualApy(Number(e.target.value))}
              className="w-full bg-gray-200 dark:bg-gray-700 accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Chart View */}
        <div className="h-64 sm:h-72 w-full">
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>

      {/* Milestones & Goals Tracker */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
          <Target size={18} className="text-purple-500" /> Multi-Year Milestones
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
          Automatic timeline forecasting calculated against your current savings
          velocity.
        </p>

        {/* Add Milestone Form */}
        <form
          onSubmit={handleAddMilestone}
          className="flex gap-2.5 mb-5 flex-wrap"
        >
          <input
            type="text"
            placeholder="Milestone (e.g. Master's Tuition, First 100k)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 min-w-[160px] bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              {sym}
            </span>
            <input
              type="number"
              placeholder="Target"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="w-28 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-7 pr-3 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all"
          >
            Add Goal
          </button>
        </form>

        {/* Milestone Cards */}
        <div className="space-y-2.5">
          <AnimatePresence>
            {milestones.map((m) => {
              const monthsToTarget =
                guaranteedSavings > 0
                  ? Math.ceil(m.targetAmount / guaranteedSavings)
                  : 0;
              const targetDate = new Date(
                now.getFullYear(),
                now.getMonth() + monthsToTarget,
                1,
              );
              const estLabel =
                guaranteedSavings > 0
                  ? targetDate.toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })
                  : "Need positive savings";

              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    m.completed
                      ? "bg-green-50/60 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/40 opacity-75"
                      : "bg-white/70 dark:bg-gray-900/60 border-white/40 dark:border-gray-700/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleMilestone(m.id)}
                      className="text-gray-400 hover:text-green-500 transition-colors"
                      title={m.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {m.completed ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <div>
                      <p
                        className={`text-sm font-semibold ${m.completed ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-100"}`}
                      >
                        {m.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        Target: {sym}
                        {m.targetAmount.toLocaleString()}{" "}
                        {!m.completed &&
                          `· Est. ${estLabel} (${monthsToTarget} mos)`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      removeMilestone(m.id);
                      toast.error("Milestone removed");
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
