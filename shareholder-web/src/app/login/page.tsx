"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post('/auth/request-otp', { email });
      localStorage.setItem('login_email', email);
      router.push("/login/otp");
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      const msg = error.response?.data?.error || "Account not found. Please contact support.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#0f172a]/5 rounded-full blur-[80px]" />
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

            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-slate-900 mb-2">Shareholder Portal</h1>
            <p className="text-sm md:text-base text-slate-500 mb-10 font-medium">Log in to manage your investor portfolio securely.</p>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="text-left space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Authorized Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    required
                    type="email"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-base md:text-lg focus:border-slate-900 focus:bg-white outline-none transition-all"
                    placeholder="investor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                disabled={email.length < 5 || isLoading}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continue Securely
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-50">
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Support</p>
                <button
                  type="button"
                  onClick={() => window.location.href = "mailto:enquiry@eatumy.com?subject=Investment%20Enquiry"}
                  className="w-full h-11 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <HelpCircle className="h-4 w-4" /> Investment Enquiry
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Authorized Access Only</p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider cursor-pointer hover:text-slate-400">Terms of Service</span>
            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider cursor-pointer hover:text-slate-400">Privacy Policy</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
