"use client";

import { Search, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";

export function TopBar() {
  return (
    <header className="h-16 sticky top-0 z-40 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden p-2 -ml-2 hover:bg-muted rounded-lg transition-colors">
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search shareholders, kitchens or transactions..."
            className="w-full h-10 pl-10 pr-4 bg-muted/50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="h-8 w-px bg-border mx-1" />

        <button className="flex items-center gap-3 p-1.5 hover:bg-muted rounded-xl transition-all group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none">Admin Station</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Super Admin</p>
          </div>
          <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
            <User className="h-5 w-5 text-primary" />
          </div>
        </button>
      </div>
    </header >
  );
}
