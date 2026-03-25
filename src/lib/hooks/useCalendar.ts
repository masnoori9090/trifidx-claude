"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  startOfDay, endOfDay, addMonths, subMonths,
} from "date-fns";
import type { CalendarEvent } from "@/lib/types";

export type CalendarView = "month" | "week" | "day";

export function useCalendar(userId?: string) {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamView, setTeamView] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let start: Date, end: Date;
      if (view === "month") {
        start = startOfWeek(startOfMonth(currentDate));
        end = endOfWeek(endOfMonth(currentDate));
      } else if (view === "week") {
        start = startOfWeek(currentDate);
        end = endOfWeek(currentDate);
      } else {
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
      }

      let query = supabase
        .from("calendar_events")
        .select("*, assigned_user:users!calendar_events_assigned_to_fkey(id, full_name, avatar_url)")
        .is("deleted_at", null)
        .gte("start_at", start.toISOString())
        .lte("start_at", end.toISOString())
        .order("start_at", { ascending: true });

      if (!teamView && userId) query = query.eq("assigned_to", userId);

      const { data, error } = await query;
      if (!error) setEvents((data as unknown as CalendarEvent[]) || []);
      else setEvents([]);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [view, currentDate, teamView, userId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const navigate = (dir: 1 | -1) => {
    if (view === "month") setCurrentDate((d) => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => new Date(d.getTime() + dir * 7 * 86400000));
    else setCurrentDate((d) => new Date(d.getTime() + dir * 86400000));
  };

  return { view, setView, currentDate, setCurrentDate, events, loading, teamView, setTeamView, navigate, refetch: fetchEvents };
}
