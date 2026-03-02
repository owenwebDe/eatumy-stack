"use client";

import { useState, useEffect } from "react";
import {
    Building2,
    Search,
    CheckCircle2,
    XCircle,
    Landmark,
    User,
    CreditCard,
    ChevronRight,
    Loader2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

export default function BankApprovalsPage() {
    const [activeTab, setActiveTab] = useState("PENDING");
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [banks, setBanks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    const fetchBanks = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/banks/admin/pending');
            // For now, if we want to show approved/rejected we might need a different endpoint or filter
            // But the spec said 'list all pending'. Let's assume the endpoint handles it or we'll filter.
            setBanks(data);
        } catch (error) {
            console.error("Failed to fetch banks", error);
            toast.error("Failed to load requests");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const handleVerify = async (status: 'APPROVED' | 'REJECTED') => {
        if (status === 'REJECTED' && !rejectionReason) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setIsVerifying(true);
        try {
            await api.put(`/banks/admin/${selectedBank.id}/verify`, {
                status,
                rejectionReason: status === 'REJECTED' ? rejectionReason : null
            });
            toast.success(`Account ${status.toLowerCase()} successfully`);
            setSelectedBank(null);
            setShowRejectForm(false);
            setRejectionReason("");
            fetchBanks();
        } catch (error) {
            console.error("Verification failed", error);
            toast.error("Failed to update status");
        } finally {
            setIsVerifying(false);
        }
    };

    const filteredBanks = banks.filter(b => b.status === activeTab);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading tracking-tight">Bank Approvals</h1>
                    <p className="text-muted-foreground mt-1">Verify shareholder bank details for payout processing.</p>
                </div>
                <div className="flex bg-card border rounded-2xl p-1 shadow-sm">
                    <TabButton label="Pending" id="PENDING" active={activeTab} onClick={setActiveTab} />
                    <TabButton label="Approved" id="APPROVED" active={activeTab} onClick={setActiveTab} />
                    <TabButton label="Rejected" id="REJECTED" active={activeTab} onClick={setActiveTab} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Verification Queue */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Submission Queue</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full h-10 pl-10 pr-4 bg-card border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="py-20 text-center space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                <p className="text-sm text-muted-foreground font-medium">Loading requests...</p>
                            </div>
                        ) : filteredBanks.length === 0 ? (
                            <div className="py-20 text-center bg-card border border-dashed rounded-[2rem] text-muted-foreground">
                                <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-bold">No {activeTab.toLowerCase()} requests found.</p>
                            </div>
                        ) : (
                            filteredBanks.map((bank, idx) => (
                                <motion.div
                                    key={bank.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedBank(bank)}
                                    className={cn(
                                        "p-4 bg-card border rounded-2xl flex items-center justify-between shadow-sm cursor-pointer transition-all hover:border-primary/50 group",
                                        selectedBank?.id === bank.id ? "ring-2 ring-primary border-primary" : ""
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center border",
                                            bank.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                bank.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    "bg-red-50 text-red-600 border-red-100"
                                        )}>
                                            <Landmark className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{bank.user?.name || "Unknown User"}</h4>
                                            <p className="text-[10px] text-muted-foreground font-medium">{bank.bankName} • {bank.accountNumber.slice(-4)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">IFSC</p>
                                            <p className="text-xs font-black">{bank.ifsc}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedBank ? (
                            <motion.div
                                key={selectedBank.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-card border rounded-[2rem] p-6 shadow-xl sticky top-24"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Building2 className="h-7 w-7" />
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                                        selectedBank.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                                            selectedBank.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" :
                                                "bg-red-100 text-red-700"
                                    )}>
                                        {selectedBank.status}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold font-heading mb-1">{selectedBank.user?.name}</h3>
                                <p className="text-xs text-muted-foreground mb-6">{selectedBank.user?.email}</p>

                                <div className="space-y-4 mb-8">
                                    <DetailRow label="Bank Name" value={selectedBank.bankName} />
                                    <DetailRow label="Account Holder" value={selectedBank.accountName} />
                                    <DetailRow label="Account Number" value={selectedBank.accountNumber} />
                                    <DetailRow label="IFSC Code" value={selectedBank.ifsc} />
                                    {selectedBank.upiId && <DetailRow label="UPI ID" value={selectedBank.upiId} />}
                                </div>

                                {selectedBank.status === 'PENDING' && !showRejectForm ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleVerify('APPROVED')}
                                            disabled={isVerifying}
                                            className="py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg border-2 border-slate-900 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setShowRejectForm(true)}
                                            disabled={isVerifying}
                                            className="py-3 bg-white text-red-600 border-2 border-red-100 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all active:scale-95"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                ) : showRejectForm ? (
                                    <div className="space-y-4">
                                        <textarea
                                            placeholder="Reason for rejection..."
                                            className="w-full h-24 p-3 bg-muted/30 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-100 transition-all font-medium"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleVerify('REJECTED')}
                                                disabled={isVerifying}
                                                className="py-3 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl"
                                            >
                                                Confirm Reject
                                            </button>
                                            <button
                                                onClick={() => setShowRejectForm(false)}
                                                className="py-3 bg-muted text-muted-foreground font-black text-[10px] uppercase tracking-widest rounded-xl"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : selectedBank.status === 'REJECTED' ? (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Rejection Reason</p>
                                        <p className="text-xs font-medium text-red-800">{selectedBank.rejectionReason}</p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        <div>
                                            <p className="text-xs font-bold text-emerald-900">Verified Account</p>
                                            <p className="text-[10px] text-emerald-700 font-medium">Ready for payouts</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="h-[400px] bg-card border border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <CreditCard className="h-8 w-8 opacity-20" />
                                </div>
                                <p className="text-sm font-bold">Select a request to review</p>
                                <p className="text-xs mt-1">Review account details against KYC before approval.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-bold">{value}</p>
        </div>
    );
}

function TabButton({ label, id, active, onClick }: { label: string, id: string, active: string, onClick: (s: string) => void }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                isActive ? "bg-slate-900 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
        >
            {label}
        </button>
    )
}
