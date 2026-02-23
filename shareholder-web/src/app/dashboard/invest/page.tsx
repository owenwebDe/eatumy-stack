"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, TrendingUp, Info } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/utils";

export default function InvestPage() {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const { data } = await api.get('/hotels');
                setOpportunities(data);
            } catch (error) {
                console.error("Failed to fetch opportunities", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHotels();
    }, []);

    return (
        <main className="p-4 space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-heading">Share Opportunities</h1>
                <p className="text-muted-foreground text-sm">Grow your portfolio with high-yield cloud kitchen assets.</p>
            </div>

            <div className="space-y-4">
                {isLoading && <p className="text-center py-10 text-muted-foreground">Loading opportunities...</p>}
                {!isLoading && opportunities.length === 0 && (
                    <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                        <p className="text-sm font-medium text-muted-foreground">No share opportunities available at the moment.</p>
                        <p className="text-xs text-muted-foreground mt-1">Check back later for new high-yield assets.</p>
                    </div>
                )}
                {opportunities.map((hotel) => (
                    <Card key={hotel.id} className="overflow-hidden border-none shadow-md">
                        <div className="h-48 bg-slate-100 relative">
                            {hotel.logoUrl ? (
                                <img
                                    src={getMediaUrl(hotel.logoUrl)}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl">
                                    {hotel.name[0]}
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                {hotel.status === 'ACTIVE' ? 'Open' : 'Coming Soon'}
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg">{hotel.name}</h3>
                            <div className="flex items-center text-muted-foreground text-xs mb-4">
                                <MapPin className="h-3 w-3 mr-1" /> {hotel.city}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-primary/5 p-2 rounded-lg">
                                    <p className="text-[10px] text-muted-foreground uppercase">Min Share</p>
                                    <p className="font-bold text-sm">₹{(hotel.minInvestment || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded-lg">
                                    <p className="text-[10px] text-green-700 uppercase">Projected ROI</p>
                                    <p className="font-bold text-sm text-green-700">{hotel.roi || "15-20%"}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                                <span>Raised: {hotel.valuation > 0 ? Math.round((hotel.raised / hotel.valuation) * 100) : 0}%</span>
                                <span>Goal: ₹{(hotel.valuation || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full mb-4 overflow-hidden">
                                <div
                                    className="bg-primary h-full rounded-full"
                                    style={{ width: `${hotel.valuation > 0 ? Math.min((hotel.raised / hotel.valuation) * 100, 100) : 0}%` }}
                                />
                            </div>

                            {hotel.status === "ACTIVE" ? (
                                <Link href={`/dashboard/hotels/${hotel.id}`} className="w-full block">
                                    <Button className="w-full">View Details & Buy Shares</Button>
                                </Link>
                            ) : (
                                <Button className="w-full" disabled>Notify Me</Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start text-blue-800 text-sm">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>
                    All share purchases are subject to market risks. Please read the offer document carefully before buying shares.
                </p>
            </div>
        </main>
    );
}
