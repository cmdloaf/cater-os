"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FileBox,
  Pencil,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { StatusBadge, STATUS_DOT } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  OverviewTab,
  ClientTab,
  EventDetailsTab,
  CateringTab,
  AddOnsTab,
  PaymentsTab,
} from "@/components/event/record-tabs";
import { DocumentsTab } from "@/components/event/documents-tab";
import { useStore } from "@/lib/store";
import { EVENT_STATUSES } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "client", label: "Client" },
  { value: "details", label: "Event Details" },
  { value: "catering", label: "Catering" },
  { value: "addons", label: "Add-ons" },
  { value: "payments", label: "Payments" },
  { value: "documents", label: "Documents" },
];

function EventRecordView() {
  const params = useSearchParams();
  const id = params.get("id");
  const { events, ready, setStatus } = useStore();
  const record = events.find((e) => e.id === id);
  const requestedTab = params.get("tab");
  const [tab, setTab] = useState(
    requestedTab && TABS.some((t) => t.value === requestedTab)
      ? requestedTab
      : "overview"
  );

  if (!ready) {
    return <EventWorkspaceSkeleton />;
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <FileBox className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Event not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This event record doesn&rsquo;t exist or hasn&rsquo;t loaded yet.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Link>
        </Button>
      </div>
    );
  }

  const meta = [
    record.event.eventType,
    formatDate(record.event.eventDate),
    record.event.eventTime,
    record.event.venue,
    `${record.event.pax} pax`,
  ].filter(Boolean);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.eventName}
            </h1>
            <StatusBadge status={record.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.join(" · ")}
          </p>
        </div>
        <div className="no-print flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTab("details")}>
            <Pencil className="h-4 w-4" />
            Edit Event
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Set status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {EVENT_STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => setStatus(record.id, s)}
                  className="gap-2"
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[s])} />
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="no-scrollbar no-print w-full justify-start overflow-x-auto lg:flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="shrink-0">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            record={record}
            onOpenDocuments={() => setTab("documents")}
          />
        </TabsContent>
        <TabsContent value="client">
          <ClientTab record={record} />
        </TabsContent>
        <TabsContent value="details">
          <EventDetailsTab record={record} />
        </TabsContent>
        <TabsContent value="catering">
          <CateringTab record={record} />
        </TabsContent>
        <TabsContent value="addons">
          <AddOnsTab record={record} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab record={record} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab record={record} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EventWorkspaceSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-9 w-full max-w-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

export default function EventRecordPage() {
  return (
    <Suspense fallback={<EventWorkspaceSkeleton />}>
      <EventRecordView />
    </Suspense>
  );
}
