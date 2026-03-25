import { cn, formatCurrency } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  change?: string;
  changeDir?: "up" | "down" | "neutral";
}

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg, change, changeDir }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <div className={cn("rounded-lg p-2", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs mt-1",
                changeDir === "up" && "text-green-600",
                changeDir === "down" && "text-red-600",
                changeDir === "neutral" && "text-slate-400"
              )}
            >
              {change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
