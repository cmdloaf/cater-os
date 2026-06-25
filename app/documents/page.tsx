"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  FileSignature,
  ClipboardList,
  ListChecks,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import type { DocumentType } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const DOC_META: Record<
  DocumentType,
  { icon: typeof FileText; accent: string }
> = {
  Quotation: { icon: FileText, accent: "text-blue-600 bg-blue-50" },
  Contract: { icon: FileSignature, accent: "text-violet-600 bg-violet-50" },
  "Event Order": { icon: ClipboardList, accent: "text-amber-600 bg-amber-50" },
  "Operations Checklist": {
    icon: ListChecks,
    accent: "text-emerald-600 bg-emerald-50",
  },
};

const DOC_TYPES: DocumentType[] = [
  "Quotation",
  "Contract",
  "Event Order",
  "Operations Checklist",
];

export default function DocumentsPage() {
  return (
    <Suspense fallback={null}>
      <DocumentsView />
    </Suspense>
  );
}

function DocumentsView() {
  const router = useRouter();
  const params = useSearchParams();
  const { events } = useStore();
  const [query, setQuery] = useState("");
  const initialType = params.get("type");
  const [filter, setFilter] = useState<DocumentType | "all">(
    initialType && DOC_TYPES.includes(initialType as DocumentType)
      ? (initialType as DocumentType)
      : "all"
  );

  const rows = useMemo(() => {
    const all = events.flatMap((e) =>
      DOC_TYPES.map((type) => ({
        id: `${e.id}-${type}`,
        eventId: e.id,
        type,
        eventName: e.eventName,
        client: e.client.clientName,
        status: e.status,
        date: e.event.eventDate,
        docNo: `${docPrefix(type)}-${e.id.slice(-6).toUpperCase()}`,
      }))
    );
    return all
      .filter((r) => (filter === "all" ? true : r.type === filter))
      .filter(
        (r) =>
          r.eventName.toLowerCase().includes(query.toLowerCase()) ||
          r.client.toLowerCase().includes(query.toLowerCase()) ||
          r.docNo.toLowerCase().includes(query.toLowerCase())
      );
  }, [events, filter, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every document is generated from its Event Record — open any one to
          view or export it.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All documents
        </Chip>
        {DOC_TYPES.map((t) => (
          <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>
            {t}
          </Chip>
        ))}
        <div className="ml-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="w-full sm:w-64"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Mobile: stacked cards */}
        <div className="divide-y lg:hidden">
          {rows.map((r) => {
            const meta = DOC_META[r.type];
            const Icon = meta.icon;
            return (
              <button
                key={r.id}
                onClick={() => router.push(`/events/view?id=${r.eventId}`)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                    meta.accent
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.eventName}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {r.type} · {r.docNo} · {formatDate(r.date)}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </button>
            );
          })}
          {rows.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No documents match your filters.
            </div>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const meta = DOC_META[r.type];
                const Icon = meta.icon;
                return (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/events/view?id=${r.eventId}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md",
                            meta.accent
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium tabular-nums">
                          {r.docNo}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.type}
                    </TableCell>
                    <TableCell className="font-medium">{r.eventName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.client}
                    </TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function docPrefix(type: DocumentType): string {
  switch (type) {
    case "Quotation":
      return "QTN";
    case "Contract":
      return "CTR";
    case "Event Order":
      return "EO";
    case "Operations Checklist":
      return "OPS";
  }
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-white text-muted-foreground hover:border-zinc-300"
      )}
    >
      {children}
    </button>
  );
}
