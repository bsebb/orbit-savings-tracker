import { motion, AnimatePresence } from "framer-motion";
import { useFinance } from "../context/FinanceContext";
import { RefreshCw, Check, CloudOff, RotateCcw } from "lucide-react";

export const SyncStatusBadge = () => {
  const { saveStatus, canUndo, undo } = useFinance();

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Sync / Save Pill */}
      <AnimatePresence mode="wait">
        {saveStatus === "syncing" && (
          <motion.div
            key="syncing"
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold shadow-sm backdrop-blur-md shrink-0 whitespace-nowrap"
            title="Changes detected — syncing to cloud..."
          >
            <RefreshCw
              size={12}
              className="animate-spin text-indigo-500 shrink-0"
            />
            <span className="hidden sm:inline">Syncing...</span>
          </motion.div>
        )}

        {saveStatus === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-sm backdrop-blur-md shrink-0 whitespace-nowrap"
            title="All changes saved and synchronized"
          >
            <Check
              size={13}
              className="text-emerald-500 stroke-[2.5] shrink-0"
            />
            <span className="hidden sm:inline">Saved</span>
          </motion.div>
        )}

        {saveStatus === "offline" && (
          <motion.div
            key="offline"
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-semibold shadow-sm backdrop-blur-md shrink-0 whitespace-nowrap"
            title="Cloud server unreachable. Changes safely preserved in local storage."
          >
            <CloudOff size={12} className="text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Saved locally</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo Button */}
      <AnimatePresence>
        {canUndo && (
          <motion.button
            key="undo-button"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            onClick={() => undo()}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/90 dark:border-gray-700/80 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-300 text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0 whitespace-nowrap"
            title="Undo last change (Ctrl+Z)"
          >
            <RotateCcw size={12} className="text-indigo-500 shrink-0" />
            <span className="hidden sm:inline">Undo</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
