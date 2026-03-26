"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  DollarSign, Calendar, Users, Briefcase, FileText, Building2,
  Trophy, AlertTriangle, TrendingUp, RefreshCw, Plus, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDayDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric",
  }).format(new Date());
}

type LeaderboardEntry = { id: string; full_name: string; count: number };
type CountryCount = { country: string; count: number };

export default function DashboardPage() {
  const { authUser, appUser } = useAuth();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<"today" | "week" | "month">("today");
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    revenue: 0,
    meetingsThisMonth: 0,
    meetingsCompleted: 0,
    myLeads: 0,
    leadsConverted: 0,
    openDeals: 0,
    dealsWon: 0,
    quotationsSent: 0,
    quotationsApproved: 0,
    myClients: 0,
    clientsRenewal: 0,
    meetingsToday: 0,
    meetingsSet: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [byCountry, setByCountry] = useState<CountryCount[]>([]);
  const [pipelineDeals, setPipelineDeals] = useState<{ title: string; stage: string; value: number; currency: string }[]>([]);
  const [pipelineTotal, setPipelineTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    const supabase = createClient();
    const uid = authUser?.id;
    if (!uid) { setRefreshing(false); return; }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    const [
      dealsRes, quotationsRes, leadsRes, eventsRes, todayEventsRes,
      leaderboardRes, countryRes, pipelineRes,
    ] = await Promise.all([
      supabase.from("deals").select("id, stage, value, currency").is("deleted_at", null).eq("owner_id", uid),
      supabase.from("quotations").select("id, status").is("deleted_at", null).eq("created_by", uid),
      supabase.from("leads").select("id, status").is("deleted_at", null).eq("owner_id", uid),
      supabase.from("calendar_events").select("id, status").is("deleted_at", null).gte("start_at", startOfMonth).eq("assigned_to", uid),
      supabase.from("calendar_events").select("id").is("deleted_at", null).gte("start_at", startOfToday).lt("start_at", endOfToday).eq("assigned_to", uid),
      supabase.from("calendar_events").select("assigned_to, users!calendar_events_assigned_to_fkey(id, full_name)").is("deleted_at", null).gte("start_at", startOfToday),
      supabase.from("leads").select("country").is("deleted_at", null),
      supabase.from("deals").select("id, title, stage, value, currency").is("deleted_at", null).eq("owner_id", uid).not("stage", "in", '("closed_won","closed_lost")').order("updated_at", { ascending: false }).limit(5),
    ]);

    const deals = dealsRes.data || [];
    const quotations = quotationsRes.data || [];
    const leads = leadsRes.data || [];
    const events = eventsRes.data || [];

    const openDeals = deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage));
    const wonDeals = deals.filter((d) => d.stage === "closed_won");
    const revenue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
    const pipelineTotalVal = openDeals.reduce((s, d) => s + (d.value || 0), 0);

    // Leaderboard
    const lbMap: Record<string, { name: string; count: number }> = {};
    (leaderboardRes.data || []).forEach((e) => {
      if (!e.assigned_to) return;
      const user = Array.isArray(e.users) ? e.users[0] : e.users;
      if (!user) return;
      if (!lbMap[e.assigned_to]) lbMap[e.assigned_to] = { name: (user as { full_name?: string }).full_name || "—", count: 0 };
      lbMap[e.assigned_to].count++;
    });
    const lb = Object.entries(lbMap)
      .map(([id, { name, count }]) => ({ id, full_name: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Country counts
    const countryMap: Record<string, number> = {};
    (countryRes.data || []).forEach((l) => {
      const key = (l as { country?: string | null }).country || "Unknown";
      countryMap[key] = (countryMap[key] || 0) + 1;
    });
    const countries = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    setStats({
      revenue,
      meetingsThisMonth: events.length,
      meetingsCompleted: events.filter((e) => (e as { status: string }).status === "completed").length,
      myLeads: leads.length,
      leadsConverted: leads.filter((l) => (l as { status: string }).status === "closed_won").length,
      openDeals: openDeals.length,
      dealsWon: wonDeals.length,
      quotationsSent: quotations.length,
      quotationsApproved: quotations.filter((q) => (q as { status: string }).status === "approved").length,
      myClients: 0,
      clientsRenewal: 0,
      meetingsToday: todayEventsRes.data?.length || 0,
      meetingsSet: events.length,
    });
    setLeaderboard(lb);
    setByCountry(countries);
    setPipelineDeals((pipelineRes.data || []) as { title: string; stage: string; value: number; currency: string }[]);
    setPipelineTotal(pipelineTotalVal);
    setRefreshing(false);
  }, [authUser?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const displayName = appUser?.full_name || authUser?.email?.split("@")[0] || "there";
  const missionProgress = Math.min(stats.meetingsSet, 5);
  const mission10Progress = Math.min(stats.meetingsSet, 10);

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="px-6 py-5 max-w-6xl mx-auto space-y-5">
        {/* Refresh */}
        <div className="flex items-center justify-between">
          <div />
          <Button size="sm" variant="outline" onClick={fetchData} disabled={refreshing} className="h-8 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Dashboard
          </Button>
        </div>

        {/* Rules of the CRM */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setRulesOpen(!rulesOpen)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              Rules of the CRM
            </div>
            {rulesOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          {rulesOpen && (
            <div className="px-5 pb-4 border-t border-slate-100 text-sm text-slate-600 space-y-1.5 pt-3">
              <p>• Log every call, meeting, and follow-up in the CRM immediately</p>
              <p>• Update deal stages after every interaction</p>
              <p>• All leads must have an owner assigned within 24 hours</p>
              <p>• Set at least 5 meetings per day to stay on track</p>
              <p>• Quotations must be approved before being sent to clients</p>
            </div>
          )}
        </div>

        {/* Greeting */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
          <h1 className="text-xl font-bold text-slate-900">
            {getGreeting()}, {displayName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here&apos;s your overview for today — {formatDayDate()}
          </p>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span><strong>{stats.meetingsToday}</strong> meetings today</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              <span><strong>0</strong> leads to follow up</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span><strong>0</strong> deals need attention</span>
            </div>
          </div>
        </div>

        {/* Daily Mission Warning */}
        {stats.meetingsSet < 5 && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-zinc-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-zinc-800">
                  ⚠️ You set {stats.meetingsSet} new meetings today
                </p>
                <p className="text-xs text-zinc-600">Set {5 - stats.meetingsSet} more to complete your daily mission</p>
              </div>
            </div>
            <Link href="/calendar">
              <Button size="sm" className="h-8 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                Calendar
              </Button>
            </Link>
          </div>
        )}
        {stats.meetingsSet >= 5 && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-zinc-700 text-sm">✅ You are on track</span>
          </div>
        )}

        {/* Performance Snapshot */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Performance Snapshot</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                label: "My Revenue This Month",
                value: formatCurrency(stats.revenue, "AED"),
                sub: null,
                icon: DollarSign,
                color: "bg-zinc-500",
              },
              {
                label: "My Meetings This Month",
                value: stats.meetingsThisMonth.toString(),
                sub: `${stats.meetingsCompleted} completed · 0.0/day avg`,
                icon: Calendar,
                color: "bg-zinc-700",
              },
              {
                label: "My Leads",
                value: stats.myLeads.toString(),
                sub: `${stats.leadsConverted} converted this month`,
                icon: Users,
                color: "bg-zinc-600",
              },
              {
                label: "My Deals",
                value: `${stats.openDeals} open`,
                sub: `AED 0 total · ${stats.dealsWon} won`,
                icon: Briefcase,
                color: "bg-zinc-800",
              },
              {
                label: "My Quotations",
                value: `${stats.quotationsSent} sent`,
                sub: `${stats.quotationsApproved} approved · 0% rate`,
                icon: FileText,
                color: "bg-zinc-800",
              },
              {
                label: "My Clients",
                value: stats.myClients.toString(),
                sub: `${stats.clientsRenewal} up for renewal`,
                icon: Building2,
                color: "bg-zinc-700",
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className={`${color} rounded-lg p-2 shrink-0`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500 truncate">{label}</p>
                    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Missions + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily Missions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Daily Missions</h3>
              <span className="text-xs text-slate-400">⏱ {new Date().getHours()}h {new Date().getMinutes()}m</span>
            </div>
            <div className="flex items-center justify-center gap-10">
              {[
                { label: "Set 5 Meetings", goal: 5, progress: missionProgress },
                { label: "Set 10 Meetings", goal: 10, progress: mission10Progress },
              ].map(({ label, goal, progress }) => {
                const pct = Math.min((progress / goal) * 100, 100);
                const r = 30;
                const circ = 2 * Math.PI * r;
                const dashOffset = circ * (1 - pct / 100);
                return (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <circle
                          cx="40" cy="40" r={r} fill="none"
                          stroke={pct >= 100 ? "#22c55e" : "#6366f1"}
                          strokeWidth="8"
                          strokeDasharray={circ}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-base font-bold text-slate-900">{progress}</span>
                        <span className="text-[10px] text-slate-400">/ {goal}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 text-center">{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 bg-zinc-50 rounded-lg py-2 px-3 text-center">
              <p className="text-xs text-zinc-700">
                {stats.meetingsSet >= 5 ? "✅ You are on track" : `⚠️ Set ${5 - stats.meetingsSet} more meetings`}
              </p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-slate-900">Leaderboard</h3>
              </div>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                {(["today", "week", "month"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLeaderboardTab(tab)}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors capitalize ${leaderboardTab === tab ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                  >
                    {tab === "today" ? "Today" : tab === "week" ? "This Week" : "This Month"}
                  </button>
                ))}
              </div>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No meetings recorded yet</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold shrink-0">
                      {entry.full_name[0]?.toUpperCase()}
                    </span>
                    <span className="flex-1 text-sm text-slate-700 truncate">{entry.full_name}</span>
                    <span className="text-sm font-semibold text-slate-900">{entry.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* No meetings today */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
          <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">
            {stats.meetingsToday === 0 ? "No meetings scheduled today" : `${stats.meetingsToday} meeting${stats.meetingsToday > 1 ? "s" : ""} today`}
          </p>
          <p className="text-xs text-slate-400 mt-1">Book a meeting to progress your daily mission 👇</p>
          <Link href="/calendar">
            <Button size="sm" className="mt-3 h-8">
              <Plus className="h-3.5 w-3.5" />
              New Meeting
            </Button>
          </Link>
        </div>

        {/* My Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">My Pipeline</h3>
            <Link href="/pipeline" className="text-xs text-zinc-900 hover:underline flex items-center gap-1">
              View All <TrendingUp className="h-3 w-3" />
            </Link>
          </div>
          {pipelineDeals.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No deals in pipeline</p>
          ) : (
            <div className="space-y-2">
              {pipelineDeals.map((deal) => (
                <div key={deal.title} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <p className="text-sm text-slate-700 truncate flex-1">{deal.title}</p>
                  <span className="text-xs text-zinc-900 font-medium ml-4">
                    {deal.value ? formatCurrency(deal.value, deal.currency) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Total Pipeline Value</span>
            <span className="text-sm font-semibold text-slate-900">{formatCurrency(pipelineTotal, "AED")}</span>
          </div>
        </div>

        {/* New Leads by Country */}
        {byCountry.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">New Leads by Country</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCountry} layout="vertical" margin={{ left: 20, right: 30 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [v, "Leads"]} />
                <Bar dataKey="count" fill="#18181b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
