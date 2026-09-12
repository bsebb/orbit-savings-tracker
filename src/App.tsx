import React from "react";
import { FinanceProvider } from "./context/FinanceContext";
import { Dashboard } from "./components/Dashboard";
import { Ledger } from "./components/Ledger";
import { GoalTracker } from "./components/GoalTracker";
import { AccountantChat } from "./components/AccountantChat";

function App() {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 font-sans p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          <div className="text-center pt-8 pb-4">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Orbit
            </h1>
            <p className="text-gray-500 mt-2">Smart Finance Engine</p>
          </div>

          <Dashboard />
          <GoalTracker />
          <Ledger />
          <AccountantChat />
        </div>
      </div>
    </FinanceProvider>
  );
}

export default App;
