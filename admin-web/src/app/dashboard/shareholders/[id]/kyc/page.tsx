"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Upload,
    Trash2,
    FileText,
    Loader2,
    ImageIcon,
    FileCheck,
    ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function KycManagementPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadType, setUploadType] = useState("ID_PROOF"); // Default type
    const [customType, setCustomType] = useState("");

    const DOCUMENT_TYPES = [
        { value: "ID_PROOF", label: "ID Proof (Aadhar/Passport)" },
        { value: "ADDRESS_PROOF", label: "Address Proof" },
        { value: "PAN_CARD", label: "PAN Card" },
        { value: "SELFIE", label: "Live Selfie" },
        { value: "OTHER", label: "Other Document" }
    ];

    useEffect(() => {
        if (!userId) return;
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [userRes, docsRes] = await Promise.all([
                api.get(`/users/${userId}`), // Requires a GET /users/:id endpoint, or we can just fetch via list
                api.get(`/users/${userId}/kyc-documents`)
            ]);
            // If the backend doesn't have GET /users/:id, this might fail, but let's assume it exists or we use the docs
            setUser(userRes.data);
            setDocuments(docsRes.data);
        } catch (error) {
            console.error("Failed to fetch KYC data", error);
            // Fallback: If user endpoint doesn't exist, just get the docs
            try {
                const docsRes = await api.get(`/users/${userId}/kyc-documents`);
                setDocuments(docsRes.data);
            } catch (e) {
                toast.error("Failed to load documents");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // 1. Upload to storage (/api/upload)
            const formData = new FormData();
            formData.append('image', file);

            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const fileUrl = uploadRes.data.imageUrl;

            // 2. Save document record in DB
            const finalType = uploadType === "OTHER" && customType.trim() !== "" ? customType.trim() : uploadType;
            await api.post(`/users/${userId}/kyc-documents`, {
                type: finalType,
                url: fileUrl
            });

            toast.success("Document uploaded successfully");

            // 3. Refresh list
            const docsRes = await api.get(`/users/${userId}/kyc-documents`);
            setDocuments(docsRes.data);

            // Clear input
            e.target.value = '';

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.error || "Failed to upload document");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            await api.delete(`/users/${userId}/kyc-documents/${docId}`);
            toast.success("Document deleted");
            setDocuments(prev => prev.filter(d => d.id !== docId));
        } catch (error) {
            toast.error("Failed to delete document");
        }
    };

    const getDocLabel = (val: string) => {
        return DOCUMENT_TYPES.find(d => d.value === val)?.label || val;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p>Loading KYC Records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto">
            {/* Header & Back Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="h-10 w-10 bg-card border rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold font-heading tracking-tight flex items-center gap-3">
                        KYC Documents
                    </h1>
                    {user ? (
                        <p className="text-muted-foreground mt-1 text-sm font-medium">
                            Managing compliance files for <span className="font-bold text-foreground">{user.name}</span> ({user.email || user.mobile})
                        </p>
                    ) : (
                        <p className="text-muted-foreground mt-1 text-sm">Upload, verify, and manage compliance files securely.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Upload Section */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card border rounded-[2rem] p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />
                            New Document
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">Document Type</label>
                                <select
                                    className="w-full p-3 bg-muted/50 rounded-xl border outline-none font-bold text-sm mb-2"
                                    value={uploadType}
                                    onChange={(e) => setUploadType(e.target.value)}
                                >
                                    {DOCUMENT_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>

                                {uploadType === "OTHER" && (
                                    <input
                                        type="text"
                                        placeholder="Enter custom document type..."
                                        className="w-full p-3 bg-muted/50 rounded-xl border outline-none font-bold text-sm"
                                        value={customType}
                                        onChange={(e) => setCustomType(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="relative group">
                                <input
                                    type="file"
                                    id="kyc-upload"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                                <label
                                    htmlFor="kyc-upload"
                                    className={cn(
                                        "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl transition-all cursor-pointer",
                                        isUploading
                                            ? "bg-muted border-muted cursor-not-allowed opacity-70"
                                            : "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
                                    )}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                                            <span className="text-sm font-bold text-primary">Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                                                <Upload className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Click to browse files</span>
                                            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">JPG, PNG or PDF (Max 5MB)</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg mb-2">Uploaded Files</h3>

                    {documents.length === 0 ? (
                        <div className="bg-card border border-dashed rounded-[2rem] flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <FileCheck className="h-12 w-12 mb-4 opacity-20" />
                            <p className="font-medium text-sm">No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {documents.map((doc, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={doc.id}
                                    className="bg-card border rounded-3xl overflow-hidden shadow-sm group hover:shadow-md transition-all flex flex-col"
                                >
                                    {/* Document Preview Area */}
                                    <div className="h-48 bg-muted/30 relative flex items-center justify-center overflow-hidden">
                                        {/* Assuming URL handles images properly. If PDF, might need an icon fallback */}
                                        {doc.url.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${doc.url}`}
                                                alt={doc.type}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 opacity-50">
                                                <FileText className="h-12 w-12" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Document File</span>
                                            </div>
                                        )}

                                        {/* Hover Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${doc.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="h-10 px-4 bg-white text-black font-bold text-sm rounded-xl flex items-center hover:scale-105 transition-transform"
                                            >
                                                View Full
                                            </a>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="h-10 w-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Document Meta */}
                                    <div className="p-4 flex items-center justify-between border-t bg-white relative z-10">
                                        <div>
                                            <h4 className="font-bold text-sm">{getDocLabel(doc.type)}</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                                                {format(new Date(doc.uploadedAt), "MMM dd, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
