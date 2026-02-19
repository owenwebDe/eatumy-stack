"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Phone, Mail, HelpCircle, ChevronRight, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "How are profits calculated?", a: "Profits are calculated based on the net revenue of the cloud kitchen after deducting operational expenses. Each kitchen has its own P&L which is audited monthly." },
  { q: "When can I withdraw my earnings?", a: "Withdrawals can be requested anytime. Approval usually takes 24-48 business hours. Funds are settled via IMPS/NEFT to your registered bank account." },
  { q: "Can I sell my kitchen shares?", a: "Yes, shares can be listed on our internal secondary market after a lock-in period of 6 months. Price depends on current market demand." },
  { q: "Is my capital guaranteed?", a: "Investments in cloud kitchens involve business risks. While we select prime locations and high-performing brands, capital is not guaranteed by the platform." },
];

export default function SupportPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-heading font-bold text-xl">Support Center</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact Strip */}
        <div className="grid grid-cols-2 gap-3">
            <ContactCard 
                icon={MessageCircle} 
                label="WhatsApp" 
                color="bg-green-50 text-green-600"
                onClick={() => window.open("https://wa.me/919876543210", "_blank")}
            />
            <ContactCard 
                icon={Phone} 
                label="Call Agent" 
                color="bg-blue-50 text-blue-600"
                onClick={() => window.open("tel:+919876543210", "_blank")}
            />
        </div>

        <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Frequently Asked Questions
            </h3>
            <div className="space-y-3">
                {FAQS.map((faq, i) => (
                    <FaqItem key={i} q={faq.q} a={faq.a} />
                ))}
            </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 text-center space-y-4">
             <div className="h-14 w-14 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Mail className="h-6 w-6" />
             </div>
             <div>
                <h4 className="font-bold">Still need help?</h4>
                <p className="text-sm text-muted-foreground">Our support team is available Mon-Fri, 10 AM to 7 PM.</p>
             </div>
             <Button variant="outline" className="w-full">
                Email Support
             </Button>
        </div>
      </div>
    </main>
  );
}

function ContactCard({ icon: Icon, label, color, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center p-6 bg-card border rounded-2xl hover:border-primary/50 transition-colors gap-2"
        >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="font-bold text-sm tracking-tight">{label}</span>
        </button>
    )
}

function FaqItem({ q, a }: { q: string, a: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border rounded-xl overflow-hidden bg-card">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
            >
                <span className="font-bold text-sm pr-4">{q}</span>
                <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-90")} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-4 pt-0 text-sm text-muted-foreground border-t bg-muted/10">
                            {a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
