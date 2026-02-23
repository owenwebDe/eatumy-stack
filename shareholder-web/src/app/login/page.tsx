"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner"; // Assuming sonner is available or will use alert

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/request-otp', { email });
      localStorage.setItem('login_email', email);
      router.push("/login/otp");
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      const msg = error.response?.data?.error || "Failed to find account. Contact Support.";
      // alert(msg); // Using alert for simplicity if toast not set up
      // Or if sonner is installed:
      // toast.error(msg);
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background p-6">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 h-12 w-12 flex items-center justify-center rounded-xl bg-primary/5 text-primary">
            <Lock className="h-6 w-6" />
          </div>

          <h1 className="mb-2 text-3xl font-bold font-heading">Welcome Back</h1>
          <p className="mb-8 text-muted-foreground">
            Enter your registered email address to access your portfolio.
          </p>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email Address
              </label>
              <div className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <input
                  id="email"
                  type="email"
                  className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                  placeholder="investor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-xl"
              disabled={email.length < 5 || isLoading}
            >
              {isLoading ? "Verifying..." : "Continue Securely"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t text-center space-y-4">
            <div className="p-4 bg-muted/30 rounded-2xl border border-dashed">
              <p className="text-xs font-medium text-muted-foreground mb-3">Don't have an account yet?</p>
              <Button
                variant="outline"
                className="w-full h-10 text-xs font-bold gap-2"
                onClick={() => {
                  window.location.href = "mailto:enquiry@eatumy.com?subject=Investment%20Enquiry";
                }}
              >
                <HelpCircle className="h-4 w-4" /> Enquire about Investment
              </Button>
            </div>

            {/* Dev Helper - Remove in Prod */}
            <div className="opacity-50 hover:opacity-100 transition-opacity">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mb-1">Dev Tool</p>
              <Button
                variant="ghost"
                className="w-full h-8 text-[10px] font-bold text-muted-foreground hover:bg-slate-100"
                onClick={() => {
                  setEmail("investor@test.com");
                }}
              >
                Auto-Fill Test Email
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground pb-4 opacity-60">
        By continuing, you accept our Terms of Service and Privacy Policy.
      </p>
    </main>
  );
}
