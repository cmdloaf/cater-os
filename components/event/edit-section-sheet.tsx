"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { ADDON_CATALOG, EVENT_TYPES, SERVICE_STYLES } from "@/lib/catalog";
import type {
  AddOn,
  EventRecord,
  MenuItem,
  PackageTier,
  ServiceStyle,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export type EditSection =
  | "client"
  | "event"
  | "package"
  | "menu"
  | "addons"
  | "special"
  | "order";

const TITLES: Record<EditSection, { title: string; desc: string }> = {
  client: {
    title: "Edit Client Information",
    desc: "Updates the client block on the quotation & contract.",
  },
  event: {
    title: "Edit Event Information",
    desc: "Updates every document plus the operations checklist & timeline.",
  },
  package: {
    title: "Edit Package & Pricing",
    desc: "Recalculates the quotation, contract amounts and dashboard totals.",
  },
  menu: {
    title: "Edit Menu",
    desc: "Updates the menu shown on the quotation and event order.",
  },
  addons: {
    title: "Edit Add-ons",
    desc: "Add-ons feed directly into the quotation pricing breakdown.",
  },
  special: {
    title: "Edit Special Requests",
    desc: "Surfaced on the quotation and operational notes.",
  },
  order: {
    title: "Edit Event Order Details",
    desc: "Drives the event order brief and operations timeline.",
  },
};

export function EditSectionSheet({
  record,
  section,
  open,
  onOpenChange,
}: {
  record: EventRecord;
  section: EditSection;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { updateEvent } = useStore();
  const [draft, setDraft] = useState<EventRecord>(record);

  // Re-seed the draft each time the sheet opens.
  useEffect(() => {
    if (open) setDraft(record);
  }, [open, record]);

  async function save(patch: Partial<EventRecord>) {
    await updateEvent(record.id, patch);
    toast.success("Event Record updated", {
      description: "All generated documents now reflect this change.",
    });
    onOpenChange(false);
  }

  const meta = TITLES[section];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-6">
          <SheetTitle>{meta.title}</SheetTitle>
          <SheetDescription>{meta.desc}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {section === "client" && (
            <ClientForm draft={draft} setDraft={setDraft} />
          )}
          {section === "event" && (
            <EventForm draft={draft} setDraft={setDraft} />
          )}
          {section === "package" && (
            <PackageForm draft={draft} setDraft={setDraft} />
          )}
          {section === "menu" && (
            <MenuForm draft={draft} setDraft={setDraft} />
          )}
          {section === "addons" && (
            <AddOnForm draft={draft} setDraft={setDraft} />
          )}
          {section === "special" && (
            <div className="space-y-2">
              <Label>Special Requests</Label>
              <Textarea
                rows={6}
                value={draft.commercial.specialRequests}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    commercial: {
                      ...draft.commercial,
                      specialRequests: e.target.value,
                    },
                  })
                }
              />
            </div>
          )}
          {section === "order" && (
            <OrderForm draft={draft} setDraft={setDraft} />
          )}
        </div>

        <div className="flex justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (section === "special") {
                save({ commercial: draft.commercial });
              } else if (
                section === "package" ||
                section === "menu" ||
                section === "addons"
              ) {
                save({ commercial: draft.commercial });
              } else if (section === "client") {
                save({ client: draft.client });
              } else if (section === "event") {
                save({ event: draft.event });
              } else {
                save({ order: draft.order });
              }
            }}
          >
            Save changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

type FormProps = {
  draft: EventRecord;
  setDraft: React.Dispatch<React.SetStateAction<EventRecord>>;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="mb-1.5 block">{children}</Label>;
}

