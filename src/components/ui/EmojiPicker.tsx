import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 288;
      const dropdownHeight = 310;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards =
        spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      const top = openUpwards ? rect.top - dropdownHeight - 6 : rect.bottom + 6;
      const left = Math.min(
        Math.max(12, rect.left),
        window.innerWidth - dropdownWidth - 12,
      );
      setCoords({ top, left });
    }
  };

  const handleToggle = () => {
    if (!isOpen) updatePosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-center gap-1.5 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2.5 text-base hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 transition-all active:scale-95"
        title="Select Icon"
      >
        <span>{value || "📺"}</span>
        <span className="text-[10px] text-gray-400">▼</span>
      </button>

      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "fixed",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                zIndex: 99999,
              }}
              className="w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-4 space-y-3"
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
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};
