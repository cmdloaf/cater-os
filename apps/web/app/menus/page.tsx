"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { useCatalog } from "@/lib/catalog-store";
import type { MenuSet } from "@/lib/catalog";
import type { MenuItem } from "@/lib/types";

function emptyMenu(): MenuSet {
  return { id: `menu-${Date.now().toString(36)}`, label: "", items: [] };
}

export default function MenusPage() {
  const { menuSets, saveMenuSet, deleteMenuSet } = useCatalog();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<MenuSet>(emptyMenu());

  function openNew() {
    setIndex(null);
    setDraft(emptyMenu());
    setOpen(true);
  }
  function openEdit(i: number) {
    setIndex(i);
    setDraft(menuSets[i]);
    setOpen(true);
  }
  function setItems(items: MenuItem[]) {
    setDraft((d) => ({ ...d, items }));
  }
  function save() {
    if (!draft.label.trim()) {
      toast.error("Menu name is required");
      return;
    }
    saveMenuSet(draft, index);
    setOpen(false);
    toast.success(index === null ? "Menu added" : "Menu updated");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Menus</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preset menu sets used when building an event&rsquo;s catering.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> New Menu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {menuSets.map((m, i) => (
          <Card key={m.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold">{m.label}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(i)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteMenuSet(i);
                    toast.success("Menu deleted");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ul className="mt-3 divide-y">
              {m.items.map((item, j) => (
                <li key={j} className="flex items-center gap-3 py-1.5">
                  <span className="w-24 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                    {item.category}
                  </span>
                  <span className="text-sm">{item.name}</span>
                </li>
              ))}
              {m.items.length === 0 && (
                <li className="py-1.5 text-sm text-muted-foreground">
                  No items.
                </li>
              )}
            </ul>
          </Card>
        ))}
        {menuSets.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            title="No menus yet"
            description="Build a menu set to reuse across events instead of re-entering dishes each time."
            action={{ label: "New Menu", onClick: openNew }}
            className="md:col-span-2"
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {index === null ? "New Menu" : "Edit Menu"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Menu Name</Label>
              <Input
                value={draft.label}
                onChange={(e) =>
                  setDraft({ ...draft, label: e.target.value })
                }
                placeholder="e.g. International Buffet"
              />
            </div>
            <div className="space-y-2">
              <Label>Items</Label>
              <div className="space-y-2">
                {draft.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      className="w-32"
                      value={item.category}
                      placeholder="Course"
                      onChange={(e) => {
                        const next = [...draft.items];
                        next[i] = { ...item, category: e.target.value };
                        setItems(next);
                      }}
                    />
                    <Input
                      value={item.name}
                      placeholder="Dish"
                      onChange={(e) => {
                        const next = [...draft.items];
                        next[i] = { ...item, name: e.target.value };
                        setItems(next);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setItems(draft.items.filter((_, idx) => idx !== i))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setItems([...draft.items, { category: "Main", name: "" }])
                  }
                >
                  <Plus className="h-4 w-4" /> Add item
                </Button>
              </div>
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
