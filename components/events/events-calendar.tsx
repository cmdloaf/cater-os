"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, statusPillClass } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { EVENT_STATUSES } from "@/lib/types";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Local YYYY-MM-DD key — matches how `event.eventDate` is stored. */
function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EventsCalendar() {
  const router = useRouter();
  const { events } = useStore();

  const today = new Date();
  const todayKey = dateKey(today);

  // Seed the visible month to the soonest upcoming event, else today.
  const [cursor, setCursor] = useState(() => {
    const upcoming = [...events]
      .filter((e) => e.event.eventDate >= todayKey)
      .sort((a, b) => a.event.eventDate.localeCompare(b.event.eventDate))[0];
    const base = upcoming
      ? new Date(upcoming.event.eventDate + "T00:00:00")
      : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventRecord[]>();
    for (const e of events) {
      const arr = map.get(e.event.eventDate) ?? [];
      arr.push(e);
      map.set(e.event.eventDate, arr);
    }
    return map;
  }, [events]);

  // Build a 6×7 grid of dates starting from the Sunday on/before the 1st.
  const cells = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(firstOfMonth);
    start.setDate(1 - firstOfMonth.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  function shiftMonth(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }
  function goToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => shiftMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <h2 className="ml-1 text-base font-semibold">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </h2>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2">
          {EVENT_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const key = dateKey(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const isToday = key === todayKey;
          const dayEvents = eventsByDay.get(key) ?? [];
          const shown = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - shown.length;
          return (
            <div
              key={i}
              className={cn(
                "min-h-[104px] border-b border-r p-1.5 [&:nth-child(7n)]:border-r-0",
                !inMonth && "bg-muted/20"
              )}
            >
              <div className="mb-1 flex justify-end">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday
                      ? "bg-primary font-semibold text-primary-foreground"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                  )}
                >
                  {d.getDate()}
                </span>
              </div>
              <div className="space-y-1">
                {shown.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => router.push(`/events/view?id=${e.id}`)}
                    title={`${e.eventName} · ${e.client.clientName}`}
                    className={cn(
                      "flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-xs font-medium ring-1 ring-inset transition-opacity hover:opacity-80",
                      statusPillClass(e.status)
                    )}
                  >
                    <span className="truncate">{e.eventName}</span>
                  </button>
                ))}
                {overflow > 0 && (
                  <button
                    onClick={() =>
                      router.push(`/events/view?id=${dayEvents[0].id}`)
                    }
                    className="px-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    +{overflow} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
