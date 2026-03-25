import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
  performer?: { full_name?: string } | { full_name?: string }[] | null;
}

function getPerformerName(performer: ActivityItem["performer"]): string {
  if (!performer) return "System";
  if (Array.isArray(performer)) return performer[0]?.full_name || "System";
  return performer.full_name || "System";
}

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-500",
  updated: "bg-blue-500",
  deleted: "bg-red-500",
  claimed: "bg-indigo-500",
  unclaimed: "bg-slate-400",
  status_changed: "bg-amber-500",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No recent activity.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-1 h-2 w-2 rounded-full shrink-0",
                  ACTION_COLORS[item.action] || "bg-slate-300"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">
                    {getPerformerName(item.performer)}
                  </span>{" "}
                  {item.action.replace(/_/g, " ")}{" "}
                  <span className="text-slate-500">{item.entity_type}</span>
                  {item.new_value && (
                    <span className="text-slate-500">
                      {" "}
                      → <span className="font-medium">{item.new_value}</span>
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
