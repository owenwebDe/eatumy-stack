"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    ShieldAlert,
    UserPlus,
    Trash2,
    Loader2,
    Settings,
    User,
    Mail,
    Phone,
    UserCog,
    Edit3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("admins");

    // Add Admin State
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        role: "ADMIN"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Admin State
    const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        role: "ADMIN"
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const [profileRes, adminsRes] = await Promise.all([
                    api.get('/users/profile'),
                    api.get('/users/admins')
                ]);
                setCurrentUser(profileRes.data);
                setAdmins(adminsRes.data);
            } catch (error) {
                console.error("Failed to load settings data", error);
                toast.error("Failed to load settings data");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/users', formData);
            toast.success("Administrator created successfully");
            setIsAddAdminOpen(false);
            setFormData({ name: "", email: "", mobile: "", role: "ADMIN" });

            // Refresh list
            const { data } = await api.get('/users/admins');
            setAdmins(data);
        } catch (error: any) {
            console.error("Add Admin Error:", error);
            toast.error(error.response?.data?.error || "Failed to create administrator");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        setIsEditing(true);
        try {
            await api.put(`/users/${selectedAdmin.id}`, editFormData);
            toast.success("Administrator updated successfully");
            setIsEditAdminOpen(false);

            // Refresh list
            const { data } = await api.get('/users/admins');
            setAdmins(data);
        } catch (error: any) {
            console.error("Edit Admin Error:", error);
            toast.error(error.response?.data?.error || "Failed to update administrator");
        } finally {
            setIsEditing(false);
        }
    };

    const openEditModal = (admin: any) => {
        setSelectedAdmin(admin);
        setEditFormData({
            name: admin.name,
            email: admin.email,
            mobile: admin.mobile,
            role: admin.role
        });
        setIsEditAdminOpen(true);
    };

    const handleDeleteAdmin = async (adminId: string, adminName: string) => {
        if (adminId === currentUser?.id) {
            toast.error("You cannot delete your own account");
            return;
        }

        const confirm = window.confirm(`Are you sure you want to remove ${adminName}? They will lose all access.`);
        if (!confirm) return;

        try {
            await api.delete(`/users/${adminId}`);
            toast.success("Administrator removed successfully");
            setAdmins(prev => prev.filter(a => a.id !== adminId));
        } catch (error: any) {
            console.error("Delete Admin Error:", error);
            toast.error(error.response?.data?.error || "Failed to remove administrator");
        }
    };

    const isSuperAdmin = currentUser?.role === 'SUPERADMIN';

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p className="text-sm font-medium">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold font-heading tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage system configurations and personnel.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("admins")}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                        activeTab === "admins" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Team Management
                </button>
                <button
                    onClick={() => setActiveTab("global")}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all opacity-50 cursor-not-allowed",
                        activeTab === "global" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
                    )}
                >
                    System Config
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "admins" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-xl font-bold">Administrators</h3>
                                <p className="text-sm text-muted-foreground">Manage accounts with access to this panel.</p>
                            </div>

                            <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-11 px-6 rounded-xl font-bold gap-2">
                                        <UserPlus className="h-4 w-4" /> Add Administrator
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add New Administrator</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddAdmin} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full h-12 px-4 bg-muted/50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full h-12 px-4 bg-muted/50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="john@eatumy.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mobile Number</label>
                                            <input
                                                required
                                                type="tel"
                                                className="w-full h-12 px-4 bg-muted/50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                placeholder="+91..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Security Role</label>
                                            <select
                                                className="w-full h-12 px-4 bg-muted/50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                <option value="ADMIN">Manager (Standard Admin)</option>
                                                <option value="SUPERADMIN">Super Administrator (Full Rights)</option>
                                            </select>
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold">
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Administrator Account"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {admins.map((admin) => (
                                <motion.div
                                    key={admin.id}
                                    layout
                                    className="bg-card border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />

                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-slate-900/10">
                                            {admin.name?.[0] || 'A'}
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            admin.role === 'SUPERADMIN' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}>
                                            {admin.role === 'SUPERADMIN' ? <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Super Admin</span> : <span className="flex items-center gap-1.5"><ShieldAlert className="h-3 w-3" /> Manager</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative z-10">
                                        <div>
                                            <h4 className="font-bold text-lg leading-tight">{admin.name}</h4>
                                            <div className="flex flex-col gap-1 mt-2">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                    <Mail className="h-3 w-3" /> {admin.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                    <Phone className="h-3 w-3" /> {admin.mobile}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added On</span>
                                                <span className="text-xs font-bold">{new Date(admin.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {isSuperAdmin && admin.id !== currentUser.id && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(admin)}
                                                        className="h-9 w-9 bg-primary/5 text-primary rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors"
                                                        title="Edit Administrator"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                                                        className="h-9 w-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                                                        title="Delete Administrator"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Edit Admin Modal */}
                        <Dialog open={isEditAdminOpen} onOpenChange={setIsEditAdminOpen}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Edit Administrator Details</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleEditAdmin} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full h-12 px-4 bg-muted/50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full h-12 px-4 bg-muted/50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={editFormData.email}
                                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mobile Number</label>
                                        <input
                                            required
                                            type="tel"
                                            className="w-full h-12 px-4 bg-muted/50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={editFormData.mobile}
                                            onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Security Role</label>
                                        <select
                                            className="w-full h-12 px-4 bg-muted/50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={editFormData.role}
                                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                        >
                                            <option value="ADMIN">Manager (Standard Admin)</option>
                                            <option value="SUPERADMIN">Super Administrator (Full Rights)</option>
                                        </select>
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button type="submit" disabled={isEditing} className="w-full h-12 rounded-xl font-bold">
                                            {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
