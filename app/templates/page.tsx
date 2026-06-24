"use client";

import { toast } from "sonner";
import {
  FileText,
  FileSignature,
  ClipboardList,
  ListChecks,
  Plus,
  Star,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Template {
  name: string;
  type: string;
  desc: string;
  icon: typeof FileText;
  accent: string;
  usage: number;
  default?: boolean;
}

const TEMPLATES: Template[] = [
  {
    name: "Standard Quotation",
    type: "Quotation",
    desc: "Clean itemized quote with pricing breakdown, SC & VAT.",
    icon: FileText,
    accent: "text-blue-600 bg-blue-50",
    usage: 124,
    default: true,
  },
  {
    name: "Premium Quotation",
    type: "Quotation",
    desc: "Styled quote for weddings & galas with menu photography.",
    icon: FileText,
    accent: "text-blue-600 bg-blue-50",
    usage: 41,
  },
  {
    name: "Standard Service Contract",
    type: "Contract",
    desc: "Payment terms, reservation fee and standard T&Cs.",
    icon: FileSignature,
    accent: "text-violet-600 bg-violet-50",
    usage: 98,
    default: true,
  },
  {
    name: "Corporate Contract",
    type: "Contract",
    desc: "PO-friendly terms with NET-30 billing clauses.",
    icon: FileSignature,
    accent: "text-violet-600 bg-violet-50",
    usage: 33,
  },
  {
    name: "Event Order Brief",
    type: "Event Order",
    desc: "Operational sheet: setup, ingress/egress, staff notes.",
    icon: ClipboardList,
    accent: "text-amber-600 bg-amber-50",
    usage: 76,
    default: true,
  },
  {
    name: "Operations Checklist",
    type: "Operations",
    desc: "Equipment, staffing and timeline scaled by pax.",
    icon: ListChecks,
    accent: "text-emerald-600 bg-emerald-50",
    usage: 76,
    default: true,
  },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable document templates. Every event picks up your defaults
            automatically.
          </p>
        </div>
        <Button onClick={() => toast.info("Template builder coming soon")}>
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.name} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    t.accent
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {t.default && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    Default
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex-1">
                <div className="text-sm font-semibold">{t.name}</div>
                <Badge variant="outline" className="mt-1.5">
                  {t.type}
                </Badge>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">
                  {t.desc}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  Used in {t.usage} events
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.info(`Editing “${t.name}”`)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
