"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Pencil,
  FileDown,
  Send,
  ChefHat,
  FileText,
  FileSignature,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EditSectionSheet, type EditSection } from "./edit-section-sheet";
import { useStore } from "@/lib/store";
import type { EventRecord } from "@/lib/types";
import { deriveQuote, SERVICE_CHARGE_RATE, VAT_RATE } from "@/lib/pricing";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export function DocumentsTab({ record }: { record: EventRecord }) {
  const { setStatus } = useStore();
  const [editing, setEditing] = useState<EditSection | null>(null);

  function generatePdf(doc: string) {
    toast.success(`${doc} ready`, {
      description: "Opening the print/PDF dialog…",
    });
    setTimeout(() => window.print(), 350);
  }

  return (
    <div>
      <Tabs defaultValue="quotation">
        <TabsList className="no-print">
          <TabsTrigger value="quotation">
            <FileText className="h-4 w-4" />
            Quotation
          </TabsTrigger>
          <TabsTrigger value="contract">
            <FileSignature className="h-4 w-4" />
            Contract
          </TabsTrigger>
          <TabsTrigger value="order">
            <ClipboardList className="h-4 w-4" />
            Event Order
          </TabsTrigger>
        </TabsList>

        {/* QUOTATION */}
        <TabsContent value="quotation" className="mt-4">
          <DocToolbar>
            <Button variant="outline" size="sm" onClick={() => setEditing("package")}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => generatePdf("Quotation")}>
              <FileDown className="h-4 w-4" /> Generate PDF
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                await setStatus(record.id, "Quotation Sent");
                toast.success("Quotation sent to client", {
                  description: `Emailed to ${record.client.email || "the client"}. Status set to “Quotation Sent”.`,
                });
              }}
            >
              <Send className="h-4 w-4" /> Send to Client
            </Button>
          </DocToolbar>
          <QuotationDoc record={record} />
        </TabsContent>

        {/* CONTRACT */}
        <TabsContent value="contract" className="mt-4">
          <DocToolbar>
            <Button variant="outline" size="sm" onClick={() => setEditing("package")}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm" onClick={() => generatePdf("Contract")}>
              <FileDown className="h-4 w-4" /> Generate Contract PDF
            </Button>
          </DocToolbar>
          <ContractDoc record={record} />
        </TabsContent>

        {/* EVENT ORDER */}
        <TabsContent value="order" className="mt-4">
          <DocToolbar>
            <Button variant="outline" size="sm" onClick={() => setEditing("order")}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm" onClick={() => generatePdf("Event Order")}>
              <FileDown className="h-4 w-4" /> Generate Event Order PDF
            </Button>
          </DocToolbar>
          <EventOrderDoc record={record} />
        </TabsContent>
      </Tabs>

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

function DocToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Live preview — generated from the Event Record.
      </p>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

/* ------------------------------- Letterhead ------------------------------- */

function Letterhead({
  docTitle,
  docNo,
}: {
  docTitle: string;
  docNo: string;
}) {
  return (
    <div className="flex items-start justify-between border-b pb-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ChefHat className="h-6 w-6" />
        </div>
        <div>
          <div className="text-lg font-semibold tracking-tight">CaterOS Catering</div>
          <div className="text-xs text-muted-foreground">
            123 Banquet Ave, Makati City · +63 2 8555 0100 · hello@cateros.ph
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">
          {docTitle}
        </div>
        <div className="mt-1 text-sm font-medium">{docNo}</div>
        <div className="text-xs text-muted-foreground">
          {formatDate(new Date().toISOString().slice(0, 10))}
        </div>
      </div>
    </div>
  );
}

function DocShell({ children }: { children: React.ReactNode }) {
  return (
    <Card className="print-area mx-auto max-w-3xl p-8 shadow-sm sm:p-10">
      {children}
    </Card>
  );
}

