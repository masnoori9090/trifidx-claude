"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const COLUMN_COLORS: Record<string, string> = {
  new: "border-slate-300 bg-slate-50",
  contacted: "border-blue-200 bg-blue-50/40",
  qualified: "border-cyan-200 bg-cyan-50/40",
  proposal: "border-violet-200 bg-violet-50/40",
  negotiation: "border-amber-200 bg-amber-50/40",
  closed_won: "border-green-200 bg-green-50/40",
  closed_lost: "border-red-200 bg-red-50/40",
};

const HEADER_COLORS: Record<string, string> = {
  new: "text-slate-600 bg-slate-100",
  contacted: "text-blue-700 bg-blue-100",
  qualified: "text-cyan-700 bg-cyan-100",
  proposal: "text-violet-700 bg-violet-100",
  negotiation: "text-amber-700 bg-amber-100",
  closed_won: "text-green-700 bg-green-100",
  closed_lost: "text-red-700 bg-red-100",
};

interface KanbanColumnProps {
  status: string;
  label: string;
  count: number;
  children: ReactNode;
}

export function KanbanColumn({ status, label, count, children }: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col flex-shrink-0 w-64 rounded-xl border overflow-hidden",
        COLUMN_COLORS[status] || "border-slate-200 bg-slate-50"
      )}
    >
      {/* Column header */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
            HEADER_COLORS[status] || "text-slate-600 bg-slate-100"
          )}
        >
          {label}
        </span>
        <span className="text-xs font-medium text-slate-500 tabular-nums">{count}</span>
      </div>

      {/* Cards area */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {children}
      </div>
    </div>
  );
}
