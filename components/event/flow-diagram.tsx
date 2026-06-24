import {
  FileText,
  FileSignature,
  ClipboardList,
  ListChecks,
  Database,
  ArrowDown,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NODES = [
  {
    label: "Event Record",
    sub: "Single source of truth",
    icon: Database,
    root: true,
  },
  { label: "Quotation", sub: "Pricing & menu", icon: FileText },
  { label: "Contract", sub: "Terms & payment", icon: FileSignature },
  { label: "Event Order", sub: "Operational brief", icon: ClipboardList },
  {
    label: "Operations Checklist",
    sub: "Setup, staff & timeline",
    icon: ListChecks,
  },
];

/** Vertical "one record → many documents" architecture visualization. */
export function FlowDiagram({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {NODES.map((node, i) => {
        const Icon = node.icon;
        return (
          <div key={node.label}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3",
                node.root
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-white"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                  node.root
                    ? "bg-white/20 text-white"
                    : "bg-accent text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">{node.label}</div>
                <div
                  className={cn(
                    "text-xs",
                    node.root
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {node.sub}
                </div>
              </div>
            </div>
            {i < NODES.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="h-4 w-4 text-zinc-300" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
