import { useState } from "react";
import { FinanceProvider } from "./context/FinanceContext";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, type TabType } from "./components/Navigation";
import { Overview } from "./components/Overview";
import { Buckets } from "./components/Buckets";
import { Subscriptions } from "./components/Subscriptions";
import { Timeline } from "./components/Timeline";
import { Runway } from "./components/Runway";
import { AccountantChat } from "./components/AccountantChat";
import { Settings } from "./components/Settings";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    const root = document.documentElement;
    root.style.setProperty("--theme-duration", "280ms");
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => root.style.setProperty("--theme-duration", "0ms"), 300);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 shadow-sm text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

function AppInner() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  return (
    <div className="min-h-screen relative p-4 sm:p-8">
      {/* Light gradient — fades out in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:opacity-0 -z-10" />
      {/* Dark gradient — fades in in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-0 dark:opacity-100 -z-10" />

      <Toaster
        position="top-center"
        theme={theme === "dark" ? "dark" : "light"}
        toastOptions={{
          style: {
            borderRadius: "16px",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.3)",
          },
        }}
      />

      <div className="max-w-2xl mx-auto pb-24">
        {/* Top Header */}
        <header className="flex items-center justify-between pt-6 pb-4 px-2">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Orbit
            </h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase">
              Financial Operating System
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* Tab Navigation Dock */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Views */}
        <main className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {activeTab === "overview" && (
                <Overview onNavigate={setActiveTab} />
              )}

              {activeTab === "envelopes" && (
                <div className="space-y-6">
                  <Buckets />
                  <Subscriptions />
                </div>
              )}

              {activeTab === "timeline" && <Timeline />}

              {activeTab === "runway" && <Runway />}

              {activeTab === "ai" && <AccountantChat />}

              {activeTab === "settings" && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FinanceProvider>
        <AppInner />
      </FinanceProvider>
    </ThemeProvider>
  );
}

export default App;
