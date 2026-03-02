"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Building2, Calendar } from "lucide-react";

export function EarningsHistory({ dividends }: { dividends: any[] }) {
    if (dividends.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Recent Dividends
            </h3>
            <div className="space-y-3">
                {dividends.map((div, idx) => (
                    <Card key={idx} className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm tracking-tight">{div.hotel}</h4>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(div.date).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-emerald-600">
                                    +₹{div.amount.toLocaleString()}
                                </p>
                                <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-100">
                                    Paid
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
