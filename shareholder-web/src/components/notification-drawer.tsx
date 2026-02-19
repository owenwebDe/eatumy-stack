import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export function NotificationDrawer({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const markRead = async (id: string) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, isRead: true }) : n));
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'WELCOME': return "👋";
            case 'DEPOSIT_APPROVED': return "💰";
            case 'WITHDRAWAL_APPROVED': return "💸";
            case 'DEPOSIT_REJECTED': return "❌";
            case 'WITHDRAWAL_REJECTED': return "❌";
            default: return "🔔";
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[85vh] flex flex-col rounded-t-[2rem]">
                <DrawerHeader className="text-left border-b pb-4">
                    <div className="flex justify-between items-center">
                        <DrawerTitle className="text-2xl font-black font-heading flex items-center gap-2">
                            Notifications
                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">
                                {notifications.filter(n => !n.isRead).length > 0 ? `${notifications.filter(n => !n.isRead).length} New` : ""}
                            </span>
                        </DrawerTitle>
                        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs font-bold text-muted-foreground hover:text-primary">
                            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
                        </Button>
                    </div>
                </DrawerHeader>
                
                <ScrollArea className="flex-1 p-4">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-10 space-y-3">
                            <div className="mx-auto h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                                <Bell className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-bold text-muted-foreground">No updates yet</h3>
                            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">We'll notify you when there are updates to your account.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    onClick={() => !n.isRead && markRead(n.id)}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all active:scale-98 cursor-pointer relative overflow-hidden",
                                        n.isRead ? "bg-background border-border opacity-70" : "bg-card border-primary/20 shadow-sm shadow-primary/5"
                                    )}
                                >
                                    {!n.isRead && (
                                        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 bg-muted/50 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="space-y-1 pr-4">
                                            <h4 className={cn("text-sm font-bold leading-none", !n.isRead && "text-primary")}>
                                                {n.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400 pt-1">
                                                {formatTimeAgo(n.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DrawerContent>
        </Drawer>
    );
}
