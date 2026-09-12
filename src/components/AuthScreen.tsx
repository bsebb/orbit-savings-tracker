import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useFinance } from "../context/FinanceContext";
import { sendLoginCode, verifyLoginCode } from "../utils/api";
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  ChevronLeft,
  Check,
  Copy,
} from "lucide-react";

export const AuthScreen = () => {
  const { login } = useFinance();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);
  const [otpCode, setOtpCode] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generate and request email dispatch from backend
  const generateAndSendCode = async (targetEmail: string) => {
    setDigits(["", "", "", "", "", ""]);
    setCountdown(30);
    setLoading(true);

    try {
      const res = await sendLoginCode(targetEmail);
      if (res.success) {
        if (res.devCode) {
          setOtpCode(res.devCode);
          toast(`📬 Verification code ready for ${targetEmail}`, {
            description: `Security Code: ${res.devCode} (Valid for 10 minutes)`,
            duration: 10000,
            action: {
              label: "Auto-fill",
              onClick: () => {
                setDigits(res.devCode!.split(""));
                setTimeout(() => handleVerify(res.devCode!), 200);
              },
            },
          });
        } else {
          setOtpCode("");
          toast.success(`Verification code sent to ${targetEmail}`, {
            description:
              "Check your inbox (and spam folder) for your 6-digit code.",
          });
        }
      } else {
        toast.error(res.message || "Failed to send verification code");
      }
    } catch {
      toast.error("Network error requesting verification code");
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown for resend
  useEffect(() => {
    if (step === "code" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast.error("Please enter a valid email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email format (e.g. name@example.com)");
      return;
    }

    setStep("code");
    await generateAndSendCode(cleanEmail);
  };

  const handleDigitChange = (index: number, val: string) => {
    // Handle paste of 6 digits
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, "").slice(0, 6);
      if (pasted.length === 6) {
        const newDigits = pasted.split("");
        setDigits(newDigits);
        handleVerify(pasted);
        return;
      }
    }

    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Move to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when 6th digit entered
    if (newDigits.every((d) => d !== "")) {
      handleVerify(newDigits.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (enteredCode: string) => {
    setLoading(true);
    try {
      if (otpCode && enteredCode === otpCode) {
        login(email.trim(), remember);
        toast.success(`Welcome to Orbit, ${email.trim()}!`, { icon: "✨" });
        setLoading(false);
        return;
      }

      const res = await verifyLoginCode(email.trim(), enteredCode);
      if (res.success) {
        login(email.trim(), remember);
        toast.success(`Welcome to Orbit, ${email.trim()}!`, { icon: "✨" });
      } else {
        toast.error(res.message || "Invalid or expired verification code.");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("Verification error. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="w-full max-w-md bg-white/50 dark:bg-gray-900/60 backdrop-blur-2xl border border-white/60 dark:border-gray-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-500/10 text-center relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Orbit Brand Header */}
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-xl shadow-indigo-500/30 mb-4">
            {step === "email" ? <Sparkles size={32} /> : <KeyRound size={30} />}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Orbit
          </h1>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-400 mt-1 uppercase tracking-wider">
            Financial Operating System
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 space-y-5 text-left"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center -mt-2 mb-2">
                Enter your email address to receive a secure login code.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2 pl-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Remember this device checkbox */}
                <label className="flex items-center gap-2.5 px-1 py-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 cursor-pointer"
                  />
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Remember this device</span>
                    <span className="block text-[11px] text-gray-400">
                      Keep me signed in for 4 years
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Login Code</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Quick login */}
              <div className="pt-4 border-t border-gray-200/50 dark:border-gray-800/60 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("bsebb@orbit.app");
                    setStep("code");
                    generateAndSendCode("bsebb@orbit.app");
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Or test with demo account: bsebb@orbit.app
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="code-step"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 space-y-5"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Enter the 6-digit code
                </p>
                <p className="text-xs text-gray-400">
                  Sent to{" "}
                  <span className="font-semibold text-indigo-500">{email}</span>
                </p>
              </div>

              {/* Code Preview Chip */}
              {otpCode && (
                <div
                  onClick={() => {
                    setDigits(otpCode.split(""));
                    handleVerify(otpCode);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 rounded-xl text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  title="Click to auto-fill code"
                >
                  <Copy size={12} />
                  <span>
                    Code: {otpCode.slice(0, 3)} {otpCode.slice(3)}
                  </span>
                  <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-sans">
                    Tap to paste
                  </span>
                </div>
              )}

              {/* 6 Digit Inputs */}
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    autoFocus={idx === 0}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white shadow-sm transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft size={14} /> Change email
                </button>

                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => generateAndSendCode(email)}
                  className={`font-semibold ${
                    countdown > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-indigo-600 dark:text-indigo-400 hover:underline"
                  }`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Footer */}
        <div className="mt-6 pt-5 border-t border-gray-200/50 dark:border-gray-800/60 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <ShieldCheck size={14} className="text-green-500" />
          <span>Local-first encrypted session · No password required</span>
        </div>
      </motion.div>
    </div>
  );
};
