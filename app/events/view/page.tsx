"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Package,
  Wallet,
  FileBox,
  ListChecks,
  FileText,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { DetailsTab } from "@/components/event/details-tab";
import { DocumentsTab } from "@/components/event/documents-tab";
import { OperationsTab } from "@/components/event/operations-tab";
import { useStore } from "@/lib/store";
import { eventTotal } from "@/lib/documents";
import { EVENT_STATUSES } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

function EventRecordView() {
  const params = useSearchParams();
  const id = params.get("id");
  const { events, ready, setStatus } = useStore();
  const record = events.find((e) => e.id === id);

  if (!ready) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading event…
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <FileBox className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Event not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This event record doesn’t exist or hasn’t loaded yet.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Link>
        </Button>
      </div>
    );
  }

  const total = eventTotal(record);

  const summary = [
    {
      label: "Event Date",
      value: formatDate(record.event.eventDate),
      sub: record.event.eventTime || "",
      icon: CalendarDays,
    },
    {
      label: "Venue",
      value: record.event.venue,
      sub: record.event.venueAddress,
      icon: MapPin,
    },
    {
      label: "Pax",
      value: `${record.event.pax}`,
      sub: record.event.serviceStyle,
      icon: Users,
    },
    {
      label: "Package",
      value: record.commercial.packageTier,
      sub: record.commercial.packageName,
      icon: Package,
    },
    {
      label: "Total Amount",
      value: formatCurrency(total),
      sub: "incl. SC & VAT",
      icon: Wallet,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="no-print inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {record.eventName}
          </h1>
          <StatusBadge status={record.status} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="no-print">
              Change status
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Set status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {EVENT_STATUSES.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => setStatus(record.id, s)}
              >
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className={cn(
                "p-4",
                s.highlight && "border-primary/30 bg-accent/40"
              )}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              <div
                className={cn(
                  "mt-2 truncate text-lg font-semibold tracking-tight",
                  s.highlight && "text-primary"
                )}
                title={s.value}
              >
                {s.value}
              </div>
              {s.sub && (
                <div className="mt-0.5 truncate text-xs text-muted-foreground" title={s.sub}>
                  {s.sub}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="no-print">
          <TabsTrigger value="details">
            <FileText className="h-4 w-4" />
            Event Details
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileBox className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="operations">
            <ListChecks className="h-4 w-4" />
            Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <DetailsTab record={record} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab record={record} />
        </TabsContent>
        <TabsContent value="operations">
          <OperationsTab record={record} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EventRecordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">
          Loading event…
        </div>
      }
    >
      <EventRecordView />
    </Suspense>
  );
}
