"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useStore } from "@/lib/store";
import type { EventRecord } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * Editable-document plumbing shared by the Quotation (and, later, Contract /
 * Event Order) documents. The fields are plain transparent inputs so the page
 * reads like a printed sheet and exports cleanly to PDF — add/remove controls
 * carry `no-print`.
 */

type DocKey = "quotation"; // widened in later passes (contract, eventOrder)

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
