"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getInitials, DEAL_STAGE_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Deal } from "@/lib/types";

const STAGE_COLORS: Record<string, string> = {
  discovery: "bg-slate-100 text-slate-700",
  proposal: "bg-violet-100 text-violet-700",
  negotiation: "bg-amber-100 text-amber-700",
  contract: "bg-blue-100 text-blue-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
};

interface DealsTableProps {
  deals: Deal[];
  loading: boolean;
  onRowClick: (deal: Deal) => void;
}

export function DealsTable({ deals, loading, onRowClick }: DealsTableProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <p className="text-sm">No deals found</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
        <tr>
          {["Title", "Company", "Stage", "Value", "Prob.", "Close Date", "Owner"].map((col) => (
            <th key={col} className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {deals.map((deal) => (
          <tr
            key={deal.id}
            onClick={() => onRowClick(deal)}
            className="hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
              {deal.title}
            </td>
            <td className="px-4 py-3 text-slate-500 max-w-[140px] truncate">
              {deal.company?.name || "—"}
            </td>
            <td className="px-4 py-3">
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                STAGE_COLORS[deal.stage] || "bg-slate-100 text-slate-700"
              )}>
                {DEAL_STAGE_LABELS[deal.stage] || deal.stage}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-700 tabular-nums">
              {formatCurrency(deal.value, deal.currency)}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 max-w-[60px] bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${deal.probability}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 tabular-nums">{deal.probability}%</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-500">{formatDate(deal.expected_close_date)}</td>
            <td className="px-4 py-3">
              {deal.owner ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                    {getInitials(deal.owner.full_name)}
                  </span>
                  <span className="text-xs text-slate-600 truncate max-w-[80px]">{deal.owner.full_name}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Unassigned</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
