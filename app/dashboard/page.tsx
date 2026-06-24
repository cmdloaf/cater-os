"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Plus,
  CalendarClock,
  FileClock,
  CircleCheckBig,
  Users,
  ArrowUpRight,
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
import { eventTotal } from "@/lib/documents";
import { EVENT_STATUSES } from "@/lib/types";
import { cn, formatCurrency, formatDate, timeAgo } from "@/lib/utils";

const STAT_META = [
  {
    key: "upcoming" as const,
    label: "Upcoming Events",
    icon: CalendarClock,
    accent: "text-blue-600 bg-blue-50",
    hint: "Confirmed & upcoming",
  },
  {
    key: "pendingQuotations" as const,
    label: "Pending Quotations",
    icon: FileClock,
    accent: "text-amber-600 bg-amber-50",
    hint: "Awaiting client response",
  },
  {
    key: "confirmed" as const,
    label: "Confirmed Events",
    icon: CircleCheckBig,
    accent: "text-emerald-600 bg-emerald-50",
    hint: "Booking secured",
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
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [events, query, status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every event is a single record that generates all your documents.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_META.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.key} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight">
                    {ready ? stats[s.key] : "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {s.hint}
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

      {/* Table card */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events or clients…"
              className="w-full sm:w-72"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
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

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Event Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Event Date</TableHead>
              <TableHead className="text-right">Pax</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead></TableHead>
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
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(eventTotal(e))}
                </TableCell>
                <TableCell>
                  <StatusBadge status={e.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {timeAgo(e.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No events match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
