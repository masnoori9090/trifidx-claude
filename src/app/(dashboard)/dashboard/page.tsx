import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";

type LeadRow = { id: string; status: string; lead_source: string; country: string | null; created_at: string };
type DealRow = { id: string; stage: string; value: number | null };
type EventRow = { id: string; title: string; type: string; start_at: string };
type ActivityRow = {
  id: string; action: string; entity_type: string;
  old_value: string | null; new_value: string | null; created_at: string;
  performer: { full_name: string } | { full_name: string }[] | null;
};

async function getDashboardData() {
  const supabase = await createClient();

  const [leadsRes, dealsRes, eventsRes, activityRes] = await Promise.all([
    supabase.from("leads").select("id, status, lead_source, country, created_at").is("deleted_at", null),
    supabase.from("deals").select("id, stage, value").is("deleted_at", null),
    supabase
      .from("calendar_events")
      .select("id, title, type, start_at")
      .is("deleted_at", null)
      .gte("start_at", new Date().toISOString())
      .lte("start_at", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("start_at", { ascending: true })
      .limit(8),
    supabase
      .from("activity_log")
      .select("id, action, entity_type, old_value, new_value, created_at, performer:users!activity_log_performed_by_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const leads = (leadsRes.data || []) as LeadRow[];
  const deals = (dealsRes.data || []) as DealRow[];
  const events = (eventsRes.data || []) as EventRow[];
  const activity = (activityRes.data || []) as unknown as ActivityRow[];

  // Aggregate
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = leads.filter((l) => new Date(l.created_at) > oneWeekAgo).length;
  const wonLeads = leads.filter((l) => l.status === "closed_won").length;
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;
  const pipelineValue = deals
    .filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
    .reduce((sum, d) => sum + (d.value || 0), 0);

  // Group by source
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => { sourceCounts[l.lead_source] = (sourceCounts[l.lead_source] || 0) + 1; });
  const bySource = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Group by status
  const statusCounts: Record<string, number> = {};
  leads.forEach((l) => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });
  const byStatus = Object.entries(statusCounts)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  // Group by country
  const countryCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const key = l.country || "Unknown";
    countryCounts[key] = (countryCounts[key] || 0) + 1;
  });
  const byCountry = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalLeads: leads.length,
    newThisWeek,
    conversionRate,
    pipelineValue,
    bySource,
    byStatus,
    byCountry,
    upcomingEvents: events,
    activity,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: data.totalLeads.toLocaleString(), Icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "New This Week", value: data.newThisWeek.toLocaleString(), Icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            { label: "Conversion Rate", value: `${data.conversionRate}%`, Icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Pipeline Value", value: formatCurrency(data.pipelineValue, "AED"), Icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">{label}</span>
                <div className={`${bg} rounded-lg p-2`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <PipelineChart
          bySource={data.bySource}
          byStatus={data.byStatus}
          byCountry={data.byCountry}
        />

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Upcoming meetings */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Upcoming (7 days)
              </h3>
              <Link href="/calendar" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
            {data.upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming meetings.</p>
            ) : (
              <div className="space-y-2">
                {data.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{event.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{event.type.replace(/_/g, " ")}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 ml-2">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      }).format(new Date(event.start_at))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <ActivityFeed items={data.activity} />
        </div>
      </div>
    </>
  );
}
