import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useFinance } from "../context/FinanceContext";
import { Mail, ArrowRight, ShieldCheck, Sparkles, Lock } from "lucide-react";

export const AuthScreen = () => {
  const { login } = useFinance();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email format (e.g. name@example.com)");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(email.trim());
      toast.success(`Welcome to Orbit, ${email.trim()}!`, { icon: "✨" });
      setLoading(false);
    }, 450);
  };

  const handleDemoLogin = () => {
    login("bsebb@orbit.app");
    toast.success("Signed in as bsebb@orbit.app", { icon: "🚀" });
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
        <div className="relative z-10 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-xl shadow-indigo-500/30 mb-4">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Orbit
          </h1>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-400 mt-1 uppercase tracking-wider">
            Financial Operating System
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 max-w-xs mx-auto">
            Sign in with your email to unlock your personal financial autopilot.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 relative z-10 text-left"
        >
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In with Email</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Login shortcut */}
        <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-800/60 relative z-10">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 mx-auto"
          >
            <Lock size={12} /> Or continue as bsebb@orbit.app
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
          <ShieldCheck size={14} className="text-green-500" />
          <span>Local-first encrypted session · No spam</span>
        </div>
      </motion.div>
    </div>
  );
};
