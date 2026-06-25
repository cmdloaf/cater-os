"use client";

import { useMemo } from "react";
import {
  CalendarRange,
  Wallet,
  Users,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import { eventTotal } from "@/lib/documents";
import { EVENT_STATUSES } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { events, ready } = useStore();

  const data = useMemo(() => {
    const revenue = events.reduce((s, e) => s + eventTotal(e), 0);
    const pax = events.reduce((s, e) => s + e.event.pax, 0);
    const byStatus = EVENT_STATUSES.map((status) => {
      const list = events.filter((e) => e.status === status);
      return {
        status,
        count: list.length,
        revenue: list.reduce((s, e) => s + eventTotal(e), 0),
      };
    });
    const top = [...events]
      .sort((a, b) => eventTotal(b) - eventTotal(a))
      .slice(0, 5);
    return { revenue, pax, byStatus, top };
  }, [events]);

  const maxStatus = Math.max(1, ...data.byStatus.map((s) => s.count));

  const stats = [
    {
      label: "Total Events",
      value: ready ? String(events.length) : "—",
      icon: CalendarRange,
      accent: "text-zinc-600 bg-zinc-100",
    },
    {
      label: "Total Revenue",
      value: ready ? formatCurrency(data.revenue) : "—",
      icon: Wallet,
      accent: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Guests Served",
      value: ready ? data.pax.toLocaleString() : "—",
      icon: Users,
      accent: "text-blue-600 bg-blue-50",
    },
    {
      label: "Avg. Event Value",
      value:
        ready && events.length
          ? formatCurrency(data.revenue / events.length)
          : "—",
      icon: TrendingUp,
      accent: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of your events and revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold tracking-tight">
                    {s.value}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Events by status */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Events by Status</h2>
          <div className="mt-4 space-y-3">
            {data.byStatus.map((s) => (
              <div key={s.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <StatusBadge status={s.status} />
                  <span className="tabular-nums text-muted-foreground">
                    {s.count} · {formatCurrency(s.revenue)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top events */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Top Events by Value</h2>
          <ul className="mt-4 divide-y">
            {data.top.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <div className="text-sm font-medium">{e.eventName}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.client.clientName} · {e.event.pax} pax
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(eventTotal(e))}
                </span>
              </li>
            ))}
            {data.top.length === 0 && (
              <li className="py-2.5 text-sm text-muted-foreground">
                No events yet.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
