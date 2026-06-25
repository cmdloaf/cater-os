"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Plus,
  CalendarRange,
  FileEdit,
  CircleCheckBig,
  PartyPopper,
  Users,
  Package,
  UtensilsCrossed,
  LayoutTemplate,
  PlusCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { EVENT_STATUSES } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const STAT_META = [
  {
    key: "totalEvents" as const,
    label: "Total Events",
    icon: CalendarRange,
    accent: "text-zinc-600 bg-zinc-100",
  },
  {
    key: "draft" as const,
    label: "Draft",
    icon: FileEdit,
    accent: "text-amber-600 bg-amber-50",
  },
  {
    key: "confirmed" as const,
    label: "Confirmed",
    icon: CircleCheckBig,
    accent: "text-emerald-600 bg-emerald-50",
  },
  {
    key: "completed" as const,
    label: "Completed",
    icon: PartyPopper,
    accent: "text-blue-600 bg-blue-50",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Import Packages",
    hint: "From Excel or CSV",
    icon: Package,
    href: "/import",
  },
  {
    label: "Import Menus",
    hint: "From Excel or CSV",
    icon: UtensilsCrossed,
    href: "/import",
  },
  {
    label: "Import Templates",
    hint: "Contracts, Event Orders",
    icon: LayoutTemplate,
    href: "/import",
  },
  {
    label: "Add Add-on",
    hint: "Create new add-on",
    icon: PlusCircle,
    href: "/addons",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { events, getStats, ready } = useStore();
  const stats = getStats();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    return events
      .filter((e) => (status === "all" ? true : e.status === status))
      .filter(
        (e) =>
          e.eventName.toLowerCase().includes(query.toLowerCase()) ||
          e.client.clientName.toLowerCase().includes(query.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(a.event.eventDate).getTime() -
          new Date(b.event.eventDate).getTime()
      );
  }, [events, query, status]);

  return (
    <div className="space-y-6">
      {/* Greeting header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Good morning! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&rsquo;s what&rsquo;s happening with your events.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_META.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.key} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-semibold tracking-tight">
                    {ready ? stats[s.key] : "—"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {s.label}
                  </div>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    s.accent
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Upcoming events table card */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold">Upcoming Events</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events or clients…"
              className="w-full sm:w-56"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
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

        {/* Mobile: stacked cards */}
        <div className="divide-y lg:hidden">
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => router.push(`/events/view?id=${e.id}`)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{e.eventName}</div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {e.client.clientName} · {formatDate(e.event.eventDate)} ·{" "}
                  {e.event.pax} pax
                </div>
              </div>
              <StatusBadge status={e.status} />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No events match your filters.
            </div>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Event Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Pax</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow
                  key={e.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/events/view?id=${e.id}`)}
                >
                  <TableCell className="font-medium">{e.eventName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.client.clientName}
                  </TableCell>
                  <TableCell>{formatDate(e.event.eventDate)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {e.event.pax}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No events match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-base font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href}>
                <Card className="flex h-full flex-col items-start gap-3 p-5 transition-colors hover:border-primary/40 hover:bg-accent/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{a.label}</div>
                    <div className="text-xs text-muted-foreground">{a.hint}</div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
