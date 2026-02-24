"use client";

import { useState, useEffect } from "react";
import {
    ClipboardList,
    Search,
    Filter,
    Plus,
    Upload,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Building2,
    Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function DailyOrdersPage() {
    const [date, setDate] = useState(new Date());
    const [metrics, setMetrics] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        totalOrders: 0,
        revenue: 0,
        reportingCount: 0,
        totalKitchens: 0
    });

    const [hotels, setHotels] = useState<any[]>([]);
    const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
    const [newEntryData, setNewEntryData] = useState({
        hotelId: "",
        ordersCount: "",
        revenue: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDate = (d: Date) => {
        return d.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const changeDate = (days: number) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        setDate(newDate);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dateStr = date.toISOString().split('T')[0];
                const [summaryRes, metricsRes, hotelsRes] = await Promise.all([
                    api.get(`/metrics/fleet-summary?date=${dateStr}`),
                    api.get(`/metrics/all?date=${dateStr}`),
                    api.get('/hotels')
                ]);
                setSummary(summaryRes.data);
                setMetrics(metricsRes.data);
                setHotels(hotelsRes.data);
            } catch (error) {
                console.error("Failed to fetch daily stats", error);
            }
        };
        fetchData();
    }, [date]);

    const handleSubmitEntry = async () => {
        if (!newEntryData.hotelId || !newEntryData.ordersCount) return;
        setIsSubmitting(true);
        try {
            await api.post('/metrics', {
                hotelId: newEntryData.hotelId,
                date: date.toISOString(),
                ordersCount: parseInt(newEntryData.ordersCount),
                revenue: newEntryData.revenue ? parseFloat(newEntryData.revenue) : 0,
            });
            toast.success("Daily entry recorded successfully");
            setIsNewEntryOpen(false);
            setNewEntryData({ hotelId: "", ordersCount: "", revenue: "" });

            // trigger a refetch
            const dateStr = date.toISOString().split('T')[0];
            const [summaryRes, metricsRes] = await Promise.all([
                api.get(`/metrics/fleet-summary?date=${dateStr}`),
                api.get(`/metrics/all?date=${dateStr}`)
            ]);
            setSummary(summaryRes.data);
            setMetrics(metricsRes.data);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to record entry");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading tracking-tight">Daily Metrics</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Input and monitor daily order volumes and revenue across hotels.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-card border px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-muted transition-all">
                        <Upload className="h-4 w-4" /> Import CSV
                    </button>
                    <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
                        <DialogTrigger asChild>
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                                <Plus className="h-4 w-4" /> New Entry
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Log Daily Performance</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Kitchen/Hotel</label>
                                    <select
                                        className="w-full p-3 bg-muted/50 rounded-xl border outline-none font-bold text-sm"
                                        value={newEntryData.hotelId}
                                        onChange={(e) => setNewEntryData(prev => ({ ...prev, hotelId: e.target.value }))}
                                    >
                                        <option value="">Select a location...</option>
                                        {hotels.map(h => (
                                            <option key={h.id} value={h.id}>{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Total Orders Today ({formatDate(date)})</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-muted/50 rounded-xl border outline-none font-bold"
                                        value={newEntryData.ordersCount}
                                        onChange={(e) => setNewEntryData(prev => ({ ...prev, ordersCount: e.target.value }))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Gross Revenue (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-muted/50 rounded-xl border outline-none font-bold"
                                        value={newEntryData.revenue}
                                        onChange={(e) => setNewEntryData(prev => ({ ...prev, revenue: e.target.value }))}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <button
                                    onClick={handleSubmitEntry}
                                    disabled={isSubmitting || !newEntryData.hotelId || !newEntryData.ordersCount}
                                    className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl flex items-center justify-center disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Entry"}
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Date Filter Ribbon */}
            <div className="flex items-center justify-between bg-card border p-2 rounded-2xl shadow-sm">
                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 font-bold text-sm">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {formatDate(date)}
                </div>
                <button onClick={() => changeDate(1)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Entry List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">Hotel Performance Logs</h3>
                        <div className="flex gap-2">
                            <button className="p-2 bg-card border rounded-lg text-muted-foreground hover:text-primary transition-colors">
                                <Filter className="h-4 w-4" />
                            </button>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search hotel..."
                                    className="h-10 pl-10 pr-4 bg-card border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Kitchen / Hotel</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Orders</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Revenue</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Growth</th>
                                    <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-wider text-muted-foreground">Edit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {metrics.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                                            No data recorded for this date.
                                        </td>
                                    </tr>
                                )}
                                {metrics.map((m) => (
                                    <tr key={m.id} className="hover:bg-muted/5 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                    <Building2 className="h-4 w-4" />
                                                </div>
                                                <p className="text-xs font-bold">{m.hotel.name}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-black">{m.ordersCount}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-bold text-slate-600">₹{m.revenue?.toLocaleString()}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[10px] font-black text-muted-foreground">--</span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Adjust</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Aggregate Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-4">Daily Fleet Summary</h3>
                            <div className="space-y-4">
                                <SummaryRow label="Total Fleet Orders" val={summary.totalOrders.toString()} trend="Today" />
                                <SummaryRow label="Aggregate Revenue" val={`₹${summary.revenue.toLocaleString()}`} trend="Today" />
                                <SummaryRow
                                    label="Entry Compliance"
                                    val={`${summary.reportingCount} / ${summary.totalKitchens}`}
                                    trend={summary.totalKitchens > 0 ? `${Math.round((summary.reportingCount / summary.totalKitchens) * 100)}% Complete` : '0% Complete'}
                                />
                            </div>
                            <button className="w-full mt-6 py-3 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl">
                                Send Reminders
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-card border rounded-[2rem] shadow-sm">
                        <h4 className="font-bold text-sm mb-4">Weekly Trend</h4>
                        <div className="h-32 flex items-center justify-center text-muted-foreground text-xs italic bg-muted/20 rounded">
                            Chart Placeholder
                        </div>
                        <div className="flex justify-between mt-3 px-1">
                            <span className="text-[8px] font-black text-muted-foreground uppercase">Mon</span>
                            <span className="text-[8px] font-black text-muted-foreground uppercase">Sun</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryRow({ label, val, trend }: { label: string, val: string, trend: string }) {
    return (
        <div className="flex justify-between items-end border-b border-white/10 pb-3">
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">{label}</p>
                <p className="text-xl font-black">{val}</p>
            </div>
            <p className="text-[10px] font-medium text-emerald-400">{trend}</p>
        </div>
    )
}
