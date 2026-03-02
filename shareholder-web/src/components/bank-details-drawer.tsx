"use client";

import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CreditCard, Loader2, CheckCircle2, Building2, Hash, Landmark, Smartphone } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export function BankDetailsDrawer({
    open,
    onOpenChange,
    onSuccess,
    existingBank
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    existingBank?: any;
}) {
    const [formData, setFormData] = useState({
        accountName: "",
        accountNumber: "",
        bankName: "",
        ifsc: "",
        upiId: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (existingBank) {
            setFormData({
                accountName: existingBank.accountName || "",
                accountNumber: existingBank.accountNumber || "",
                bankName: existingBank.bankName || "",
                ifsc: existingBank.ifsc || "",
                upiId: existingBank.upiId || ""
            });
        } else {
            setFormData({
                accountName: "",
                accountNumber: "",
                bankName: "",
                ifsc: "",
                upiId: ""
            });
        }
    }, [existingBank, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/banks', formData);
            setIsSuccess(true);
            toast.success("Bank details submitted for verification");
            if (onSuccess) onSuccess();
            setTimeout(() => {
                setIsSuccess(false);
                onOpenChange(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to save bank details", error);
            toast.error("Failed to save details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Drawer.Content className="bg-background flex flex-col rounded-t-[2rem] h-[92vh] mt-24 fixed bottom-0 left-0 right-0 z-50 focus:outline-none border-t">
                    <div className="p-4 bg-background rounded-t-[2rem] flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />

                        <div className="max-w-md mx-auto h-full flex flex-col">
                            {!isSuccess ? (
                                <>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <Drawer.Title className="font-heading font-bold text-2xl">Bank Details</Drawer.Title>
                                            <Drawer.Description className="text-muted-foreground text-xs font-medium">
                                                Add your payout account for dividends
                                            </Drawer.Description>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 mt-4">
                                        <p className="text-[11px] text-amber-800 font-bold uppercase tracking-wider mb-1">Verification Policy</p>
                                        <p className="text-[11px] text-amber-600 leading-relaxed font-medium">
                                            Your bank details will be verified by our administrative team before you can request withdrawals. This usually takes 2-4 hours during business days.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                                        <InputField
                                            icon={Landmark}
                                            label="Bank Name"
                                            placeholder="e.g. HDFC Bank"
                                            value={formData.bankName}
                                            onChange={(val) => setFormData({ ...formData, bankName: val })}
                                        />
                                        <InputField
                                            icon={Building2}
                                            label="Account Holder Name"
                                            placeholder="Name as per Passbook"
                                            value={formData.accountName}
                                            onChange={(val) => setFormData({ ...formData, accountName: val })}
                                        />
                                        <InputField
                                            icon={Hash}
                                            label="Account Number"
                                            placeholder="Valid Bank Account No."
                                            value={formData.accountNumber}
                                            onChange={(val) => setFormData({ ...formData, accountNumber: val })}
                                        />
                                        <InputField
                                            icon={Hash}
                                            label="IFSC Code"
                                            placeholder="11 Character Code"
                                            value={formData.ifsc}
                                            onChange={(val) => setFormData({ ...formData, ifsc: val.toUpperCase() })}
                                        />
                                        <InputField
                                            icon={Smartphone}
                                            label="UPI ID (Optional)"
                                            placeholder="e.g. name@bank"
                                            value={formData.upiId}
                                            onChange={(val) => setFormData({ ...formData, upiId: val })}
                                        />

                                        <div className="pt-6">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full text-sm h-14 font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                                disabled={!formData.bankName || !formData.accountNumber || !formData.ifsc || isLoading}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                ) : (
                                                    "Submit for Verification"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                                    <div className="h-24 w-24 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-2 animate-in zoom-in duration-500">
                                        <CheckCircle2 className="h-12 w-12" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black font-heading tracking-tight mb-2">Submitted!</h2>
                                        <p className="text-muted-foreground text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                                            Your bank details are now being verified. You'll be notified once approved.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

function InputField({ icon: Icon, label, placeholder, value, onChange, type = "text" }: {
    icon: any;
    label: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    type?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Icon className="h-4 w-4" />
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-12 bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl pl-11 pr-4 text-sm font-bold outline-none transition-all placeholder:font-medium placeholder:text-muted-foreground/50"
                />
            </div>
        </div>
    );
}
