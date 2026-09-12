import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJI_CATEGORIES = [
  {
    name: "Subscriptions & Tech",
    emojis: [
      "📺",
      "🎵",
      "☁️",
      "📦",
      "🎮",
      "📰",
      "🏋️",
      "🔐",
      "🌐",
      "⚡",
      "💻",
      "📱",
    ],
  },
  {
    name: "Living & Lifestyle",
    emojis: [
      "🏠",
      "🍔",
      "☕",
      "🚌",
      "🚗",
      "✈️",
      "👕",
      "💊",
      "🎓",
      "🐾",
      "🛒",
      "🎉",
    ],
  },
  {
    name: "Finance & Growth",
    emojis: [
      "💰",
      "💳",
      "📈",
      "🏦",
      "💎",
      "🚀",
      "🎯",
      "🔥",
      "🛡️",
      "🏷️",
      "✨",
      "⭐",
    ],
  },
];

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
};

export const EmojiPicker = ({
  value,
  onChange,
  className = "",
}: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1.5 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-3 text-lg hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all active:scale-95"
        title="Select Icon"
      >
        <span>{value || "📺"}</span>
        <span className="text-[10px] text-gray-400">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute left-0 top-full mt-2 z-50 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-4 space-y-3"
          >
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                  {cat.name}
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onChange(emoji);
                        setIsOpen(false);
                      }}
                      className={`text-xl p-2 rounded-xl transition-all hover:scale-125 active:scale-95 ${
                        value === emoji
                          ? "bg-purple-100 dark:bg-purple-900/40 shadow-sm"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
