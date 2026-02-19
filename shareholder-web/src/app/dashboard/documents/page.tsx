"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, ShieldCheck, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const DOCUMENTS = [
  { id: 1, title: "Share Certificate - Goa Kitchen", date: "15 Oct 2023", type: "Certificate", size: "1.2 MB" },
  { id: 2, title: "Investment Agreement - Mumbai Grand", date: "10 Sept 2023", type: "Agreement", size: "2.4 MB" },
  { id: 3, title: "T&C and Policy Document", date: "01 Aug 2023", type: "Legal", size: "0.8 MB" },
  { id: 4, title: "KYC Confirmation Letter", date: "28 Jul 2023", type: "Personal", size: "0.5 MB" },
];

export default function DocumentsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-heading font-bold text-xl">Document Vault</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Digitally Signed</h3>
            <p className="text-sm text-muted-foreground">All your share certificates are legally binding and digitally signed by Eatumy Holder.</p>
        </div>

        <div className="space-y-3">
            {DOCUMENTS.map((doc, idx) => (
                <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <div className="bg-card border rounded-xl p-4 flex items-center justify-between group hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-tight">{doc.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">{doc.type}</span>
                                    <span className="text-[10px] text-muted-foreground">{doc.date} • {doc.size}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-9 w-9">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </main>
  );
}
