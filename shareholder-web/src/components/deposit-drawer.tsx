"use client";

import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, Loader2, CheckCircle2, CreditCard } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export function DepositDrawer({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        await api.post('/wallet/deposit-request', {
            amount: parseFloat(amount)
        });
        
        setIsSuccess(true);
        toast.success("Deposit requested successfully");

        setTimeout(() => {
            setIsSuccess(false);
            setAmount("");
            onOpenChange(false);
        }, 3000);

    } catch (error: any) {
        console.error("Deposit request failed", error);
        toast.error(error.response?.data?.error || "Failed to request deposit");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 focus:outline-none">
          <div className="p-4 bg-background rounded-t-[10px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            
            <div className="max-w-md mx-auto">
              {!isSuccess ? (
                <>
                  <Drawer.Title className="font-heading font-bold text-2xl mb-2">Request Deposit</Drawer.Title>
                  <Drawer.Description className="text-muted-foreground mb-6">
                    Request funds to be added to your wallet.
                  </Drawer.Description>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Amount (₹)</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₹</span>
                         <input 
                           type="number" 
                           className="w-full bg-background border rounded-xl h-14 pl-10 pr-4 text-2xl font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                           placeholder="0"
                           value={amount}
                           onChange={(e) => setAmount(e.target.value)}
                           autoFocus
                         />
                       </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[10000, 25000, 50000, 100000].map((val) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setAmount(val.toString())}
                                className="px-4 py-2 rounded-full border bg-background text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
                            >
                                + ₹{val.toLocaleString()}
                            </button>
                        ))}
                    </div>

                    <div className="bg-muted/30 p-4 rounded-xl border flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border">
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Transfer to Admin</p>
                            <p className="text-xs text-muted-foreground">Verification required</p>
                        </div>
                    </div>

                    <Button 
                        size="lg" 
                        className="w-full text-lg h-14 font-bold"
                        disabled={!amount || Number(amount) <= 0 || isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isLoading ? "Processing..." : `Request ₹${amount ? Number(amount).toLocaleString() : '0'}`}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-in zoom-in duration-300">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading">Request Submitted!</h2>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        Your request for <span className="font-bold text-foreground">₹{Number(amount).toLocaleString()}</span> has been sent for admin approval.
                    </p>
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
