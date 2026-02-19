"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Building2, 
  IndianRupee, 
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Plus,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const RECENT_WITHDRAWALS: any[] = [];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    shareholders: 0,
    kitchens: 0,
    pendingWithdrawals: 0,
    walletBalance: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const { data } = await api.get('/metrics/system-stats');
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch system stats", error);
        }
    }
    fetchStats();
  }, []);

  const STATS_DATA = [
    { 
      label: "Total Shareholders", 
      value: stats.shareholders.toLocaleString(), 
      trend: "Total Registered", 
      icon: Users,
      color: "bg-blue-500/10 text-blue-600"
    },
    { 
      label: "Active Kitchens", 
      value: stats.kitchens.toString(), 
      trend: "Live Operations", 
      icon: Building2,
      color: "bg-emerald-500/10 text-emerald-600"
    },
    { 
      label: "Pending Withdrawals", 
      value: "₹" + stats.pendingWithdrawals.toLocaleString(), 
      trend: "Process Queue", 
      icon: AlertCircle,
      color: "bg-amber-500/10 text-amber-600"
    },
    { 
      label: "System Liability", 
      value: "₹" + stats.walletBalance.toLocaleString(), 
      trend: "Total Wallet Balances", 
      icon: IndianRupee,
      color: "bg-primary/10 text-primary"
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Mission Control</h1>
        <p className="text-muted-foreground mt-1">Real-time overview of the Eatumy ecosystem.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_DATA.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Live
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
              <p className="text-xs text-muted-foreground mt-2 font-medium">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              Management Portal
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/dashboard/shareholders"><ActionCard icon={Plus} label="Add Shareholder" color="bg-primary" /></Link>
              <Link href="/dashboard/kitchens"><ActionCard icon={Building2} label="New Kitchen" color="bg-indigo-600" /></Link>
              <Link href="/dashboard/investments"><ActionCard icon={Briefcase} label="Review Requests" color="bg-amber-600" /></Link>
              <Link href="/dashboard/finance"><ActionCard icon={IndianRupee} label="Run Payouts" color="bg-slate-900" /></Link>
            </div>
          </section>

          {/* Performance Chart Placeholder */}
          <section className="bg-card border rounded-2xl p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold">Ecosystem Performance</h3>
                <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" /> Revenue</span>
                    <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-slate-300" /> Payouts</span>
                </div>
             </div>
             <div className="h-64 flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground font-medium italic">
                Analytics Chart (Recharts) Placeholder
             </div>
          </section>
        </div>

        {/* Sidebar Items */}
        <div className="space-y-8">
          <section className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Withdrawal Queue</h3>
              <Link href="/dashboard/finance" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {RECENT_WITHDRAWALS.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">No pending withdrawals.</p>
              )}
              {RECENT_WITHDRAWALS.map((w, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {w.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none mb-1 group-hover:text-primary transition-colors cursor-pointer">{w.name}</p>
                      <p className="text-[10px] text-muted-foreground">{w.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{w.amount}</p>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                      w.status === 'PENDING' ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    )}>
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all active:scale-95">
              Approve All Pending
            </button>
          </section>

          <section className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16" />
             <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Monthly Allocation</h4>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    October profit allocation is ready to be processed for all active kitchens.
                </p>
                <div className="bg-white/10 rounded-xl p-4 border border-white/10 mb-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                            <p className="text-sm font-bold text-primary">Ready to preview</p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-primary/30" />
                    </div>
                </div>
                <button className="w-full py-3 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95">
                    Start Allocation Wizard
                </button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <button className="group flex flex-col items-center justify-center p-6 bg-card border rounded-2xl hover:border-primary/50 transition-all active:scale-95 shadow-sm text-center">
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-3 text-white shadow-lg group-hover:scale-110 transition-transform", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
}
