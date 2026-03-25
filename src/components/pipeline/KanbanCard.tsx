"use client";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import type { Deal } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface KanbanCardProps {
  deal: Deal;
  isDragging: boolean;
  onClick: () => void;
}

export function KanbanCard({ deal, isDragging, onClick }: KanbanCardProps) {
  const ownerName = deal.owner?.full_name;
  const daysInStage = formatDistanceToNow(new Date(deal.updated_at), { addSuffix: false });

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-slate-200 p-3 cursor-pointer select-none transition-all",
        "hover:border-indigo-300 hover:shadow-sm",
        isDragging && "shadow-lg rotate-1 border-indigo-400"
      )}
    >
      {/* Title */}
      <p className="text-sm font-medium text-slate-900 leading-tight line-clamp-2 mb-1">
        {deal.title}
      </p>

      {/* Company */}
      {deal.company_name && (
        <p className="text-xs text-slate-500 mb-1 truncate">{deal.company_name}</p>
      )}

      {/* Value */}
      {deal.value && deal.value > 0 && (
        <p className="text-xs font-semibold text-indigo-600 mb-2">
          {formatCurrency(deal.value, deal.currency)}
        </p>
      )}

      {/* Service */}
      {deal.service && (
        <span className="inline-block text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded mb-2">
          {deal.service}
        </span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-slate-400">{daysInStage} ago</span>
        {ownerName ? (
          <span
            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold"
            title={ownerName}
          >
            {getInitials(ownerName)}
          </span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </div>
    </div>
  );
}
