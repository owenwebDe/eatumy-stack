"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";

export default function OTPPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const storedMobile = localStorage.getItem('login_mobile');
    if (!storedMobile) {
      router.push("/login");
    } else {
      setMobile(storedMobile);
    }
  }, [router]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Verify button clicked. Mobile:", mobile, "OTP:", otp);
    setIsLoading(true);
    
    try {
        console.log("Calling login function...");
        await login(mobile, otp);
        console.log("Login successful, redirecting...");
        // Login function handles redirect
    } catch (error) {
        console.error("Login failed in component:", error);
        alert("Login failed. Check console for details.");
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
            <ShieldCheck className="h-6 w-6" />
          </div>
          
          <h1 className="mb-2 text-3xl font-bold font-heading">Security Check</h1>
          <p className="mb-8 text-muted-foreground">
            Enter the code sent to <span className="font-bold text-foreground">+91 {mobile}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    One-Time Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-background border border-input rounded-xl font-bold text-lg focus:ring-2 focus:ring-primary outline-none transition-all tracking-widest placeholder:font-normal placeholder:tracking-normal"
                        placeholder="Any Code (e.g. 1234)"
                        autoFocus
                    />
                </div>
            </div>

            <Button 
                type="submit"
                onClick={handleVerify}
                className="w-full h-12 text-base" 
                disabled={otp.length < 1 || isLoading}
            >
                {isLoading ? "Verifying..." : "Verify & Login"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <button 
                onClick={() => router.push('/login')}
                className="text-muted-foreground hover:text-primary transition-colors"
            >
                Change Mobile Number
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
