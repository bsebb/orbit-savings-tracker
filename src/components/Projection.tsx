import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
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
import { TrendingUp } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

export const Projection = () => {
  const { monthlyIncome, buckets, currency, totalSubscriptions } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sym = currencySymbols[currency];
  const [monthsAhead, setMonthsAhead] = useState(12);
  const [expenseAdj, setExpenseAdj] = useState(0);

  const totalAllocated = buckets.reduce((sum, b) => sum + b.allocated, 0);
  const baseExpenses = totalAllocated + totalSubscriptions;
  const adjustedExpenses = baseExpenses * (1 + expenseAdj / 100);
  const netMonthly = monthlyIncome - adjustedExpenses;

  const labels = Array.from({ length: monthsAhead }, (_, i) => `Mo ${i + 1}`);
  const dataPoints = labels.map((_, i) => +(netMonthly * (i + 1)).toFixed(2));
  const isPositive = netMonthly >= 0;

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        data: dataPoints,
        borderColor: isPositive ? "rgb(99,102,241)" : "rgb(239,68,68)",
        backgroundColor: isPositive
          ? "rgba(99,102,241,0.12)"
          : "rgba(239,68,68,0.12)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark
          ? "rgba(17,24,39,0.92)"
          : "rgba(255,255,255,0.92)",
        borderColor: isDark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.25)",
        borderWidth: 1,
        titleColor: isDark ? "#e5e7eb" : "#111827",
        bodyColor: isDark ? "#9ca3af" : "#6b7280",
        padding: { x: 14, y: 10 },
        cornerRadius: 14,
        displayColors: false,
        callbacks: {
          title: (items: { label: string }[]) => items[0]?.label ?? "",
          label: (item: { raw: unknown }) =>
            `${sym}${Number(item.raw).toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        grid: { color: "rgba(156,163,175,0.15)" },
        ticks: {
          callback: (v: number | string) =>
            `${sym}${Number(v).toLocaleString()}`,
          color: "#9ca3af",
          font: { size: 11 },
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <TrendingUp size={20} className="text-indigo-500" /> Savings Projection
      </h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            <span>Months ahead</span>
            <span className="text-indigo-500">{monthsAhead}m</span>
          </label>
          <input
            type="range"
            min="3"
            max="36"
            value={monthsAhead}
            onChange={(e) => setMonthsAhead(Number(e.target.value))}
            className="w-full bg-gray-200 dark:bg-gray-700 accent-indigo-500"
          />
        </div>
        <div>
          <label className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            <span>Spending adjust</span>
            <span
              className={
                expenseAdj !== 0
                  ? expenseAdj > 0
                    ? "text-red-400"
                    : "text-green-400"
                  : "text-indigo-500"
              }
            >
              {expenseAdj > 0 ? "+" : ""}
              {expenseAdj}%
            </span>
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={expenseAdj}
            onChange={(e) => setExpenseAdj(Number(e.target.value))}
            className="w-full bg-gray-200 dark:bg-gray-700 accent-indigo-500"
          />
        </div>
      </div>

      <div className="mt-2">
        <Line options={options} data={data} />
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-gray-400">Net per month</span>
        <span
          className={`font-semibold ${isPositive ? "text-indigo-600 dark:text-indigo-400" : "text-red-500"}`}
        >
          {isPositive ? "+" : ""}
          {sym}
          {netMonthly.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
};
