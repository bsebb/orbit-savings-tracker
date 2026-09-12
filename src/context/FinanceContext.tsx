import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { fetchCloudUserData, syncCloudUserData } from "../utils/api";

export type Currency = "USD" | "EUR" | "MDL";

export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  MDL: "M",
};

export const RATES_TO_USD: Record<Currency, number> = {
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
  currency: Currency;
};

export type Transaction = {
  id: string;
  bucketId: string | null;
  amount: number;
  type: "expense" | "income";
  date: string; // ISO string YYYY-MM-DD...
  note?: string;
};

export type Milestone = {
  id: string;
  title: string;
  targetAmount: number;
  targetDate?: string;
  completed: boolean;
};

export type ChatMessage = {
  role: "user" | "model";
  text: string;
  timestamp: string;
};

const DEFAULT_BUCKETS: Bucket[] = [
  { id: "default-food", name: "Food & Groceries", allocated: 400 },
  { id: "default-transport", name: "Transport & Transit", allocated: 150 },
  { id: "default-university", name: "University & Studies", allocated: 200 },
  { id: "default-fun", name: "Leisure & Fun", allocated: 250 },
];

const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: "ms-1",
    title: "Starter Emergency Buffer",
    targetAmount: 2000,
    completed: false,
  },
  {
    id: "ms-2",
    title: "6-Month Runway Cushion",
    targetAmount: 12000,
    completed: false,
  },
  {
    id: "ms-3",
    title: "Freedom & Investment Fund",
    targetAmount: 50000,
    completed: false,
  },
];

