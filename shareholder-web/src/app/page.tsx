"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">

      
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground font-heading">
        EatumyHolder
      </h1>
      
      <p className="mb-8 max-w-sm text-balance text-muted-foreground font-medium">
        Securely manage your share portfolio, track daily profits, and withdraw earnings instantly.
      </p>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button 
          size="lg" 
          className="w-full text-base font-semibold"
          onClick={() => router.push("/dashboard")}
        >
          Login to Portfolio <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full text-base"
          onClick={() => router.push("/login")}
        >
          Create Account
        </Button>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Protected by 256-bit encryption. <br />
        By continuing, you agree to our Terms of Service.
      </p>
    </main>
  );
}
