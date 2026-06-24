"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Printer,
  Users,
  Clock,
  Boxes,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { deriveOperations } from "@/lib/documents";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OperationsTab({ record }: { record: EventRecord }) {
  const plan = useMemo(() => deriveOperations(record), [record]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const doneCount = Object.values(checked).filter(Boolean).length;
  const pct = plan.checklist.length
    ? Math.round((doneCount / plan.checklist.length) * 100)
    : 0;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof plan.checklist>();
    for (const item of plan.checklist) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return Array.from(map.entries());
  }, [plan.checklist]);

  function exportChecklist() {
    const lines = [
      `CaterOS Operations Checklist`,
      `Event: ${record.eventName}`,
      `Date: ${record.event.eventDate} · ${record.event.pax} pax · ${record.event.serviceStyle}`,
      ``,
      `EQUIPMENT & SETUP`,
      ...plan.checklist.map((c) => `[ ] ${c.label} — ${c.qty}`),
      ``,
      `STAFF REQUIREMENTS`,
      ...plan.staff.map((s) => `- ${s.count} ${s.role}`),
      ``,
      `SETUP TIMELINE`,
      ...plan.timeline.map((t) => `- ${t.phase} (${t.time}): ${t.note}`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ops-checklist-${record.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Checklist exported");
  }

  return (
    <div className="space-y-6">
      <Card className="no-print flex flex-col gap-4 border-primary/20 bg-accent/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">
              Auto-generated from the Event Record
            </div>
            <p className="text-sm text-muted-foreground">
              Quantities scale with {record.event.pax} pax and{" "}
              {record.event.serviceStyle.toLowerCase()} service. Change the pax
              and this updates automatically.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportChecklist}>
            <Download className="h-4 w-4" /> Export Checklist
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print Checklist
          </Button>
        </div>
      </Card>

      <div className="print-area space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Checklist */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Equipment & Setup Checklist</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {doneCount}/{plan.checklist.length} done
              </span>
            </div>
            <div className="px-5 pb-2 pt-4">
              <Progress value={pct} className="no-print" />
            </div>
            <div className="space-y-5 px-5 py-4">
              {grouped.map(([category, items]) => (
                <div key={category}>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {category}
                  </div>
                  <ul className="space-y-1">
                    {items.map((item) => {
                      const key = item.label;
                      const isChecked = !!checked[key];
                      return (
                        <li key={key}>
                          <label className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
                            <span className="flex items-center gap-3">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(v) =>
                                  setChecked((c) => ({ ...c, [key]: !!v }))
                                }
                              />
                              <span
                                className={cn(
                                  "text-sm",
                                  isChecked &&
                                    "text-muted-foreground line-through"
                                )}
                              >
                                {item.label}
                              </span>
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                              {item.qty}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          {/* Staff */}
          <Card className="h-fit">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Staff Requirements</h3>
            </div>
            <ul className="divide-y px-5">
              {plan.staff.map((s) => (
                <li
                  key={s.role}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm">{s.role}</span>
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-accent px-2 text-sm font-semibold text-accent-foreground">
                    {s.count}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t px-5 py-3 text-xs text-muted-foreground">
              Total crew:{" "}
              <span className="font-semibold text-foreground">
                {plan.staff.reduce((sum, s) => sum + s.count, 0)} staff
              </span>
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <div className="flex items-center gap-2 border-b px-5 py-3">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Setup Timeline</h3>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-4">
            {plan.timeline.map((t) => (
              <div key={t.phase} className="bg-card p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t.phase}
                </div>
                <div className="mt-1 text-sm font-medium">{t.time}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t.note}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
