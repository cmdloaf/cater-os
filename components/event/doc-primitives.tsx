"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { useStore } from "@/lib/store";
import type { DocField, DocSection, EventRecord } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * Editable-document plumbing shared by the Quotation (and, later, Contract /
 * Event Order) documents. The fields are plain transparent inputs so the page
 * reads like a printed sheet and exports cleanly to PDF — add/remove controls
 * carry `no-print`.
 */

type DocKey = "quotation" | "contract" | "eventOrder";

/**
 * Local copy of a persisted document on the record, seeded lazily.
 * `update` mutates locally (live typing); `persist` flushes to the store
 * (call on blur); `commit` does both (structural edits, reset).
 */
export function usePersistedDoc<T>(
  record: EventRecord,
  key: DocKey,
  seed: (r: EventRecord) => T
) {
  const { updateEvent } = useStore();
  const [doc, setDoc] = useState<T>(
    () => (record[key] as T | undefined) ?? seed(record)
  );
  const ref = useRef(doc);
  ref.current = doc;

  // Re-seed when switching to a different event.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const next = (record[key] as T | undefined) ?? seed(record);
    setDoc(next);
    ref.current = next;
  }, [record.id]);

  const update = useCallback((next: T) => {
    setDoc(next);
    ref.current = next;
  }, []);

  const persist = useCallback(() => {
    updateEvent(record.id, { [key]: ref.current } as Partial<EventRecord>);
  }, [record.id, key, updateEvent]);

  const commit = useCallback(
    (next: T) => {
      setDoc(next);
      ref.current = next;
      updateEvent(record.id, { [key]: next } as Partial<EventRecord>);
    },
    [record.id, key, updateEvent]
  );

  return { doc, update, persist, commit };
}

/* ------------------------------ Inline fields ----------------------------- */

export function EditableText({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={cn(
        "w-full min-w-0 rounded-[2px] bg-transparent outline-none placeholder:text-muted-foreground/50 hover:bg-primary/5 focus:bg-primary/5",
        className
      )}
    />
  );
}

export function EditableArea({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow to fit content.
  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(resize, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      placeholder={placeholder}
      rows={1}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onBlur={onBlur}
      className={cn(
        "w-full resize-none overflow-hidden rounded-[2px] bg-transparent leading-relaxed outline-none placeholder:text-muted-foreground/50 hover:bg-primary/5 focus:bg-primary/5",
        className
      )}
    />
  );
}

export function EditableMoney({
  value,
  onCommit,
  className,
}: {
  value: number;
  onCommit: (n: number) => void;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <input
      inputMode="decimal"
      value={focused ? draft : formatCurrency(value)}
      onFocus={() => {
        setDraft(String(value));
        setFocused(true);
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const n = Number(draft.replace(/[^0-9.-]/g, "")) || 0;
        if (n !== value) onCommit(n);
      }}
      className={cn(
        "w-full rounded-[2px] bg-transparent text-right tabular-nums outline-none hover:bg-primary/5 focus:bg-primary/5",
        className
      )}
    />
  );
}

/* ----------------------------- Composite blocks --------------------------- */

const rid = () => Math.random().toString(36).slice(2, 8);

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="no-print flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function RemoveButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "no-print shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100",
        className
      )}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

/** Editable "label : value" rows (document header details). */
export function FieldTable({
  fields,
  onChange,
  onBlur,
  onStructural,
}: {
  fields: DocField[];
  onChange: (next: DocField[]) => void;
  onBlur: () => void;
  onStructural: (next: DocField[]) => void;
}) {
  const patch = (id: string, p: Partial<DocField>) =>
    fields.map((f) => (f.id === id ? { ...f, ...p } : f));
  return (
    <div className="space-y-1">
      {fields.map((f) => (
        <div key={f.id} className="group grid grid-cols-[13rem_auto_1fr] items-baseline gap-2">
          <EditableText
            value={f.label}
            onChange={(v) => onChange(patch(f.id, { label: v }))}
            onBlur={onBlur}
            className="text-muted-foreground"
          />
          <span className="text-muted-foreground">:</span>
          <div className="flex items-center gap-1">
            <EditableText
              value={f.value}
              onChange={(v) => onChange(patch(f.id, { value: v }))}
              onBlur={onBlur}
              className="font-medium"
            />
            <RemoveButton onClick={() => onStructural(fields.filter((x) => x.id !== f.id))} />
          </div>
        </div>
      ))}
      <AddButton
        label="Add row"
        onClick={() => onStructural([...fields, { id: rid(), label: "Label", value: "" }])}
      />
    </div>
  );
}

/** Editable headed paragraphs (contract terms, remarks). */
export function SectionList({
  sections,
  onChange,
  onBlur,
  onStructural,
}: {
  sections: DocSection[];
  onChange: (next: DocSection[]) => void;
  onBlur: () => void;
  onStructural: (next: DocSection[]) => void;
}) {
  const patch = (id: string, p: Partial<DocSection>) =>
    sections.map((s) => (s.id === id ? { ...s, ...p } : s));
  return (
    <div className="space-y-3">
      {sections.map((s) => (
        <div key={s.id} className="group">
          <div className="flex items-center gap-1">
            <EditableText
              value={s.heading}
              onChange={(v) => onChange(patch(s.id, { heading: v }))}
              onBlur={onBlur}
              className="text-sm font-semibold uppercase tracking-wide"
            />
            <RemoveButton onClick={() => onStructural(sections.filter((x) => x.id !== s.id))} />
          </div>
          <EditableArea
            value={s.body}
            onChange={(v) => onChange(patch(s.id, { body: v }))}
            onBlur={onBlur}
            className="text-sm text-zinc-700"
          />
        </div>
      ))}
      <AddButton
        label="Add clause"
        onClick={() =>
          onStructural([...sections, { id: rid(), heading: "New Clause", body: "" }])
        }
      />
    </div>
  );
}
