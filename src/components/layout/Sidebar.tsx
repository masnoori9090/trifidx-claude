"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, TrendingUp, FileText, UserCircle,
  Calendar, Package, BookOpen, BarChart3, UserCheck, Settings,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Sales Pipeline", icon: TrendingUp },
  { href: "/quotations", label: "Quotations", icon: FileText },
  { href: "/clients", label: "My Clients", icon: UserCircle },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/assets", label: "Assets", icon: Package },
  { href: "/training", label: "Training", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/user-approvals", label: "User Approvals", icon: UserCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("flex flex-col bg-zinc-950 transition-all duration-200", collapsed ? "w-14" : "w-56", className)}>
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-zinc-800">
        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shrink-0">
          <span className="text-zinc-900 font-bold text-sm">T</span>
        </div>
        {!collapsed && (
          <span className="ml-3 text-white font-semibold text-sm truncate">Trifid X</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-zinc-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-md hover:bg-zinc-800 text-xs"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 mr-1" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
