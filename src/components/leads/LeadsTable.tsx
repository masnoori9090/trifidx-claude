"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, LEAD_SOURCE_COLORS, LEAD_SOURCE_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { Flame, Trash2 } from "lucide-react";

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  onRowClick: (lead: Lead) => void;
}

export function LeadsTable({ leads, loading, onRowClick }: LeadsTableProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <p className="text-sm font-medium">No leads found</p>
        <p className="text-xs mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-white z-10 border-b border-slate-200">
        <tr>
          <th className="px-4 py-2.5 w-8">
            <input type="checkbox" className="rounded border-slate-300" />
          </th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Lead / Business Name</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-28">Source</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-28">Industry</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-24">Status</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-44">Assigned To</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-28">Country</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-20"></th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-20">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {leads.map((lead) => (
          <LeadRow key={lead.id} lead={lead} onClick={() => onRowClick(lead)} />
        ))}
      </tbody>
    </table>
  );
}

function LeadRow({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const displayName = lead.instagram_handle
    ? `${lead.business_name} // @${lead.instagram_handle.replace(/^@/, "")}`
    : lead.business_name;

  const ownerEmail = lead.owner?.email || "—";
  const isClaimed = !!lead.claimed_at;

  return (
    <tr
      onClick={onClick}
      className="hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <td className="px-4 py-3 w-8" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" className="rounded border-slate-300" />
      </td>
      <td className="px-4 py-3 font-medium text-slate-900 max-w-0 min-w-[200px]">
        <div className="flex items-center gap-1.5">
          {lead.do_not_approach && (
            <span title="Do Not Approach" className="text-red-500 text-xs">⚠</span>
          )}
          <span className="truncate text-sm">
            {displayName}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 w-28">
        <span className={cn(
          "text-xs px-2 py-0.5 rounded font-medium",
          LEAD_SOURCE_COLORS[lead.lead_source] || "bg-slate-100 text-slate-600"
        )}>
          {LEAD_SOURCE_LABELS[lead.lead_source] || lead.lead_source}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-500 text-sm w-28 truncate">
        {lead.industry || "Other"}
      </td>
      <td className="px-4 py-3 w-24">
        <span className={cn(
          "text-xs px-2 py-0.5 rounded font-medium",
          LEAD_STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-600"
        )}>
          {LEAD_STATUS_LABELS[lead.status] || lead.status}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs w-44 truncate">
        {ownerEmail}
      </td>
      <td className="px-4 py-3 text-slate-500 text-sm w-28">
        {lead.country || "—"}
      </td>
      <td className="px-4 py-3 w-20">
        {isClaimed && (
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
            Claimed
          </span>
        )}
      </td>
      <td className="px-4 py-3 w-20" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="text-orange-400 hover:text-orange-600 transition-colors"
            title="Flag lead"
          >
            <Flame className="h-4 w-4" />
          </button>
          <button
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Delete lead"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
