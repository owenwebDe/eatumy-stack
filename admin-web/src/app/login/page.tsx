"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Users, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // In a real flow, this would request an OTP
      // For now, we simulate success and move to OTP step
      // The actual verify endpoint handles the logic
      setTimeout(() => {
        setStep(2);
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, otp);
    } catch (err: any) {
      setError(err.message || "Invalid OTP or unauthorized");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="p-10">
          <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-slate-900/20">
            <Users className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900 mb-2">Admin Portal</h1>
          <p className="text-sm text-slate-500 mb-8 font-medium">Secure access for ecosystem managers.</p>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 pl-4 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg focus:border-slate-900 outline-none transition-colors"
                      placeholder="admin@test.com"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={email.length < 5 || isLoading}
                  className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Request Access <ArrowRight className="h-4 w-4" /></>}
                </button>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@test.com');
                      setStep(2);
                      setTimeout(() => {
                        setOtp('1234');
                        login('admin@test.com', '1234');
                      }, 500);
                    }}
                    className="w-full h-10 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs tracking-wide hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 border border-emerald-100"
                  >
                    🚀 Quick Admin Access
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerify}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Code</label>
                    <button type="button" onClick={() => setStep(1)} className="text-[10px] font-bold text-primary hover:underline">Change Email</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg focus:border-slate-900 outline-none transition-colors tracking-widest"
                      placeholder="Any Code"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl flex items-center gap-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={otp.length < 1 || isLoading} // Relaxed validation
                  className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Login"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold">Authorized Personnel Only</p>
        </div>
      </motion.div>
    </div>
  );
}
