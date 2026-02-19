"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Clock, FileCheck, UserCheck, AlertCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function KycPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-heading font-bold text-xl">Identity Verification</h1>
      </div>

      <div className="p-4 space-y-8">
        {/* Status Header */}
        <div className="text-center py-6">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 border-4 border-green-50 shadow-inner">
                <ShieldCheck className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-1">Verify as Shareholder</h2>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">Complete your identity check to enable withdrawals and large purchases.</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
            <KycStep 
                icon={UserCheck} 
                title="Basic Information" 
                desc="Name, Mobile, and Email verified" 
                status="COMPLETED" 
            />
            <KycStep 
                icon={FileCheck} 
                title="PAN Card Verification" 
                desc="Mandatory for financial transactions" 
                status="COMPLETED" 
            />
            <KycStep 
                icon={Clock} 
                title="Aadhar (Live Video)" 
                desc="In-person verification via video call" 
                status="PENDING" 
                active
            />
             <KycStep 
                icon={AlertCircle} 
                title="Bank Account Check" 
                desc="Penny drop test for bank validation" 
                status="LOCKED" 
            />
        </div>

        {/* Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20">
                Continue Verification
            </Button>
        </div>
      </div>
    </main>
  );
}

function KycStep({ icon: Icon, title, desc, status, active }: any) {
    return (
        <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${active ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'bg-card'}`}>
            <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${status === 'COMPLETED' ? 'bg-green-100 text-green-600' : status === 'LOCKED' ? 'bg-muted text-muted-foreground' : 'bg-amber-100 text-amber-600'}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">{title}</h4>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
            </div>
            {status === 'COMPLETED' ? (
                <ShieldCheck className="h-5 w-5 text-green-500" />
            ) : (
                <ChevronRight className={`h-4 w-4 ${status === 'LOCKED' ? 'text-muted-foreground/30' : 'text-muted-foreground'}`} />
            )}
        </div>
    )
}
