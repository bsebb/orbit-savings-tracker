import React, { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  note?: string;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
};

type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id" | "date">) => void;
  goals: Goal[];
  addGoal: (g: Omit<Goal, "id" | "currentAmount">) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  balance: number;
  geminiKey: string;
  setGeminiKey: (k: string) => void;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "orbit_transactions",
    [],
  );
  const [goals, setGoals] = useLocalStorage<Goal[]>("orbit_goals", []);
  const [geminiKey, setGeminiKey] = useLocalStorage<string>(
    "orbit_geminikey",
    "",
  );

  const balance = transactions.reduce((acc, curr) => {
    return curr.type === "income" ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const addTransaction = (t: Omit<Transaction, "id" | "date">) => {
    setTransactions([
      { ...t, id: crypto.randomUUID(), date: new Date().toISOString() },
      ...transactions,
    ]);
  };

  const addGoal = (g: Omit<Goal, "id" | "currentAmount">) => {
    setGoals([...goals, { ...g, id: crypto.randomUUID(), currentAmount: 0 }]);
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals(
      goals.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g,
      ),
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        goals,
        addGoal,
        updateGoalProgress,
        balance,
        geminiKey,
        setGeminiKey,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined)
    throw new Error("useFinance must be used within a FinanceProvider");
  return context;
}
