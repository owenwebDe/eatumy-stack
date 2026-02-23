"use client";

import { useState, useMemo } from "react";
import {
    Building2,
    Search,
    MapPin,
    MoreVertical,
    Plus,
    Users,
    TrendingUp,
    Filter,
    IndianRupee,
    Settings2,
    Video,
    Calendar,
    PieChart,
    ChevronRight,
    ChevronLeft,
    Briefcase,
    CheckCircle2,
    AlertCircle,
    Percent,
    Coins,
    Trash2,
    Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";


export default function KitchensPage() {
    const [kitchens, setKitchens] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedKitchen, setSelectedKitchen] = useState<any>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Wizard State
    const [bizName, setBizName] = useState("");
    const [bizCity, setBizCity] = useState("");
    const [capitalReq, setCapitalReq] = useState<number>(0);
    const [sharesForSale, setSharesForSale] = useState<number>(40);

    // Manager Assignment State
    const [isAssignManagerOpen, setIsAssignManagerOpen] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [managerSearchTerm, setManagerSearchTerm] = useState("");

    // Edit State
    const [editName, setEditName] = useState("");
    const [editCity, setEditCity] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editLogoUrl, setEditLogoUrl] = useState("");
    const [editRoi, setEditRoi] = useState("");
    const [editManagerId, setEditManagerId] = useState("");

    useEffect(() => {
        fetchKitchens();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const handleImageUpload = async (file: File) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('image', file); // 'image' should match the backend's expected field name

            const { data } = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setEditLogoUrl(data.imageUrl); // Assuming the backend returns { imageUrl: "path/to/image.jpg" }
            toast.success("Image uploaded successfully!");
        } catch (error: any) {
            console.error("Image upload failed:", error);
            toast.error(error.response?.data?.error || "Failed to upload image.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignManager = async (userId: string) => {
        if (!selectedKitchen) return;
        try {
            await api.put(`/hotels/${selectedKitchen.id}/assign-manager`, { userId });
            alert("Manager assigned successfully!");
            setIsAssignManagerOpen(false);
            fetchKitchens(); // Refetch to update UI
        } catch (error: any) {
            console.error("Failed to assign manager", error);
            alert(error.response?.data?.error || "Failed to assign manager");
        }
    };

    const fetchKitchens = async () => {
        try {
            const { data } = await api.get('/hotels'); // Use /hotels endpoint for kitchens/businesses
            setKitchens(data);
        } catch (error) {
            console.error("Failed to fetch kitchens:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLaunch = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/hotels', {
                name: bizName,
                city: bizCity, // Fixed: Backend expects 'city', not 'location'
                totalUpdates: 0,
                status: 'ACTIVE',
                subscriptionStatus: 'ACTIVE',
                valuation: capitalReq, // Mapping Total Capital Required to valuation (Funding Goal)
                minInvestment: 0, // Default for now
                roi: '15-20%' // Default estimate
            });
            await fetchKitchens();
            closeWizard();
        } catch (error) {
            console.error("Failed to create kitchen:", error);
            alert("Failed to create business. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateHotel = async () => {
        if (!selectedKitchen) return;
        setIsSubmitting(true);
        try {
            // 1. Update basic info
            await api.put(`/hotels/${selectedKitchen.id}`, {
                name: editName,
                city: editCity,
                address: editAddress,
                logoUrl: editLogoUrl,
                roi: editRoi
            });

            // 2. Update manager if changed
            if (editManagerId !== selectedKitchen.branchManagerId) {
                await api.put(`/hotels/${selectedKitchen.id}/assign-manager`, { userId: editManagerId });
            }

            toast.success("Business updated successfully");
            setSelectedKitchen(null);
            fetchKitchens();
        } catch (error: any) {
            console.error("Update Error:", error);
            alert(error.response?.data?.error || "Failed to update business.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleDeleteBusiness = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone and will only work if there are no active investments.`)) {
            return;
        }
        try {
            await api.delete(`/hotels/${id}`);
            toast.success("Business deleted successfully");
            fetchKitchens();
        } catch (error: any) {
            console.error("Delete Error:", error);
            alert(error.response?.data?.error || "Failed to delete business. Check if it has active investments.");
        }
    };

    const pricePerOnePercent = useMemo(() => {
        if (!capitalReq || !sharesForSale) return 0;
        return capitalReq / sharesForSale;
    }, [capitalReq, sharesForSale]);

    const handleNext = () => setWizardStep(s => s + 1);
    const handleBack = () => setWizardStep(s => s - 1);

    const closeWizard = () => {
        setIsWizardOpen(false);
        setWizardStep(1);
        setBizName("");
        setBizCity("");
        setCapitalReq(0);
        setSharesForSale(40);
    };

    return (
        <div className="space-y-8 pb-10 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading tracking-tight">Business Fleet</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage operational status and high-level branch configuration.</p>
                </div>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Add New Business
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mr-3" />
                    Loading Fleet...
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {kitchens.length === 0 && (
                        <div className="col-span-full text-center py-20 text-muted-foreground">
                            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No businesses found. Launch your first one!</p>
                        </div>
                    )}
                    {kitchens.map((kitchen, idx) => (
                        <motion.div
                            key={kitchen.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-card border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row"
                        >
                            <div className="p-8 flex-1 border-r border-border/50">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase",
                                        kitchen.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" :
                                            "bg-amber-100 text-amber-700"
                                    )}>
                                        {kitchen.status}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDeleteBusiness(kitchen.id, kitchen.name)}
                                            className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-full transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                                            <Settings2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 mb-8">
                                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 overflow-hidden">
                                        {kitchen.logoUrl ? (
                                            <img
                                                src={kitchen.logoUrl.startsWith('http') ? kitchen.logoUrl : `http://45.76.132.8:5000${kitchen.logoUrl}`}
                                                alt={kitchen.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Building2 className="h-10 w-10" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors cursor-pointer">{kitchen.name}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                                            <MapPin className="h-3 w-3 mr-1 text-primary" /> {kitchen.city || (kitchen.location || "Unknown City")}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 border-t pt-6">
                                    <Stat label="Manager" val={kitchen.branchManager?.name || "Unassigned"} />
                                    <Stat label="Shareholders" val={(kitchen.shareholders?.length || 0).toString()} icon={<Users className="h-3 w-3" />} />
                                    <Stat label="Target ROI" val={kitchen.roi || "N/A"} icon={<TrendingUp className="h-3 w-3" />} />
                                    <Stat label="Total Payouts" val={`₹0`} icon={<IndianRupee className="h-3 w-3" />} />
                                </div>
                            </div>

                            {/* Config Quick Panel */}
                            <div className="w-full md:w-72 bg-muted/20 p-8 flex flex-col gap-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Branch Settings</h4>

                                {/* Manager Assignment */}
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg flex items-center justify-center border bg-slate-100 text-slate-400 border-slate-200">
                                        <Briefcase className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Manager</p>
                                        <p className="text-xs font-black leading-tight mt-0.5">{kitchen.branchManager?.name || "Unassigned"}</p>
                                        <button
                                            onClick={() => {
                                                setSelectedKitchen(kitchen);
                                                setIsAssignManagerOpen(true);
                                            }}
                                            className="text-[9px] font-bold text-primary mt-1 hover:underline"
                                        >
                                            {kitchen.branchManager ? "Change Manager" : "Assign Manager"}
                                        </button>
                                    </div>
                                </div>

                                <ConfigItem
                                    icon={<PieChart className="h-3.5 w-3.5" />}
                                    label="Share Model"
                                    val="PERCENT"
                                    sub="Equity Based"
                                />

                                {/* ... other items */}

                                <button
                                    onClick={() => {
                                        setSelectedKitchen(kitchen);
                                        setEditName(kitchen.name);
                                        setEditCity(kitchen.city || "");
                                        setEditAddress(kitchen.address || "");
                                        setEditLogoUrl(kitchen.logoUrl || "");
                                        setEditRoi(kitchen.roi || "");
                                        setEditManagerId(kitchen.branchManagerId || "");
                                    }}
                                    className="mt-auto w-full py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    Full Configuration <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Assign Manager Modal */}
            <AnimatePresence>
                {isAssignManagerOpen && selectedKitchen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-card w-full max-w-lg p-6 rounded-[2rem] shadow-2xl relative border"
                        >
                            <button
                                onClick={() => setIsAssignManagerOpen(false)}
                                className="absolute top-4 right-4 h-8 w-8 bg-muted rounded-full flex items-center justify-center font-bold text-sm hover:bg-muted/80 transition-all"
                            >
                                ✕
                            </button>
                            <h2 className="text-xl font-bold font-heading mb-1">Assign Manager</h2>
                            <p className="text-xs text-muted-foreground mb-4">Select a user to manage <span className="font-bold text-foreground">{selectedKitchen.name}</span></p>

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or mobile..."
                                    className="w-full h-10 pl-9 pr-4 bg-muted/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    onChange={(e) => setManagerSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-2">
                                {users
                                    .filter(u => u.name.toLowerCase().includes(managerSearchTerm.toLowerCase()) || u.mobile.includes(managerSearchTerm))
                                    .map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleAssignManager(user.id)}
                                            className={cn(
                                                "p-3 rounded-xl border flex items-center justify-between cursor-pointer hover:border-primary transition-all",
                                                selectedKitchen.branchManagerId === user.id ? "bg-primary/5 border-primary" : "bg-card"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                                                    {user.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold leading-none">{user.name}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">{user.mobile} • {user.role}</p>
                                                </div>
                                            </div>
                                            {selectedKitchen.branchManagerId === user.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                        </div>
                                    ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Business Wizard Modal */}
            <AnimatePresence>
                {isWizardOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-card w-full max-w-2xl rounded-[3rem] shadow-2xl relative border overflow-hidden"
                        >
                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-muted flex">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: "33.33%" }}
                                    animate={{ width: `${(wizardStep / 3) * 100}%` }}
                                />
                            </div>

                            <button
                                onClick={closeWizard}
                                className="absolute top-6 right-6 h-10 w-10 bg-muted rounded-full flex items-center justify-center font-bold text-sm hover:bg-muted/80 transition-all z-10"
                            >
                                ✕
                            </button>

                            <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                                {/* Sidebar Info */}
                                <div className="w-full md:w-64 bg-slate-50 p-10 flex flex-col border-r">
                                    <div className="mb-10">
                                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-bold text-xl leading-tight">Add New Business</h3>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2">Acquisition Wizard</p>
                                    </div>

                                    <div className="space-y-6 mt-auto">
                                        <WizardStep indicator="01" label="Business Identity" active={wizardStep === 1} done={wizardStep > 1} />
                                        <WizardStep indicator="02" label="Equity Parameters" active={wizardStep === 2} done={wizardStep > 2} />
                                        <WizardStep indicator="03" label="Launch Summary" active={wizardStep === 3} done={wizardStep > 3} />
                                    </div>
                                </div>

                                {/* Form Area */}
                                <div className="flex-1 p-10 flex flex-col">
                                    <AnimatePresence mode="wait">
                                        {wizardStep === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-2">
                                                    <h2 className="text-2xl font-black font-heading tracking-tight">Tell us about the business</h2>
                                                    <p className="text-sm text-muted-foreground">Basic information for the new branch.</p>
                                                </div>

                                                <div className="space-y-4 pt-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business / Kitchen Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Eatumy Royale, Bangalore"
                                                            value={bizName}
                                                            onChange={(e) => setBizName(e.target.value)}
                                                            className="w-full h-14 px-6 bg-slate-50 border-2 border-border/50 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Bangalore"
                                                                value={bizCity}
                                                                onChange={(e) => setBizCity(e.target.value)}
                                                                className="w-full h-14 px-6 bg-slate-50 border-2 border-border/50 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initial Status</label>
                                                            <div className="h-14 flex items-center px-6 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-2xl border-2 border-emerald-100">
                                                                ACTIVE
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {wizardStep === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-2">
                                                    <h2 className="text-2xl font-black font-heading tracking-tight">Equity & Capital</h2>
                                                    <p className="text-sm text-muted-foreground">Define the share structure and funding requirement.</p>
                                                </div>

                                                <div className="space-y-6 pt-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                            Total Capital Required <Coins className="h-3 w-3 text-primary" />
                                                        </label>
                                                        <div className="relative font-bold">
                                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                            <input
                                                                type="number"
                                                                placeholder="500"
                                                                value={capitalReq || ""}
                                                                onChange={(e) => setCapitalReq(parseFloat(e.target.value) || 0)}
                                                                className="w-full h-16 pl-12 pr-6 bg-slate-50 border-2 border-border/50 rounded-2xl text-xl font-bold focus:border-primary outline-none transition-all placeholder:text-slate-200"
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground font-medium">This is the total fund needed to launch/acquire this branch.</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                            Shares for Sale (%) <Percent className="h-3 w-3 text-primary" />
                                                        </label>
                                                        <div className="relative font-bold">
                                                            <input
                                                                type="number"
                                                                placeholder="40"
                                                                value={sharesForSale || ""}
                                                                onChange={(e) => setSharesForSale(parseFloat(e.target.value) || 0)}
                                                                className="w-full h-16 px-6 bg-slate-50 border-2 border-border/50 rounded-2xl text-xl font-bold focus:border-primary outline-none transition-all placeholder:text-slate-200"
                                                            />
                                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mb-1 font-heading">Valuation Metric</p>
                                                            <p className="text-xs font-bold text-slate-600">Price of 1% Equity Share</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black text-primary">₹{pricePerOnePercent.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {wizardStep === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="space-y-2">
                                                    <h2 className="text-2xl font-black font-heading tracking-tight">Ready to Launch?</h2>
                                                    <p className="text-sm text-muted-foreground">Review the business parameters before committing.</p>
                                                </div>

                                                <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />

                                                    <div className="flex items-center gap-4 border-b border-white/10 pb-6 relative z-10">
                                                        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-lg text-primary">
                                                            {bizName ? bizName[0] : "B"}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold">{bizName || "Unnamed Business"}</h4>
                                                            <p className="text-xs text-slate-400">{bizCity || "Unknown City"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-8 relative z-10">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Total Capital</p>
                                                            <p className="text-xl font-black">₹{capitalReq.toLocaleString()}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Sale Target</p>
                                                            <p className="text-xl font-black">{sharesForSale}% Equity</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Price / 1% Share</p>
                                                            <p className="text-xl font-black text-primary">₹{pricePerOnePercent.toLocaleString()}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Equity Model</p>
                                                            <p className="text-xl font-black">Percentile</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-2xl text-[10px] font-bold text-muted-foreground">
                                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                                    Launch will initiate the ledger for this business and make shares available for mapping.
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="mt-auto pt-10 flex justify-between gap-4">
                                        {wizardStep > 1 ? (
                                            <button
                                                onClick={handleBack}
                                                className="h-14 px-8 bg-muted rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-muted/80 transition-all flex items-center gap-2"
                                            >
                                                <ChevronLeft className="h-4 w-4" /> Back
                                            </button>
                                        ) : (
                                            <div />
                                        )}

                                        {wizardStep < 3 ? (
                                            <button
                                                onClick={handleNext}
                                                disabled={wizardStep === 1 && (!bizName || !bizCity)}
                                                className="h-14 px-10 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all ml-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next Step <ChevronRight className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleLaunch}
                                                disabled={isSubmitting}
                                                className="h-14 px-12 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all ml-auto active:scale-95 disabled:opacity-50"
                                            >
                                                {isSubmitting ? "Launching..." : "Finalize & Launch"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legacy/Config Modal (Already partially implemented) */}
            <AnimatePresence>
                {selectedKitchen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-card w-full max-w-2xl p-8 rounded-[2.5rem] shadow-2xl relative border overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <button
                                onClick={() => setSelectedKitchen(null)}
                                className="absolute top-6 right-6 h-10 w-10 bg-muted rounded-full flex items-center justify-center font-bold text-sm hover:bg-muted/80 transition-all z-10"
                            >
                                ✕
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border shrink-0">
                                    {editLogoUrl ? (
                                        <img src={editLogoUrl} alt="logo" className="h-full w-full object-cover rounded-2xl" />
                                    ) : (
                                        <Building2 className="h-7 w-7" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold font-heading leading-tight">Configure Branch</h2>
                                    <p className="text-sm text-muted-foreground">{selectedKitchen.name} • {selectedKitchen.city}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <section className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business Identity</label>
                                        <div className="space-y-3">
                                            <FormInput label="Name" value={editName} onChange={setEditName} placeholder="Kitchen Name" />
                                            <FormInput label="City" value={editCity} onChange={setEditCity} placeholder="Location" />
                                            <FormInput label="Full Address" value={editAddress} onChange={setEditAddress} placeholder="Official Address" />
                                        </div>
                                    </section>

                                    <section className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Market Branding</label>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight ml-1">Business Logo</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-20 w-20 rounded-2xl bg-slate-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
                                                        {editLogoUrl ? (
                                                            <img src={editLogoUrl.startsWith('http') ? editLogoUrl : `http://45.76.132.8:5000${editLogoUrl}`} alt="Logo Preview" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Upload className="h-6 w-6 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <label className="flex-1">
                                                        <div className="h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all border-slate-200">
                                                            <Upload className="h-5 w-5 text-primary mb-1" />
                                                            <p className="text-[10px] font-bold text-primary">Click to Upload</p>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleImageUpload(file);
                                                                }}
                                                            />
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                            <FormInput label="ROI / Profit Return" value={editRoi} onChange={setEditRoi} placeholder="e.g. 15-20%" />
                                        </div>
                                    </section>
                                </div>

                                <section className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operations Management</label>
                                    <div className="p-5 bg-muted/30 rounded-3xl border space-y-4">
                                        <div>
                                            <p className="text-xs font-bold mb-2">Assign Branch Manager</p>
                                            <select
                                                value={editManagerId}
                                                onChange={(e) => setEditManagerId(e.target.value)}
                                                className="w-full h-12 px-4 bg-white border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="">Unassigned</option>
                                                {users.map(user => (
                                                    <option key={user.id} value={user.id}>{user.name} ({user.mobile})</option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-muted-foreground mt-2">Assigning a user will grant them the BRANCH_MANAGER role for this kitchen.</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Withdrawal Policies</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SelectOption label="Monthly Window" desc="E.g. 5 days" active={false} />
                                        <SelectOption label="Anytime" desc="High liquidity access" active={true} />
                                    </div>
                                </section>
                            </div>

                            <div className="pt-6 border-t mt-4">
                                <button
                                    onClick={handleUpdateHotel}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving Changes..." : "Save Global Configuration"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Stat({ label, val, icon }: { label: string, val: string, icon?: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5">{label}</p>
            <p className="text-sm font-bold flex items-center gap-1.5">
                {icon && <span className="text-primary">{icon}</span>}
                {val}
            </p>
        </div>
    )
}

function ConfigItem({ icon, label, val, sub, active = true }: { icon: React.ReactNode, label: string, val: string, sub: string, active?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border", active ? "bg-white text-primary border-border" : "bg-slate-100 text-slate-400 border-slate-200")}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{label}</p>
                <p className="text-xs font-black leading-tight mt-0.5">{val}</p>
                <p className="text-[9px] font-medium text-slate-500 mt-1">{sub}</p>
            </div>
        </div>
    )
}

function SelectOption({ label, desc, active }: { label: string, desc: string, active: boolean }) {
    return (
        <div className={cn(
            "p-4 rounded-2xl border-2 transition-all cursor-pointer",
            active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-slate-300"
        )}>
            <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-black">{label}</p>
                {active && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
            <p className="text-[9px] font-medium text-muted-foreground leading-tight">{desc}</p>
        </div>
    )
}

function WizardStep({ indicator, label, active, done }: { indicator: string, label: string, active: boolean, done: boolean }) {
    return (
        <div className="flex items-center gap-4">
            <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all",
                done ? "bg-primary border-primary text-primary-foreground" :
                    active ? "border-primary text-primary shadow-lg shadow-primary/20 scale-110" :
                        "border-slate-300 text-slate-300"
            )}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : indicator}
            </div>
            <p className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-all",
                active ? "text-slate-900" : "text-slate-400"
            )}>
                {label}
            </p>
        </div>
    )
}

function FormInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
    return (
        <div className="space-y-1.5 text-left">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight ml-1">{label}</p>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-11 px-4 bg-slate-50 border border-border rounded-xl text-sm font-bold outline-none focus:border-primary transition-all"
            />
        </div>
    );
}
