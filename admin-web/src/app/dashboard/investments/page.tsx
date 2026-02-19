
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function InvestmentApprovalsPage() {
    const [investments, setInvestments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchInvestments = async () => {
        setIsLoading(true);
        try {
            // Fetch all investments
            const { data } = await api.get('/investments/all');
            // Filter only PENDING ones for this view, or show all with status
            // Ideally backend filters, but for now we filter client side
            setInvestments(data.filter((inv: any) => inv.status === 'PENDING'));
        } catch (error) {
            console.error("Failed to fetch investments", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, []);

    const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        
        setProcessingId(id);
        try {
            await api.post(`/investments/request/${id}`, { status: action });
            // Refresh list
            await fetchInvestments();
            alert(`Investment request ${action} successfully.`);
        } catch (error: any) {
            console.error(`Failed to ${action} request`, error);
            alert(error.response?.data?.error || `Failed to ${action} request`);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredInvestments = investments.filter(inv => 
        inv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.user.mobile.includes(searchTerm) ||
        inv.hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-heading">Investment Requests</h1>
                <p className="text-muted-foreground mt-1">Approve or reject shareholder investment applications.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Pending Approvals</CardTitle>
                            <CardDescription>Requests waiting for your review.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search investor..." 
                                className="pl-8" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredInvestments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No pending investment requests found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Investor</TableHead>
                                    <TableHead>Hotel</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvestments.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell>
                                            <div className="font-medium">{inv.user.name}</div>
                                            <div className="text-xs text-muted-foreground">{inv.user.mobile}</div>
                                        </TableCell>
                                        <TableCell>{inv.hotel.name}</TableCell>
                                        <TableCell className="font-bold">₹{inv.investedAmount.toLocaleString()}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleAction(inv.id, 'REJECTED')}
                                                disabled={processingId === inv.id}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleAction(inv.id, 'APPROVED')}
                                                disabled={processingId === inv.id}
                                            >
                                                {processingId === inv.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
