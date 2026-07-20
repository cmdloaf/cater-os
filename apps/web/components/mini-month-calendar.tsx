"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Compact month grid — today highlighted, an optional highlighted range (e.g.
 * the visible week in the Week view), and an optional colored dot per date.
 * Shared by the Week view's rail and the dashboard's schedule panel.
 */
export function MiniMonthCalendar({
  cursor,
  onPrevMonth,
  onNextMonth,
  today,
  onSelectDate,
  highlightKeys,
  dotColor,
  className,
  children,
  size = "sm",
}: {
  cursor: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  today: Date;
  onSelectDate: (d: Date) => void;
  highlightKeys?: Set<string>;
  dotColor?: (key: string) => string | undefined;
  className?: string;
  /** Optional extra content (agenda, footer link) rendered inside the card. */
  children?: React.ReactNode;
  /** "sm" fits narrow rails (week view); "lg" is the roomier dashboard style. */
  size?: "sm" | "lg";
}) {
  const lg = size === "lg";
  const cells = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = addDays(firstOfMonth, -firstOfMonth.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const todayKey = dateKey(today);

  return (
    <Card className={cn("p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className={cn("font-semibold tracking-tight", lg ? "text-lg" : "text-[15px]")}>
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div
        className={cn(
          "grid grid-cols-7 text-center text-muted-foreground",
          lg ? "text-xs" : "text-[11px]"
        )}
      >
        {WEEKDAYS_SHORT.map((w) => (
          <div key={w} className={lg ? "py-1.5" : "py-1"}>
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          const key = dateKey(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const isHighlighted = highlightKeys?.has(key) ?? false;
          const isToday = key === todayKey;
          const dot = dotColor?.(key);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(d)}
              className="group mx-auto flex flex-col items-center"
            >
              {/* Number circle; the event dot sits below it, with space always
                  reserved so rows stay aligned whether or not a dot exists. */}
              <span
                className={cn(
                  "flex items-center justify-center rounded-full transition-colors",
                  lg ? "h-9 w-9 text-[13px]" : "h-8 w-8 text-xs",
                  isHighlighted && !isToday && "bg-accent",
                  isToday && "bg-primary font-semibold text-primary-foreground",
                  !inMonth && !isToday && "text-muted-foreground/40",
                  inMonth && !isHighlighted && !isToday && "group-hover:bg-muted"
                )}
              >
                {d.getDate()}
              </span>
              <span
                className={cn(
                  "rounded-full",
                  lg ? "h-1.5 w-1.5" : "h-1 w-1",
                  dot ? dot : "opacity-0"
                )}
              />
            </button>
          );
        })}
      </div>
      {children}
    </Card>
  );
}
