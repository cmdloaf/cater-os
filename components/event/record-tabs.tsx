"use client";

import { useState } from "react";
import {
  Pencil,
  FileText,
  FileSignature,
  ClipboardList,
  ListChecks,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EditSectionSheet, type EditSection } from "./edit-section-sheet";
import type { EventRecord } from "@/lib/types";
import { deriveQuote, SERVICE_CHARGE_RATE, VAT_RATE } from "@/lib/pricing";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

/* --------------------------- Shared primitives --------------------------- */

export function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>
      <div className="px-5 py-3">{children}</div>
    </Card>
  );
}

export function Row({
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

/** Wrap a tab's sections with a one-shot edit sheet. */
function useEdit() {
  const [editing, setEditing] = useState<EditSection | null>(null);
  return { editing, setEditing };
}

function EditSheet({
  record,
  editing,
  setEditing,
}: {
  record: EventRecord;
  editing: EditSection | null;
  setEditing: (s: EditSection | null) => void;
}) {
  if (!editing) return null;
  return (
    <EditSectionSheet
      record={record}
      section={editing}
      open={editing !== null}
      onOpenChange={(v) => !v && setEditing(null)}
    />
  );
}

/* -------------------------------- Overview -------------------------------- */

const DOCS = [
  { key: "quotation", label: "Quotation", icon: FileText },
  { key: "contract", label: "Contract", icon: FileSignature },
  { key: "order", label: "Event Order", icon: ClipboardList },
  { key: "checklist", label: "Checklist", icon: ListChecks },
];

export function OverviewTab({
  record,
  onOpenDocuments,
}: {
  record: EventRecord;
  onOpenDocuments: () => void;
}) {
  const quote = deriveQuote(record);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Event summary */}
        <Section title="Event Summary">
          <Row label="Client" value={record.client.clientName} />
          <Row label="Contact Person" value={record.client.contactPerson} />
          <Row label="Contact" value={record.client.mobile || "—"} />
          <Row label="Email" value={record.client.email || "—"} />
          <Row label="Event Type" value={record.event.eventType} />
          <Row
            label="Date & Time"
            value={`${formatDate(record.event.eventDate)}${
              record.event.eventTime ? " · " + record.event.eventTime : ""
            }`}
          />
          <Row label="Venue" value={record.event.venue || "—"} />
          <Row label="Pax" value={`${record.event.pax} guests`} />
          <Row label="Theme / Motif" value={record.order.theme || "—"} />
        </Section>

        {/* Catering summary */}
        <Section title="Catering Summary">
          <Row
            label="Package"
            value={
              <span className="inline-flex items-center gap-2">
                {record.commercial.packageName}
                <Badge variant="secondary">
                  {formatCurrency(record.commercial.budgetPerHead)}/pax
                </Badge>
              </span>
            }
          />
          <Separator className="my-2" />
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Menu · {record.commercial.menu.length} courses
          </div>
          <ul className="mt-1.5 space-y-1">
            {record.commercial.menu.map((m, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {m.name}
              </li>
            ))}
          </ul>
          {record.commercial.addOns.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Add-ons
              </div>
              <ul className="mt-1.5 space-y-1">
                {record.commercial.addOns.map((a, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {a.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>

        {/* Pricing summary */}
        <Section title="Pricing Summary">
          <Row
            label={`${record.event.pax} pax × ${formatCurrency(
              record.commercial.budgetPerHead
            )}`}
            value={formatCurrency(quote.packageLine.amount)}
          />
          <Row label="Add-ons Total" value={formatCurrency(quote.addOnsTotal)} />
          <Row
            label="Transportation Fee"
            value={formatCurrency(quote.transportationFee)}
          />
          <Row
            label={`Service Charge (${Math.round(SERVICE_CHARGE_RATE * 100)}%)`}
            value={formatCurrency(quote.serviceCharge)}
          />
          <Row
            label={`VAT (${Math.round(VAT_RATE * 100)}%)`}
            value={formatCurrency(quote.vat)}
          />
          <Row
            label="Discount"
            value={`–${formatCurrency(quote.discount)}`}
          />
          <Separator className="my-2" />
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-semibold">TOTAL</span>
            <span className="text-xl font-semibold text-primary tabular-nums">
              {formatCurrency(quote.total)}
            </span>
          </div>
        </Section>
      </div>

      {/* Document status */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Document Status</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOCS.map((d) => {
            const Icon = d.icon;
            return (
              <Card key={d.key} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="text-xs text-muted-foreground">
                      Ready to generate
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onOpenDocuments}
                >
                  Generate
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Client --------------------------------- */

export function ClientTab({ record }: { record: EventRecord }) {
  const { editing, setEditing } = useEdit();
  return (
    <div className="max-w-2xl">
      <Section title="Client Information" onEdit={() => setEditing("client")}>
        <Row label="Client Name" value={record.client.clientName} />
        <Row label="Contact Person" value={record.client.contactPerson} />
        <Row label="Contact Number" value={record.client.mobile || "—"} />
        <Row label="Email Address" value={record.client.email || "—"} />
      </Section>
      <EditSheet record={record} editing={editing} setEditing={setEditing} />
    </div>
  );
}

/* ------------------------------ Event Details ----------------------------- */

export function EventDetailsTab({ record }: { record: EventRecord }) {
  const { editing, setEditing } = useEdit();
  const o = record.order;
  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <Section title="Event Information" onEdit={() => setEditing("event")}>
        <Row label="Event Type" value={record.event.eventType} />
        <Row label="Event Date" value={formatDate(record.event.eventDate)} />
        <Row label="Event Time" value={record.event.eventTime || "—"} />
        <Row label="Venue" value={record.event.venue || "—"} />
        <Row label="Venue Address" value={record.event.venueAddress || "—"} />
        <Row label="Expected Pax" value={`${record.event.pax} guests`} />
      </Section>
      <Section title="Operations & Logistics" onEdit={() => setEditing("order")}>
        <Row label="Theme / Motif" value={o.theme || "—"} />
        <Row label="Ingress" value={o.ingress || "—"} />
        <Row label="Egress" value={o.egress || "—"} />
        <Row label="Setup Requirements" value={o.setupRequirements || "—"} />
      </Section>
      <EditSheet record={record} editing={editing} setEditing={setEditing} />
    </div>
  );
}

/* -------------------------------- Catering -------------------------------- */

export function CateringTab({ record }: { record: EventRecord }) {
  const { editing, setEditing } = useEdit();
  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <Section title="Package & Pricing" onEdit={() => setEditing("package")}>
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
          label="Price Per Head"
          value={formatCurrency(record.commercial.budgetPerHead)}
        />
        <Row
          label="Transportation Fee"
          value={formatCurrency(record.commercial.transportationFee)}
        />
        <Row label="Discount" value={formatCurrency(record.commercial.discount)} />
      </Section>
      <Section title="Menu Selection" onEdit={() => setEditing("menu")}>
        <ul className="divide-y">
          {record.commercial.menu.map((m, i) => (
            <li key={i} className="flex items-center gap-3 py-2">
              <span className="w-28 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
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
      <EditSheet record={record} editing={editing} setEditing={setEditing} />
    </div>
  );
}

/* --------------------------------- Add-ons -------------------------------- */

export function AddOnsTab({ record }: { record: EventRecord }) {
  const { editing, setEditing } = useEdit();
  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
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
      <Section title="Special Requests" onEdit={() => setEditing("special")}>
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {record.commercial.specialRequests || "No special requests noted."}
        </p>
      </Section>
      <EditSheet record={record} editing={editing} setEditing={setEditing} />
    </div>
  );
}

/* -------------------------------- Payments -------------------------------- */

export function PaymentsTab({ record }: { record: EventRecord }) {
  const quote = deriveQuote(record);
  const balance = quote.total - record.reservationFee;
  const figures = [
    { label: "Contract Total", value: quote.total, primary: true },
    { label: "Reservation Fee Paid", value: record.reservationFee },
    { label: "Balance Due", value: balance },
  ];
  return (
    <div className="max-w-4xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {figures.map((f) => (
          <Card
            key={f.label}
            className={cn("p-5", f.primary && "border-primary/30 bg-accent/40")}
          >
            <div className="text-xs text-muted-foreground">{f.label}</div>
            <div
              className={cn(
                "mt-1 text-2xl font-semibold tabular-nums",
                f.primary && "text-primary"
              )}
            >
              {formatCurrency(f.value)}
            </div>
          </Card>
        ))}
      </div>
      <Section title="Payment Schedule">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Reservation fee of {formatCurrency(record.reservationFee)} is due on
            signing to confirm and block the event date.
          </li>
          <li>
            50% of the remaining balance is due thirty (30) days before the
            event.
          </li>
          <li>
            The full balance of {formatCurrency(balance)} must be settled no
            later than three (3) days before the event.
          </li>
        </ol>
      </Section>
    </div>
  );
}
