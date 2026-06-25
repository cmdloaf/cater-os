"use client";

import { toast } from "sonner";
import { Plus, Trash2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DocLine, EventRecord } from "@/lib/types";
import { seedEventOrder } from "@/lib/documents";
import { formatCurrency } from "@/lib/utils";
import {
  usePersistedDoc,
  EditableText,
  EditableMoney,
  FieldTable,
} from "./doc-primitives";

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function EventOrderDocument({ record }: { record: EventRecord }) {
  const { doc, update, persist, commit } = usePersistedDoc(
    record,
    "eventOrder",
    seedEventOrder
  );

  // Totals math shared with the other documents (by `kind`).
  const all = [...doc.particulars, ...doc.totals];
  const subtotal = all.filter((c) => c.kind === "line").reduce((s, c) => s + c.amount, 0);
  const service = doc.totals.find((c) => c.kind === "service");
  const vat = doc.totals.find((c) => c.kind === "vat");
  const discount = doc.totals.find((c) => c.kind === "discount");
  const total =
    subtotal + (service?.amount ?? 0) + (vat?.amount ?? 0) + (discount?.amount ?? 0);
  const balance = total - record.reservationFee;

  const patchParticular = (id: string, p: Partial<DocLine>) =>
    doc.particulars.map((c) => (c.id === id ? { ...c, ...p } : c));

  function resetToEvent() {
    commit(seedEventOrder(record));
    toast.success("Event Order reset", {
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

        {/* Header fields */}
        <div className="mt-6">
          <FieldTable
            fields={doc.fields}
            onChange={(next) => update({ ...doc, fields: next })}
            onBlur={persist}
            onStructural={(next) => commit({ ...doc, fields: next })}
          />
        </div>

        {/* Remarks */}
        <SectionTitle>Remarks</SectionTitle>
        <ul className="space-y-0.5 py-3">
          {doc.remarks.map((r, i) => (
            <li key={i} className="group flex items-center gap-1">
              <span className="text-muted-foreground">•</span>
              <EditableText
                value={r}
                onChange={(v) => update({ ...doc, remarks: doc.remarks.map((x, idx) => (idx === i ? v : x)) })}
                onBlur={persist}
              />
              <button
                type="button"
                onClick={() => commit({ ...doc, remarks: doc.remarks.filter((_, idx) => idx !== i) })}
                className="no-print text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => commit({ ...doc, remarks: [...doc.remarks, ""] })}
          className="no-print flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add remark
        </button>

        {/* Particulars */}
        <SectionTitle>Particulars</SectionTitle>
        <div className="grid grid-cols-[1fr_8rem] bg-zinc-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white">
          <span>Particulars</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="divide-y">
          {doc.particulars.map((c) => (
            <div key={c.id} className="group grid grid-cols-[1fr_8rem] items-start gap-3 px-2 py-2">
              <div className="min-w-0">
                <EditableText
                  value={c.description}
                  onChange={(v) => update({ ...doc, particulars: patchParticular(c.id, { description: v }) })}
                  onBlur={persist}
                  className="font-medium"
                />
                {c.detail !== undefined && (
                  <EditableText
                    value={c.detail}
                    onChange={(v) => update({ ...doc, particulars: patchParticular(c.id, { detail: v }) })}
                    onBlur={persist}
                    className="text-xs text-muted-foreground"
                  />
                )}
              </div>
              <div className="flex items-center justify-end gap-1">
                <EditableMoney
                  value={c.amount}
                  onCommit={(n) => commit({ ...doc, particulars: patchParticular(c.id, { amount: n }) })}
                  className="font-medium"
                />
                <button
                  type="button"
                  onClick={() => commit({ ...doc, particulars: doc.particulars.filter((x) => x.id !== c.id) })}
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
            commit({ ...doc, particulars: [...doc.particulars, { id: uid("ln"), description: "New item", amount: 0, kind: "line" }] })
          }
          className="no-print mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add particular
        </button>

        {/* Totals */}
        <div className="mt-5 ml-auto max-w-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          {doc.totals
            .filter((t) => t.kind !== "line")
            .concat(doc.totals.filter((t) => t.kind === "line"))
            .map((t) => (
              <TotalRow
                key={t.id}
                charge={t}
                onLabel={(v) => update({ ...doc, totals: doc.totals.map((x) => (x.id === t.id ? { ...x, description: v } : x)) })}
                onAmount={(n) => commit({ ...doc, totals: doc.totals.map((x) => (x.id === t.id ? { ...x, amount: n } : x)) })}
                onBlur={persist}
              />
            ))}
        </div>
        <div className="mt-3 flex items-center justify-between bg-primary/10 px-4 py-3">
          <span className="font-serif text-base font-semibold">TOTAL BILL</span>
          <span className="font-serif text-xl font-semibold text-primary">{formatCurrency(total)}</span>
        </div>
        <div className="mt-1.5 ml-auto max-w-xs space-y-0.5 text-xs text-muted-foreground">
          <div className="flex justify-between"><span>Downpayment</span><span className="tabular-nums">{formatCurrency(record.reservationFee)}</span></div>
          <div className="flex justify-between font-medium text-foreground"><span>Remaining Balance</span><span className="tabular-nums">{formatCurrency(balance)}</span></div>
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

function TotalRow({
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
      <EditableText value={charge.description} onChange={onLabel} onBlur={onBlur} className="text-muted-foreground" />
      <EditableMoney value={charge.amount} onCommit={onAmount} className="w-28" />
    </div>
  );
}
