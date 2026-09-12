import { FinanceProvider } from "./context/FinanceContext";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { Ledger } from "./components/Ledger";
import { Settings } from "./components/Settings";
import { AccountantChat } from "./components/AccountantChat";
import { Buckets } from "./components/Buckets";
import { Projection } from "./components/Projection";
import { Subscriptions } from "./components/Subscriptions";
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
      className="absolute top-5 right-5 p-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 shadow-sm text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 z-50"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

function AppInner() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen relative p-4 sm:p-8">
      {/* Light gradient — fades out in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:opacity-0 -z-10" />
      {/* Dark gradient — fades in in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-0 dark:opacity-100 -z-10" />

      <ThemeToggle />

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

      <div className="max-w-2xl mx-auto space-y-6 pb-24">
        <header className="text-center pt-10 pb-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Orbit
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 font-medium tracking-wide uppercase">
            Financial Autopilot
          </p>
        </header>

        <Settings />
        <Dashboard />
        <Buckets />
        <Subscriptions />
        <Projection />
        <Ledger />
        <AccountantChat />
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
