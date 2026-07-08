"use client";

import Link from "next/link";
import { useState } from "react";
import { List, CalendarDays, CalendarClock, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EventsList } from "@/components/events/events-list";
import { EventsCalendar } from "@/components/events/events-calendar";
import { EventsWeek } from "@/components/events/events-week";
import { cn } from "@/lib/utils";

type View = "list" | "calendar" | "week";

export default function EventsPage() {
  const [view, setView] = useState<View>("list");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === "list"
              ? "All events in order of execution."
              : view === "week"
                ? "Your schedule by day and time."
                : "Your event schedule at a glance."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex overflow-hidden rounded-md border">
            <ToggleButton
              active={view === "list"}
              onClick={() => setView("list")}
              icon={List}
              label="List"
            />
            <ToggleButton
              active={view === "week"}
              onClick={() => setView("week")}
              icon={CalendarClock}
              label="Week"
            />
            <ToggleButton
              active={view === "calendar"}
              onClick={() => setView("calendar")}
              icon={CalendarDays}
              label="Month"
            />
          </div>
          <Button asChild>
            <Link href="/events/new">
              <Plus className="h-4 w-4" />
              New Event
            </Link>
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <EventsList />
      ) : view === "week" ? (
        <EventsWeek />
      ) : (
        <EventsCalendar />
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof List;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