export const formatMonthKey = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

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
  addTransaction: (
    t: Omit<Transaction, "id" | "date"> & { date?: string },
  ) => void;
  removeTransaction: (id: string) => void;
  geminiKey: string;
  setGeminiKey: (k: string) => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  getBucketSpent: (bucketId: string, monthKey?: string) => number;
  guaranteedSavings: number;
  oneOffIncome: number;
  monthTransactions: Transaction[];
  allMonths: string[];
  milestones: Milestone[];
  addMilestone: (m: Omit<Milestone, "id" | "completed">) => void;
  toggleMilestone: (id: string) => void;
  removeMilestone: (id: string) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, "timestamp">) => void;
  clearChatHistory: () => void;
  userEmail: string | null;
  rememberDevice: boolean;
  login: (email: string, remember?: boolean) => void;
  logout: () => void;
  cloudSyncStatus: "synced" | "syncing" | "offline";
  lastSyncedAt: string | null;
  syncToCloudNow: () => Promise<void>;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonStr: string) => boolean;
  resetAllData: () => void;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const currentMonthKey = formatMonthKey();
  const [currency, _setCurrency] = useLocalStorage<Currency>(
    "orbit_v6_currency",
    "USD",
  );
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage<number>(
    "orbit_v6_income",
    3500,
  );
  const [buckets, setBuckets] = useLocalStorage<Bucket[]>(
    "orbit_v6_buckets",
    DEFAULT_BUCKETS,
  );
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>(
    "orbit_v6_subs",
    [],
  );
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "orbit_v6_transactions",
    [],
  );
  const [geminiKey, setGeminiKey] = useLocalStorage<string>(
    "orbit_v6_geminikey",
    "",
  );
  const [selectedMonth, setSelectedMonth] = useLocalStorage<string>(
    "orbit_v6_selected_month",
    currentMonthKey,
  );
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>(
    "orbit_v6_milestones",
    DEFAULT_MILESTONES,
  );
  const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>(
    "orbit_v6_chat_history",
    [],
  );
  const [rememberDevice, setRememberDevice] = useLocalStorage<boolean>(
    "orbit_v6_remember_device",
    true,
  );
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem("orbit_v6_user_email");
      if (stored) return JSON.parse(stored);
      const session = sessionStorage.getItem("orbit_v6_session_email");
      if (session) return JSON.parse(session);
      return null;
    } catch {
      return null;
    }
  });

  const login = (email: string, remember: boolean = true) => {
    const cleanEmail = email.trim().toLowerCase();
    setRememberDevice(remember);
    setUserEmail(cleanEmail);
    if (remember) {
      localStorage.setItem("orbit_v6_user_email", JSON.stringify(cleanEmail));
      sessionStorage.removeItem("orbit_v6_session_email");
    } else {
      sessionStorage.setItem(
        "orbit_v6_session_email",
        JSON.stringify(cleanEmail),
      );
      localStorage.removeItem("orbit_v6_user_email");
    }
  };

  const logout = () => {
    setUserEmail(null);
    localStorage.removeItem("orbit_v6_user_email");
    sessionStorage.removeItem("orbit_v6_session_email");
  };

  const [cloudSyncStatus, setCloudSyncStatus] = useState<
    "synced" | "syncing" | "offline"
  >("synced");
  const [lastSyncedAt, setLastSyncedAt] = useLocalStorage<string | null>(
    "orbit_v6_last_synced",
    null,
  );

  // 1. On login: hydrate state from Upstash Redis
  useEffect(() => {
    if (!userEmail) return;
    fetchCloudUserData(userEmail).then((cloudData) => {
      if (cloudData) {
        if (cloudData.currency) _setCurrency(cloudData.currency);
        if (typeof cloudData.monthlyIncome === "number")
          setMonthlyIncome(cloudData.monthlyIncome);
        if (Array.isArray(cloudData.buckets) && cloudData.buckets.length > 0)
          setBuckets(cloudData.buckets);
        if (Array.isArray(cloudData.subscriptions))
          setSubscriptions(cloudData.subscriptions);
        if (Array.isArray(cloudData.transactions))
          setTransactions(cloudData.transactions);
        if (Array.isArray(cloudData.milestones))
          setMilestones(cloudData.milestones);
        if (cloudData.lastSyncedAt) setLastSyncedAt(cloudData.lastSyncedAt);
      }
    });
  }, [userEmail]);

  // 2. Debounced auto-sync to Upstash Redis
  useEffect(() => {
    if (!userEmail) return;
    setCloudSyncStatus("syncing");
    const timer = setTimeout(async () => {
      const now = new Date().toISOString();
      const ok = await syncCloudUserData(userEmail, {
        currency,
        monthlyIncome,
        buckets,
        subscriptions,
        transactions,
        milestones,
        lastSyncedAt: now,
      });
      if (ok) {
        setCloudSyncStatus("synced");
        setLastSyncedAt(now);
      } else {
        setCloudSyncStatus("offline");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    userEmail,
    currency,
    monthlyIncome,
    buckets,
    subscriptions,
    transactions,
    milestones,
  ]);

  const syncToCloudNow = async () => {
    if (!userEmail) return;
    setCloudSyncStatus("syncing");
    const now = new Date().toISOString();
    const ok = await syncCloudUserData(userEmail, {
      currency,
      monthlyIncome,
      buckets,
      subscriptions,
      transactions,
      milestones,
      lastSyncedAt: now,
    });
    if (ok) {
      setCloudSyncStatus("synced");
      setLastSyncedAt(now);
    } else {
      setCloudSyncStatus("offline");
    }
  };

  const totalAllocated = buckets.reduce((sum, b) => sum + b.allocated, 0);

  // Convert each subscription from its native currency to active app currency
  const totalSubscriptions = subscriptions.reduce((sum, s) => {
    const subCurrency = s.currency ?? currency;
    const converted =
      s.amount * (RATES_TO_USD[subCurrency] / RATES_TO_USD[currency]);
    return sum + converted;
  }, 0);

  // Month-scoped transactions
  const monthTransactions = transactions.filter((t) => {
    const tMonth = t.date.slice(0, 7);
    return tMonth === selectedMonth;
  });

  const oneOffIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const guaranteedSavings =
    Math.max(0, monthlyIncome - totalAllocated - totalSubscriptions) +
    oneOffIncome;

  const getBucketSpent = (
    bucketId: string,
    monthKey: string = selectedMonth,
  ) => {
    return transactions
      .filter(
        (t) =>
          t.bucketId === bucketId &&
          t.type === "expense" &&
          t.date.slice(0, 7) === monthKey,
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

  const addTransaction = (
    t: Omit<Transaction, "id" | "date"> & { date?: string },
  ) => {
    const date = t.date || new Date().toISOString();
    setTransactions([{ ...t, id: crypto.randomUUID(), date }, ...transactions]);
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const addMilestone = (m: Omit<Milestone, "id" | "completed">) => {
    setMilestones([
      ...milestones,
      { ...m, id: crypto.randomUUID(), completed: false },
    ]);
  };

  const toggleMilestone = (id: string) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m,
      ),
    );
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const addChatMessage = (msg: Omit<ChatMessage, "timestamp">) => {
    setChatHistory((prev) => [
      ...prev,
      { ...msg, timestamp: new Date().toISOString() },
    ]);
  };

  const clearChatHistory = () => setChatHistory([]);

  // Collect all unique historical and planned months
  const allMonths = Array.from(
    new Set([
      currentMonthKey,
      selectedMonth,
      ...transactions.map((t) => t.date.slice(0, 7)),
    ]),
  )
    .sort()
    .reverse();

  // Smart currency switch with proportional math
  const setCurrency = (newCurrency: Currency) => {
    if (newCurrency === currency) return;
    const factor = RATES_TO_USD[currency] / RATES_TO_USD[newCurrency];
    const r2 = (n: number) => Math.round(n * 100) / 100;
    setMonthlyIncome(r2(monthlyIncome * factor));
    setBuckets(
      buckets.map((b) => ({ ...b, allocated: r2(b.allocated * factor) })),
    );
    setMilestones(
      milestones.map((m) => ({
        ...m,
        targetAmount: r2(m.targetAmount * factor),
      })),
    );
    _setCurrency(newCurrency);
  };

  const exportBackupJSON = () => {
    const data = {
      version: "6.0",
      exportedAt: new Date().toISOString(),
      currency,
      monthlyIncome,
      buckets,
      subscriptions,
      transactions,
      milestones,
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.currency) _setCurrency(parsed.currency);
      if (typeof parsed.monthlyIncome === "number")
        setMonthlyIncome(parsed.monthlyIncome);
      if (Array.isArray(parsed.buckets)) setBuckets(parsed.buckets);
      if (Array.isArray(parsed.subscriptions))
        setSubscriptions(parsed.subscriptions);
      if (Array.isArray(parsed.transactions))
        setTransactions(parsed.transactions);
      if (Array.isArray(parsed.milestones)) setMilestones(parsed.milestones);
      return true;
    } catch {
      return false;
    }
  };

  const resetAllData = () => {
    _setCurrency("USD");
    setMonthlyIncome(3500);
    setBuckets(DEFAULT_BUCKETS);
    setSubscriptions([]);
    setTransactions([]);
    setMilestones(DEFAULT_MILESTONES);
    setChatHistory([]);
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
        removeTransaction,
        geminiKey,
        setGeminiKey,
        selectedMonth,
        setSelectedMonth,
        getBucketSpent,
        guaranteedSavings,
        oneOffIncome,
        monthTransactions,
        allMonths,
        milestones,
        addMilestone,
        toggleMilestone,
        removeMilestone,
        chatHistory,
        addChatMessage,
        clearChatHistory,
        userEmail,
        rememberDevice,
        login,
        logout,
        cloudSyncStatus,
        lastSyncedAt,
        syncToCloudNow,
        exportBackupJSON,
        importBackupJSON,
        resetAllData,
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