function InfoBlock({
  title,
  rows,
}: {
  title: string;
  rows: [string, React.ReactNode][];
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <dl className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------------- Quotation ------------------------------- */

function QuotationDoc({ record }: { record: EventRecord }) {
  const quote = deriveQuote(record);
  return (
    <DocShell>
      <Letterhead docTitle="Quotation" docNo={`QTN-${record.id.slice(-6).toUpperCase()}`} />

      <div className="grid gap-8 py-6 sm:grid-cols-2">
        <InfoBlock
          title="Bill To"
          rows={[
            ["Client", record.client.clientName],
            ["Contact", record.client.contactPerson],
            ["Mobile", record.client.mobile || "—"],
            ["Email", record.client.email || "—"],
          ]}
        />
        <InfoBlock
          title="Event Details"
          rows={[
            ["Event", record.eventName],
            ["Date", formatDate(record.event.eventDate)],
            ["Time", record.event.eventTime || "—"],
            ["Venue", record.event.venue],
            ["Pax", `${record.event.pax} guests`],
            ["Service", record.event.serviceStyle],
          ]}
        />
      </div>

      <Separator />

      {/* Menu */}
      <div className="py-6">
        <div className="mb-3 text-sm font-semibold">
          {record.commercial.packageName} — Menu Inclusions
        </div>
        <div className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
          {record.commercial.menu.map((m, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                {m.category}
              </span>
              <span>{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div className="py-6">
        <div className="mb-3 text-sm font-semibold">Pricing Breakdown</div>
        <table className="w-full text-sm">
          <tbody>
            <PriceRow
              label={quote.packageLine.label}
              detail={quote.packageLine.detail}
              amount={quote.packageLine.amount}
            />
            {quote.addOnLines.map((l, i) => (
              <PriceRow key={i} label={l.label} detail={l.detail} amount={l.amount} />
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-1.5 border-t pt-4">
          <Total label="Subtotal" value={quote.subtotal} />
          <Total
            label={`Service Charge (${Math.round(SERVICE_CHARGE_RATE * 100)}%)`}
            value={quote.serviceCharge}
          />
          <Total label={`VAT (${Math.round(VAT_RATE * 100)}%)`} value={quote.vat} />
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-base font-semibold">Total Amount</span>
            <span className="text-xl font-semibold text-primary">
              {formatCurrency(quote.total)}
            </span>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            ≈ {formatCurrency(quote.perHead)} per guest
          </div>
        </div>
      </div>

      {record.commercial.specialRequests && (
        <>
          <Separator />
          <div className="py-6">
            <div className="mb-2 text-sm font-semibold">Notes & Special Requests</div>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {record.commercial.specialRequests}
            </p>
          </div>
        </>
      )}

      <div className="mt-2 rounded-lg bg-muted/60 p-4 text-xs text-muted-foreground">
        This quotation is valid for 30 days. A reservation fee of{" "}
        {formatCurrency(record.reservationFee)} confirms your booking. Prices are
        inclusive of service charge and VAT.
      </div>
    </DocShell>
  );
}

function PriceRow({
  label,
  detail,
  amount,
}: {
  label: string;
  detail: string;
  amount: number;
}) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-2.5">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </td>
      <td className="py-2.5 text-right font-medium tabular-nums">
        {formatCurrency(amount)}
      </td>
    </tr>
  );
}

function Total({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}

/* -------------------------------- Contract -------------------------------- */

function ContractDoc({ record }: { record: EventRecord }) {
  const quote = deriveQuote(record);
  const balance = quote.total - record.reservationFee;
  return (
    <DocShell>
      <Letterhead docTitle="Catering Contract" docNo={`CTR-${record.id.slice(-6).toUpperCase()}`} />

      <p className="py-6 text-sm leading-relaxed text-muted-foreground">
        This Catering Service Agreement is entered into between{" "}
        <span className="font-medium text-foreground">CaterOS Catering</span>{" "}
        (“the Caterer”) and{" "}
        <span className="font-medium text-foreground">
          {record.client.clientName}
        </span>{" "}
        (“the Client”) for the event detailed below.
      </p>

      <div className="grid gap-8 sm:grid-cols-2">
        <InfoBlock
          title="Client"
          rows={[
            ["Name", record.client.clientName],
            ["Contact Person", record.client.contactPerson],
            ["Mobile", record.client.mobile || "—"],
            ["Email", record.client.email || "—"],
          ]}
        />
        <InfoBlock
          title="Event"
          rows={[
            ["Event", record.eventName],
            ["Date", formatDate(record.event.eventDate)],
            ["Time", record.event.eventTime || "—"],
            ["Venue", record.event.venue],
            ["Address", record.event.venueAddress || "—"],
            ["Pax", `${record.event.pax} guests`],
          ]}
        />
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 sm:grid-cols-3">
        <ContractFigure label="Contract Total" value={quote.total} primary />
        <ContractFigure label="Reservation Fee" value={record.reservationFee} />
        <ContractFigure label="Balance Due" value={balance} />
      </div>

      <Separator className="my-6" />

      <div>
        <div className="mb-2 text-sm font-semibold">Payment Terms</div>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            A reservation fee of {formatCurrency(record.reservationFee)} is due
            upon signing to confirm and block the event date.
          </li>
          <li>
            50% of the remaining balance is due thirty (30) days before the
            event date.
          </li>
          <li>
            The full balance of {formatCurrency(balance)} must be settled no
            later than three (3) days before the event.
          </li>
        </ol>
      </div>

      <div className="mt-6">
        <div className="mb-2 text-sm font-semibold">Terms & Conditions</div>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            Final guest count must be confirmed seven (7) days prior; charges are
            based on the guaranteed count.
          </li>
          <li>
            The reservation fee is non-refundable but transferable to a
            rescheduled date within six (6) months, subject to availability.
          </li>
          <li>
            Menu and add-ons may be adjusted up to fourteen (14) days before the
            event; pricing follows the latest Event Record.
          </li>
          <li>
            The Caterer is not liable for delays caused by force majeure or venue
            restrictions beyond its control.
          </li>
        </ol>
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <Signature label="Client" name={record.client.contactPerson} />
        <Signature label="Authorized Representative, CaterOS Catering" name="" />
      </div>
    </DocShell>
  );
}

function ContractFigure({
  label,
  value,
  primary,
}: {
  label: string;
  value: number;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        primary && "border-primary/30 bg-accent/40"
      )}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          primary && "text-primary"
        )}
      >
        {formatCurrency(value)}
      </div>
    </div>
  );
}

function Signature({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <div className="mb-1 h-10 border-b border-dashed" />
      <div className="text-sm font-medium">{name || " "}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/* ------------------------------- Event Order ------------------------------ */

function EventOrderDoc({ record }: { record: EventRecord }) {
  const o = record.order;
  return (
    <DocShell>
      <Letterhead docTitle="Event Order" docNo={`EO-${record.id.slice(-6).toUpperCase()}`} />

      <div className="grid gap-8 py-6 sm:grid-cols-2">
        <InfoBlock
          title="Event Details"
          rows={[
            ["Event", record.eventName],
            ["Client", record.client.clientName],
            ["Date", formatDate(record.event.eventDate)],
            ["Call Time", record.event.eventTime || "—"],
            ["Pax", `${record.event.pax} guests`],
            ["Service", record.event.serviceStyle],
          ]}
        />
        <InfoBlock
          title="Venue & Logistics"
          rows={[
            ["Venue", record.event.venue],
            ["Address", record.event.venueAddress || "—"],
            ["Ingress", o.ingress || "—"],
            ["Egress", o.egress || "—"],
            ["Theme", o.theme || "—"],
          ]}
        />
      </div>

      <Separator />

      <div className="py-6">
        <div className="mb-3 text-sm font-semibold">Menu to Serve</div>
        <div className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
          {record.commercial.menu.map((m, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                {m.category}
              </span>
              <span>{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 py-6 sm:grid-cols-2">
        <OrderNote title="Setup Requirements" body={o.setupRequirements} />
        <OrderNote title="Operational Notes" body={o.operationalNotes} />
        <OrderNote title="Staff Notes" body={o.staffNotes} />
        <OrderNote
          title="Add-ons On-site"
          body={
            record.commercial.addOns.length
              ? record.commercial.addOns.map((a) => a.name).join(", ")
              : ""
          }
        />
      </div>
    </DocShell>
  );
}

function OrderNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <p className="whitespace-pre-line text-sm">
        {body || <span className="text-muted-foreground">Not specified.</span>}
      </p>
    </div>
  );
}
