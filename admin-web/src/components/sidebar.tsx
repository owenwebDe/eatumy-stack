"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  IndianRupee,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  ClipboardList,
  Briefcase,
  BarChart3,
  UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building2, label: "Kitchens", path: "/dashboard/kitchens" },
  { icon: ClipboardList, label: "Daily Orders", path: "/dashboard/orders" },
  { icon: Users, label: "Shareholders", path: "/dashboard/shareholders" },
  { icon: UserCog, label: "Branch Managers", path: "/dashboard/branch-managers" },
  { icon: Briefcase, label: "Investment Requests", path: "/dashboard/investments" },
  { icon: IndianRupee, label: "Financials", path: "/dashboard/finance" },
  { icon: ShieldCheck, label: "KYC Verification", path: "/dashboard/kyc" },
  { icon: BarChart3, label: "Reports", path: "/dashboard/reports" },
  { icon: History, label: "Audit Logs", path: "/dashboard/logs" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-screen sticky top-0 sidebar-gradient text-white flex flex-col transition-all duration-300 border-r border-white/10",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="p-6">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-bold tracking-tight text-lg leading-tight uppercase">Eatumy</span>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Admin Panel</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-white/60 group-hover:text-white")} />
              {!isCollapsed && (
                <span className="font-medium text-sm tracking-tight">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/dashboard/settings"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
            pathname === "/dashboard/settings"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Settings</span>}
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all">
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full mt-4 flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
