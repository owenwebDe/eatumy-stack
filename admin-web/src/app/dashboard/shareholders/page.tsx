"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  CreditCard,
  Ban,
  User,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  X,
  Wallet,
  IndianRupee
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api"; // Access axios instance
import { toast } from "sonner"; // Assuming sonner is available
import { Button } from "@/components/ui/button"; // Assuming Button component exists

export default function ShareholdersPage() {
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Deposit State
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // Add User State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserMobile, setNewUserMobile] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    fetchShareholders();
  }, []);

  const fetchShareholders = async () => {
      try {
          const { data } = await api.get('/users');
          // Filter only INVESTOR role if needed, but backend might return all
          setShareholders(data);
      } catch (error) {
          console.error("Failed to fetch shareholders", error);
      } finally {
          setIsLoading(false);
      }
  };

  const handleDeposit = async () => {
      if (!depositAmount || !selectedUser) return;
      setIsDepositing(true);
      try {
          const response = await api.post('/wallet/deposit', {
              userId: selectedUser.id,
              amount: parseFloat(depositAmount),
              description: "Admin Deposit"
          });
          toast.success("Funds deposited successfully");
          setIsDepositOpen(false);
          setDepositAmount("");
          
          const { user: updatedUser } = response.data;

          // Update local state with the actual updated user from backend
          if (selectedUser && updatedUser && updatedUser.id === selectedUser.id) {
             setSelectedUser((prev: any) => ({ ...prev, walletBalance: updatedUser.walletBalance }));
             
             // Also update the list so the card view is correct
             setShareholders(prev => prev.map(u => u.id === updatedUser.id ? { ...u, walletBalance: updatedUser.walletBalance } : u));
          } else {
             fetchShareholders();
          }
      } catch (error: any) {
          console.error("Deposit Error:", error);
          toast.error(error.response?.data?.error || "Failed to deposit funds");
      } finally {
          setIsDepositing(false);
      }
  };

  const handleVerifyKyc = async () => {
      if (!selectedUser) return;
      const confirm = window.confirm("Are you sure you want to verify this user's KYC?");
      if (!confirm) return;

      try {
          await api.put(`/users/${selectedUser.id}/kyc`, { status: 'VERIFIED' });
          toast.success("KYC Verified");
          // Update local state
          const updatedUser = { ...selectedUser, kycStatus: 'VERIFIED' };
          setSelectedUser(updatedUser);
          setShareholders(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      } catch (error: any) {
          console.error("KYC Error:", error);
          toast.error("Failed to update KYC");
      }
  };

  const handleAddUser = async () => {
      if (!newUserName || !newUserMobile) return;
      setIsAddingUser(true);
      try {
          await api.post('/users', {
              name: newUserName,
              mobile: newUserMobile,
              role: 'INVESTOR'
          });
          toast.success("Shareholder added successfully");
          setIsAddUserOpen(false);
          setNewUserName("");
          setNewUserMobile("");
          fetchShareholders();
      } catch (error: any) {
          console.error("Add User Error:", error);
          toast.error(error.response?.data?.error || "Failed to add shareholder");
      } finally {
          setIsAddingUser(false);
      }
  };

  const filteredUsers = shareholders.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.mobile?.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10 relative h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Shareholders</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage investors, view portfolios, and process verifycations.</p>
        </div>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border/50 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors">
                <Download className="h-4 w-4 text-slate-500" /> Export CSV
            </button>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-colors">
                        <Plus className="h-4 w-4" /> Add Shareholder
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Shareholder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-muted/50 rounded-xl border outline-none font-bold"
                                placeholder="e.g. John Doe"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mobile Number</label>
                            <input 
                                type="tel" 
                                className="w-full p-3 bg-muted/50 rounded-xl border outline-none font-bold"
                                placeholder="e.g. 9876543210"
                                value={newUserMobile}
                                onChange={(e) => setNewUserMobile(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddUser} disabled={isAddingUser || !newUserName || !newUserMobile} className="w-full font-bold h-12 rounded-xl">
                            {isAddingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-0">
          {/* List Section */}
          <div className="flex-1 bg-card border rounded-[2.5rem] flex flex-col overflow-hidden shadow-sm">
              <div className="p-5 border-b flex gap-4 items-center">
                  <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search by name, mobile, or email..." 
                            className="w-full h-12 pl-11 pr-4 bg-muted/40 rounded-xl text-sm font-medium outline-none focus:bg-muted/60 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                  </div>
                  <button className="h-12 w-12 flex items-center justify-center rounded-xl border border-border/50 hover:bg-muted transition-colors">
                      <Filter className="h-4 w-4 text-slate-500" />
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                  {isLoading ? (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                          <p className="text-sm font-medium">Loading Shareholders...</p>
                      </div>
                  ) : filteredUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                          <Users className="h-12 w-12 mb-4 opacity-20" />
                          <p>No shareholders found.</p>
                      </div>
                  ) : (
                      <div className="space-y-1">
                          {filteredUsers.map((user) => (
                              <div 
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={cn(
                                    "p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border border-transparent",
                                    selectedUser?.id === user.id ? "bg-primary/5 border-primary/20 shadow-sm" : "hover:bg-slate-50"
                                )}
                              >
                                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                                      {user.name?.[0] || <User className="h-5 w-5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-0.5">
                                          <h4 className="font-bold text-sm truncate">{user.name}</h4>
                                          <span className={cn(
                                              "px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase",
                                              user.kycStatus === 'VERIFIED' ? "bg-emerald-100 text-emerald-700" :
                                              user.kycStatus === 'REJECTED' ? "bg-red-100 text-red-700" :
                                              "bg-amber-100 text-amber-700"
                                          )}>
                                              {user.kycStatus || 'PENDING'}
                                          </span>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                          <span>{user.mobile}</span>
                                          <span>•</span>
                                          <span className="flex items-center gap-1">
                                              <Wallet className="h-3 w-3" />
                                              ₹{user.walletBalance?.toLocaleString() || 0}
                                          </span>
                                      </div>
                                  </div>
                                  <ChevronRight className={cn("h-4 w-4 text-slate-300 transition-transform", selectedUser?.id === user.id && "text-primary translate-x-1")} />
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>

          {/* Details Panel */}
          <AnimatePresence mode="wait">
            {selectedUser && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-96 bg-card border rounded-[2.5rem] shadow-xl p-6 flex flex-col h-full overflow-y-auto"
                >
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <div className="h-16 w-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-xl shadow-slate-900/20">
                                {selectedUser.name?.[0]}
                            </div>
                            <h2 className="text-xl font-bold font-heading leading-tight">{selectedUser.name}</h2>
                            <p className="text-sm text-muted-foreground font-medium">{selectedUser.email || "No Email"}</p>
                            <p className="text-sm text-muted-foreground font-medium">{selectedUser.mobile}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedUser(null)}
                            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Financials Card */}
                        <div className="p-5 bg-slate-900 text-white rounded-3xl border border-border/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
                            <div className="relative z-10">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Wallet Balance</label>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-3xl font-black">₹{selectedUser.walletBalance?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="flex-1 bg-primary text-white hover:bg-primary/90 font-bold rounded-xl h-10 text-xs">
                                                <Plus className="h-3 w-3 mr-2" /> Add Funds
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Deposit Funds</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Amount (₹)</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-3 bg-muted/50 rounded-xl border outline-none font-bold text-lg"
                                                        placeholder="0.00"
                                                        value={depositAmount}
                                                        onChange={(e) => setDepositAmount(e.target.value)}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    For: <span className="font-bold text-foreground">{selectedUser?.name}</span>
                                                </p>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleDeposit} disabled={isDepositing || !depositAmount} className="w-full font-bold h-12 rounded-xl">
                                                    {isDepositing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Deposit"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>

                        {/* KYC & Bank Details */}
                        <div className="p-5 bg-muted/40 rounded-3xl border border-border/50">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Compliance</label>
                                {selectedUser.kycStatus !== 'VERIFIED' && (
                                    <button 
                                        onClick={handleVerifyKyc}
                                        className="text-[10px] font-bold text-primary hover:underline"
                                    >
                                        Mark Verified
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-border/30">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">KYC Status</span>
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-tight",
                                        selectedUser.kycStatus === 'VERIFIED' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        {selectedUser.kycStatus || 'PENDING'}
                                    </div>
                                </div>
                            </div>
                             <div className="mt-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Bank Details</label>
                                {selectedUser.bankAccounts?.length > 0 ? (
                                    <div className="space-y-2">
                                        <BankDetail label="Account" val={selectedUser.bankAccounts[0].accountNumber} />
                                        <BankDetail label="IFSC" val={selectedUser.bankAccounts[0].ifsc} />
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">No bank details added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BankDetail({ label, val }: { label: string, val: string }) {
    return (
        <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-border/30">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
            <span className="text-xs font-black">{val}</span>
        </div>
    )
}

function ChevronRight({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m9 18 6-6-6-6"/>
        </svg>
    )
}
