"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/empty-state";
import { STATUS_DOT, statusPillClass } from "@/components/status-badge";
import { MiniMonthCalendar, dateKey, addDays, startOfMonth } from "@/components/mini-month-calendar";
import { useStore } from "@/lib/store";
import { EVENT_STATUSES, type EventRecord, type EventStatus } from "@/lib/types";
import {
  cn,
  formatMinutesAsTime,
  parseTimeToMinutes,
} from "@/lib/utils";

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const START_HOUR = 6;
const END_HOUR = 22;
const ROW_HEIGHT = 56; // px per hour
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const GRID_HEIGHT = (HOURS.length - 1) * ROW_HEIGHT;
/** Events only carry a start time, not a duration — render a fixed-length block. */
const DEFAULT_DURATION_MIN = 120;

function startOfWeek(d: Date): Date {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - s.getDay());
  return s;
}

function minutesToTop(minutes: number): number {
  const clamped = Math.max(START_HOUR * 60, Math.min(END_HOUR * 60, minutes));
  return ((clamped - START_HOUR * 60) / 60) * ROW_HEIGHT;
}

function formatWeekRange(start: Date, end: Date): string {
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${MONTHS[start.getMonth()].slice(0, 3)} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  const fmt = (d: Date) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

export function EventsWeek() {
  const router = useRouter();
  const { events } = useStore();
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [miniCursor, setMiniCursor] = useState(() => startOfMonth(today));
  const [selectedStatuses, setSelectedStatuses] = useState<Set<EventStatus>>(
    () => new Set(EVENT_STATUSES)
  );

  // Keep the mini month-picker following the visible week.
  useEffect(() => {
    setMiniCursor(startOfMonth(weekStart));
  }, [weekStart]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const weekEnd = weekDays[6];
  const weekDateKeys = useMemo(
    () => new Set(weekDays.map((d) => dateKey(d))),
    [weekDays]
  );

  const filteredEvents = useMemo(
    () => events.filter((e) => selectedStatuses.has(e.status)),
    [events, selectedStatuses]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventRecord[]>();
    for (const e of filteredEvents) {
      const arr = map.get(e.event.eventDate) ?? [];
      arr.push(e);
      map.set(e.event.eventDate, arr);
    }
    return map;
  }, [filteredEvents]);

  const eventDateKeys = useMemo(
    () => new Set(filteredEvents.map((e) => e.event.eventDate)),
    [filteredEvents]
  );

  function toggleStatus(status: EventStatus) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function goToDate(d: Date) {
    setWeekStart(startOfWeek(d));
  }

  function openSlot(day: Date, hour: number) {
    const time = formatMinutesAsTime(hour * 60);
    router.push(
      `/events/new?date=${dateKey(day)}&time=${encodeURIComponent(time)}`
    );
  }

  const hasAnyEvents = filteredEvents.length > 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left rail */}
      <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
        <MiniMonthCalendar
          cursor={miniCursor}
          onPrevMonth={() =>
            setMiniCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
          }
          onNextMonth={() =>
            setMiniCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
          }
          today={today}
          highlightKeys={weekDateKeys}
          dotColor={(key) => (eventDateKeys.has(key) ? "bg-current opacity-70" : undefined)}
          onSelectDate={goToDate}
        />

        <Card className="p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Filter by Status
          </div>
          <div className="space-y-2">
            {EVENT_STATUSES.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <Checkbox
                  checked={selectedStatuses.has(s)}
                  onCheckedChange={() => toggleStatus(s)}
                />
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[s])} />
                {s}
              </label>
            ))}
          </div>
        </Card>
      </aside>

      {/* Time grid */}
      <Card className="flex-1 overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setWeekStart((w) => addDays(w, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setWeekStart((w) => addDays(w, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => goToDate(today)}>
              Today
            </Button>
            <h2 className="ml-1 text-base font-semibold">
              {formatWeekRange(weekStart, weekEnd)}
            </h2>
          </div>
        </div>

        {!hasAnyEvents ? (
          <EmptyState
            icon={CalendarClock}
            title="No events match your filters"
            description="Clear a status filter, or click any time slot below to schedule one."
          />
        ) : null}

        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            {/* Day header */}
            <div className="grid grid-cols-[3.5rem_1fr] border-b">
              <div />
              <div className="grid grid-cols-7">
                {weekDays.map((d) => {
                  const isToday = dateKey(d) === dateKey(today);
                  return (
                    <div
                      key={dateKey(d)}
                      className="border-l px-2 py-2 text-center"
                    >
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {WEEKDAYS_SHORT[d.getDay()]}
                      </div>
                      <div
                        className={cn(
                          "mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold",
                          isToday && "bg-primary text-primary-foreground"
                        )}
                      >
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hour rows */}
            <div className="grid grid-cols-[3.5rem_1fr]">
              {/* Hour labels */}
              <div style={{ height: GRID_HEIGHT }} className="relative">
                {HOURS.slice(0, -1).map((h, i) => (
                  <div
                    key={h}
                    className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
                    style={{ top: i * ROW_HEIGHT }}
                  >
                    {formatMinutesAsTime(h * 60)}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              <div className="grid grid-cols-7">
                {weekDays.map((day) => {
                  const dayKey = dateKey(day);
                  const isToday = dayKey === dateKey(today);
                  const dayEvents = (eventsByDay.get(dayKey) ?? [])
                    .map((e) => ({
                      event: e,
                      minutes: parseTimeToMinutes(e.event.eventTime),
                    }))
                    .filter((x) => x.minutes !== null)
                    .sort((a, b) => (a.minutes! - b.minutes!));
                  const lanes = dayEvents.length || 1;
                  const nowMinutes = today.getHours() * 60 + today.getMinutes();
                  const showNowLine =
                    isToday && nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;

                  return (
                    <div
                      key={dayKey}
                      className="relative border-l"
                      style={{ height: GRID_HEIGHT }}
                    >
                      {HOURS.slice(0, -1).map((h, i) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => openSlot(day, h)}
                          className="absolute inset-x-0 border-b transition-colors hover:bg-muted/40"
                          style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
                          aria-label={`New event ${dayKey} ${formatMinutesAsTime(h * 60)}`}
                        />
                      ))}

                      {showNowLine && (
                        <div
                          className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-red-500"
                          style={{ top: minutesToTop(nowMinutes) }}
                        >
                          <span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-red-500" />
                        </div>
                      )}

                      {dayEvents.map(({ event: e, minutes }, i) => {
                        const top = minutesToTop(minutes!);
                        const height = Math.min(
                          GRID_HEIGHT - top,
                          (DEFAULT_DURATION_MIN / 60) * ROW_HEIGHT
                        );
                        const width = 100 / lanes;
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => router.push(`/events/view?id=${e.id}`)}
                            title={`${e.eventName} · ${e.event.eventTime}`}
                            className={cn(
                              "absolute z-[5] overflow-hidden rounded px-1.5 py-1 text-left text-[11px] font-medium leading-tight ring-1 ring-inset transition-opacity hover:opacity-80",
                              statusPillClass(e.status)
                            )}
                            style={{
                              top,
                              height: Math.max(height, 20),
                              left: `${i * width}%`,
                              width: `calc(${width}% - 2px)`,
                            }}
                          >
                            <div className="truncate">{e.eventName}</div>
                            <div className="truncate opacity-80">{e.event.eventTime}</div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
