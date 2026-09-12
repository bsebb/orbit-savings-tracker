import { useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  useFinance,
  currencySymbols,
  type Currency,
} from "../context/FinanceContext";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  LogOut,
  User,
} from "lucide-react";

const CURRENCIES: Currency[] = ["USD", "EUR", "MDL"];

export const Settings = () => {
  const {
    monthlyIncome,
    setMonthlyIncome,
    currency,
    setCurrency,
    geminiKey,
    setGeminiKey,
    exportBackupJSON,
    importBackupJSON,
    resetAllData,
    userEmail,
    logout,
  } = useFinance();

  const sym = currencySymbols[currency];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `orbit-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      "Backup downloaded! Save this file to preserve your 4-year history.",
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importBackupJSON(text);
      if (success) {
        toast.success("Financial backup restored successfully!");
      } else {
        toast.error("Invalid backup file. Restoration failed.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all data? Download a backup first if you want to keep your history.",
      )
    ) {
      resetAllData();
      toast.success("App reset to clean baseline.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-6 w-full max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <SettingsIcon size={20} className="text-gray-400" /> Preferences &
          Data Safety
        </h2>
        <span className="text-xs px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold rounded-full flex items-center gap-1 border border-green-500/20">
          <ShieldCheck size={12} /> Local-First Storage
        </span>
      </div>

      <div className="space-y-5">
        {/* Account Profile Section */}
        <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/40 dark:border-gray-700/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20">
              {userEmail ? userEmail.slice(0, 2).toUpperCase() : "U"}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Signed in as
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {userEmail}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              toast.success("Signed out successfully");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>

        {/* Currency Switcher */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Base Currency
          </label>
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currency === c
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : "bg-white/60 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-400"
                }`}
              >
                {c} <span className="opacity-70">({currencySymbols[c]})</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Auto-converts all your allocations and targets proportionately.
          </p>
        </div>

        {/* Expected Monthly Income */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Expected Monthly Income
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
              {sym}
            </span>
            <input
              type="number"
              value={monthlyIncome || ""}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="5,000"
              className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-9 pr-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            Everything not allocated into an envelope automatically compounds as
            Guaranteed Savings.
          </p>
        </div>

        {/* Gemini API Key */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Gemini API Key (AI Co-Pilot)
          </label>
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AI Studio API Key..."
            className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            Stored locally in your browser. Never transmitted to third-party
            servers.
          </p>
        </div>

        {/* Data Longevity & Portability (4-Year Guarantee) */}
        <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Data Portability & 4-Year Backup
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 p-3 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all active:scale-95"
            >
              <Download size={15} /> Export Backup (.json)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 p-3 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all active:scale-95"
            >
              <Upload size={15} /> Import Backup (.json)
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={13} /> Reset app to clean baseline
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
