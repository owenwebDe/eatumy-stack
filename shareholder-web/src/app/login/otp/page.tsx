"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Loader2, ShieldCheck, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";

export default function OTPPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem('login_email');
    if (!storedEmail) {
      router.push("/login");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, otp);
    } catch (error: any) {
      console.error("Login failed:", error);
      setError("Invalid security code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#ea580c]/5 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12 text-center">

            <div className="flex justify-center mb-8">
              <div className="h-16 w-auto flex items-center justify-center">
                <img
                  src="/PortShare/logo.png"
                  alt="Eatumy"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-2xl font-black text-slate-900">EATUMY</span>';
                  }}
                />
              </div>
            </div>

            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900 mb-2">Security Check</h1>
            <p className="text-sm text-slate-500 mb-8 font-medium">
              We've sent a 6-digit code to <br />
              <span className="text-slate-900 font-bold">{email}</span>
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-left space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Security Code</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-lg focus:border-slate-900 focus:bg-white outline-none transition-all tracking-[0.2em] placeholder:tracking-normal placeholder:font-normal"
                    placeholder="Enter Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={otp.length < 1 || isLoading}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Verify & Access Portfolio
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <button
                onClick={() => router.push('/login')}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                Change email address
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Authorized High-Security Portal</p>
          <p className="text-[9px] text-slate-300 mt-2 font-bold uppercase tracking-wider">© 2026 Eatumy Ecosystem.</p>
        </div>
      </motion.div>
    </main>
  );
}
