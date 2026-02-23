"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/utils";

const MY_HOTELS: any[] = [];

export default function HotelsPage() {
    const [myHotels, setMyHotels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInvestments = async () => {
            try {
                // Get user's investments
                const { data } = await api.get('/investments');
                // Transform investment data to match UI needs if necessary.
                // Assuming data contains: { hotel: { name, city, ... }, investedAmount, ... }
                const mappedHotels = data.map((inv: any) => ({
                    id: inv.hotel.id,
                    name: inv.hotel.name,
                    location: inv.hotel.city,
                    share: `${inv.sharePercent || 0}%`, // Or handle share units
                    shareValue: inv.investedAmount, // Simplified for now
                    profitMonth: 0, // Needs real data later
                    image: getMediaUrl(inv.hotel.logoUrl) || "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&auto=format&fit=crop&q=60"
                }));
                setMyHotels(mappedHotels);
            } catch (error) {
                console.error("Failed to fetch my kitchens", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvestments();
    }, []);

    return (
        <main className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-heading">My Kitchens</h1>
                <div className="text-sm font-medium text-muted-foreground">{myHotels.length} Active</div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search your kitchens..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading your kitchens...</div>
                ) : myHotels.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                        <p className="text-sm font-medium text-muted-foreground">You haven't invested in any kitchens yet.</p>
                        <Link href="/dashboard/invest" className="text-primary text-xs font-bold mt-2 inline-block">Start Investing</Link>
                    </div>
                ) : (
                    myHotels.map((item, idx) => (
                        <Link href={`/dashboard/hotels/${item.id}`} key={item.id} className="block">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4 flex gap-4">
                                        {/* Thumbnail */}
                                        <div className="h-16 w-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                                    <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                                                        <MapPin className="h-3 w-3 mr-1" /> {item.location}
                                                    </div>
                                                </div>
                                                <span className="bg-primary/5 text-primary px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                                                    {item.share}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">Share Value</p>
                                                    <p className="font-bold text-sm">₹{item.shareValue.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-muted-foreground">This Month</p>
                                                    <p className="font-bold text-sm text-green-600 flex items-center justify-end">
                                                        <TrendingUp className="h-3 w-3 mr-1" /> ₹{item.profitMonth.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    );
}
