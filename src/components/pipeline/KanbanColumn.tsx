"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { DEAL_STAGE_DOT_COLORS } from "@/lib/utils";

interface KanbanColumnProps {
  stage: string;
  label: string;
  count: number;
  value: number;
  currency?: string;
  children: ReactNode;
}

export function KanbanColumn({ stage, label, count, value, currency = "AED", children }: KanbanColumnProps) {
  const dotColor = DEAL_STAGE_DOT_COLORS[stage] || "bg-slate-400";

  return (
    <div className="flex flex-col flex-shrink-0 w-60 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
      {/* Column header */}
      <div className="px-3 py-2.5 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full shrink-0", dotColor)} />
            <span className="text-xs font-semibold text-slate-700 truncate">{label}</span>
          </div>
          <span className="text-xs font-medium text-slate-400 tabular-nums shrink-0">{count}</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 pl-4">
          {currency} {value.toLocaleString()}
        </p>
      </div>

      {/* Cards area */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {children}
      </div>
    </div>
  );
}
