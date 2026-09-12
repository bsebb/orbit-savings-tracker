import React, { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type Currency = "USD" | "EUR" | "MDL";

export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  MDL: "MDL",
};

export type Bucket = {
  id: string;
  name: string;
  allocated: number;
};

export type Transaction = {
  id: string;
  bucketId: string;
  amount: number;
  date: string;
  note?: string;
};

type FinanceContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  monthlyIncome: number;
  setMonthlyIncome: (v: number) => void;
  buckets: Bucket[];
  addBucket: (b: Omit<Bucket, "id">) => void;
  removeBucket: (id: string) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id" | "date">) => void;
  geminiKey: string;
  setGeminiKey: (k: string) => void;
  getBucketSpent: (bucketId: string) => number;
  guaranteedSavings: number;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  // New V4 storage keys to automatically wipe old incompatible data
  const [currency, setCurrency] = useLocalStorage<Currency>(
    "orbit_v4_currency",
    "USD",
  );
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number>(
    "orbit_v4_income",
    0,
  );
  const [buckets, setBuckets] = useLocalStorage<Bucket[]>(
    "orbit_v4_buckets",
    [],
  );
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "orbit_v4_transactions",
    [],
  );
  const [geminiKey, setGeminiKey] = useLocalStorage<string>(
    "orbit_v4_geminikey",
    "",
  );

  const totalAllocated = buckets.reduce((sum, b) => sum + b.allocated, 0);
  const guaranteedSavings = Math.max(0, monthlyIncome - totalAllocated);

  const getBucketSpent = (bucketId: string) => {
    const currentMonth = new Date().getMonth();
    return transactions
      .filter(
        (t) =>
          t.bucketId === bucketId &&
          new Date(t.date).getMonth() === currentMonth,
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const addBucket = (b: Omit<Bucket, "id">) => {
    setBuckets([...buckets, { ...b, id: crypto.randomUUID() }]);
  };

  const removeBucket = (id: string) => {
    setBuckets(buckets.filter((b) => b.id !== id));
    // Also remove associated transactions to keep data clean
    setTransactions(transactions.filter((t) => t.bucketId !== id));
  };

  const addTransaction = (t: Omit<Transaction, "id" | "date">) => {
    setTransactions([
      { ...t, id: crypto.randomUUID(), date: new Date().toISOString() },
      ...transactions,
    ]);
  };

  return (
    <FinanceContext.Provider
      value={{
        currency,
        setCurrency,
        monthlyIncome,
        setMonthlyIncome,
        buckets,
        addBucket,
        removeBucket,
        transactions,
        addTransaction,
        geminiKey,
        setGeminiKey,
        getBucketSpent,
        guaranteedSavings,
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
