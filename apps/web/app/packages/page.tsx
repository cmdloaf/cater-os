"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { useCatalog } from "@/lib/catalog-store";
import type { PackageOption } from "@/lib/catalog";
import type { PackageTier } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const TIERS: PackageTier[] = ["Silver", "Gold", "Platinum", "Custom"];
const EMPTY: PackageOption = { tier: "Gold", name: "", perHead: 0, blurb: "" };

export default function PackagesPage() {
  const { packages, savePackage, deletePackage } = useCatalog();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<PackageOption>(EMPTY);

  function openNew() {
    setIndex(null);
    setDraft(EMPTY);
    setOpen(true);
  }
  function openEdit(i: number) {
    setIndex(i);
    setDraft(packages[i]);
    setOpen(true);
  }
  function save() {
    if (!draft.name.trim()) {
      toast.error("Package name is required");
      return;
    }
    savePackage(draft, index);
    setOpen(false);
    toast.success(index === null ? "Package added" : "Package updated");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Packages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tiers and per-head pricing offered to clients.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> New Package
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p, i) => (
          <Card key={`${p.name}-${i}`} className="flex flex-col p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(i)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deletePackage(i);
                    toast.success("Package deleted");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 text-sm font-semibold">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.tier} tier</div>
            <div className="mt-2 text-lg font-semibold text-primary">
              {formatCurrency(p.perHead)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / pax
              </span>
            </div>
            <p className="mt-2 text-xs leading-snug text-muted-foreground">
              {p.blurb}
            </p>
          </Card>
        ))}
        {packages.length === 0 && (
          <EmptyState
            icon={Package}
            title="No packages yet"
            description="Create a package tier to offer clients during the create-event flow."
            action={{ label: "New Package", onClick: openNew }}
            className="col-span-full"
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {index === null ? "New Package" : "Edit Package"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select
                  value={draft.tier}
                  onValueChange={(v) =>
                    setDraft({ ...draft, tier: v as PackageTier })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIERS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price Per Head</Label>
                <Input
                  type="number"
                  value={draft.perHead}
                  onChange={(e) =>
                    setDraft({ ...draft, perHead: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Package Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Gold Buffet Package"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={draft.blurb}
                onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
                placeholder="What's included…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
