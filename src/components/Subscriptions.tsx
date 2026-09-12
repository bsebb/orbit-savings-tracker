import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  useFinance,
  currencySymbols,
  type Currency,
} from "../context/FinanceContext";
import {
  RefreshCw,
  Trash2,
  Plus,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { EmojiPicker } from "./ui/EmojiPicker";

type CategoryId = "all" | "ai" | "music" | "streaming" | "telecom" | "gaming";

type CatalogItem = {
  id: string;
  name: string;
  category: "ai" | "music" | "streaming" | "telecom" | "gaming";
  icon: string;
  defaultPriceUSD: number;
  description: string;
};

const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: "all", label: "All Services", icon: "✨" },
  { id: "ai", label: "AI & Tools", icon: "🤖" },
  { id: "music", label: "Music & Audio", icon: "🎵" },
  { id: "streaming", label: "Streaming", icon: "🍿" },
  { id: "telecom", label: "Phone & Cloud", icon: "📱" },
  { id: "gaming", label: "Gaming & Gym", icon: "🎮" },
];

const CATALOG: CatalogItem[] = [
  // AI & Productivity
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    category: "ai",
    icon: "🤖",
    defaultPriceUSD: 20.0,
    description: "GPT-4o & Advanced Voice",
  },
  {
    id: "claude",
    name: "Claude Pro",
    category: "ai",
    icon: "🧠",
    defaultPriceUSD: 20.0,
    description: "Claude 3.5 Sonnet & Artifacts",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    category: "ai",
    icon: "⚡",
    defaultPriceUSD: 10.0,
    description: "Code autocomplete & CLI",
  },
  {
    id: "perplexity",
    name: "Perplexity Pro",
    category: "ai",
    icon: "🔍",
    defaultPriceUSD: 20.0,
    description: "Real-time AI research",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    category: "ai",
    icon: "🎨",
    defaultPriceUSD: 10.0,
    description: "AI generative art",
  },
  {
    id: "notion",
    name: "Notion Plus",
    category: "ai",
    icon: "📝",
    defaultPriceUSD: 10.0,
    description: "Workspace & team docs",
  },

  // Music & Audio
  {
    id: "spotify",
    name: "Spotify Premium",
    category: "music",
    icon: "🎵",
    defaultPriceUSD: 10.99,
    description: "Ad-free music & offline play",
  },
  {
    id: "apple_music",
    name: "Apple Music",
    category: "music",
    icon: "🍏",
    defaultPriceUSD: 10.99,
    description: "Spatial & lossless audio",
  },
  {
    id: "yt_music",
    name: "YouTube Music",
    category: "music",
    icon: "🎧",
    defaultPriceUSD: 10.99,
    description: "Streaming music & covers",
  },
  {
    id: "tidal",
    name: "Tidal HiFi",
    category: "music",
    icon: "🌊",
    defaultPriceUSD: 10.99,
    description: "Master quality sound",
  },

  // Streaming & Video
  {
    id: "netflix",
    name: "Netflix",
    category: "streaming",
    icon: "🍿",
    defaultPriceUSD: 15.49,
    description: "Movies & original series",
  },
  {
    id: "yt_premium",
    name: "YouTube Premium",
    category: "streaming",
    icon: "▶️",
    defaultPriceUSD: 13.99,
    description: "Ad-free & background video",
  },
  {
    id: "disney",
    name: "Disney+",
    category: "streaming",
    icon: "🏰",
    defaultPriceUSD: 9.99,
    description: "Disney, Marvel, Star Wars",
  },
  {
    id: "hbo",
    name: "Max (HBO)",
    category: "streaming",
    icon: "📺",
    defaultPriceUSD: 15.99,
    description: "HBO & Warner Bros series",
  },
  {
    id: "prime",
    name: "Amazon Prime",
    category: "streaming",
    icon: "📦",
    defaultPriceUSD: 14.99,
    description: "Prime Video & delivery",
  },

  // Telecom, Cloud & Bills
  {
    id: "phone_bill",
    name: "Mobile Phone Bill",
    category: "telecom",
    icon: "📱",
    defaultPriceUSD: 20.0,
    description: "Monthly mobile plan & 5G",
  },
  {
    id: "home_internet",
    name: "Home Fiber Internet",
    category: "telecom",
    icon: "🌐",
    defaultPriceUSD: 25.0,
    description: "High-speed broadband",
  },
  {
    id: "icloud",
    name: "Apple iCloud+",
    category: "telecom",
    icon: "☁️",
    defaultPriceUSD: 2.99,
    description: "Apple cloud storage & Private Relay",
  },
  {
    id: "google_one",
    name: "Google One",
    category: "telecom",
    icon: "🗄️",
    defaultPriceUSD: 1.99,
    description: "100GB Google Drive & Photos",
  },

  // Gaming & Fitness
  {
    id: "gamepass",
    name: "Xbox Game Pass",
    category: "gaming",
    icon: "🎮",
    defaultPriceUSD: 14.99,
    description: "PC & console games library",
  },
  {
    id: "ps_plus",
    name: "PlayStation Plus",
    category: "gaming",
    icon: "🕹️",
    defaultPriceUSD: 14.99,
    description: "Multiplayer & catalog",
  },
  {
    id: "gym",
    name: "Gym Membership",
    category: "gaming",
    icon: "🏋️",
    defaultPriceUSD: 35.0,
    description: "Fitness & workout access",
  },
];

const CURRENCIES: Currency[] = ["USD", "EUR", "MDL"];

const RATES_TO_USD_EXPORT: Record<Currency, number> = {
  USD: 1,
  EUR: 1 / 0.92,
  MDL: 1 / 17.8,
};

