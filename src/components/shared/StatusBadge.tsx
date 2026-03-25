import { cn } from "@/lib/utils";
import { LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = LEAD_STATUS_COLORS[status] || "bg-slate-100 text-slate-700";
  const label = LEAD_STATUS_LABELS[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
