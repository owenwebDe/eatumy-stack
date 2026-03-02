"use client";

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Download, TrendingUp, Calendar, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Drawer } from "vaul";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/utils";

export default function HotelDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = use(params);
  const [hotel, setHotel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Buy Flow State
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userInvestment, setUserInvestment] = useState<any>(null);

  useEffect(() => {
    const fetchHotelAndProfile = async () => {
      try {
        const [hotelRes, profileRes, investmentRes] = await Promise.all([
          api.get(`/hotels/${id}`),
          api.get('/auth/me'),
          api.get('/investments')
        ]);
        setHotel(hotelRes.data);
        const profile = profileRes.data;
        // Backend returns { user: { ... } } so we access profile.user.walletBalance
        // Fallback to profile.walletBalance if structure changes
        const balance = profile.user?.walletBalance ?? profile.walletBalance ?? 0;
        setWalletBalance(balance);

        const myInvestment = investmentRes.data.find((inv: any) => inv.hotelId === id);
        setUserInvestment(myInvestment);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotelAndProfile();
  }, [id]);

  const handleBuyShares = async () => {
    if (!investmentAmount || isNaN(Number(investmentAmount))) return;
    const amount = parseFloat(investmentAmount);

    if (amount > walletBalance) {
      toast.error("Insufficient Wallet Balance. Please contact Admin to add funds.");
      // Optional: Redirect to dashboard or show deposit drawer
      return;
    }

    setIsProcessing(true);

    try {
      await api.post('/investments', {
        userId: user?.id,
        hotelId: id, // String ID
        investedAmount: amount,
        shareUnits: Math.floor(amount / 1000), // Mock unit calc - to be refined by Admin on approval if needed
      });

      // Success
      toast.success("Investment request submitted successfully! An admin will review and contact you shortly.");
      setIsBuyOpen(false);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Share purchase failed", error);
      toast.error(error.response?.data?.error || "Failed to submit investment request.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* ... (Header and Banner - No changes needed) */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-heading font-bold text-lg truncate flex-1">{hotel.name}</h1>
        <Button variant="ghost" size="icon">
          <Download className="h-5 w-5" />
        </Button>
      </div>

      <div className="overflow-y-auto">
        {/* Banner Image */}
        <div className="h-64 w-full relative">
          {hotel.logoUrl ? (
            <img src={getMediaUrl(hotel.logoUrl)} className="w-full h-full object-cover" alt={hotel.name} />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-4xl">{hotel.name[0]}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80" />
        </div>

        <div className="p-4 -mt-12 relative bg-background/50 backdrop-blur-sm rounded-t-3xl space-y-6 border-t">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold font-heading">{hotel.name}</h2>
              <div className="flex items-center text-muted-foreground mt-1 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {hotel.city}
              </div>
            </div>
            <div className="bg-primary/5 px-3 py-1 rounded-lg text-primary font-bold text-sm">
              {hotel.roi || "15%"} ROI
            </div>
          </div>

          {userInvestment ? (
            <div className={`w-full p-4 rounded-xl border flex flex-col items-center gap-2 ${userInvestment.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'
              }`}>
              <div className="flex items-center gap-2 font-bold">
                {userInvestment.status === 'APPROVED' ? <TrendingUp className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                {userInvestment.status === 'APPROVED' ? 'Active Investment' : 'Investment Pending'}
              </div>
              <p className="text-sm font-medium">
                ₹{userInvestment.investedAmount.toLocaleString()} {userInvestment.status === 'APPROVED' ? 'Working for you' : 'Awaiting confirmation'}
              </p>
            </div>
          ) : (
            <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25" onClick={() => setIsBuyOpen(true)}>
              Buy Shares Now <ArrowUpRight className="ml-2 h-5 w-5" />
            </Button>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Raised So Far" value={`₹${(hotel.raised || 0).toLocaleString()}`} />
            <MetricCard label="Valuation" value={`₹${(hotel.valuation || 0).toLocaleString()}`} highlight />
          </div>

          {/* Action Tabs */}
          <div className="flex border-b">
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</TabButton>
            <TabButton active={activeTab === "ledger"} onClick={() => setActiveTab("ledger")}>Details</TabButton>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="min-h-[200px]"
          >
            {activeTab === "overview" ? (
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" /> Highlights
                </h3>
                <div className="bg-card p-4 rounded-xl border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min Purchase</span>
                    <span className="font-bold">₹{hotel.minInvestment?.toLocaleString() || "5,000"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Share Model</span>
                    <span className="font-bold">{hotel.shareModel || "Profit Share"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payout Frequency</span>
                    <span className="font-bold">Monthly</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Detailed financial reports will be available to shareholders.
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Drawer.Root open={isBuyOpen} onOpenChange={setIsBuyOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[75vh] mt-24 fixed bottom-0 left-0 right-0 z-50 transition-transform">
            <div className="p-4 bg-background rounded-t-[10px] flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
              <div className="max-w-md mx-auto space-y-6">
                <Drawer.Title className="font-heading font-bold text-2xl">Buy Shares in {hotel.name}</Drawer.Title>

                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl -mr-6 -mt-6" />
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Your Wallet Balance</p>
                      <p className="text-xl font-bold font-heading">₹{walletBalance.toLocaleString()}</p>
                    </div>
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Minimum Purchase</span>
                    <span className="font-bold">₹{hotel.minInvestment?.toLocaleString() || "5,000"}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Purchase Amount (₹)</label>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="w-full h-14 bg-background border rounded-xl px-4 text-xl font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder={hotel.minInvestment?.toString() || "5000"}
                      autoFocus
                    />
                    {parseFloat(investmentAmount || '0') > walletBalance && (
                      <p className="text-xs text-red-500 font-bold mt-1">Insufficient balance. Please add funds.</p>
                    )}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-bold"
                  onClick={handleBuyShares}
                  disabled={isProcessing || !investmentAmount || parseFloat(investmentAmount) > walletBalance}
                >
                  {isProcessing ? "Processing..." : "Confirm Purchase"}
                </Button>

                {parseFloat(investmentAmount || '0') > walletBalance && (
                  <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
                    Go to Dashboard to Add Funds
                  </Button>
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </main>
  );
}

function MetricCard({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-amber-50 border-amber-100' : 'bg-card'}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-amber-700' : ''}`}>{value}</p>
    </div>
  )
}

// ... TabButton
function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
    >
      {children}
    </button>
  )
}

function ArrowUpRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
  )
}
