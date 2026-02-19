"use client";

import { Button } from "@/components/ui/button";
import { User, CreditCard, LogOut, Phone, Shield, FileText, ChevronRight, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/me');
            // Support both structures: { user: {...} } or { ... }
            setProfile(data.user || data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
      return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  const user = profile || {};
  const bank = user.bankAccounts && user.bankAccounts.length > 0 ? user.bankAccounts[0] : null;

  return (
    <main className="p-4 space-y-6">
      <h1 className="text-2xl font-bold font-heading">My Profile</h1>

      {/* User Info */}
      <div className="bg-card rounded-xl p-4 border flex items-center gap-4">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
          {user.name ? user.name[0] : <User className="h-8 w-8" />}
        </div>
        <div>
          <h2 className="font-bold text-lg">{user.name || "Shareholder"}</h2>
          <p className="text-muted-foreground text-sm">{user.mobile}</p>
          <div className={cn("flex items-center gap-1 mt-1 text-xs w-fit px-2 py-0.5 rounded-full",
              user.kycStatus === 'VERIFIED' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"
          )}>
            <Shield className="h-3 w-3" /> {user.kycStatus === 'VERIFIED' ? 'KYC Verified' : 'KYC Pending'}
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        <h3 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">Financial & Assets</h3>
        
        <div className="bg-card rounded-xl border divide-y overflow-hidden">
          <button 
            onClick={() => router.push("/dashboard/documents")}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">Document Vault</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-bold text-sm">{bank ? bank.accountNumber : "No Bank Linked"}</p>
                <p className="text-[10px] text-muted-foreground">{bank ? bank.ifsc : "Setup payout account to withdraw"}</p>
              </div>
            </div>
            {!bank && <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 h-8 font-bold text-xs uppercase tracking-wide">Add</Button>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">Help & Legal</h3>
        
        <div className="bg-card rounded-xl border divide-y overflow-hidden">
          <button 
            onClick={() => router.push("/dashboard/support")}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="font-bold text-sm">Support Center</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="font-bold text-sm">Safe & Secure</span>
            </div>
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded uppercase">256-bit</span>
          </button>
        </div>
      </div>

      <Button 
        variant="destructive" 
        className="w-full mt-8"
        onClick={() => router.push("/login")}
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
      
      <p className="text-center text-xs text-muted-foreground pt-4">v1.2.0 • EatumyHolder</p>
    </main>
  );
}
