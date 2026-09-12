import { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type Currency = "USD" | "EUR" | "MDL";

export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  MDL: "M",
};

const RATES_TO_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 1 / 0.92,
  MDL: 1 / 17.8,
};

export type Bucket = {
  id: string;
  name: string;
  allocated: number;
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  icon: string;
};

export type Transaction = {
  id: string;
  bucketId: string | null;
  amount: number;
  type: "expense" | "income";
  date: string;
  note?: string;
};

const DEFAULT_BUCKETS: Bucket[] = [
  { id: "default-food", name: "Food", allocated: 0 },
  { id: "default-transport", name: "Transport", allocated: 0 },
  { id: "default-university", name: "University", allocated: 0 },
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
  subscriptions: Subscription[];
  addSubscription: (s: Omit<Subscription, "id">) => void;
  removeSubscription: (id: string) => void;
  totalSubscriptions: number;
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
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>(
    "orbit_v5_subs",
    [],
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
  const totalSubscriptions = subscriptions.reduce(
    (sum, s) => sum + s.amount,
    0,
  );
  const oneOffIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const guaranteedSavings =
    Math.max(0, monthlyIncome - totalAllocated - totalSubscriptions) +
    oneOffIncome;

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

  const addBucket = (b: Omit<Bucket, "id">) =>
    setBuckets([...buckets, { ...b, id: crypto.randomUUID() }]);
  const removeBucket = (id: string) => {
    setBuckets(buckets.filter((b) => b.id !== id));
    setTransactions(transactions.filter((t) => t.bucketId !== id));
  };
  const updateBucket = (id: string, data: Partial<Omit<Bucket, "id">>) =>
    setBuckets(buckets.map((b) => (b.id === id ? { ...b, ...data } : b)));

  const addSubscription = (s: Omit<Subscription, "id">) =>
    setSubscriptions([...subscriptions, { ...s, id: crypto.randomUUID() }]);
  const removeSubscription = (id: string) =>
    setSubscriptions(subscriptions.filter((s) => s.id !== id));

  const addTransaction = (t: Omit<Transaction, "id" | "date">) =>
    setTransactions([
      { ...t, id: crypto.randomUUID(), date: new Date().toISOString() },
      ...transactions,
    ]);

  const setCurrency = (newCurrency: Currency) => {
    if (newCurrency === currency) return;
    const factor = RATES_TO_USD[currency] / RATES_TO_USD[newCurrency];
    const r2 = (n: number) => Math.round(n * 100) / 100;
    setMonthlyIncome(r2(monthlyIncome * factor));
    setBuckets(
      buckets.map((b) => ({ ...b, allocated: r2(b.allocated * factor) })),
    );
    setSubscriptions(
      subscriptions.map((s) => ({ ...s, amount: r2(s.amount * factor) })),
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
        subscriptions,
        addSubscription,
        removeSubscription,
        totalSubscriptions,
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
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within a FinanceProvider");
  return ctx;
}
