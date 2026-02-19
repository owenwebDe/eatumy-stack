import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";

export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "PAYOUT" | "INVESTMENT";
export type TransactionStatus = "SUCCESS" | "PENDING" | "FAILED";

interface TransactionItemProps {
  type: TransactionType;
  amount: number;
  title: string;
  date: string;
  status: TransactionStatus;
  notes?: string;
}

export function TransactionItem({ type, amount, title, date, status, notes }: TransactionItemProps) {
  const isCredit = type === "PAYOUT" || type === "DEPOSIT";
  
  const getIcon = () => {
    switch (type) {
      case "DEPOSIT": return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      case "PAYOUT": return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case "WITHDRAWAL": return <ArrowUpRight className="h-5 w-5 text-amber-600" />;
      case "INVESTMENT": return <FileText className="h-5 w-5 text-purple-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "DEPOSIT": return "bg-green-100";
      case "PAYOUT": return "bg-blue-100";
      case "WITHDRAWAL": return "bg-amber-100";
      case "INVESTMENT": return "bg-purple-100";
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0 hover:bg-muted/30 transition-colors -mx-4 px-4">
      <div className="flex items-center gap-3">
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", getBgColor())}>
          {getIcon()}
        </div>
        <div>
          <p className="font-medium text-sm leading-none mb-1.5">{title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{date}</span>
            {status === "PENDING" && (
                <span className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded-full">
                    <Clock className="h-3 w-3" /> Processing
                </span>
            )}
             {status === "FAILED" && (
                <span className="flex items-center gap-1 text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded-full">
                    <XCircle className="h-3 w-3" /> Failed
                </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-bold font-mono", isCredit ? "text-green-600" : "text-foreground")}>
            {isCredit ? "+" : "-"}₹{amount.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 max-w-[100px] truncate">
            {notes || (status === "SUCCESS" ? "Completed" : "Pending Approval")}
        </p>
      </div>
    </div>
  );
}
