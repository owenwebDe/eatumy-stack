"use client";

import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ArrowUpRight, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export function WithdrawalDrawer({
  open,
  onOpenChange,
  availableBalance = 0
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance?: number;
}) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bankStatus, setBankStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE');
  const [isCheckingBank, setIsCheckingBank] = useState(true);

  useEffect(() => {
    if (open) {
      const checkBank = async () => {
        try {
          const { data } = await api.get('/banks/mine');
          if (data && data.length > 0) {
            // Find if any is approved, otherwise take the first one's status
            const approved = data.find((b: any) => b.status === 'APPROVED');
            if (approved) {
              setBankStatus('APPROVED');
            } else {
              setBankStatus(data[0].status);
            }
          } else {
            setBankStatus('NONE');
          }
        } catch (error) {
          console.error("Failed to check bank status", error);
        } finally {
          setIsCheckingBank(false);
        }
      };
      checkBank();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Future: Call withdrawal API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setAmount("");
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Withdrawal failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isCheckingBank) {
      return (
        <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Verifying bank status...</p>
        </div>
      );
    }

    if (bankStatus !== 'APPROVED') {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6 bg-red-50/30 rounded-3xl border border-red-100">
          <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold font-heading mb-2">Withdrawal Locked</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-[280px] mx-auto">
            {bankStatus === 'NONE'
              ? "You haven't linked a bank account yet. Please add one in your profile."
              : bankStatus === 'PENDING'
                ? "Your bank account is currently under verification. This usually takes 2-4 hours."
                : "Your bank account was rejected. Please update your details in the profile section."
            }
          </p>
          <Button
            className="w-full h-14 font-black uppercase tracking-widest"
            asChild
          >
            <Link href="/dashboard/profile" onClick={() => onOpenChange(false)}>
              Manage Bank Accounts
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold font-heading">Success!</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Your request for <span className="font-bold text-foreground">₹{Number(amount).toLocaleString()}</span> has been submitted. Reference ID: #WD-{Math.floor(Math.random() * 10000)}
          </p>
        </div>
      );
    }

    return (
      <>
        <Drawer.Title className="font-heading font-bold text-2xl mb-2">Request Withdrawal</Drawer.Title>
        <Drawer.Description className="text-muted-foreground mb-6">
          Funds will be transferred to your verified bank account within 24 hours.
        </Drawer.Description>

        <div className="bg-muted/30 p-4 rounded-xl mb-6 flex justify-between items-center border">
          <span className="text-sm font-medium text-muted-foreground">Available Balance</span>
          <span className="font-bold text-lg">₹{availableBalance.toLocaleString()}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount (₹)</label>
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
            {[5000, 10000, 25000, availableBalance].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className="px-4 py-2 rounded-full border bg-background text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
              >
                ₹{val.toLocaleString()}
              </button>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full text-sm h-14 font-black uppercase tracking-widest"
            disabled={!amount || Number(amount) <= 0 || Number(amount) > availableBalance || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? "Processing..." : "Confirm Withdrawal"}
          </Button>
        </form>
      </>
    );
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[2rem] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 focus:outline-none">
          <div className="p-4 bg-background rounded-t-[2rem] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            <div className="max-w-md mx-auto h-full">
              {renderContent()}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

