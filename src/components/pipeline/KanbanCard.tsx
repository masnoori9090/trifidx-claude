"use client";
import { cn, getInitials } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { AlertOctagon, Flame, Snowflake, Thermometer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface KanbanCardProps {
  lead: Lead;
  isDragging: boolean;
  onClick: () => void;
}

const TYPE_ICONS = {
  hot: <Flame className="h-3 w-3 text-red-500" />,
  warm: <Thermometer className="h-3 w-3 text-amber-500" />,
  cold: <Snowflake className="h-3 w-3 text-blue-400" />,
};

export function KanbanCard({ lead, isDragging, onClick }: KanbanCardProps) {
  const contactName =
    [lead.first_name, lead.last_name].filter(Boolean).join(" ") || null;
  const ownerName = lead.owner?.full_name;
  const daysInStage = formatDistanceToNow(new Date(lead.updated_at), {
    addSuffix: false,
  });

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-slate-200 p-3 cursor-pointer select-none transition-all",
        "hover:border-indigo-300 hover:shadow-sm",
        isDragging && "shadow-lg rotate-1 border-indigo-400"
      )}
    >
      {/* Business name */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <p className="text-sm font-medium text-slate-900 leading-tight line-clamp-2">
          {lead.business_name}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {lead.lead_type && TYPE_ICONS[lead.lead_type]}
          {lead.do_not_approach && (
            <AlertOctagon className="h-3 w-3 text-red-500" />
          )}
        </div>
      </div>

      {/* Contact */}
      {contactName && (
        <p className="text-xs text-slate-500 mb-1.5">{contactName}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400">{daysInStage} ago</span>
        {ownerName ? (
          <span
            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold"
            title={ownerName}
          >
            {getInitials(ownerName)}
          </span>
        ) : (
          <span className="text-xs text-slate-300">Unassigned</span>
        )}
      </div>
    </div>
  );
}
