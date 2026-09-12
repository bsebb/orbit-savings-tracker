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
  Cloud,
  RefreshCw,
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
    rememberDevice,
    logout,
    cloudSyncStatus,
    lastSyncedAt,
    syncToCloudNow,
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
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-4 sm:p-6 w-full max-w-2xl mx-auto space-y-6 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <SettingsIcon size={20} className="text-gray-400 shrink-0" />{" "}
          Preferences & Data Safety
        </h2>
        <span className="self-start sm:self-auto text-xs px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold rounded-full flex items-center gap-1 border border-green-500/20 shrink-0">
          <ShieldCheck size={12} /> Local & Cloud Synced
        </span>
      </div>

      <div className="space-y-5">
        {/* Account Profile & Cloud Sync Section */}
        <div className="p-3.5 sm:p-4 bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/40 dark:border-gray-700/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0">
                {userEmail ? userEmail.slice(0, 2).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[190px] sm:max-w-none">
                    {userEmail}
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${rememberDevice ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
                  >
                    {rememberDevice ? "Trusted Device" : "Session Only"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {rememberDevice
                    ? "Persistent 4-year login active"
                    : "Session clears on tab close"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                toast.success("Signed out successfully");
              }}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shrink-0"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Cloud
                size={15}
                className={`shrink-0 ${
                  cloudSyncStatus === "syncing"
                    ? "text-amber-500 animate-spin"
                    : cloudSyncStatus === "synced"
                      ? "text-emerald-500"
                      : "text-rose-500"
                }`}
              />
              <div className="text-xs min-w-0">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {cloudSyncStatus === "synced" && "Cloud Sync: Synced"}
                  {cloudSyncStatus === "syncing" && "Cloud Sync: Syncing..."}
                  {cloudSyncStatus === "offline" && "Cloud Sync: Offline"}
                </span>
                {lastSyncedAt && (
                  <span className="text-[10px] text-gray-400 ml-1.5">
                    Updated{" "}
                    {new Date(lastSyncedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={async () => {
                await syncToCloudNow();
                toast.success("Synchronized with cloud");
              }}
              disabled={cloudSyncStatus === "syncing"}
              className="self-start sm:self-auto flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors disabled:opacity-50 shrink-0"
            >
              <RefreshCw
                size={12}
                className={cloudSyncStatus === "syncing" ? "animate-spin" : ""}
              />
              Sync Now
            </button>
          </div>
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
          <div className="flex items-center bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-400 w-full">
            <span className="text-sm font-semibold text-gray-400 select-none mr-2 shrink-0">
              {sym.trim()}
            </span>
            <input
              type="number"
              value={monthlyIncome || ""}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="5,000"
              className="w-full min-w-0 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
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
