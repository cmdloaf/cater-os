"use client";

import { toast } from "sonner";
import {
  ChefHat,
  CalendarDays,
  Users,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DocLine, EventRecord } from "@/lib/types";
import { seedQuotation } from "@/lib/documents";
import { cn, formatCurrency } from "@/lib/utils";
import {
  usePersistedDoc,
  EditableText,
  EditableArea,
  EditableMoney,
} from "./doc-primitives";

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function QuotationDocument({ record }: { record: EventRecord }) {
  const { doc, update, persist, commit } = usePersistedDoc(
    record,
    "quotation",
    seedQuotation
  );

  /* ------------------------------- charges ------------------------------- */
  const lineItems = doc.charges.filter((c) => c.kind === "line");
  const service = doc.charges.find((c) => c.kind === "service");
  const vat = doc.charges.find((c) => c.kind === "vat");
  const discount = doc.charges.find((c) => c.kind === "discount");
  const subtotal = lineItems.reduce((s, c) => s + c.amount, 0);
  const grand =
    subtotal +
    (service?.amount ?? 0) +
    (vat?.amount ?? 0) +
    (discount?.amount ?? 0);

  const patchCharge = (id: string, patch: Partial<DocLine>) =>
    doc.charges.map((c) => (c.id === id ? { ...c, ...patch } : c));

  const setField = (patch: Partial<typeof doc>) => update({ ...doc, ...patch });

  function resetToEvent() {
    commit(seedQuotation(record));
    toast.success("Quotation reset", {
      description: "Re-generated from the latest Event Record.",
    });
  }

  return (
    <div className="space-y-3">
      <div className="no-print flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Click any field to edit — changes save to this event.
        </p>
        <Button variant="outline" size="sm" onClick={resetToEvent}>
          <RotateCcw className="h-4 w-4" /> Reset to event data
        </Button>
      </div>

      <div className="print-area mx-auto max-w-3xl border bg-white p-4 text-sm text-zinc-800 shadow-sm sm:p-8 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/60 text-primary sm:h-14 sm:w-14">
            <ChefHat className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <EditableText
              value={doc.companyName}
              onChange={(v) => setField({ companyName: v })}
              onBlur={persist}
              className="font-serif text-lg font-semibold tracking-wide"
            />
            <EditableText
              value={doc.companyTagline}
              onChange={(v) => setField({ companyTagline: v })}
              onBlur={persist}
              className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            />
          </div>
        </div>
        <div className="font-serif text-2xl font-semibold tracking-[0.15em] text-zinc-900 sm:text-3xl">
          QUOTATION
        </div>
      </div>

      {/* Prepared for + meta */}
      <div className="grid gap-6 border-b py-6 sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            Prepared For
          </div>
          <EditableText
            value={doc.preparedFor}
            onChange={(v) => setField({ preparedFor: v })}
            onBlur={persist}
            className="mt-1 font-serif text-xl font-semibold"
          />
        </div>
        <div className="space-y-1.5">
          <MetaRow icon={CalendarDays} label="Date" value={doc.dateLabel} onChange={(v) => setField({ dateLabel: v })} onBlur={persist} />
          <MetaRow icon={Users} label="Pax" value={doc.paxLabel} onChange={(v) => setField({ paxLabel: v })} onBlur={persist} />
          <MetaRow icon={Clock} label="Terms" value={doc.termsLabel} onChange={(v) => setField({ termsLabel: v })} onBlur={persist} />
          <MetaRow icon={MapPin} label="Venue" value={doc.venueLabel} onChange={(v) => setField({ venueLabel: v })} onBlur={persist} />
        </div>
      </div>

      {/* Charges */}
      <div className="py-6">
        <div className="grid grid-cols-[1fr_8rem] bg-zinc-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white">
          <span>Description</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="divide-y">
          {lineItems.map((c) => (
            <div
              key={c.id}
              className="group grid grid-cols-[1fr_8rem] items-start gap-3 px-2 py-2.5"
            >
              <div className="min-w-0">
                <EditableText
                  value={c.description}
                  onChange={(v) => update({ ...doc, charges: patchCharge(c.id, { description: v }) })}
                  onBlur={persist}
                  className="font-serif text-base font-medium"
                />
                {c.detail !== undefined && (
                  <EditableText
                    value={c.detail}
                    onChange={(v) => update({ ...doc, charges: patchCharge(c.id, { detail: v }) })}
                    onBlur={persist}
                    placeholder="detail (optional)"
                    className="text-xs text-muted-foreground"
                  />
                )}
              </div>
              <div className="flex items-center justify-end gap-1">
                {c.struckAmount ? (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(c.struckAmount)}
                  </span>
                ) : null}
                <EditableMoney
                  value={c.amount}
                  onCommit={(n) => commit({ ...doc, charges: patchCharge(c.id, { amount: n }) })}
                  className="font-medium"
                />
                <button
                  type="button"
                  onClick={() => commit({ ...doc, charges: doc.charges.filter((x) => x.id !== c.id) })}
                  className="no-print shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            commit({
              ...doc,
              charges: [...doc.charges, { id: uid("ln"), description: "New item", amount: 0, kind: "line" }],
            })
          }
          className="no-print mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add line item
        </button>

        {/* Totals */}
        <div className="mt-5 ml-auto max-w-xs space-y-1.5">
          <TotalRow label="Subtotal" value={subtotal} />
          {service && (
            <EditableTotal
              charge={service}
              onLabel={(v) => update({ ...doc, charges: patchCharge(service.id, { description: v }) })}
              onAmount={(n) => commit({ ...doc, charges: patchCharge(service.id, { amount: n }) })}
              onBlur={persist}
            />
          )}
          {vat && (
            <EditableTotal
              charge={vat}
              onLabel={(v) => update({ ...doc, charges: patchCharge(vat.id, { description: v }) })}
              onAmount={(n) => commit({ ...doc, charges: patchCharge(vat.id, { amount: n }) })}
              onBlur={persist}
            />
          )}
          {discount && (
            <EditableTotal
              charge={discount}
              onLabel={(v) => update({ ...doc, charges: patchCharge(discount.id, { description: v }) })}
              onAmount={(n) => commit({ ...doc, charges: patchCharge(discount.id, { amount: n }) })}
              onBlur={persist}
            />
          )}
        </div>
        <div className="mt-3 flex items-center justify-between bg-primary/10 px-4 py-3">
          <span className="font-serif text-lg font-semibold">TOTAL</span>
          <span className="font-serif text-2xl font-semibold text-primary">
            {formatCurrency(grand)}
          </span>
        </div>
      </div>

      {/* Menu / package breakdown */}
      <SectionTitle>Menu Inclusions</SectionTitle>
      <div className="grid gap-5 py-4 sm:grid-cols-2">
        {doc.meals.map((m) => (
          <div key={m.id} className="group/meal">
            <div className="flex items-center gap-1 border-b pb-1">
              <EditableText
                value={m.title}
                onChange={(v) => update({ ...doc, meals: doc.meals.map((g) => (g.id === m.id ? { ...g, title: v } : g)) })}
                onBlur={persist}
                className="font-serif text-sm font-semibold uppercase tracking-wide text-primary"
              />
              <button
                type="button"
                onClick={() => commit({ ...doc, meals: doc.meals.filter((g) => g.id !== m.id) })}
                className="no-print text-muted-foreground opacity-0 hover:text-destructive group-hover/meal:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="mt-1.5 space-y-0.5">
              {m.items.map((it, i) => (
                <li key={i} className="group/it flex items-center gap-1">
                  <span className="text-muted-foreground">•</span>
                  <EditableText
                    value={it}
                    onChange={(v) =>
                      update({
                        ...doc,
                        meals: doc.meals.map((g) =>
                          g.id === m.id ? { ...g, items: g.items.map((x, idx) => (idx === i ? v : x)) } : g
                        ),
                      })
                    }
                    onBlur={persist}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      commit({
                        ...doc,
                        meals: doc.meals.map((g) =>
                          g.id === m.id ? { ...g, items: g.items.filter((_, idx) => idx !== i) } : g
                        ),
                      })
                    }
                    className="no-print text-muted-foreground opacity-0 hover:text-destructive group-hover/it:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                commit({
                  ...doc,
                  meals: doc.meals.map((g) => (g.id === m.id ? { ...g, items: [...g.items, ""] } : g)),
                })
              }
              className="no-print mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3" /> Add item
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => commit({ ...doc, meals: [...doc.meals, { id: uid("grp"), title: "New Section", items: [""] }] })}
        className="no-print flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" /> Add menu section
      </button>

      {/* Inclusions */}
      <SectionTitle>Service Inclusions</SectionTitle>
      <div className="grid gap-x-8 gap-y-1 py-4 sm:grid-cols-2">
        {doc.inclusions.map((inc, i) => (
          <div key={i} className="group/inc flex items-center gap-2">
            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
            <EditableText
              value={inc}
              onChange={(v) => setField({ inclusions: doc.inclusions.map((x, idx) => (idx === i ? v : x)) })}
              onBlur={persist}
            />
            <button
              type="button"
              onClick={() => commit({ ...doc, inclusions: doc.inclusions.filter((_, idx) => idx !== i) })}
              className="no-print text-muted-foreground opacity-0 hover:text-destructive group-hover/inc:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => commit({ ...doc, inclusions: [...doc.inclusions, ""] })}
        className="no-print flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" /> Add inclusion
      </button>

      {/* Notes */}
      <SectionTitle>Notes</SectionTitle>
      <EditableArea
        value={doc.notes}
        onChange={(v) => setField({ notes: v })}
        onBlur={persist}
        placeholder="Validity, payment terms, reminders…"
        className="py-3 text-sm text-zinc-700"
      />

      {/* Footer */}
      <div className="mt-6 border-t pt-4 text-center">
        <EditableText
          value={doc.footerContact}
          onChange={(v) => setField({ footerContact: v })}
          onBlur={persist}
          className="text-center text-xs text-muted-foreground"
        />
      </div>
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  onChange,
  onBlur,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="w-12 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <EditableText value={value} onChange={onChange} onBlur={onBlur} className="text-sm" />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 border-b pb-1 text-center font-serif text-sm font-semibold uppercase tracking-[0.2em] text-zinc-700">
      {children}
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}

function EditableTotal({
  charge,
  onLabel,
  onAmount,
  onBlur,
}: {
  charge: DocLine;
  onLabel: (v: string) => void;
  onAmount: (n: number) => void;
  onBlur: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <EditableText
        value={charge.description}
        onChange={onLabel}
        onBlur={onBlur}
        className="text-muted-foreground"
      />
      <EditableMoney value={charge.amount} onCommit={onAmount} className="w-28" />
    </div>
  );
}
