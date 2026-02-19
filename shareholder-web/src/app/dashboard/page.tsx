"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp, Building2, Wallet, Plus, Bell, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { WithdrawalDrawer } from "@/components/withdrawal-drawer";
import { DepositDrawer } from "@/components/deposit-drawer";
import { NotificationDrawer } from "@/components/notification-drawer";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // State for fetched data
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0); // New State
  const [totalAssetValue, setTotalAssetValue] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // Initial Fetch
    const fetchData = async () => {
      try {
        // Fetch User's Profile for Wallet Balance
        const { data: profile } = await api.get('/auth/me'); 
        // Backend returns { user: { ... } } so we access profile.user.walletBalance
        // Fallback to profile.walletBalance if structure changes
        const balance = profile.user?.walletBalance ?? profile.walletBalance ?? 0;
        setWalletBalance(balance);

        // Fetch User's Investments
        const { data: investments } = await api.get('/investments'); 
        const totalValue = investments.reduce((acc: number, inv: any) => acc + inv.investedAmount, 0);
        setTotalAssetValue(totalValue);
        setPortfolio(investments); 

        // Always fetch featured hotels
        const { data: hotels } = await api.get('/hotels');
        setFeatured(hotels);

        // Fetch Fleet Summary (Live Stats)
        const dateStr = new Date().toISOString().split('T')[0];
        const { data: fleetStats } = await api.get(`/metrics/fleet-summary?date=${dateStr}`);
        setKitchenStats(fleetStats);

        // Fetch Notifications Count
        const { data: notifications } = await api.get('/notifications');
        setUnreadCount(notifications.filter((n: any) => !n.isRead).length);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user) {
        fetchData();
        
        // Polling every 10 seconds to keep balance, portfolio and stats fresh
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }
  }, [user]);

  // Use separate state for featured opportunities
  const [featured, setFeatured] = useState<any[]>([]);
  // State for live stats
  const [kitchenStats, setKitchenStats] = useState<any>({ totalOrders: 0, revenue: 0, reportingCount: 0, totalKitchens: 0 });

  return (
    <main className="pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b p-4 flex justify-between items-center">
        <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mb-1">Welcome back,</p>
            <h1 className="font-heading font-bold text-xl leading-none">{user?.name || "Shareholder"}</h1>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-muted/30" onClick={() => setIsNotificationOpen(true)}>
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 border-2 border-background rounded-full" />}
            </Button>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "SH"}
            </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Wallet Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-[2rem] bg-slate-900 text-white p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Wallet Balance</p>
                        <h2 className="text-4xl font-bold font-heading">₹{walletBalance.toLocaleString()}</h2>
                        <p className="text-xs text-slate-500 mt-1">Total Assets: ₹{totalAssetValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20 text-[10px] font-bold">
                        <TrendingUp className="h-3 w-3 inline mr-1" /> ACTIVE
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setIsDepositOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-2xl flex flex-col items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/25"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-bold text-xs uppercase tracking-tight">Add Funds</span>
                    </button>
                    <button 
                        onClick={() => setIsWithdrawOpen(true)}
                        className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl flex flex-col items-center gap-2 transition-transform active:scale-95 backdrop-blur-md border border-white/10"
                    >
                        <ArrowUpRight className="h-5 w-5" />
                        <span className="font-bold text-xs uppercase tracking-tight">Withdraw</span>
                    </button>
                </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
            <QuickActionButton 
                icon={Clock} 
                label="Latest Activity" 
                onClick={() => router.push("/dashboard/transactions")} 
            />
            <QuickActionButton 
                icon={FileText} 
                label="Documents" 
                onClick={() => router.push("/dashboard/documents")} 
            />
        </div>

        <WithdrawalDrawer open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen} availableBalance={walletBalance} />
        <DepositDrawer open={isDepositOpen} onOpenChange={setIsDepositOpen} />
        <NotificationDrawer open={isNotificationOpen} onOpenChange={setIsNotificationOpen} />
        
        {/* Live Kitchen Stats */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Live Kitchen Stats</h3>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-card p-3 rounded-xl border shadow-sm">
                <p className="text-xs text-muted-foreground">Today's Orders</p>
                <p className="text-xl font-bold font-heading">{kitchenStats.totalOrders}</p>
                <span className="text-[10px] text-muted-foreground font-medium">Across {kitchenStats.reportingCount} Kitchens</span>
             </div>
             <div className="bg-card p-3 rounded-xl border shadow-sm">
                <p className="text-xs text-muted-foreground">Today's Revenue</p>
                <p className="text-xl font-bold font-heading">₹{kitchenStats.revenue.toLocaleString()}</p>
             </div>
             <div className="bg-card p-3 rounded-xl border shadow-sm">
                <p className="text-xs text-muted-foreground">Active Kitchens</p>
                <p className="text-xl font-bold font-heading">{kitchenStats.totalKitchens}</p>
             </div>
             <div className="bg-card p-3 rounded-xl border shadow-sm">
                <p className="text-xs text-muted-foreground">Reporting</p>
                <p className="text-xl font-bold font-heading">{kitchenStats.reportingCount}</p>
             </div>
          </div>
        </div>

          {/* Portfolio Section */}
        <div>
          <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
             <Building2 className="h-4 w-4 text-primary" />
             {portfolio.length > 0 ? "Your Cloud Kitchens" : "Featured Opportunities"}
          </h3>
          
          <div className="space-y-3">
            {portfolio.length === 0 && (
                <>
                {/* We reuse the portfolio state to show opportunities if empty */}
                {/* But we need to fetch them first. Let's do that in useEffect */}
                {featured.length === 0 ? (
                    <div className="text-center py-10 bg-muted/30 rounded-3xl border border-dashed text-muted-foreground">
                        <p className="text-xs font-medium">No investments found.</p>
                        <Link href="/dashboard/invest" className="text-primary text-xs font-bold mt-2 inline-block">Start Investing</Link>
                    </div>
                ) : (
                    featured.map((hotel) => (
                        <Link href={`/dashboard/hotels/${hotel.id}`} key={hotel.id} className="block">
                            <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            >
                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                                <CardContent className="p-0 flex">
                                <div className="w-24 h-24 relative bg-muted">
                                    {hotel.logoUrl ? (
                                        <img src={hotel.logoUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg">{hotel.name[0]}</div>
                                    )}
                                </div>
                                <div className="p-3 flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-sm line-clamp-1">{hotel.name}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{hotel.city}</p>
                                        </div>
                                        <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                            {hotel.roi || "15%"} ROI
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Min Investment</p>
                                            <p className="font-bold text-sm text-primary">₹{(hotel.minInvestment || 0).toLocaleString()}</p>
                                        </div>
                                        <Button size="sm" className="h-7 text-xs px-3" variant="outline">
                                            View
                                        </Button>
                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                            </motion.div>
                        </Link>
                    ))
                )}
                </>
            )}
            
            {portfolio.map((item, idx) => (
              <Link href={`/dashboard/hotels/${item.hotel.id}`} key={item.id} className="block">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                    <CardContent className="p-0 flex">
                      <div className="w-24 h-24 relative bg-muted">
                         {item.hotel.logoUrl ? (
                             <img src={item.hotel.logoUrl} className="w-full h-full object-cover" alt="" />
                         ) : (
                             <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg">{item.hotel.name[0]}</div>
                         )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                         <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-sm line-clamp-1">{item.hotel.name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{item.hotel.city}</p>
                            </div>
                            <span className="bg-primary/5 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {item.sharePercent || 0}% Share
                            </span>
                         </div>
                         <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-muted-foreground">Invested</p>
                                <p className="font-bold text-sm text-primary">₹{(item.investedAmount || 0).toLocaleString()}</p>
                            </div>
                            <span className="text-green-600 text-[10px] font-bold flex items-center bg-green-50 px-1.5 py-0.5 rounded">
                                <TrendingUp className="h-3 w-3 mr-1" /> ACTIVE
                            </span>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}


function QuickActionButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="flex items-center gap-3 p-4 bg-card border rounded-2xl hover:border-primary/50 transition-all active:scale-95 shadow-sm w-full text-left"
        >
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm tracking-tight">{label}</span>
        </button>
    )
}
