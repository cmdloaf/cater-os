"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  UploadCloud,
  Database,
  UtensilsCrossed,
  FileText,
  FileSignature,
  ClipboardList,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  FileType,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface UploadCard {
  id: string;
  title: string;
  desc: string;
  icon: typeof Database;
  accepts: string;
  detected: { label: string; count: number }[];
}

const CARDS: UploadCard[] = [
  {
    id: "packages",
    title: "Package Database",
    desc: "Your tiers, inclusions and per-head pricing.",
    icon: Database,
    accepts: "Excel, PDF",
    detected: [
      { label: "Packages Detected", count: 6 },
      { label: "Pricing Rules", count: 18 },
    ],
  },
  {
    id: "menu",
    title: "Menu Database",
    desc: "Dishes, categories and dietary tags.",
    icon: UtensilsCrossed,
    accepts: "Excel, Word, Images",
    detected: [
      { label: "Menu Items Detected", count: 142 },
      { label: "Categories", count: 9 },
    ],
  },
  {
    id: "quotations",
    title: "Previous Quotations",
    desc: "Historical quotes to learn your formatting.",
    icon: FileText,
    accepts: "PDF, Excel",
    detected: [
      { label: "Quotations Parsed", count: 37 },
      { label: "Add-ons Detected", count: 21 },
    ],
  },
  {
    id: "contracts",
    title: "Contract Templates",
    desc: "Terms, payment schedules and clauses.",
    icon: FileSignature,
    accepts: "Word, PDF",
    detected: [
      { label: "Templates Detected", count: 3 },
      { label: "Clause Blocks", count: 24 },
    ],
  },
  {
    id: "eventorders",
    title: "Event Order Templates",
    desc: "Operational briefs and setup sheets.",
    icon: ClipboardList,
    accepts: "Word, PDF, Excel",
    detected: [
      { label: "Templates Detected", count: 4 },
      { label: "Setup Checklists", count: 12 },
    ],
  },
];

const FILE_TYPES = [
  { label: "Excel", icon: FileSpreadsheet },
  { label: "PDF", icon: FileText },
  { label: "Word", icon: FileType },
  { label: "Images", icon: ImageIcon },
];

type CardState = "idle" | "uploaded";

export default function ImportPage() {
  const [states, setStates] = useState<Record<string, CardState>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const uploadedCards = CARDS.filter((c) => states[c.id] === "uploaded");
  const totals = uploadedCards
    .flatMap((c) => c.detected)
    .reduce(
      (acc, d) => {
        acc[d.label] = (acc[d.label] || 0) + d.count;
        return acc;
      },
      {} as Record<string, number>
    );

  function simulateUpload(id: string) {
    setStates((s) => ({ ...s, [id]: "uploaded" }));
    toast.success("File processed", {
      description: "We detected structured data — review it below.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import Data</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Onboard your catering business in minutes. Upload your existing files
          and Vero detects packages, menus, add-ons and templates
          automatically.
        </p>
      </div>

      {/* Accepted types */}
      <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
        <span className="text-sm font-medium">Accepted file types:</span>
        {FILE_TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <span
              key={t.label}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Icon className="h-4 w-4 text-primary" />
              {t.label}
            </span>
          );
        })}
      </Card>

      {/* Upload cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const uploaded = states[card.id] === "uploaded";
          return (
            <Card key={card.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                {uploaded && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Detected
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <div className="text-sm font-semibold">{card.title}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {card.desc}
                </p>
              </div>

              {!uploaded ? (
                <button
                  onClick={() => simulateUpload(card.id)}
                  className="mt-4 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed py-6 text-center transition-colors hover:border-primary hover:bg-accent/40"
                >
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Drag & drop or browse
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {card.accepts}
                  </span>
                </button>
              ) : (
                <div className="mt-4 space-y-2 rounded-lg bg-muted/50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Detected Data
                  </div>
                  {card.detected.map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-semibold">{d.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Review & confirm bar */}
      {uploadedCards.length > 0 && (
        <Card className="flex flex-col gap-4 border-primary/20 bg-accent/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="text-sm font-semibold">
              Detected across {uploadedCards.length} file
              {uploadedCards.length > 1 ? "s" : ""}:
            </div>
            {Object.entries(totals).map(([label, count]) => (
              <span key={label} className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{count}</span>{" "}
                {label.replace(" Detected", "").replace(" Parsed", "")}
              </span>
            ))}
          </div>
          <Button onClick={() => setConfirmOpen(true)}>
            Review & Confirm
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review detected data</DialogTitle>
            <DialogDescription>
              Confirm the records below to import them into your Vero
              workspace. You can edit everything afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border p-4">
            {Object.entries(totals).map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {label}
                </span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                toast.success("Data imported", {
                  description:
                    "Your packages, menus and templates are now available across Vero.",
                });
              }}
            >
              Confirm Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
