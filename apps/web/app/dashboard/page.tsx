"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Inbox,
  LayoutTemplate,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  PlusCircle,
  ReceiptText,
  Search,
  Sparkles,
  SquarePen,
  UploadCloud,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Sparkline } from "@/components/sparkline";
import { DashboardAccent } from "@/components/dashboard-accent";
import {
  MiniMonthCalendar,
  dateKey,
  startOfMonth,
} from "@/components/mini-month-calendar";
import { useStore } from "@/lib/store";
import { EVENT_STATUSES, type EventRecord } from "@/lib/types";
import { deriveQuote } from "@/lib/pricing";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Create Event", icon: Plus, href: "/events/new" },
  { label: "Import Packages", icon: Package, href: "/import" },
  { label: "Import Menus", icon: UtensilsCrossed, href: "/import" },
  { label: "Import Templates", icon: LayoutTemplate, href: "/import" },
  { label: "Add-ons", icon: PlusCircle, href: "/addons" },
  { label: "Upload Files", icon: UploadCloud, href: "/import" },
];

/** Deterministic accent dot per event type — same type always renders the same
 * hue, but the set (5 hues) reads as varied rather than uniform. */
const EVENT_TYPE_DOTS = [
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-rose-500",
];

function eventTypeDot(type: string) {
  let hash = 0;
  for (let i = 0; i < type.length; i++)
    hash = (hash * 31 + type.charCodeAt(i)) >>> 0;
  return EVENT_TYPE_DOTS[hash % EVENT_TYPE_DOTS.length];
}

function daysFromToday(iso: string): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Real bucketed monthly counts (last N months, including current) — feeds the
 * stat-card sparklines. Small demo dataset means small numbers; that's honest. */
function monthlyCounts(
  events: EventRecord[],
  monthsBack: number,
  predicate: (e: EventRecord) => boolean,
): number[] {
  const now = new Date();
  return Array.from({ length: monthsBack }, (_, i) => {
    const bucket = new Date(
      now.getFullYear(),
      now.getMonth() - (monthsBack - 1 - i),
      1,
    );
    return events.filter((e) => {
      const d = new Date(e.event.eventDate + "T00:00:00");
      return (
        d.getMonth() === bucket.getMonth() &&
        d.getFullYear() === bucket.getFullYear() &&
        predicate(e)
      );
    }).length;
  });
}

/** % of operations-checklist items completed — null until the checklist has
 * been opened at least once (it's lazily seeded), so we never show a fake bar. */