function ClientForm({ draft, setDraft }: FormProps) {
  const c = draft.client;
  const upd = (patch: Partial<typeof c>) =>
    setDraft({ ...draft, client: { ...c, ...patch } });
  return (
    <>
      <div>
        <FieldLabel>Client Name</FieldLabel>
        <Input value={c.clientName} onChange={(e) => upd({ clientName: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Contact Person</FieldLabel>
        <Input value={c.contactPerson} onChange={(e) => upd({ contactPerson: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Mobile Number</FieldLabel>
        <Input value={c.mobile} onChange={(e) => upd({ mobile: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Email Address</FieldLabel>
        <Input value={c.email} onChange={(e) => upd({ email: e.target.value })} />
      </div>
    </>
  );
}

function EventForm({ draft, setDraft }: FormProps) {
  const ev = draft.event;
  const upd = (patch: Partial<typeof ev>) =>
    setDraft({ ...draft, event: { ...ev, ...patch } });
  return (
    <>
      <div>
        <FieldLabel>Event Type</FieldLabel>
        <Select value={ev.eventType} onValueChange={(v) => upd({ eventType: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <FieldLabel>Service Style</FieldLabel>
        <Select
          value={ev.serviceStyle}
          onValueChange={(v) => upd({ serviceStyle: v as ServiceStyle })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_STYLES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Event Date</FieldLabel>
          <Input type="date" value={ev.eventDate} onChange={(e) => upd({ eventDate: e.target.value })} />
        </div>
        <div>
          <FieldLabel>Event Time</FieldLabel>
          <Input value={ev.eventTime} onChange={(e) => upd({ eventTime: e.target.value })} />
        </div>
      </div>
      <div>
        <FieldLabel>Number of Pax</FieldLabel>
        <Input
          type="number"
          value={ev.pax}
          onChange={(e) => upd({ pax: Number(e.target.value) || 0 })}
        />
      </div>
      <div>
        <FieldLabel>Venue</FieldLabel>
        <Input value={ev.venue} onChange={(e) => upd({ venue: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Venue Address</FieldLabel>
        <Input value={ev.venueAddress} onChange={(e) => upd({ venueAddress: e.target.value })} />
      </div>
    </>
  );
}

function PackageForm({ draft, setDraft }: FormProps) {
  const c = draft.commercial;
  const upd = (patch: Partial<typeof c>) =>
    setDraft({ ...draft, commercial: { ...c, ...patch } });
  const tiers: PackageTier[] = ["Silver", "Gold", "Platinum", "Custom"];
  return (
    <>
      <div>
        <FieldLabel>Package Tier</FieldLabel>
        <Select
          value={c.packageTier}
          onValueChange={(v) => upd({ packageTier: v as PackageTier })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tiers.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <FieldLabel>Package Name</FieldLabel>
        <Input value={c.packageName} onChange={(e) => upd({ packageName: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Budget Per Head</FieldLabel>
        <Input
          type="number"
          value={c.budgetPerHead}
          onChange={(e) => upd({ budgetPerHead: Number(e.target.value) || 0 })}
        />
      </div>
      <div>
        <FieldLabel>Reservation Fee</FieldLabel>
        <Input
          type="number"
          value={draft.reservationFee}
          onChange={(e) =>
            setDraft({ ...draft, reservationFee: Number(e.target.value) || 0 })
          }
        />
      </div>
    </>
  );
}

function MenuForm({ draft, setDraft }: FormProps) {
  const menu = draft.commercial.menu;
  const setMenu = (m: MenuItem[]) =>
    setDraft({ ...draft, commercial: { ...draft.commercial, menu: m } });
  return (
    <div className="space-y-3">
      {menu.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            className="w-28"
            value={item.category}
            onChange={(e) => {
              const next = [...menu];
              next[i] = { ...item, category: e.target.value };
              setMenu(next);
            }}
          />
          <Input
            value={item.name}
            onChange={(e) => {
              const next = [...menu];
              next[i] = { ...item, name: e.target.value };
              setMenu(next);
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenu(menu.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setMenu([...menu, { category: "Main", name: "" }])}
      >
        <Plus className="h-4 w-4" />
        Add menu item
      </Button>
    </div>
  );
}

function AddOnForm({ draft, setDraft }: FormProps) {
  const current = draft.commercial.addOns;
  const setAddOns = (a: AddOn[]) =>
    setDraft({ ...draft, commercial: { ...draft.commercial, addOns: a } });
  // Merge catalog with any custom add-ons already on the record.
  const names = new Set(ADDON_CATALOG.map((a) => a.name));
  const merged: AddOn[] = [
    ...ADDON_CATALOG,
    ...current.filter((a) => !names.has(a.name)),
  ];
  return (
    <div className="space-y-2">
      {merged.map((a) => {
        const checked = current.some((x) => x.name === a.name);
        return (
          <label
            key={a.name}
            className="flex cursor-pointer items-center justify-between rounded-lg border p-3"
          >
            <span className="flex items-center gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={() =>
                  setAddOns(
                    checked
                      ? current.filter((x) => x.name !== a.name)
                      : [...current, a]
                  )
                }
              />
              <span className="text-sm font-medium">{a.name}</span>
            </span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(a.price)}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function OrderForm({ draft, setDraft }: FormProps) {
  const o = draft.order;
  const upd = (patch: Partial<typeof o>) =>
    setDraft({ ...draft, order: { ...o, ...patch } });
  return (
    <>
      <div>
        <FieldLabel>Theme</FieldLabel>
        <Input value={o.theme} onChange={(e) => upd({ theme: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Setup Requirements</FieldLabel>
        <Textarea rows={3} value={o.setupRequirements} onChange={(e) => upd({ setupRequirements: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Ingress</FieldLabel>
          <Input value={o.ingress} onChange={(e) => upd({ ingress: e.target.value })} />
        </div>
        <div>
          <FieldLabel>Egress</FieldLabel>
          <Input value={o.egress} onChange={(e) => upd({ egress: e.target.value })} />
        </div>
      </div>
      <div>
        <FieldLabel>Operational Notes</FieldLabel>
        <Textarea rows={3} value={o.operationalNotes} onChange={(e) => upd({ operationalNotes: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Staff Notes</FieldLabel>
        <Textarea rows={3} value={o.staffNotes} onChange={(e) => upd({ staffNotes: e.target.value })} />
      </div>
    </>
  );
}
