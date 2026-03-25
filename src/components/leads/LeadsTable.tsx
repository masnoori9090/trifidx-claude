"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getInitials, LEAD_SOURCE_LABELS } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertOctagon } from "lucide-react";

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  onRowClick: (lead: Lead) => void;
}

const COLUMNS = [
  { key: "business_name", label: "Business", width: "w-48" },
  { key: "contact", label: "Contact", width: "w-36" },
  { key: "email", label: "Email", width: "w-44" },
  { key: "lead_source", label: "Source", width: "w-28" },
  { key: "country", label: "Country", width: "w-28" },
  { key: "status", label: "Status", width: "w-28" },
  { key: "owner", label: "Assigned To", width: "w-36" },
  { key: "actions", label: "", width: "w-10" },
];

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
      <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
        <tr>
          {COLUMNS.map((col) => (
            <th
              key={col.key}
              className={cn(
                "px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide",
                col.width
              )}
            >
              {col.label}
            </th>
          ))}
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

function LeadRow({
  lead,
  onClick,
}: {
  lead: Lead;
  onClick: () => void;
}) {
  const contactName = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "—";
  const ownerName = lead.owner?.full_name || "Unassigned";

  return (
    <tr
      onClick={onClick}
      className="hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <td className="px-4 py-3 font-medium text-slate-900 max-w-0 w-48">
        <div className="flex items-center gap-1.5 truncate">
          {lead.do_not_approach && (
            <span title="Do Not Approach"><AlertOctagon className="h-3.5 w-3.5 text-red-500 shrink-0" /></span>
          )}
          <span className="truncate">{lead.business_name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600 truncate max-w-0 w-36">
        {contactName}
      </td>
      <td className="px-4 py-3 text-slate-500 truncate max-w-0 w-44">
        {lead.email || "—"}
      </td>
      <td className="px-4 py-3 text-slate-500 w-28">
        {LEAD_SOURCE_LABELS[lead.lead_source] || lead.lead_source}
      </td>
      <td className="px-4 py-3 text-slate-500 w-28">{lead.country || "—"}</td>
      <td className="px-4 py-3 w-28">
        <StatusBadge status={lead.status} />
      </td>
      <td className="px-4 py-3 w-36">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium shrink-0">
            {lead.owner ? getInitials(ownerName) : "—"}
          </span>
          <span className="text-xs text-slate-600 truncate">{ownerName}</span>
        </div>
      </td>
      <td className="px-4 py-3 w-10" />
    </tr>
  );
}