export const Subscriptions = () => {
  const {
    subscriptions,
    addSubscription,
    removeSubscription,
    totalSubscriptions,
    currency,
  } = useFinance();

  const appSym = currencySymbols[currency];
  const [showCatalog, setShowCatalog] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Custom Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [icon, setIcon] = useState("⚡");
  const [subCurrency, setSubCurrency] = useState<Currency>(currency);

  const existingSubNames = new Set(
    subscriptions.map((s) => s.name.toLowerCase().trim()),
  );

  const filteredCatalog = CATALOG.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddFromCatalog = (item: CatalogItem) => {
    // Convert default USD price to active app currency
    const rateToActiveCurrency =
      RATES_TO_USD_EXPORT["USD"] / RATES_TO_USD_EXPORT[currency];
    const convertedAmount = Math.round(
      item.defaultPriceUSD * rateToActiveCurrency,
    );

    addSubscription({
      name: item.name,
      amount: convertedAmount,
      icon: item.icon,
      currency: currency,
    });

    toast.success(
      `${item.icon} ${item.name} added (${appSym}${convertedAmount}/mo)`,
    );
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    addSubscription({
      name: name.trim(),
      amount: Number(amount),
      icon,
      currency: subCurrency,
    });
    toast.success(`${icon} ${name.trim()} subscription added`);
    setName("");
    setAmount("");
    setShowCustomForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
      className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl rounded-3xl p-4 sm:p-6 w-full max-w-2xl mx-auto overflow-hidden space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <RefreshCw size={20} className="text-purple-500 shrink-0" />{" "}
            Subscriptions & Bills
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Recurring commitments auto-deducted from guaranteed cashflow
          </p>
        </div>

        {subscriptions.length > 0 && (
          <div className="self-start sm:self-auto px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400">
            Total: {appSym}
            {Math.round(totalSubscriptions).toLocaleString()}/mo
          </div>
        )}
      </div>

      {/* Active Subscriptions List */}
      <div className="space-y-2">
        <AnimatePresence>
          {subscriptions.length === 0 ? (
            <div className="p-6 text-center bg-white/40 dark:bg-gray-900/30 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                No active subscriptions
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Keep your recurring bills transparent. Browse the catalog to add
                services.
              </p>
            </div>
          ) : (
            subscriptions.map((s) => {
              const sCur = s.currency ?? currency;
              const sSym = currencySymbols[sCur];
              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="flex items-center justify-between p-3.5 sm:p-4 bg-white/70 dark:bg-gray-900/60 rounded-2xl border border-white/40 dark:border-gray-700/40 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{s.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {s.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-gray-400">
                          Monthly recurring
                        </span>
                        {sCur !== currency && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold">
                            {sCur}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        -{sSym}
                        {s.amount.toLocaleString()}/mo
                      </p>
                      {sCur !== currency && (
                        <p className="text-[10px] text-gray-400">
                          ≈ {appSym}
                          {Math.round(
                            s.amount *
                              (RATES_TO_USD_EXPORT[sCur] /
                                RATES_TO_USD_EXPORT[currency]),
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        removeSubscription(s.id);
                        toast.error(`${s.name} removed`);
                      }}
                      className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="Remove subscription"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Catalog Trigger Bar */}
      <div className="pt-2">
        <button
          onClick={() => setShowCatalog((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-indigo-500/15 border border-purple-500/20 dark:border-purple-500/30 rounded-2xl text-xs font-semibold text-purple-700 dark:text-purple-300 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            <span>
              {showCatalog
                ? "Hide Subscription Catalog"
                : "+ Browse Popular Subscriptions (AI, Music, Video, Telecom)"}
            </span>
          </div>
          {showCatalog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Pop-Out Services Catalog Table */}
      <AnimatePresence>
        {showCatalog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden space-y-4 pt-1"
          >
            {/* Filter pills & Search */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search AI, Spotify, Netflix, Phone bills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium shrink-0 flex items-center gap-1 transition-all ${
                      selectedCategory === cat.id
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredCatalog.map((item) => {
                const isAdded = existingSubNames.has(
                  item.name.toLowerCase().trim(),
                );
                const rateToActive =
                  RATES_TO_USD_EXPORT["USD"] / RATES_TO_USD_EXPORT[currency];
                const convertedEst = Math.round(
                  item.defaultPriceUSD * rateToActive,
                );

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isAdded
                        ? "bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/40 dark:border-purple-800/40 opacity-70"
                        : "bg-white/80 dark:bg-gray-900/70 border-gray-200/70 dark:border-gray-700/60 hover:border-purple-300 dark:hover:border-purple-600"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        ≈ {appSym}
                        {convertedEst}
                      </span>

                      <button
                        onClick={() => handleAddFromCatalog(item)}
                        disabled={isAdded}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isAdded
                            ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                            : "bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-sm"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={12} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={12} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Subscription Dropdown Toggle */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowCustomForm((prev) => !prev)}
                className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Don't see your service? Add custom subscription</span>
                {showCustomForm ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>

              {/* Custom Form */}
              <AnimatePresence>
                {showCustomForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCustomSubmit}
                    className="pt-3 flex flex-col sm:flex-row gap-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <EmojiPicker value={icon} onChange={setIcon} />
                      <input
                        type="text"
                        placeholder="Service name (e.g. Gym, Electricity)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 min-w-0 sm:w-48 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="flex rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 flex-1 sm:flex-none">
                        {CURRENCIES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSubCurrency(c)}
                            className={`px-2 py-1 text-[11px] font-semibold transition-colors border-r border-gray-200 dark:border-gray-700 last:border-0 ${
                              subCurrency === c
                                ? "bg-purple-600 text-white"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            {currencySymbols[c]}
                          </button>
                        ))}
                        <input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-20 bg-transparent pl-2 pr-2 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
