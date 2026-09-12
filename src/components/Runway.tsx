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
  ArrowUp,
  ArrowDown,
  Zap,
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
    moveMilestone,
    undo,
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
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-4 sm:p-6 overflow-hidden">
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

      {/* Chronological Goals & Feasibility Roadmap */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-4 sm:p-6 overflow-hidden space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Target size={18} className="text-purple-500 shrink-0" />{" "}
              Chronological Goals Roadmap
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Sequential timeline feasibility. Goals are funded sequentially at{" "}
              {sym}
              {Math.max(0, Math.round(guaranteedSavings)).toLocaleString()}/mo.
            </p>
          </div>

          {guaranteedSavings > 0 ? (
            <span className="self-start sm:self-auto text-xs px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold rounded-full border border-green-500/20">
              ● Feasible Pace Active
            </span>
          ) : (
            <span className="self-start sm:self-auto text-xs px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold rounded-full border border-amber-500/20">
              ⚠️ Positive Savings Needed
            </span>
          )}
        </div>

        {/* Popular Goal Quick Presets */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Quick Add Milestones
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              {
                title: "📱 iPhone 16 Pro",
                amount:
                  currency === "MDL" ? 17000 : currency === "EUR" ? 950 : 999,
              },
              {
                title: "💻 MacBook Pro M-series",
                amount:
                  currency === "MDL" ? 32000 : currency === "EUR" ? 1800 : 1900,
              },
              {
                title: "✈️ Summer Vacation",
                amount:
                  currency === "MDL" ? 12000 : currency === "EUR" ? 650 : 700,
              },
              {
                title: "🛡️ 3-Month Emergency Fund",
                amount:
                  currency === "MDL" ? 30000 : currency === "EUR" ? 1600 : 1700,
              },
            ].map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => {
                  addMilestone({ title: p.title, targetAmount: p.amount });
                  toast.success(
                    `Added ${p.title} (${sym}${p.amount.toLocaleString()})`,
                    {
                      action: {
                        label: "Undo",
                        onClick: () => undo(),
                      },
                    },
                  );
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all active:scale-95"
              >
                <span>{p.title}</span>
                <span className="text-[10px] text-gray-400 font-bold">
                  {sym}
                  {p.amount.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Add Milestone Form */}
        <form
          onSubmit={handleAddMilestone}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="text"
            placeholder="Custom goal (e.g. Car Down Payment, Tuition)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 min-w-0 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-purple-400 flex-1 sm:w-32 sm:flex-none">
              <span className="text-xs text-gray-400 font-semibold select-none mr-1.5 shrink-0">
                {sym.trim()}
              </span>
              <input
                type="number"
                placeholder="Target"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full min-w-0 bg-transparent text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0"
            >
              Add Goal
            </button>
          </div>
        </form>

        {/* Chronological Milestone Sequential Cards */}
        <div className="space-y-3">
          <AnimatePresence>
            {(() => {
              let cumulativeUncompleted = 0;
              let uncompletedIndex = 0;

              return milestones.map((m, idx) => {
                let rankLabel = "";
                let estLabel = "";
                let monthsToTarget = 0;
                let isCurrentTarget = false;

                if (!m.completed) {
                  uncompletedIndex += 1;
                  isCurrentTarget = uncompletedIndex === 1;
                  rankLabel = isCurrentTarget
                    ? "Priority #1 · In Progress"
                    : `Priority #${uncompletedIndex} · Queued`;
                  cumulativeUncompleted += m.targetAmount;

                  if (guaranteedSavings > 0) {
                    monthsToTarget = Math.ceil(
                      cumulativeUncompleted / guaranteedSavings,
                    );
                    const targetDate = new Date(
                      now.getFullYear(),
                      now.getMonth() + monthsToTarget,
                      1,
                    );
                    estLabel = `${targetDate.toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })} (in ${monthsToTarget} mos)`;
                  } else {
                    estLabel = "Need positive savings";
                  }
                }

                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      m.completed
                        ? "bg-green-50/60 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/40 opacity-75"
                        : isCurrentTarget
                          ? "bg-white/90 dark:bg-gray-900/80 border-indigo-500/30 shadow-md shadow-indigo-500/5"
                          : "bg-white/70 dark:bg-gray-900/60 border-white/40 dark:border-gray-700/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleMilestone(m.id)}
                          className="text-gray-400 hover:text-green-500 transition-colors shrink-0"
                          title={
                            m.completed ? "Mark incomplete" : "Mark complete"
                          }
                        >
                          {m.completed ? (
                            <CheckCircle2
                              size={22}
                              className="text-green-500"
                            />
                          ) : (
                            <Circle size={22} />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p
                              className={`text-sm font-bold truncate ${
                                m.completed
                                  ? "line-through text-gray-400"
                                  : "text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              {m.title}
                            </p>
                            {!m.completed && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                  isCurrentTarget
                                    ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                }`}
                              >
                                {rankLabel}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              Target: {sym}
                              {m.targetAmount.toLocaleString()}
                            </span>
                            {!m.completed && (
                              <>
                                <span>·</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                  Est. Arrival: {estLabel}
                                </span>
                                {uncompletedIndex > 1 && (
                                  <>
                                    <span>·</span>
                                    <span className="text-[11px] text-gray-400">
                                      Cumulative: {sym}
                                      {cumulativeUncompleted.toLocaleString()}
                                    </span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls: Reorder Priority + Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!m.completed && (
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveMilestone(m.id, "up")}
                              disabled={idx === 0}
                              className="p-1 rounded text-gray-400 hover:text-indigo-600 disabled:opacity-20 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
                              title="Move up priority"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => moveMilestone(m.id, "down")}
                              disabled={idx === milestones.length - 1}
                              className="p-1 rounded text-gray-400 hover:text-indigo-600 disabled:opacity-20 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
                              title="Move down priority"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            removeMilestone(m.id);
                            toast.info("Milestone removed", {
                              action: {
                                label: "Undo",
                                onClick: () => undo(),
                              },
                            });
                          }}
                          className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete milestone"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress & Accelerator Bar for Active Milestone */}
                    {!m.completed &&
                      isCurrentTarget &&
                      guaranteedSavings > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 gap-2 flex-wrap">
                          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                            <Zap size={12} /> Saving {sym}
                            {Math.round(guaranteedSavings).toLocaleString()}/mo
                            towards this goal
                          </span>
                          <span className="text-gray-400">
                            {monthsToTarget <= 3
                              ? "🚀 Near-term horizon"
                              : monthsToTarget <= 12
                                ? "🎯 Feasible within 1 year"
                                : "📅 Multi-year milestone"}
                          </span>
                        </div>
                      )}
                  </motion.div>
                );
              });
            })()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
