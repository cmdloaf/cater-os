"use client";

import { useState } from "react";
import { Pencil, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlowDiagram } from "./flow-diagram";
import { EditSectionSheet, type EditSection } from "./edit-section-sheet";
import type { EventRecord } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DetailsTab({ record }: { record: EventRecord }) {
  const [editing, setEditing] = useState<EditSection | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Propagation callout */}
        <Card className="border-primary/20 bg-accent/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                This is the single source of truth.
              </div>
              <p className="text-sm text-muted-foreground">
                Edit any section below and every document — quotation, contract,
                event order and operations checklist — updates instantly. No
                duplicate data entry.
              </p>
            </div>
          </div>
        </Card>

        <Section
          title="Client Information"
          onEdit={() => setEditing("client")}
        >
          <Row label="Client Name" value={record.client.clientName} />
          <Row label="Contact Person" value={record.client.contactPerson} />
          <Row label="Mobile Number" value={record.client.mobile} />
          <Row label="Email Address" value={record.client.email} />
        </Section>

        <Section
          title="Event Information"
          onEdit={() => setEditing("event")}
        >
          <Row label="Event Type" value={record.event.eventType} />
          <Row label="Service Style" value={record.event.serviceStyle} />
          <Row label="Event Date" value={formatDate(record.event.eventDate)} />
          <Row label="Event Time" value={record.event.eventTime || "—"} />
          <Row label="Venue" value={record.event.venue} />
          <Row label="Venue Address" value={record.event.venueAddress || "—"} />
          <Row label="Number of Pax" value={`${record.event.pax} guests`} />
        </Section>

        <Section
          title="Package & Pricing"
          onEdit={() => setEditing("package")}
        >
          <Row
            label="Package"
            value={
              <span className="inline-flex items-center gap-2">
                {record.commercial.packageName}
                <Badge variant="secondary">{record.commercial.packageTier}</Badge>
              </span>
            }
          />
          <Row
            label="Budget Per Head"
            value={formatCurrency(record.commercial.budgetPerHead)}
          />
          <Row
            label="Reservation Fee"
            value={formatCurrency(record.reservationFee)}
          />
        </Section>

        <Section title="Menu" onEdit={() => setEditing("menu")}>
          <ul className="divide-y">
            {record.commercial.menu.map((m, i) => (
              <li key={i} className="flex items-center gap-3 py-2">
                <span className="w-24 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                  {m.category}
                </span>
                <span className="text-sm">{m.name}</span>
              </li>
            ))}
            {record.commercial.menu.length === 0 && (
              <li className="py-2 text-sm text-muted-foreground">
                No menu items yet.
              </li>
            )}
          </ul>
        </Section>

        <Section title="Add-ons" onEdit={() => setEditing("addons")}>
          {record.commercial.addOns.length > 0 ? (
            <ul className="divide-y">
              {record.commercial.addOns.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>{a.name}</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(a.price)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No add-ons selected.</p>
          )}
        </Section>

        <Section
          title="Special Requests"
          onEdit={() => setEditing("special")}
        >
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {record.commercial.specialRequests || "No special requests noted."}
          </p>
        </Section>
      </div>

      {/* Architecture viz */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24">
          <Card className="p-5">
            <div className="mb-3">
              <div className="text-sm font-semibold">Generated from this record</div>
              <p className="text-xs text-muted-foreground">
                One record flows into four documents.
              </p>
            </div>
            <FlowDiagram />
          </Card>
        </div>
      </div>

      {editing && (
        <EditSectionSheet
          record={record}
          section={editing}
          open={editing !== null}
          onOpenChange={(v) => !v && setEditing(null)}
        />
      )}
    </div>
  );
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
      <div className="px-5 py-3">{children}</div>
    </Card>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}
