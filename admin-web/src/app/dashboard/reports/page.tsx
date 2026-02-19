"use client";

import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  Building2, 
  Users, 
  ArrowUpRight,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const REPORT_TYPES = [
  { id: "inv-stat", title: "Investor Statements", desc: "Monthly individual payout and holding summaries.", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "hotel-perf", title: "Hotel Performance", desc: "Comparative revenue and order metrics by branch.", icon: Building2, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "payout-ledger", title: "Payout Ledger", desc: "Comprehensive history of all processed distributions.", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "pending-pay", title: "Pending Payouts", desc: "Real-time list of all approved but unpaid withdrawals.", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Reporting Center</h1>
        <p className="text-muted-foreground mt-1 text-sm">Generate data-rich statements and ecosystem performance audits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPES.map((report, idx) => (
            <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 bg-card border rounded-[2rem] hover:border-primary/50 transition-all cursor-pointer group shadow-sm flex items-start gap-4"
            >
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0", report.bg, report.color)}>
                    <report.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{report.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{report.desc}</p>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                            Generate Report
                        </button>
                        <button className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground">
                            <Download className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        ))}
      </div>

      {/* Snapshot Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border rounded-[2rem] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold">Ecosystem Performance</h3>
                <div className="flex gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-muted rounded-full">Last 30 Days</span>
                </div>
            </div>
            <div className="h-64 flex items-end gap-1.5 pt-4">
                {[20, 45, 30, 80, 55, 90, 70, 40, 60, 85, 50, 75].map((v, i) => (
                   <div key={i} className="flex-1 bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary cursor-pointer" style={{ height: `${v}%` }}>
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded hidden group-hover:block z-10 whitespace-nowrap">
                           ₹{(v * 10).toLocaleString()}k
                       </div>
                   </div>
                ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">
                <span>Oct 01</span>
                <span>Oct 15</span>
                <span>Oct 31</span>
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="font-bold px-2">Top Performing Kitchens</h3>
            {[
                { name: "Mumbai Grand", rev: "₹18.4L", growth: "+12.5%", positive: true },
                { name: "Goa Residency", rev: "₹12.1L", growth: "+8.2%", positive: true },
                { name: "Bangalore Stay", rev: "₹9.8L", growth: "-1.4%", positive: false },
            ].map((k) => (
                <div key={k.name} className="p-4 bg-card border rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-bold">{k.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{k.rev} Revenue</p>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-black",
                        k.positive ? "text-emerald-600" : "text-red-600"
                    )}>
                        {k.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {k.growth}
                    </div>
                </div>
            ))}
            <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border border-dashed rounded-2xl mt-2">
                View All Metrics
            </button>
        </div>
      </div>
    </div>
  );
}
