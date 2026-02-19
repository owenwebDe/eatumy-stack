"use client";

import { useState, useEffect } from "react";
import { 
  IndianRupee, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Filter,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

const WITHDRAWALS: any[] = [];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("withdrawals");
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(false);

  useEffect(() => {
    if (activeTab === 'deposits') {
        fetchDepositRequests();
    }
  }, [activeTab]);

  const fetchDepositRequests = async () => {
      setIsLoadingDeposits(true);
      try {
          const { data } = await api.get('/wallet/deposit-requests');
          setDepositRequests(data);
      } catch (error) {
          console.error("Failed to fetch deposit requests", error);
          // toast.error("Failed to fetch requests");
      } finally {
          setIsLoadingDeposits(false);
      }
  };

  const handleApproveDeposit = async (id: string) => {
      try {
          await api.post(`/wallet/deposit-requests/${id}/approve`);
          toast.success("Deposit Approved");
          fetchDepositRequests();
      } catch (error: any) {
          toast.error(error.response?.data?.error || "Failed to approve deposit");
      }
  };

  const handleRejectDeposit = async (id: string) => {
    if(!confirm("Are you sure you want to reject this deposit request?")) return;
      try {
          await api.post(`/wallet/deposit-requests/${id}/reject`);
          toast.success("Deposit Rejected");
          fetchDepositRequests();
      } catch (error: any) {
          toast.error(error.response?.data?.error || "Failed to reject deposit");
      }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Financial Command</h1>
          <p className="text-muted-foreground mt-1">Approve withdrawals and run profit distributions.</p>
        </div>
      <div className="flex bg-card border rounded-2xl p-1 shadow-sm">
            <TabButton label="Withdrawals" id="withdrawals" active={activeTab} onClick={setActiveTab} />
            <TabButton label="Deposits" id="deposits" active={activeTab} onClick={setActiveTab} />
            <TabButton label="Allocations" id="allocations" active={activeTab} onClick={setActiveTab} />
        </div>
      </div>
      
      {/* ... keeping Overview Cards ... */}

      <AnimatePresence mode="wait">
        {activeTab === 'withdrawals' ? (
          <motion.div
            key="withdrawals"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Current Queue</h3>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-card border rounded-xl text-xs font-bold hover:bg-muted transition-colors">
                        <Filter className="h-4 w-4" /> Filter Status
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95">
                        Approve All Pending
                    </button>
                </div>
            </div>

            <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Request ID</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Shareholder</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Amount</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Bank Account</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Status</th>
                            <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-wider text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {WITHDRAWALS.map((w) => (
                            <tr key={w.id} className="hover:bg-muted/10 transition-colors group">
                                <td className="p-4 pl-6">
                                    <p className="text-xs font-bold font-mono text-muted-foreground">{w.id}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{w.time}</p>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm font-bold">{w.name}</p>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm font-black">₹{w.amount.toLocaleString()}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs font-medium">{w.bank}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight",
                                        w.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                                        w.status === 'APPROVED' ? "bg-blue-100 text-blue-700" :
                                        "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {w.status}
                                    </span>
                                </td>
                                <td className="p-4 pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        {w.status === 'PENDING' && (
                                            <>
                                                <button className="px-3 py-1.5 h-8 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Approve</button>
                                                <button className="px-3 py-1.5 h-8 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all">Reject</button>
                                            </>
                                        )}
                                        {w.status === 'APPROVED' && (
                                            <button className="px-4 py-1.5 h-8 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Mark Paid</button>
                                        )}
                                        {w.status === 'PAID' && (
                                            <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                Ref: <span className="text-foreground">{w.utr}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </motion.div>
        ) : activeTab === 'deposits' ? (
          <motion.div 
            key="deposits"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Deposit Requests</h3>
                  <button onClick={fetchDepositRequests} className="flex items-center gap-2 px-4 py-2 bg-card border rounded-xl text-xs font-bold hover:bg-muted transition-colors">
                      <Clock className="h-4 w-4" /> Refresh
                  </button>
              </div>

              <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="border-b bg-muted/30">
                              <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-wider text-muted-foreground">User</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Amount</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Date</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Status</th>
                              <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-wider text-muted-foreground">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y">
                          {isLoadingDeposits ? (
                              <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary"/></td></tr>
                          ) : depositRequests.length === 0 ? (
                              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">No pending deposit requests.</td></tr>
                          ) : (
                              depositRequests.map((d) => (
                                  <tr key={d.id} className="hover:bg-muted/10 transition-colors">
                                      <td className="p-4 pl-6">
                                          <p className="text-sm font-bold">{d.user?.name || "Unknown"}</p>
                                          <p className="text-[10px] text-muted-foreground">{d.user?.mobile}</p>
                                      </td>
                                      <td className="p-4">
                                          <p className="text-sm font-black">₹{d.amount.toLocaleString()}</p>
                                      </td>
                                      <td className="p-4">
                                          <p className="text-xs font-medium text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</p>
                                      </td>
                                      <td className="p-4">
                                          <span className={cn(
                                              "px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight",
                                              d.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                                              d.status === 'APPROVED' ? "bg-blue-100 text-blue-700" :
                                              "bg-red-100 text-red-700"
                                          )}>
                                              {d.status}
                                          </span>
                                      </td>
                                      <td className="p-4 pr-6 text-right">
                                          {d.status === 'PENDING' && (
                                              <div className="flex items-center justify-end gap-2">
                                                  <button onClick={() => handleApproveDeposit(d.id)} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Approve</button>
                                                  <button onClick={() => handleRejectDeposit(d.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all">Reject</button>
                                              </div>
                                          )}
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </motion.div>
        ) : (
          <motion.div
            key="allocations"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -ml-32 -mb-32" />
                <div className="relative z-10 flex flex-col h-full">
                    <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                        <TrendingUp className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold font-heading mb-4 leading-tight">Monthly Profit Allocation Wizard</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-sm">
                        Automatically split kitchen profits among shareholders based on their holdings. Preview calculations before committing to ledger.
                    </p>
                    
                    <div className="space-y-4 mt-auto">
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Active Month</p>
                                <p className="text-sm font-bold">October 2023</p>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95">
                            Start Distribution
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center justify-between">
                    Recent Allocations
                    <span className="text-xs font-medium text-muted-foreground">Audit Log</span>
                </h3>
                <div className="space-y-3">
                    <AllocationAuditItem kitchen="Eatumy Residency, Goa" amount="₹4.2 Lakhs" date="01 Oct 2023" investors={145} />
                    <AllocationAuditItem kitchen="Eatumy Grand, Mumbai" amount="₹8.1 Lakhs" date="01 Oct 2023" investors={210} />
                    <AllocationAuditItem kitchen="Eatumy Express, Pune" amount="₹1.2 Lakhs" date="01 Sep 2023" investors={38} />
                </div>
                <button className="w-full py-3 bg-muted/50 rounded-xl text-xs font-bold hover:bg-muted transition-colors">
                    View Full Allocation History
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ label, id, active, onClick }: { label: string, id: string, active: string, onClick: (s:string) => void }) {
    const isActive = active === id;
    return (
        <button 
            onClick={() => onClick(id)}
            className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
        >
            {label}
        </button>
    )
}

function SummaryCard({ label, val, count, icon: Icon, color }: { label: string, val: string, count: string, icon: any, color: string }) {
    return (
        <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-lg font-bold tracking-tight">{val}</p>
                <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{count}</p>
            </div>
        </div>
    )
}

function AllocationAuditItem({ kitchen, amount, date, investors }: { kitchen: string, amount: string, date: string, investors: number }) {
    return (
        <div className="p-4 bg-card border rounded-2xl flex items-center justify-between shadow-sm hover:border-primary/30 transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                    <Building2 className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{kitchen}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">{date} • {investors} Shareolders</p>
                </div>
            </div>
            <div className="text-right flex items-center gap-3">
                <div>
                    <p className="text-sm font-black text-emerald-600">{amount}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
        </div>
    )
}
