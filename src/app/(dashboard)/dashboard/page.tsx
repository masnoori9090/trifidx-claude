import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { DashboardData } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const [
    appUserRes,
    dealsRes,
    quotationsRes,
    leadsRes,
    eventsRes,
    todayEventsRes,
    leaderboardRes,
    countryRes,
    pipelineRes,
  ] = await Promise.all([
    uid ? supabase.from("users").select("full_name, email").eq("id", uid).single() : Promise.resolve({ data: null }),
    uid ? supabase.from("deals").select("id, stage, value, currency").is("deleted_at", null).eq("owner_id", uid) : Promise.resolve({ data: [] }),
    uid ? supabase.from("quotations").select("id, status").is("deleted_at", null).eq("created_by", uid) : Promise.resolve({ data: [] }),
    uid ? supabase.from("leads").select("id, status").is("deleted_at", null).eq("owner_id", uid) : Promise.resolve({ data: [] }),
    uid ? supabase.from("calendar_events").select("id, status").is("deleted_at", null).gte("start_at", startOfMonth).eq("assigned_to", uid) : Promise.resolve({ data: [] }),
    uid ? supabase.from("calendar_events").select("id").is("deleted_at", null).gte("start_at", startOfToday).lt("start_at", endOfToday).eq("assigned_to", uid) : Promise.resolve({ data: [] }),
    supabase.from("calendar_events").select("assigned_to, users!calendar_events_assigned_to_fkey(id, full_name)").is("deleted_at", null).gte("start_at", startOfToday),
    supabase.from("leads").select("country").is("deleted_at", null),
    uid ? supabase.from("deals").select("id, title, stage, value, currency").is("deleted_at", null).eq("owner_id", uid).not("stage", "in", '("closed_won","closed_lost")').order("updated_at", { ascending: false }).limit(5) : Promise.resolve({ data: [] }),
  ]);

  const deals = (dealsRes.data || []) as { stage: string; value?: number | null; currency: string }[];
  const quotations = (quotationsRes.data || []) as { status: string }[];
  const leads = (leadsRes.data || []) as { status: string }[];
  const events = (eventsRes.data || []) as { status: string }[];

  const openDeals = deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage));
  const wonDeals = deals.filter((d) => d.stage === "closed_won");
  const revenue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const pipelineTotalVal = openDeals.reduce((s, d) => s + (d.value || 0), 0);

  // Leaderboard
  const lbMap: Record<string, { name: string; count: number }> = {};
  ((leaderboardRes.data || []) as { assigned_to?: string | null; users?: { full_name?: string } | { full_name?: string }[] | null }[]).forEach((e) => {
    if (!e.assigned_to) return;
    const u = Array.isArray(e.users) ? e.users[0] : e.users;
    if (!u) return;
    if (!lbMap[e.assigned_to]) lbMap[e.assigned_to] = { name: u.full_name || "—", count: 0 };
    lbMap[e.assigned_to].count++;
  });
  const leaderboard = Object.entries(lbMap)
    .map(([id, { name, count }]) => ({ id, full_name: name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Country counts
  const countryMap: Record<string, number> = {};
  ((countryRes.data || []) as { country?: string | null }[]).forEach((l) => {
    const key = l.country || "Unknown";
    countryMap[key] = (countryMap[key] || 0) + 1;
  });
  const byCountry = Object.entries(countryMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const appUser = appUserRes.data as { full_name?: string; email?: string } | null;
  const displayName = appUser?.full_name || user?.email?.split("@")[0] || "there";

  const initialData: DashboardData = {
    stats: {
      revenue,
      meetingsThisMonth: events.length,
      meetingsCompleted: events.filter((e) => e.status === "completed").length,
      myLeads: leads.length,
      leadsConverted: leads.filter((l) => l.status === "closed_won").length,
      openDeals: openDeals.length,
      dealsWon: wonDeals.length,
      quotationsSent: quotations.length,
      quotationsApproved: quotations.filter((q) => q.status === "approved").length,
      myClients: 0,
      clientsRenewal: 0,
      meetingsToday: (todayEventsRes.data || []).length,
      meetingsSet: events.length,
    },
    leaderboard,
    byCountry,
    pipelineDeals: (pipelineRes.data || []) as { title: string; stage: string; value: number; currency: string }[],
    pipelineTotal: pipelineTotalVal,
  };

  return (
    <DashboardClient
      initialData={initialData}
      displayName={displayName}
      userId={uid || ""}
    />
  );
}
