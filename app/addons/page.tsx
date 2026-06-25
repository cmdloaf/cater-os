"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCatalog } from "@/lib/catalog-store";
import type { AddOn } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const EMPTY: AddOn = { name: "", price: 0 };

export default function AddOnsPage() {
  const { addOns, saveAddOn, deleteAddOn } = useCatalog();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<AddOn>(EMPTY);

  function openNew() {
    setIndex(null);
    setDraft(EMPTY);
    setOpen(true);
  }
  function openEdit(i: number) {
    setIndex(i);
    setDraft(addOns[i]);
    setOpen(true);
  }
  function save() {
    if (!draft.name.trim()) {
      toast.error("Add-on name is required");
      return;
    }
    saveAddOn(draft, index);
    setOpen(false);
    toast.success(index === null ? "Add-on added" : "Add-on updated");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add-ons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional stations and services priced per booking.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> New Add-on
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Add-on</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addOns.map((a, i) => (
              <TableRow key={`${a.name}-${i}`} className="hover:bg-transparent">
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(a.price)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(i)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        deleteAddOn(i);
                        toast.success("Add-on deleted");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {addOns.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={3}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No add-ons yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {index === null ? "New Add-on" : "Edit Add-on"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Coffee Station"
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={draft.price}
                onChange={(e) =>
                  setDraft({ ...draft, price: Number(e.target.value) || 0 })
                }
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
