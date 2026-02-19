"use client";

import { Button } from "@/components/ui/button";
import { TransactionItem, TransactionType } from "@/components/transaction-item";
import { ArrowLeft, Filter, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// Mock Data Removed


export default function TransactionsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | TransactionType>("ALL");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/wallet/transactions');
            // Assuming data is array of { id, type, amount, created_at, description }
            // Map to UI model
            const mapped = data.map((tx: any) => ({
                id: tx.id,
                date: new Date(tx.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }),
                amount: tx.amount,
                type: tx.type, // Ensure backend enums match or map them: 'DEPOSIT', 'WITHDRAWAL', 'PAYOUT'
                status: "Success", // Backend doesn't seem to have status yet, assume success for logs
                title: tx.description || (tx.type === 'DEPOSIT' ? 'Funds Added' : 'Transaction'),
            }));
            setTransactions(mapped);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchTransactions();
  },[]);

  const filteredTransactions = filter === "ALL" 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-heading font-bold text-xl">History</h1>
        </div>
        <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
        <FilterButton label="All" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
        <FilterButton label="Payouts" active={filter === "PAYOUT"} onClick={() => setFilter("PAYOUT")} />
        <FilterButton label="Withdrawals" active={filter === "WITHDRAWAL"} onClick={() => setFilter("WITHDRAWAL")} />
        <FilterButton label="Deposits" active={filter === "DEPOSIT"} onClick={() => setFilter("DEPOSIT")} />
      </div>

      {/* List */}
      <div className="px-4">
        {isLoading ? (
             <div className="text-center py-10 text-muted-foreground">Loading history...</div>
        ) : filteredTransactions.length > 0 ? (
            <div className="bg-card border rounded-xl p-4 shadow-sm">
                {filteredTransactions.map((tx) => (
                    <TransactionItem 
                        key={tx.id}
                        {...tx}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Filter className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-bold text-lg">No Transactions</h3>
                <p className="text-sm text-muted-foreground">Try changing the filters.</p>
            </div>
        )}
      </div>
    </main>
  );
}

function FilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
        >
            {label}
        </button>
    )
}
