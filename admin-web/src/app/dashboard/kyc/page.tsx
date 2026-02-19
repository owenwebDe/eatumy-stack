"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  User,
  CreditCard,
  ChevronRight,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const KYC_REQUESTS: any[] = [];

export default function KYCPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedKyc, setSelectedKyc] = useState<any>(null);

  const filteredRequests = KYC_REQUESTS.filter(r => {
    if (activeTab === 'pending') return r.status === 'PENDING';
    if (activeTab === 'verified') return r.status === 'VERIFIED';
    if (activeTab === 'rejected') return r.status === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">KYC Verification</h1>
          <p className="text-muted-foreground mt-1">Review and validate shareholder identity documents.</p>
        </div>
        <div className="flex bg-card border rounded-2xl p-1 shadow-sm">
            <TabButton label="Pending" id="pending" active={activeTab} onClick={setActiveTab} />
            <TabButton label="Verified" id="verified" active={activeTab} onClick={setActiveTab} />
            <TabButton label="Rejected" id="rejected" active={activeTab} onClick={setActiveTab} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Queue */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Identity Queue</h3>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Search by name or ID..." 
                        className="w-full h-10 pl-10 pr-4 bg-card border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {filteredRequests.map((kyc, idx) => (
                    <motion.div
                        key={kyc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedKyc(kyc)}
                        className={cn(
                            "p-4 bg-card border rounded-2xl flex items-center justify-between shadow-sm cursor-pointer transition-all hover:border-primary/50 group",
                            selectedKyc?.id === kyc.id ? "ring-2 ring-primary border-primary" : ""
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center border",
                                kyc.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                kyc.status === 'VERIFIED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                "bg-red-50 text-red-600 border-red-100"
                            )}>
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{kyc.name}</h4>
                                    {kyc.isHighValue && (
                                        <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase rounded tracking-widest">VIP</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">{kyc.id} • Submitted {kyc.submitted}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Documents</p>
                                <div className="flex gap-1">
                                    {kyc.docs.map((doc: string) => (
                                        <div key={doc} className="h-2 w-4 bg-muted rounded-full" title={doc} />
                                    ))}
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Detail Panel */}
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {selectedKyc ? (
                    <motion.div
                        key={selectedKyc.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-card border rounded-[2rem] p-6 shadow-xl sticky top-24"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <FileText className="h-7 w-7" />
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                                selectedKyc.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                                selectedKyc.status === 'VERIFIED' ? "bg-emerald-100 text-emerald-700" :
                                "bg-red-100 text-red-700"
                            )}>
                                {selectedKyc.status}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold font-heading mb-1">{selectedKyc.name}</h3>
                        <p className="text-xs text-muted-foreground mb-6">{selectedKyc.mobile}</p>

                        <div className="space-y-4 mb-8">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uploaded Documents</h4>
                            {selectedKyc.docs.map((doc: string) => (
                                <div key={doc} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50 group hover:border-primary/30 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-xs font-bold">{doc}</span>
                                    </div>
                                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                        </div>

                        {selectedKyc.status === 'PENDING' ? (
                            <div className="grid grid-cols-2 gap-3">
                                <button className="py-3 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                                    Approve Document
                                </button>
                                <button className="py-3 bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all active:scale-95">
                                    Reject & Reason
                                </button>
                            </div>
                        ) : selectedKyc.status === 'REJECTED' ? (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Rejection Reason</p>
                                <p className="text-xs font-medium text-red-800">{selectedKyc.reason}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-900">Verified Identity</p>
                                    <p className="text-[10px] text-emerald-700 font-medium">Auto-whitelisted for payouts</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="h-[400px] bg-card border border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Eye className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-sm font-bold">Select a request to review</p>
                        <p className="text-xs mt-1">High-value shareholders are flagged for priority.</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
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
