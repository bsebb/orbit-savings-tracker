import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  Receipt,
  TrendingUp,
  Bot,
  Settings as SettingsIcon,
} from "lucide-react";

export type TabType =
  "overview" | "envelopes" | "timeline" | "runway" | "ai" | "settings";

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TABS: {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}[] = [
  { id: "overview", label: "Home", icon: LayoutDashboard },
  { id: "envelopes", label: "Budgets", icon: Layers },
  { id: "timeline", label: "Ledger", icon: Receipt },
  { id: "runway", label: "Runway", icon: TrendingUp },
  { id: "ai", label: "AI", icon: Bot },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  return (
    <nav className="sticky top-4 z-40 w-full max-w-2xl mx-auto mb-6 px-1">
      <div className="grid grid-cols-6 p-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-white/50 dark:border-gray-800/60 rounded-2xl shadow-lg shadow-black/[0.03] gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all active:scale-95 ${
                isActive
                  ? "text-indigo-600 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-black/[0.04] dark:border-white/[0.06] -z-10"
                />
              )}
              <Icon
                size={16}
                className={
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 shrink-0"
                    : "opacity-70 shrink-0"
                }
              />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
