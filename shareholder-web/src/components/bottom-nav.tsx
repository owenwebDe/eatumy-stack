"use client";

import { usePathname, useRouter } from "next/navigation";
import { TrendingUp, Building2, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Wallet, label: "Portfolio", path: "/dashboard" },
    { icon: Building2, label: "Kitchens", path: "/dashboard/hotels" },
    { icon: TrendingUp, label: "Shares", path: "/dashboard/invest" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t h-16 flex justify-around items-center z-40 px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-6 w-6", isActive && "fill-current/10")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
