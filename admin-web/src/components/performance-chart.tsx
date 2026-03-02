"use client";

import { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import api from "@/lib/api";

type PerformanceData = {
    month: string;
    revenue: number;
    expenses: number;
};

export function PerformanceChart() {
    const [data, setData] = useState<PerformanceData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const { data } = await api.get("/metrics/performance");
                setData(data);
            } catch (error) {
                console.error("Failed to fetch performance stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPerformance();
    }, []);

    if (isLoading) {
        return (
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-xl animate-pulse">
                <p className="text-muted-foreground text-sm font-medium">Loading analytics...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-xl border border-dashed text-muted-foreground">
                <p className="text-sm font-medium italic">No performance data available yet.</p>
            </div>
        );
    }

    return (
        <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontFamily: 'inherit'
                        }}
                        formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        animationDuration={1500}
                    />
                    <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
