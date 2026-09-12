import { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type Currency = "USD" | "EUR" | "MDL";

export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  MDL: "M",
};

// USD-based exchange rates (approximate, hardcoded for local-first app)
const RATES_TO_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 1 / 0.92, // 1 EUR ≈ 1.087 USD
  MDL: 1 / 17.8, // 1 MDL ≈ 0.0562 USD
};

export type Bucket = {
  id: string;
  name: string;
  allocated: number;
};

export type Transaction = {
  id: string;
  bucketId: string | null; // null = one-off income
  amount: number;
  type: "expense" | "income";
  date: string;
  note?: string;
};

const DEFAULT_BUCKETS: Bucket[] = [
  { id: "default-housing", name: "Housing", allocated: 0 },
  { id: "default-groceries", name: "Groceries", allocated: 0 },
  { id: "default-utilities", name: "Utilities", allocated: 0 },
  { id: "default-fun", name: "Fun", allocated: 0 },
];

type FinanceContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  monthlyIncome: number;
  setMonthlyIncome: (v: number) => void;
  buckets: Bucket[];
  addBucket: (b: Omit<Bucket, "id">) => void;
  removeBucket: (id: string) => void;
  updateBucket: (id: string, data: Partial<Omit<Bucket, "id">>) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id" | "date">) => void;
  geminiKey: string;
  setGeminiKey: (k: string) => void;
  getBucketSpent: (bucketId: string) => number;
  guaranteedSavings: number;
  oneOffIncome: number;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [currency, _setCurrency] = useLocalStorage<Currency>(
    "orbit_v5_currency",
    "USD",
  );
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number>(
    "orbit_v5_income",
    0,
  );
  const [buckets, setBuckets] = useLocalStorage<Bucket[]>(
    "orbit_v5_buckets",
    DEFAULT_BUCKETS,
  );
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "orbit_v5_transactions",
    [],
  );
  const [geminiKey, setGeminiKey] = useLocalStorage<string>(
    "orbit_v5_geminikey",
    "",
  );

  const totalAllocated = buckets.reduce((sum, b) => sum + b.allocated, 0);
  const oneOffIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const guaranteedSavings =
    Math.max(0, monthlyIncome - totalAllocated) + oneOffIncome;

  const getBucketSpent = (bucketId: string) => {
    const currentMonth = new Date().getMonth();
    return transactions
      .filter(
        (t) =>
          t.bucketId === bucketId &&
          t.type === "expense" &&
          new Date(t.date).getMonth() === currentMonth,
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const addBucket = (b: Omit<Bucket, "id">) => {
    setBuckets([...buckets, { ...b, id: crypto.randomUUID() }]);
  };

  const removeBucket = (id: string) => {
    setBuckets(buckets.filter((b) => b.id !== id));
    setTransactions(transactions.filter((t) => t.bucketId !== id));
  };

  const updateBucket = (id: string, data: Partial<Omit<Bucket, "id">>) => {
    setBuckets(buckets.map((b) => (b.id === id ? { ...b, ...data } : b)));
  };

  const addTransaction = (t: Omit<Transaction, "id" | "date">) => {
    setTransactions([
      { ...t, id: crypto.randomUUID(), date: new Date().toISOString() },
      ...transactions,
    ]);
  };

  // Convert all stored monetary values when switching currency
  const setCurrency = (newCurrency: Currency) => {
    if (newCurrency === currency) return;
    const factor = RATES_TO_USD[currency] / RATES_TO_USD[newCurrency];
    const round2 = (n: number) => Math.round(n * 100) / 100;
    setMonthlyIncome(round2(monthlyIncome * factor));
    setBuckets(
      buckets.map((b) => ({ ...b, allocated: round2(b.allocated * factor) })),
    );
    _setCurrency(newCurrency);
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
        updateBucket,
        transactions,
        addTransaction,
        geminiKey,
        setGeminiKey,
        getBucketSpent,
        guaranteedSavings,
        oneOffIncome,
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
