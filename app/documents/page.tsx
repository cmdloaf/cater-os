"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { events } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DocumentType | "all">("all");

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
