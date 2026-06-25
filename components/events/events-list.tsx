"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CalendarDays, Users, MapPin, Pencil, ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { eventTotal } from "@/lib/documents";
import type { EventRecord } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EventsList() {
  const { events, ready } = useStore();
  const todayKey = dateKey(new Date());

  const { upcoming, past } = useMemo(() => {
    const upcoming = events
      .filter((e) => e.event.eventDate >= todayKey)
      .sort((a, b) => a.event.eventDate.localeCompare(b.event.eventDate));
    const past = events
      .filter((e) => e.event.eventDate < todayKey)
      .sort((a, b) => b.event.eventDate.localeCompare(a.event.eventDate));
    return { upcoming, past };
  }, [events, todayKey]);

  if (!ready) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Loading events…
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-12 text-center text-sm text-muted-foreground">
        No events yet.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Group label="Upcoming" events={upcoming} />
      <Group label="Past" events={past} />
    </div>
  );
}

function Group({ label, events }: { label: string; events: EventRecord[] }) {
  if (events.length === 0) return null;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-1">
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="text-xs text-muted-foreground">{events.length}</span>
      </div>
      <Card className="divide-y overflow-hidden">
        {events.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </Card>
    </div>
  );
}

function EventRow({ event: e }: { event: EventRecord }) {
  const router = useRouter();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/events/view?id=${e.id}`)}
      onKeyDown={(ev) => {
        if (ev.key === "Enter") router.push(`/events/view?id=${e.id}`);
      }}
      className="group flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
    >
      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{e.eventName}</span>
          <StatusBadge status={e.status} />
        </div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">
          {e.client.clientName} · {e.event.eventType}
        </div>
      </div>

      {/* Date + time */}
      <div className="hidden w-36 shrink-0 sm:block">
        <div className="flex items-center gap-1.5 text-sm">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          {formatDate(e.event.eventDate)}
        </div>
        {e.event.eventTime && (
          <div className="mt-0.5 pl-5 text-xs text-muted-foreground">
            {e.event.eventTime}
          </div>
        )}
      </div>

      {/* Venue */}
      <div className="hidden w-40 shrink-0 lg:block">
        <div className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{e.event.venue || "—"}</span>
        </div>
      </div>

      {/* Pax */}
      <div className="hidden w-16 shrink-0 md:flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        {e.event.pax}
      </div>

      {/* Total */}
      <div className="w-28 shrink-0 text-right text-sm font-medium tabular-nums">
        {formatCurrency(eventTotal(e))}
      </div>

      {/* Edit affordance */}
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/events/view?id=${e.id}&tab=details`}
          onClick={(ev) => ev.stopPropagation()}
          title="Edit event"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
      </div>
    </div>
  );
}
