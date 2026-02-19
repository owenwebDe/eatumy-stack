"use client";

import { 
  History, 
  Search, 
  Shield, 
  User, 
  Building2, 
  IndianRupee, 
  Filter,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const LOGS: any[] = [];

export default function LogsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">Action Audit Logs</h1>
        <p className="text-muted-foreground mt-1 text-sm">Immutable record of all administrative and system events.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full font-sans">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by action, user or details..." 
            className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium shadow-sm"
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-12 px-6 bg-card border border-border rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-muted transition-colors">
                <Filter className="h-4 w-4" /> Category
            </button>
            <button className="flex-1 lg:flex-none h-12 px-6 bg-card border border-border rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-muted transition-colors">
                Today
            </button>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="space-y-4">
        {LOGS.map((log, idx) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between shadow-sm group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border",
                    log.type === 'FINANCE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    log.type === 'KITCHEN' ? "bg-amber-50 text-amber-600 border-amber-100" :
                    "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                    {log.type === 'FINANCE' ? <IndianRupee className="h-5 w-5" /> :
                     log.type === 'KITCHEN' ? <Building2 className="h-5 w-5" /> :
                     <User className="h-5 w-5" />}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{log.type}</span>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[10px] font-bold text-primary">{log.time}</span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">{log.action}</h4>
                    <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">{log.details}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Triggered By</p>
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 justify-end">
                        <Shield className="h-3 w-3 text-primary" /> {log.user}
                    </p>
                </div>
                <button className="p-2 hover:bg-primary/5 hover:text-primary rounded-lg transition-all text-muted-foreground">
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border border-dashed rounded-2xl">
        Load Older Activity
      </button>
    </div>
  );
}
