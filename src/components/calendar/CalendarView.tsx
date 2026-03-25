"use client";
import { useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay,
} from "date-fns";
import { useCalendar } from "@/lib/hooks/useCalendar";
import { useAuth } from "@/lib/hooks/useAuth";
import { EventModal } from "./EventModal";
import { Button } from "@/components/ui/button";
import { cn, EVENT_TYPE_COLORS } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { CalendarEvent, User } from "@/lib/types";

interface CalendarViewProps {
  users: Partial<User>[];
}

const EVENT_DOTS: Record<string, string> = {
  meeting: "bg-indigo-500",
  phone_call: "bg-green-500",
  follow_up: "bg-amber-500",
  demo: "bg-purple-500",
  other: "bg-slate-400",
};

export function CalendarView({ users }: CalendarViewProps) {
  const { authUser } = useAuth();
  const {
    view, setView, currentDate, setCurrentDate, events, loading,
    teamView, setTeamView, navigate, refetch,
  } = useCalendar(authUser?.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const openNew = (date?: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setModalOpen(true);
  };

  // Build month grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.start_at), day));

  const title =
    view === "month"
      ? format(currentDate, "MMMM yyyy")
      : view === "week"
      ? `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`
      : format(currentDate, "EEEE, MMMM d, yyyy");

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold text-slate-900 ml-2">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-md overflow-hidden">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1 text-xs font-medium capitalize transition-colors",
                  view === v ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Team / My toggle */}
          <button
            onClick={() => setTeamView(!teamView)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md border transition-colors",
              teamView ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {teamView ? "Team" : "Mine"}
          </button>

          <Button size="sm" onClick={() => openNew()}>
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        {view === "month" && (
          <div className="h-full flex flex-col">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-slate-500 uppercase">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const inMonth = isSameMonth(day, currentDate);
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "p-1.5 cursor-pointer hover:bg-slate-50 transition-colors group min-h-[80px]",
                      !inMonth && "bg-slate-50/50"
                    )}
                    onClick={() => openNew(day)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                          isToday(day) ? "bg-indigo-600 text-white" : inMonth ? "text-slate-700" : "text-slate-400"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      <Plus className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100" />
                    </div>

                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); openEdit(event); }}
                          className={cn(
                            "w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded text-white truncate",
                            EVENT_DOTS[event.type] || "bg-slate-500"
                          )}
                        >
                          {format(new Date(event.start_at), "h:mm")} {event.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] text-slate-400 px-1">+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week / Day — list view fallback */}
        {(view === "week" || view === "day") && (
          <div className="p-6 space-y-2">
            {loading && <p className="text-sm text-slate-400">Loading…</p>}
            {!loading && events.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm">No events for this period</p>
                <Button className="mt-4" size="sm" onClick={() => openNew()}>
                  <Plus className="h-4 w-4" /> Add Event
                </Button>
              </div>
            )}
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => openEdit(event)}
                className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className={cn("mt-1 h-3 w-3 rounded-full shrink-0", EVENT_DOTS[event.type] || "bg-slate-400")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(event.start_at), "MMM d, h:mm a")} — {format(new Date(event.end_at), "h:mm a")}
                    {event.location && ` · ${event.location}`}
                  </p>
                </div>
                <span className="text-xs text-slate-400 shrink-0 capitalize">{event.type.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Legend */}
      <div className="px-6 py-2 border-t border-slate-200 bg-white flex items-center gap-4">
        {Object.entries(EVENT_DOTS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", color)} />
            <span className="text-xs text-slate-500 capitalize">{type.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <EventModal
          event={selectedEvent}
          defaultDate={selectedDate}
          users={users}
          onClose={() => setModalOpen(false)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
