import React from "react";
import { FinanceProvider } from "./context/FinanceContext";
import { ThemeProvider, useTheme } from "next-themes";
import { Dashboard } from "./components/Dashboard";
import { Ledger } from "./components/Ledger";
import { GoalTracker } from "./components/GoalTracker";
import { AccountantChat } from "./components/AccountantChat";
import { Categories } from "./components/Categories";
import { Projection } from "./components/Projection";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="absolute top-6 right-6 p-2 rounded-full bg-white/60 dark:bg-gray-800/60 border border-white/50 dark:border-gray-700/50 shadow-sm text-gray-800 dark:text-gray-200"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <FinanceProvider>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 font-sans p-4 sm:p-8 transition-colors duration-300">
          <ThemeToggle />
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="text-center pt-8 pb-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Orbit
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Smart Finance Engine
              </p>
            </div>

            <Dashboard />
            <Categories />
            <Projection />
            <Ledger />
            <GoalTracker />
            <AccountantChat />
          </div>
        </div>
      </FinanceProvider>
    </ThemeProvider>
  );
}

export default App;
