import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { fetchCloudUserData, syncCloudUserData } from "../utils/api";

export type Currency = "USD" | "EUR" | "MDL";

export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  MDL: "MDL ",
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

export const safeRandomUUID = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback below
    }
  }
  return (
    "id-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).substring(2, 9)
  );
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
  moveMilestone: (id: string, direction: "up" | "down") => void;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, "timestamp">) => void;
  clearChatHistory: () => void;
  userEmail: string | null;
  rememberDevice: boolean;
  login: (email: string, remember?: boolean) => void;
  logout: () => void;
  cloudSyncStatus: "synced" | "syncing" | "offline";
  saveStatus: "idle" | "syncing" | "saved" | "offline";
  canUndo: boolean;
  undo: () => string | null;
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
    isHydratedRef.current = false;
    isApplyingCloudDataRef.current = true;
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
    setLastSyncedAt(null);
    lastSyncedAtRef.current = null;
    setUndoStack([]);
    setChatHistory([]);
    _setCurrency("USD");
    setMonthlyIncome(3500);
    setBuckets(DEFAULT_BUCKETS);
    setSubscriptions([]);
    setTransactions([]);
    setMilestones(DEFAULT_MILESTONES);
  };

  type StateSnapshot = {
    description: string;
    buckets: Bucket[];
    subscriptions: Subscription[];
    transactions: Transaction[];
    monthlyIncome: number;
    currency: Currency;
    milestones: Milestone[];
  };

  const [undoStack, setUndoStack] = useState<StateSnapshot[]>([]);
  const isHydratedRef = useRef(false);
  const isApplyingCloudDataRef = useRef(false);
  const lastLocalEditAtRef = useRef<number>(0);

  const [cloudSyncStatus, setCloudSyncStatus] = useState<
    "synced" | "syncing" | "offline"
  >("synced");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "syncing" | "saved" | "offline"
  >("idle");
  const [lastSyncedAt, setLastSyncedAt] = useLocalStorage<string | null>(
    "orbit_v6_last_synced",
    null,
  );

  const lastSyncedAtRef = useRef<string | null>(lastSyncedAt);
  useEffect(() => {
    lastSyncedAtRef.current = lastSyncedAt;
  }, [lastSyncedAt]);

  const transactionsRef = useRef<Transaction[]>(transactions);
  useEffect(() => {
    transactionsRef.current = transactions;
  }, [transactions]);

  const recordSnapshot = (description: string) => {
    lastLocalEditAtRef.current = Date.now();
    setUndoStack((prev) => [
      ...prev.slice(-19),
      {
        description,
        buckets,
        subscriptions,
        transactions,
        monthlyIncome,
        currency,
        milestones,
      },
    ]);
  };

  const undo = () => {
    if (undoStack.length === 0) return null;
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    setBuckets(last.buckets);
    setSubscriptions(last.subscriptions);
    setTransactions(last.transactions);
    setMonthlyIncome(last.monthlyIncome);
    _setCurrency(last.currency);
    setMilestones(last.milestones);

    toast.info(`Undone: ${last.description}`);
    return last.description;
  };

  // Global keyboard shortcut: Ctrl+Z / Cmd+Z to undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "z" &&
        !e.shiftKey
      ) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        if (undoStack.length > 0) {
          e.preventDefault();
          undo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoStack]);

  const applyCloudData = (cloudData: any) => {
    if (!cloudData) return;
    isApplyingCloudDataRef.current = true;
    setSaveStatus("syncing");

    if (cloudData.currency) _setCurrency(cloudData.currency);
    if (typeof cloudData.monthlyIncome === "number")
      setMonthlyIncome(cloudData.monthlyIncome);
    if (Array.isArray(cloudData.buckets) && cloudData.buckets.length > 0)
      setBuckets(cloudData.buckets);
    if (Array.isArray(cloudData.subscriptions))
      setSubscriptions(cloudData.subscriptions);

    const localTime = lastSyncedAtRef.current
      ? new Date(lastSyncedAtRef.current).getTime()
      : 0;

    if (Array.isArray(cloudData.transactions)) {
      // Retain only fresh local transactions created locally while offline (timestamp > last known sync time)
      const freshOfflineTx = transactionsRef.current.filter((t) => {
        const tTime = new Date(t.date).getTime();
        return (
          tTime > localTime &&
          !cloudData.transactions.some((ct: Transaction) => ct.id === t.id)
        );
      });

      const merged = [...freshOfflineTx, ...cloudData.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setTransactions(merged);
    }

    if (Array.isArray(cloudData.milestones))
      setMilestones(cloudData.milestones);

    if (cloudData.lastSyncedAt) {
      setLastSyncedAt(cloudData.lastSyncedAt);
      lastSyncedAtRef.current = cloudData.lastSyncedAt;
    }

    setCloudSyncStatus("synced");
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);

    // Keep applying flag true to prevent inbound cloud data from triggering a bounce-back auto-sync
    setTimeout(() => {
      isApplyingCloudDataRef.current = false;
      isHydratedRef.current = true;
    }, 1800);
  };

  // 1. On login or app launch: hydrate state from Upstash Redis
  useEffect(() => {
    if (!userEmail) {
      return;
    }
    let isMounted = true;
    isApplyingCloudDataRef.current = true;

    fetchCloudUserData(userEmail)
      .then(async (cloudData) => {
        if (!isMounted) return;

        // Check if local device has user-customized non-default data
        const hasLocalCustomData =
          currency !== "USD" ||
          monthlyIncome !== 3500 ||
          transactionsRef.current.length > 0 ||
          buckets.length !== DEFAULT_BUCKETS.length;

        // Check if cloud has real customized user data
        const hasCloudCustomData =
          cloudData &&
          (cloudData.currency !== "USD" ||
            cloudData.monthlyIncome !== 3500 ||
            (Array.isArray(cloudData.transactions) &&
              cloudData.transactions.length > 0) ||
            (Array.isArray(cloudData.buckets) && cloudData.buckets.length > 0));

        if (cloudData && hasCloudCustomData) {
          // Canonical cloud data takes precedence: apply cleanly
          applyCloudData(cloudData);
        } else if (hasLocalCustomData) {
          // Cloud has no custom data, but this device does: seed cloud from local device
          const now = new Date().toISOString();
          const res = await syncCloudUserData(userEmail, {
            currency,
            monthlyIncome,
            buckets,
            subscriptions,
            transactions: transactionsRef.current,
            milestones,
            lastSyncedAt: now,
          });
          if (res.success) {
            setLastSyncedAt(now);
            lastSyncedAtRef.current = now;
            setCloudSyncStatus("synced");
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
          }
          isHydratedRef.current = true;
          isApplyingCloudDataRef.current = false;
        } else if (cloudData) {
          // Both are default state; adopt cloud snapshot
          applyCloudData(cloudData);
        } else {
          // Brand new profile on both ends: seed initial baseline
          const now = new Date().toISOString();
          await syncCloudUserData(userEmail, {
            currency,
            monthlyIncome,
            buckets,
            subscriptions,
            transactions: [],
            milestones,
            lastSyncedAt: now,
          });
          setLastSyncedAt(now);
          lastSyncedAtRef.current = now;
          isHydratedRef.current = true;
          isApplyingCloudDataRef.current = false;
        }
      })
      .catch((err) => {
        console.warn("Cloud hydration note:", err);
        if (isMounted) {
          isHydratedRef.current = true;
          isApplyingCloudDataRef.current = false;
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  // 2. Cross-device sync: Listen for tab visibility, window focus, and background polling
  useEffect(() => {
    if (!userEmail) return;

    const checkForCloudUpdates = async () => {
      // If user is currently typing/editing locally (within 3 seconds) or applying cloud updates, skip
      if (Date.now() - lastLocalEditAtRef.current < 3000) return;
      if (isApplyingCloudDataRef.current) return;

      try {
        const cloudData = await fetchCloudUserData(userEmail);
        if (!cloudData || !cloudData.lastSyncedAt) return;

        const cloudTime = new Date(cloudData.lastSyncedAt).getTime();
        const localTime = lastSyncedAtRef.current
          ? new Date(lastSyncedAtRef.current).getTime()
          : 0;

        // Strictly apply if cloud is newer than local timestamp
        if (cloudTime > localTime) {
          applyCloudData(cloudData);
        }
      } catch (e) {
        console.warn("Cross-device sync check error:", e);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForCloudUpdates();
      }
    };

    const onFocus = () => {
      checkForCloudUpdates();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    // Foreground poll every 20 seconds while app is active
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkForCloudUpdates();
      }
    }, 20000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      clearInterval(pollInterval);
    };
  }, [userEmail]);

  // 3. Debounced auto-sync (1-second persistence) to Upstash Redis
  useEffect(() => {
    if (!userEmail) return;
    if (!isHydratedRef.current) return;
    if (isApplyingCloudDataRef.current) return;

    setSaveStatus("syncing");
    setCloudSyncStatus("syncing");

    const timer = setTimeout(async () => {
      if (isApplyingCloudDataRef.current) return;
      const now = new Date().toISOString();
      const res = await syncCloudUserData(userEmail, {
        currency,
        monthlyIncome,
        buckets,
        subscriptions,
        transactions,
        milestones,
        lastSyncedAt: now,
      });
      if (res.success) {
        if (res.cloudData) {
          // Backend protected against an overwrite and returned cloud canonical data
          applyCloudData(res.cloudData);
        } else {
          setSaveStatus("saved");
          setCloudSyncStatus("synced");
          setLastSyncedAt(now);
          lastSyncedAtRef.current = now;
          const resetTimer = setTimeout(() => setSaveStatus("idle"), 2500);
          return () => clearTimeout(resetTimer);
        }
      } else {
        setSaveStatus("offline");
        setCloudSyncStatus("offline");
        const resetTimer = setTimeout(() => setSaveStatus("idle"), 3500);
        return () => clearTimeout(resetTimer);
      }
    }, 1000);

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

  const syncToCloudNow = async (options?: { isExplicitReset?: boolean }) => {
    if (!userEmail) return;
    setSaveStatus("syncing");
    setCloudSyncStatus("syncing");
    const now = new Date().toISOString();
    const res = await syncCloudUserData(userEmail, {
      currency,
      monthlyIncome,
      buckets,
      subscriptions,
      transactions,
      milestones,
      lastSyncedAt: now,
      isExplicitReset: options?.isExplicitReset,
    });
    if (res.success) {
      if (res.cloudData) {
        applyCloudData(res.cloudData);
      } else {
        setSaveStatus("saved");
        setCloudSyncStatus("synced");
        setLastSyncedAt(now);
        lastSyncedAtRef.current = now;
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } else {
      setSaveStatus("offline");
      setCloudSyncStatus("offline");
      setTimeout(() => setSaveStatus("idle"), 3500);
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

  const addBucket = (b: Omit<Bucket, "id">) => {
    recordSnapshot(`Add envelope: ${b.name}`);
    setBuckets([...buckets, { ...b, id: safeRandomUUID() }]);
  };

  const removeBucket = (id: string) => {
    const target = buckets.find((b) => b.id === id);
    recordSnapshot(`Remove envelope: ${target?.name || "item"}`);
    setBuckets(buckets.filter((b) => b.id !== id));
    setTransactions(transactions.filter((t) => t.bucketId !== id));
  };

  const updateBucket = (id: string, data: Partial<Omit<Bucket, "id">>) => {
    recordSnapshot("Update envelope");
    setBuckets(buckets.map((b) => (b.id === id ? { ...b, ...data } : b)));
  };

  const addSubscription = (s: Omit<Subscription, "id">) => {
    recordSnapshot(`Add subscription: ${s.name}`);
    setSubscriptions([...subscriptions, { ...s, id: safeRandomUUID() }]);
  };

  const removeSubscription = (id: string) => {
    const target = subscriptions.find((s) => s.id === id);
    recordSnapshot(`Remove subscription: ${target?.name || "item"}`);
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
  };

  const addTransaction = (
    t: Omit<Transaction, "id" | "date"> & { date?: string },
  ) => {
    recordSnapshot(t.type === "expense" ? "Log expense" : "Add income");
    const date = t.date || new Date().toISOString();
    setTransactions([{ ...t, id: safeRandomUUID(), date }, ...transactions]);
  };

  const removeTransaction = (id: string) => {
    recordSnapshot("Delete transaction");
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const addMilestone = (m: Omit<Milestone, "id" | "completed">) => {
    recordSnapshot(`Add goal: ${m.title}`);
    setMilestones([
      ...milestones,
      { ...m, id: safeRandomUUID(), completed: false },
    ]);
  };

  const toggleMilestone = (id: string) => {
    recordSnapshot("Toggle goal");
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m,
      ),
    );
  };

  const removeMilestone = (id: string) => {
    const target = milestones.find((m) => m.id === id);
    recordSnapshot(`Remove goal: ${target?.title || "item"}`);
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const moveMilestone = (id: string, direction: "up" | "down") => {
    recordSnapshot("Reorder goals");
    const idx = milestones.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= milestones.length) return;
    const copy = [...milestones];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setMilestones(copy);
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
    setTransactions(
      transactions.map((t) => ({
        ...t,
        amount: r2(t.amount * factor),
      })),
    );
    _setCurrency(newCurrency);
  };

  const handleSetMonthlyIncome = (val: number) => {
    recordSnapshot("Update monthly income");
    setMonthlyIncome(val);
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

  const resetAllData = async () => {
    recordSnapshot("Reset all data");
    _setCurrency("USD");
    setMonthlyIncome(3500);
    setBuckets(DEFAULT_BUCKETS);
    setSubscriptions([]);
    setTransactions([]);
    setMilestones(DEFAULT_MILESTONES);
    setChatHistory([]);
    if (userEmail) {
      const now = new Date().toISOString();
      await syncCloudUserData(userEmail, {
        currency: "USD",
        monthlyIncome: 3500,
        buckets: DEFAULT_BUCKETS,
        subscriptions: [],
        transactions: [],
        milestones: DEFAULT_MILESTONES,
        lastSyncedAt: now,
        isExplicitReset: true,
      });
      setLastSyncedAt(now);
      lastSyncedAtRef.current = now;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        currency,
        setCurrency,
        monthlyIncome,
        setMonthlyIncome: handleSetMonthlyIncome,
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
        moveMilestone,
        chatHistory,
        addChatMessage,
        clearChatHistory,
        userEmail,
        rememberDevice,
        login,
        logout,
        cloudSyncStatus,
        saveStatus,
        canUndo: undoStack.length > 0,
        undo,
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
