"use client";

import { toast } from "sonner";
import { Plus, Trash2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DocLine, EventRecord } from "@/lib/types";
import { seedContract } from "@/lib/documents";
import { cn, formatCurrency } from "@/lib/utils";
import {
  usePersistedDoc,
  EditableText,
  EditableArea,
  EditableMoney,
  FieldTable,
  SectionList,
} from "./doc-primitives";

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function ContractDocument({ record }: { record: EventRecord }) {
  const { doc, update, persist, commit } = usePersistedDoc(
    record,
    "contract",
    seedContract
  );

  const lineItems = doc.figures.filter((c) => c.kind === "line");
  const service = doc.figures.find((c) => c.kind === "service");
  const vat = doc.figures.find((c) => c.kind === "vat");
  const discount = doc.figures.find((c) => c.kind === "discount");
  const subtotal = lineItems.reduce((s, c) => s + c.amount, 0);
  const total =
    subtotal + (service?.amount ?? 0) + (vat?.amount ?? 0) + (discount?.amount ?? 0);
  const balance = total - record.reservationFee;

  const patchFigure = (id: string, patch: Partial<DocLine>) =>
    doc.figures.map((c) => (c.id === id ? { ...c, ...patch } : c));

  function resetToEvent() {
    commit(seedContract(record));
    toast.success("Contract reset", {
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

      <div className="print-area mx-auto max-w-3xl border bg-white p-8 text-sm text-zinc-800 shadow-sm sm:p-10">
        {/* Title */}
        <div className="text-center font-serif text-2xl font-semibold tracking-[0.15em] text-zinc-900">
          {doc.title}
        </div>
        <EditableArea
          value={doc.intro}
          onChange={(v) => update({ ...doc, intro: v })}
          onBlur={persist}
          className="mt-4 text-sm leading-relaxed text-zinc-700"
        />

        {/* Event details */}
        <div className="mt-6">
          <FieldTable
            fields={doc.fields}
            onChange={(next) => update({ ...doc, fields: next })}
            onBlur={persist}
            onStructural={(next) => commit({ ...doc, fields: next })}
          />
        </div>

        {/* Figures */}
        <SectionTitle>Contract Amount</SectionTitle>
        <div className="divide-y">
          {lineItems.map((c) => (
            <div key={c.id} className="group grid grid-cols-[1fr_8rem] items-start gap-3 px-1 py-2">
              <div className="min-w-0">
                <EditableText
                  value={c.description}
                  onChange={(v) => update({ ...doc, figures: patchFigure(c.id, { description: v }) })}
                  onBlur={persist}
                  className="font-medium"
                />
                {c.detail !== undefined && (
                  <EditableText
                    value={c.detail}
                    onChange={(v) => update({ ...doc, figures: patchFigure(c.id, { detail: v }) })}
                    onBlur={persist}
                    className="text-xs text-muted-foreground"
                  />
                )}
              </div>
              <div className="flex items-center justify-end gap-1">
                <EditableMoney
                  value={c.amount}
                  onCommit={(n) => commit({ ...doc, figures: patchFigure(c.id, { amount: n }) })}
                  className="font-medium"
                />
                <button
                  type="button"
                  onClick={() => commit({ ...doc, figures: doc.figures.filter((x) => x.id !== c.id) })}
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
            commit({ ...doc, figures: [...doc.figures, { id: uid("ln"), description: "New item", amount: 0, kind: "line" }] })
          }
          className="no-print mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add line item
        </button>

        <div className="mt-4 ml-auto max-w-xs space-y-1.5">
          {service && <FigureTotal charge={service} doc={doc} update={update} persist={persist} commit={commit} />}
          {vat && <FigureTotal charge={vat} doc={doc} update={update} persist={persist} commit={commit} />}
          {discount && <FigureTotal charge={discount} doc={doc} update={update} persist={persist} commit={commit} />}
        </div>
        <div className="mt-3 flex items-center justify-between bg-primary/10 px-4 py-3">
          <span className="font-serif text-base font-semibold">TOTAL PAYABLE</span>
          <span className="font-serif text-xl font-semibold text-primary">{formatCurrency(total)}</span>
        </div>
        <div className="mt-1.5 ml-auto max-w-xs space-y-0.5 text-xs text-muted-foreground">
          <div className="flex justify-between"><span>Reservation Fee</span><span className="tabular-nums">{formatCurrency(record.reservationFee)}</span></div>
          <div className="flex justify-between"><span>Balance Due</span><span className="tabular-nums">{formatCurrency(balance)}</span></div>
        </div>

        {/* Inclusions */}
        <SectionTitle>Package Inclusions</SectionTitle>
        <div className="grid gap-6 py-4 sm:grid-cols-2">
          {doc.inclusions.map((g) => (
            <div key={g.id} className="group/grp">
              <div className="flex items-center gap-1 border-b pb-1">
                <EditableText
                  value={g.title}
                  onChange={(v) => update({ ...doc, inclusions: doc.inclusions.map((x) => (x.id === g.id ? { ...x, title: v } : x)) })}
                  onBlur={persist}
                  className="text-sm font-semibold uppercase tracking-wide text-primary"
                />
                <button
                  type="button"
                  onClick={() => commit({ ...doc, inclusions: doc.inclusions.filter((x) => x.id !== g.id) })}
                  className="no-print text-muted-foreground opacity-0 hover:text-destructive group-hover/grp:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <ul className="mt-1.5 space-y-0.5">
                {g.items.map((it, i) => (
                  <li key={i} className="group/it flex items-center gap-1">
                    <span className="text-muted-foreground">•</span>
                    <EditableText
                      value={it}
                      onChange={(v) =>
                        update({ ...doc, inclusions: doc.inclusions.map((x) => (x.id === g.id ? { ...x, items: x.items.map((y, idx) => (idx === i ? v : y)) } : x)) })
                      }
                      onBlur={persist}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        commit({ ...doc, inclusions: doc.inclusions.map((x) => (x.id === g.id ? { ...x, items: x.items.filter((_, idx) => idx !== i) } : x)) })
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
                  commit({ ...doc, inclusions: doc.inclusions.map((x) => (x.id === g.id ? { ...x, items: [...x.items, ""] } : x)) })
                }
                className="no-print mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add item
              </button>
            </div>
          ))}
        </div>

        {/* Terms */}
        <SectionTitle>Terms &amp; Conditions</SectionTitle>
        <div className="py-4">
          <SectionList
            sections={doc.terms}
            onChange={(next) => update({ ...doc, terms: next })}
            onBlur={persist}
            onStructural={(next) => commit({ ...doc, terms: next })}
          />
        </div>

        {/* Payment schedule */}
        <SectionTitle>Payment Schedule</SectionTitle>
        <div className="py-4">
          <div className="grid grid-cols-[1fr_10rem_8rem] gap-2 border-b pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Payment Terms</span>
            <span>Due Date</span>
            <span className="text-right">Amount</span>
          </div>
          {doc.paymentSchedule.map((p) => (
            <div key={p.id} className="group grid grid-cols-[1fr_10rem_8rem] items-center gap-2 py-1.5">
              <EditableText
                value={p.description}
                onChange={(v) => update({ ...doc, paymentSchedule: doc.paymentSchedule.map((x) => (x.id === p.id ? { ...x, description: v } : x)) })}
                onBlur={persist}
              />
              <EditableText
                value={p.detail ?? ""}
                onChange={(v) => update({ ...doc, paymentSchedule: doc.paymentSchedule.map((x) => (x.id === p.id ? { ...x, detail: v } : x)) })}
                onBlur={persist}
                className="text-muted-foreground"
              />
              <div className="flex items-center justify-end gap-1">
                <EditableMoney
                  value={p.amount}
                  onCommit={(n) => commit({ ...doc, paymentSchedule: doc.paymentSchedule.map((x) => (x.id === p.id ? { ...x, amount: n } : x)) })}
                />
                <button
                  type="button"
                  onClick={() => commit({ ...doc, paymentSchedule: doc.paymentSchedule.filter((x) => x.id !== p.id) })}
                  className="no-print text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => commit({ ...doc, paymentSchedule: [...doc.paymentSchedule, { id: uid("ps"), description: "Payment", detail: "", amount: 0, kind: "line" }] })}
            className="no-print mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add payment row
          </button>
        </div>

        {/* Signatories */}
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {doc.signatories.map((s) => (
            <div key={s.id}>
              <EditableText
                value={s.value}
                onChange={(v) => update({ ...doc, signatories: doc.signatories.map((x) => (x.id === s.id ? { ...x, value: v } : x)) })}
                onBlur={persist}
                placeholder="Signatory name"
                className="border-b border-dashed pb-1 font-medium"
              />
              <EditableText
                value={s.label}
                onChange={(v) => update({ ...doc, signatories: doc.signatories.map((x) => (x.id === s.id ? { ...x, label: v } : x)) })}
                onBlur={persist}
                className="mt-1 text-xs text-muted-foreground"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 border-t pt-4 text-center">
          <EditableText
            value={doc.footerContact}
            onChange={(v) => update({ ...doc, footerContact: v })}
            onBlur={persist}
            className="text-center text-xs text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 border-b pb-1 font-serif text-sm font-semibold uppercase tracking-[0.15em] text-zinc-700">
      {children}
    </div>
  );
}

function FigureTotal({
  charge,
  doc,
  update,
  persist,
  commit,
}: {
  charge: DocLine;
  doc: import("@/lib/types").ContractDoc;
  update: (d: import("@/lib/types").ContractDoc) => void;
  persist: () => void;
  commit: (d: import("@/lib/types").ContractDoc) => void;
}) {
  const patch = (p: Partial<DocLine>) =>
    doc.figures.map((c) => (c.id === charge.id ? { ...c, ...p } : c));
  return (
    <div className="flex items-center justify-between gap-2">
      <EditableText
        value={charge.description}
        onChange={(v) => update({ ...doc, figures: patch({ description: v }) })}
        onBlur={persist}
        className="text-muted-foreground"
      />
      <EditableMoney
        value={charge.amount}
        onCommit={(n) => commit({ ...doc, figures: patch({ amount: n }) })}
        className="w-28"
      />
    </div>
  );
}
