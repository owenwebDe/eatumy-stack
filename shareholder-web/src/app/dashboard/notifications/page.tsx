"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, BellOff, Megaphone, Banknote, ShieldCheck, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const NOTIFICATIONS = [
  { 
    id: 1, 
    type: "PAYOUT", 
    title: "Profit Payout Received", 
    desc: "₹12,500 has been credited to your portfolio for Eatumy Residency.", 
    time: "2h ago", 
    read: false,
    icon: Banknote,
    color: "bg-green-100 text-green-600"
  },
  { 
    id: 2, 
    type: "OPPORTUNITY", 
    title: "New Cloud Kitchen Live!", 
    desc: "Eatumy Signature is now open for share purchase in Bangalore.", 
    time: "5h ago", 
    read: false,
    icon: Megaphone,
    color: "bg-blue-100 text-blue-600"
  },
  { 
    id: 3, 
    type: "SYSTEM", 
    title: "KYC Verified Successfully", 
    desc: "Your documents have been approved. You can now withdraw funds.", 
    time: "1d ago", 
    read: true,
    icon: ShieldCheck,
    color: "bg-purple-100 text-purple-600"
  },
  { 
    id: 4, 
    type: "PERFORMANCE", 
    title: "Monthly Report Ready", 
    desc: "October kitchen performance report is now available in documents.", 
    time: "2d ago", 
    read: true,
    icon: TrendingUp,
    color: "bg-amber-100 text-amber-600"
  },
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-heading font-bold text-xl">Notifications</h1>
        </div>
        <Button variant="ghost" size="sm" className="text-primary text-xs font-bold uppercase tracking-wider">
            Mark all read
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {NOTIFICATIONS.length > 0 ? (
            <div className="space-y-3">
                {NOTIFICATIONS.map((notif, idx) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <div className={`p-4 rounded-2xl border flex gap-4 transition-colors ${notif.read ? 'bg-card' : 'bg-primary/5 border-primary/20 shadow-sm'}`}>
                            <div className={`h-11 w-11 rounded-full flex-shrink-0 flex items-center justify-center ${notif.color}`}>
                                <notif.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-bold ${notif.read ? 'text-foreground' : 'text-primary'}`}>{notif.title}</h4>
                                    <span className="text-[10px] text-muted-foreground font-medium">{notif.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{notif.desc}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground/30">
                    <BellOff className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-lg">All caught up!</h3>
                <p className="text-sm text-muted-foreground">We'll notify you when something important happens.</p>
            </div>
        )}
      </div>
    </main>
  );
}