function checklistProgress(
  record: EventRecord,
): { done: number; total: number; pct: number } | null {
  const ops = record.operations;
  if (!ops) return null;
  const all = [
    ...ops.timeline,
    ...ops.foodPrep,
    ...ops.equipment,
    ...ops.addons,
    ...ops.logistics,
  ];
  if (all.length === 0) return null;
  const done = all.filter((i) => i.done).length;
  return {
    done,
    total: all.length,
    pct: Math.round((done / all.length) * 100),
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { events, ready } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [miniCursor, setMiniCursor] = useState(() => startOfMonth(new Date()));

  const today = new Date();
  const todayKey = dateKey(today);
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const todaysEvents = useMemo(
    () => events.filter((e) => daysFromToday(e.event.eventDate) === 0),
    [events],
  );

  const pendingQuotations = useMemo(
    () => events.filter((e) => e.status === "Quotation Sent"),
    [events],
  );

  const revenueThisWeek = useMemo(
    () =>
      events
        .filter((e) => {
          const d = daysFromToday(e.event.eventDate);
          return d >= 0 && d <= 7 && e.status !== "Draft";
        })
        .reduce((sum, e) => sum + deriveQuote(e).total, 0),
    [events],
  );

  const monthEvents = useMemo(
    () =>
      events.filter((e) => {
        const d = new Date(e.event.eventDate + "T00:00:00");
        return (
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      }),
    [events, today],
  );
  const draftsThisMonth = monthEvents.filter(
    (e) => e.status === "Draft",
  ).length;
  const confirmedThisMonth = monthEvents.filter(
    (e) => e.status === "Confirmed",
  ).length;

  const totalTrend = useMemo(
    () => monthlyCounts(events, 6, () => true),
    [events],
  );
  const draftTrend = useMemo(
    () => monthlyCounts(events, 6, (e) => e.status === "Draft"),
    [events],
  );
  const confirmedTrend = useMemo(
    () => monthlyCounts(events, 6, (e) => e.status === "Confirmed"),
    [events],
  );

  const filtered = useMemo(() => {
    return events
      .filter((e) => (status === "all" ? true : e.status === status))
      .filter(
        (e) =>
          e.eventName.toLowerCase().includes(query.toLowerCase()) ||
          e.client.clientName.toLowerCase().includes(query.toLowerCase()),
      )
      .sort(
        (a, b) =>
          new Date(a.event.eventDate).getTime() -
          new Date(b.event.eventDate).getTime(),
      );
  }, [events, query, status]);

  const featured = todaysEvents[0] ?? filtered[0];
  const upcomingPreview = filtered
    .filter((e) => e.id !== featured?.id)
    .slice(0, 3);
  const scheduleItems =
    todaysEvents.length > 0 ? todaysEvents.slice(0, 3) : filtered.slice(0, 3);

  const dotForDate = (key: string) => {
    const match = events.find((e) => e.event.eventDate === key);
    return match ? eventTypeDot(match.event.eventType) : undefined;
  };

  return (
    <div className="relative isolate -mx-4 -mt-6 px-4 pb-5 pt-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
      {/* Soft top-right corner graphic — sits behind all content */}
      <DashboardAccent className="absolute -top-16 -right-10 -z-10 h-[420px] w-[560px] opacity-70" />
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Left column — greeting, banner, stats, featured event, upcoming */}
        <div className="space-y-5 lg:col-span-2">
          {/* Header — greeting only; Create Event lives in the topbar */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting(today.getHours())}, Gian 👋
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{dateLabel}</p>
          </div>

          {/* Summary banner */}
          <Card className="flex w-fit max-w-full items-center gap-2.5 rounded-xl border-border/70 bg-white/90 px-4 py-2.5 text-sm shadow-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span>
              You have{" "}
              <span className="font-semibold">{pendingQuotations.length}</span>{" "}
              quotation{pendingQuotations.length === 1 ? "" : "s"} waiting,{" "}
              <span className="font-semibold">{todaysEvents.length}</span> event
              {todaysEvents.length === 1 ? "" : "s"} today, and{" "}
              <span className="font-semibold">
                {formatCurrency(revenueThisWeek)}
              </span>{" "}
              expected this week.
            </span>
          </Card>

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Total Events"
              value={ready ? String(monthEvents.length) : "—"}
              caption="This month"
              icon={ReceiptText}
              theme="bg-amber-100 text-amber-600"
              tint="bg-amber-50/70"
              trend={totalTrend}
              trendClass="text-amber-400"
            />
            <StatCard
              label="Drafts"
              value={ready ? String(draftsThisMonth) : "—"}
              caption="This month"
              icon={SquarePen}
              theme="bg-violet-100 text-violet-600"
              tint="bg-violet-50/70"
              trend={draftTrend}
              trendClass="text-violet-400"
            />
            <StatCard
              label="Confirmed"
              value={ready ? String(confirmedThisMonth) : "—"}
              caption="This month"
              icon={Check}
              theme="bg-emerald-100 text-emerald-600"
              tint="bg-emerald-50/70"
              trend={confirmedTrend}
              trendClass="text-emerald-400"
            />
          </div>

          {/* Featured event */}
          {featured ? (
            <FeaturedEventCard
              record={featured}
              isToday={todaysEvents.length > 0}
            />
          ) : (
            <Card className="rounded-2xl">
              <EmptyState
                icon={CalendarDays}
                title="No events yet"
                description="Create your first event to see it here."
                action={{
                  label: "New Event",
                  onClick: () => router.push("/events/new"),
                }}
              />
            </Card>
          )}

          {/* Upcoming events — self-contained card: header, rows, footer link */}
          <Card className="overflow-hidden rounded-2xl shadow-sm">
            <div className="flex flex-col gap-2.5 px-5 pb-2.5 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold tracking-tight">
                Upcoming Events
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search events…"
                    className="h-8 w-full rounded-full pl-8 text-xs sm:w-40"
                  />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-8 w-full rounded-full text-xs sm:w-[124px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {EVENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {upcomingPreview.length > 0 ? (
              <div className="divide-y border-t">
                {upcomingPreview.map((e) => (
                  <UpcomingRow key={e.id} record={e} />
                ))}
              </div>
            ) : (
              <div className="border-t">
                <EmptyState
                  icon={Inbox}
                  title="No events match your filters"
                  className="py-6"
                />
              </div>
            )}

            <Link
              href="/events"
              className="flex items-center gap-1.5 border-t px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent/40"
            >
              View all events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Mini calendar with the day's agenda + link inside one card */}
          <MiniMonthCalendar
            className="rounded-2xl shadow-sm"
            size="lg"
            cursor={miniCursor}
            onPrevMonth={() =>
              setMiniCursor(
                (c) => new Date(c.getFullYear(), c.getMonth() - 1, 1),
              )
            }
            onNextMonth={() =>
              setMiniCursor(
                (c) => new Date(c.getFullYear(), c.getMonth() + 1, 1),
              )
            }
            today={today}
            highlightKeys={new Set([todayKey])}
            dotColor={dotForDate}
            onSelectDate={() => router.push("/events")}
          >
            {scheduleItems.length > 0 && (
              <ul className="-mx-4 mt-3 divide-y border-t">
                {scheduleItems.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/events/view?id=${e.id}`}
                      className="flex items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          eventTypeDot(e.event.eventType),
                        )}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {e.eventName}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {e.event.eventTime || formatDate(e.event.eventDate)}
                          {e.event.venue ? ` · ${e.event.venue}` : ""}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/events"
              className={cn(
                "-mx-4 -mb-4 flex items-center justify-center gap-1.5 border-t px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent/40",
                scheduleItems.length === 0 && "mt-3",
              )}
            >
              View full calendar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </MiniMonthCalendar>

          {/* Quick actions — heading + individual white tiles + imports banner */}
          <div>
            <h2 className="mb-2 text-base font-semibold tracking-tight">
              Quick Actions
            </h2>
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card px-2 py-3 text-center shadow-sm transition-all hover:border-primary/30 hover:shadow"
                  >
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                    <span className="text-[11px] font-medium leading-tight text-foreground/80">
                      {a.label}
                    </span>
                  </Link>
                );
              })}
            </div>
            <Link
              href="/import"
              className="mt-2.5 flex items-center gap-3 rounded-2xl border border-primary/10 bg-accent/70 px-4 py-2.5 transition-colors hover:bg-accent"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  Save time with imports
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  Import menus, packages, and templates
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  theme,
  tint,
  trend,
  trendClass,
}: {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  theme: string;
  tint: string;
  trend: number[];
  trendClass: string;
}) {
  return (
    <Card
      className={cn(
        "flex items-center gap-3 rounded-2xl border-white/60 p-4 shadow-sm",
        tint,
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          theme,
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold tabular-nums leading-tight tracking-tight">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{caption}</div>
      </div>
      <Sparkline data={trend} className={cn("h-7 w-14 self-end", trendClass)} />
    </Card>
  );
}

function FeaturedEventCard({
  record,
  isToday,
}: {
  record: EventRecord;
  isToday: boolean;
}) {
  const progress = checklistProgress(record);

  return (
    <Card className="rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          {isToday ? "Today's Event" : "Next Event"}
        </h2>
        <button
          type="button"
          aria-label="More options"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3">
        <h3 className="text-xl font-semibold tracking-tight">
          {record.eventName}
        </h3>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          {record.event.venue && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              {record.event.venue}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" />
            {isToday
              ? record.event.eventTime || formatDate(record.event.eventDate)
              : `${formatDate(record.event.eventDate)}${
                  record.event.eventTime ? ` · ${record.event.eventTime}` : ""
                }`}
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <StatusBadge status={record.status} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {record.event.pax} pax
          </span>
        </div>

        {progress && (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Progress
              </span>
              <span className="text-xs font-semibold">{progress.pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Client
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-primary ring-2 ring-white">
                {initials(record.client.clientName)}
              </span>
              <span className="truncate text-sm font-medium">
                {record.client.clientName}
              </span>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0 border-primary/25 text-primary hover:bg-accent/50 hover:text-primary"
          >
            <Link href={`/events/view?id=${record.id}`}>
              Open Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function UpcomingRow({ record }: { record: EventRecord }) {
  const d = new Date(record.event.eventDate + "T00:00:00");
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

  return (
    <Link
      href={`/events/view?id=${record.id}`}
      className="flex items-center gap-3.5 px-5 py-2.5 transition-colors hover:bg-muted/50"
    >
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-accent text-primary">
        <span className="text-[10px] font-bold uppercase leading-none tracking-wide">
          {month}
        </span>
        <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{record.eventName}</div>
        <div className="truncate text-xs text-muted-foreground">
          {record.event.eventTime ? `${record.event.eventTime} · ` : ""}
          {record.event.venue || record.client.clientName}
        </div>
      </div>
      <StatusBadge
        status={record.status}
        className="hidden shrink-0 sm:inline-flex"
      />
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
