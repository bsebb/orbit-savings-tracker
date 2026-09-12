import { useState, useEffect } from "react";
import { FinanceProvider, useFinance } from "./context/FinanceContext";
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
import { AuthScreen } from "./components/AuthScreen";
import { SyncStatusBadge } from "./components/SyncStatusBadge";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    const root = document.documentElement;
    root.style.setProperty("--theme-duration", "280ms");
    setTheme(nextTheme);
    setTimeout(() => root.style.setProperty("--theme-duration", "0ms"), 300);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 shadow-sm text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

function AppInner() {
  const { resolvedTheme } = useTheme();
  const { userEmail } = useFinance();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  return (
    <div className="min-h-screen relative p-4 sm:p-8">
      {/* Light gradient — fades out in dark mode */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:opacity-0 -z-10 pointer-events-none transition-opacity duration-300" />
      {/* Dark gradient — fades in in dark mode */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-0 dark:opacity-100 -z-10 pointer-events-none transition-opacity duration-300" />

      <Toaster
        position="top-center"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        toastOptions={{
          style: {
            borderRadius: "16px",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.3)",
          },
        }}
      />

      <div className="max-w-2xl mx-auto pb-24 px-3 sm:px-4">
        {!userEmail ? (
          <>
            <header className="flex items-center justify-end pt-4 pb-2 px-2">
              <ThemeToggle />
            </header>
            <AuthScreen />
          </>
        ) : (
          <>
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
              <div className="flex items-center gap-2">
                <SyncStatusBadge />
                <button
                  onClick={() => setActiveTab("settings")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all shadow-sm"
                  title="Account Settings"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {userEmail.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline truncate max-w-[140px]">
                    {userEmail}
                  </span>
                </button>
                <ThemeToggle />
              </div>
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
          </>
        )}
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
