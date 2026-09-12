import React, { useState } from "react";
import { useFinance, currencySymbols } from "../context/FinanceContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { TrendingUp } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
);

export const Projection = () => {
  const { monthlyIncome, buckets, currency } = useFinance();
  const [monthsAhead, setMonthsAhead] = useState(12);
  const [expenseAdj, setExpenseAdj] = useState(0);

  const totalAllocatedBase = buckets.reduce((sum, b) => sum + b.allocated, 0);
  const adjustedExpenses = totalAllocatedBase * (1 + expenseAdj / 100);
  const netMonthly = monthlyIncome - adjustedExpenses;

  const labels = Array.from(
    { length: monthsAhead },
    (_, i) => `Month ${i + 1}`,
  );
  const dataPoints = labels.map((_, i) => netMonthly * (i + 1));

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: `Projected Savings (${currency})`,
        data: dataPoints,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { grid: { color: "rgba(156, 163, 175, 0.2)" } },
      x: { grid: { display: false } },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <TrendingUp className="text-indigo-500" /> Savings Projection
      </h2>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>Months Ahead</span>
            <span>{monthsAhead}m</span>
          </label>
          <input
            type="range"
            min="3"
            max="36"
            value={monthsAhead}
            onChange={(e) => setMonthsAhead(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
        <div>
          <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>Bucket Target Adjust</span>
            <span>
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
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};
