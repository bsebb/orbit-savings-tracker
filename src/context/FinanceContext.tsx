import React, { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type Category = {
  id: string;
  name: string;
  targetAmount: number;
  type: "income" | "expense";
};

export type Transaction = {
  id: string;
  categoryId: string;
  amount: number;
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
  categories: Category[];
  addCategory: (c: Omit<Category, "id">) => void;
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
  const [categories, setCategories] = useLocalStorage<Category[]>(
    "orbit_categories",
    [],
  );
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "orbit_transactions",
    [],
  );
  const [goals, setGoals] = useLocalStorage<Goal[]>("orbit_goals", []);
  const [geminiKey, setGeminiKey] = useLocalStorage<string>(
    "orbit_geminikey",
    "",
  );

  const balance = transactions.reduce((acc, tx) => {
    const cat = categories.find((c) => c.id === tx.categoryId);
    if (!cat) return acc;
    return cat.type === "income" ? acc + tx.amount : acc - tx.amount;
  }, 0);

  const addCategory = (c: Omit<Category, "id">) => {
    setCategories([...categories, { ...c, id: crypto.randomUUID() }]);
  };

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
        categories,
        addCategory,
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
