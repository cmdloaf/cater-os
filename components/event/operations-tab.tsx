"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChefHat,
  Boxes,
  PlusCircle,
  Star,
  Plus,
  Trash2,
  CheckCheck,
  Pencil,
  RotateCcw,
  Printer,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { seedOperations } from "@/lib/documents";
import type { EventRecord, OperationsChecklist, OpsItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type SectionKey = Exclude<keyof OperationsChecklist, "notes">;

interface SectionConfig {
  key: SectionKey;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  withMeta: boolean;
  metaPlaceholder?: string;
}

const SECTIONS: SectionConfig[] = [
  {
    key: "foodPrep",
    title: "Food Preparation",
    subtitle: "Generated from Selected Menu",
    icon: ChefHat,
    withMeta: false,
  },
  {
    key: "equipment",
    title: "Equipment Checklist",
    subtitle: "Generated from Package + Add-ons",
    icon: Boxes,
    withMeta: true,
    metaPlaceholder: "Qty",
  },
  {
    key: "addons",
    title: "Add-ons",
    subtitle: "Generated from Add-ons",
    icon: PlusCircle,
    withMeta: false,
  },
];

const CHECKABLE: SectionKey[] = ["foodPrep", "equipment", "addons"];

function uid() {
  return `ops-${Math.random().toString(36).slice(2, 8)}`;
}

export function OperationsTab({ record }: { record: EventRecord }) {
  const { updateEvent } = useStore();
  const [ops, setOps] = useState<OperationsChecklist>(
    () => record.operations ?? seedOperations(record)
  );
  const [editing, setEditing] = useState(false);

  // Re-seed local state when switching to a different event.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setOps(record.operations ?? seedOperations(record));
  }, [record.id]);

  function commit(next: OperationsChecklist) {
    setOps(next);
    updateEvent(record.id, { operations: next });
  }

  function setSection(key: SectionKey, items: OpsItem[]) {
    commit({ ...ops, [key]: items });
  }
  function toggle(key: SectionKey, id: string) {
    setSection(
      key,
      ops[key].map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  }
  function editItem(key: SectionKey, id: string, patch: Partial<OpsItem>) {
    setSection(
      key,
      ops[key].map((i) => (i.id === id ? { ...i, ...patch } : i))
    );
  }
  function removeItem(key: SectionKey, id: string) {
    setSection(
      key,
      ops[key].filter((i) => i.id !== id)
    );
  }
  function addItem(key: SectionKey) {
    setSection(key, [...ops[key], { id: uid(), label: "", meta: "", done: false }]);
  }

  function markAll() {
    const next = { ...ops };
    for (const k of CHECKABLE) next[k] = ops[k].map((i) => ({ ...i, done: true }));
    commit(next);
  }
  function reset() {
    commit(seedOperations(record));
    setEditing(false);
  }

  const { done, total } = useMemo(() => {
    const items = CHECKABLE.flatMap((k) => ops[k]);
    return { done: items.filter((i) => i.done).length, total: items.length };
  }, [ops]);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const requests = (record.commercial.specialRequests || "")
    .split(/\n|\.(?:\s|$)/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header / controls */}
      <Card className="no-print flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Operations Checklist</h3>
            <span className="text-xs text-muted-foreground">
              {done}/{total} done
            </span>
          </div>
          <Progress value={pct} className="mt-2 max-w-md" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={markAll}>
            <CheckCheck className="h-4 w-4" /> Mark All Complete
          </Button>
          <Button
            variant={editing ? "default" : "outline"}
            size="sm"
            onClick={() => setEditing((e) => !e)}
          >
            <Pencil className="h-4 w-4" /> {editing ? "Done Editing" : "Edit Checklist"}
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </Card>

      {/* Section cards — masonry columns */}
      <div className="print-area gap-6 space-y-6 lg:columns-3 [&>*]:break-inside-avoid">
        {SECTIONS.map((cfg) => {
          const Icon = cfg.icon;
          const items = ops[cfg.key];
          return (
            <Card key={cfg.key} className="overflow-hidden">
              <SectionHeader icon={Icon} title={cfg.title} subtitle={cfg.subtitle} />
              <div className="px-3 py-2">
                <ul className="space-y-0.5">
                  {items.map((item) =>
                    editing ? (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 px-2 py-1"
                      >
                        <Input
                          value={item.label}
                          onChange={(e) =>
                            editItem(cfg.key, item.id, { label: e.target.value })
                          }
                          placeholder="Item"
                          className="h-8"
                        />
                        {cfg.withMeta && (
                          <Input
                            value={item.meta ?? ""}
                            onChange={(e) =>
                              editItem(cfg.key, item.id, { meta: e.target.value })
                            }
                            placeholder={cfg.metaPlaceholder}
                            className="h-8 w-24 shrink-0"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => removeItem(cfg.key, item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ) : (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                          <span className="flex items-center gap-3">
                            <Checkbox
                              checked={item.done}
                              onCheckedChange={() => toggle(cfg.key, item.id)}
                            />
                            <span
                              className={cn(
                                "text-sm",
                                item.done && "text-muted-foreground line-through"
                              )}
                            >
                              {item.label || (
                                <span className="italic text-muted-foreground">
                                  Untitled
                                </span>
                              )}
                            </span>
                          </span>
                          {item.meta && (
                            <span className="shrink-0 text-sm font-medium text-muted-foreground">
                              {item.meta}
                            </span>
                          )}
                        </label>
                      </li>
                    )
                  )}
                  {items.length === 0 && (
                    <li className="px-2 py-1.5 text-sm text-muted-foreground">
                      Nothing here yet.
                    </li>
                  )}
                </ul>
                {editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => addItem(cfg.key)}
                  >
                    <Plus className="h-4 w-4" /> Add item
                  </Button>
                )}
              </div>
            </Card>
          );
        })}

        {/* Special Requests — read-only, from the Event Record */}
        <Card className="overflow-hidden">
          <SectionHeader
            icon={Star}
            title="Special Requests"
            subtitle="Generated from Special Requests"
          />
          <div className="px-5 py-3">
            {requests.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {requests.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No special requests noted.
              </p>
            )}
          </div>
        </Card>
      </div>

      <p className="no-print flex items-center gap-1.5 text-xs text-muted-foreground">
        This checklist is seeded from the Event Record and your edits are saved to
        this event. Use <span className="font-medium">Reset</span> to regenerate
        the auto-derived version.
      </p>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-2 border-b px-5 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
