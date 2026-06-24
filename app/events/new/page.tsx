"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  CalendarDays,
  Receipt,
  Save,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  ADDON_CATALOG,
  EVENT_TYPES,
  MENU_SETS,
  PACKAGES,
  SERVICE_STYLES,
} from "@/lib/catalog";
import type {
  AddOn,
  NewEventInput,
  PackageTier,
  ServiceStyle,
} from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { SERVICE_CHARGE_RATE, VAT_RATE } from "@/lib/pricing";

const STEPS = [
  { n: 1, label: "Client", icon: User, hint: "Who you're catering for" },
  { n: 2, label: "Event", icon: CalendarDays, hint: "Date, venue & guests" },
  { n: 3, label: "Commercial", icon: Receipt, hint: "Package & pricing" },
];

interface FormState {
  // client
  clientName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  // event
  eventName: string;
  eventType: string;
  serviceStyle: ServiceStyle;
  eventDate: string;
  eventTime: string;
  venue: string;
  venueAddress: string;
  pax: string;
  // commercial
  packageTier: PackageTier;
  budgetPerHead: string;
  menuSetId: string;
  addOns: string[];
  specialRequests: string;
}

const INITIAL: FormState = {
  clientName: "",
  contactPerson: "",
  mobile: "",
  email: "",
  eventName: "",
  eventType: EVENT_TYPES[0],
  serviceStyle: "Buffet",
  eventDate: "",
  eventTime: "",
  venue: "",
  venueAddress: "",
  pax: "",
  packageTier: "Gold",
  budgetPerHead: "1450",
  menuSetId: "international-buffet",
  addOns: [],
  specialRequests: "",
};

export default function CreateEventPage() {
  const router = useRouter();
  const { createEvent } = useStore();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const selectedAddOns: AddOn[] = useMemo(
    () => ADDON_CATALOG.filter((a) => form.addOns.includes(a.name)),
    [form.addOns]
  );

  const estimate = useMemo(() => {
    const pax = Number(form.pax) || 0;
    const perHead = Number(form.budgetPerHead) || 0;
    const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
    const subtotal = pax * perHead + addOnTotal;
    const sc = subtotal * SERVICE_CHARGE_RATE;
    const vat = (subtotal + sc) * VAT_RATE;
    return { subtotal, total: subtotal + sc + vat };
  }, [form.pax, form.budgetPerHead, selectedAddOns]);

  const canNext =
    step === 1
      ? form.clientName.trim() && form.contactPerson.trim()
      : step === 2
        ? form.eventName.trim() && form.eventDate && form.pax
        : true;

  function choosePackage(tier: PackageTier) {
    const pkg = PACKAGES.find((p) => p.tier === tier)!;
    set("packageTier", tier);
    set("budgetPerHead", String(pkg.perHead));
  }

  function toggleAddOn(name: string) {
    setForm((f) => ({
      ...f,
      addOns: f.addOns.includes(name)
        ? f.addOns.filter((a) => a !== name)
        : [...f.addOns, name],
    }));
  }

  async function handleSave() {
    setSaving(true);
    const pkg = PACKAGES.find((p) => p.tier === form.packageTier)!;
    const menuSet = MENU_SETS.find((m) => m.id === form.menuSetId);
    const pax = Number(form.pax) || 0;
    const reservationFee = Math.max(
      10000,
      Math.round((estimate.total * 0.2) / 5000) * 5000
    );

    const input: NewEventInput = {
      eventName: form.eventName.trim(),
      status: "Draft",
      reservationFee,
      client: {
        clientName: form.clientName.trim(),
        contactPerson: form.contactPerson.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
      },
      event: {
        eventType: form.eventType,
        serviceStyle: form.serviceStyle,
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        venue: form.venue.trim(),
        venueAddress: form.venueAddress.trim(),
        pax,
      },
      commercial: {
        packageTier: form.packageTier,
        packageName: pkg.name,
        budgetPerHead: Number(form.budgetPerHead) || 0,
        menu: menuSet ? menuSet.items : [],
        addOns: selectedAddOns,
        specialRequests: form.specialRequests.trim(),
      },
      order: {
        theme: "",
        setupRequirements: "",
        ingress: "3 hrs before call time",
        egress: "1 hr after program",
        operationalNotes: "",
        staffNotes: "",
      },
    };

    const record = await createEvent(input);
    toast.success("Event created", {
      description: "Your quotation, contract & event order are ready.",
    });
    router.push(`/events/view?id=${record.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Create Event
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Enter details once — CaterOS generates the quotation, contract, event
          order & operations checklist.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const active = step === s.n;
          const done = step > s.n;
          const Icon = s.icon;
          return (
            <div key={s.n} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary text-primary",
                    !active && !done && "border-zinc-200 text-muted-foreground"
                  )}
                >
                  {done ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      active || done ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Step {s.n} · {s.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.hint}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-0.5 flex-1 rounded",
                    step > s.n ? "bg-primary" : "bg-zinc-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-5">
            <SectionTitle
              title="Client Information"
              subtitle="The organization or person booking the event."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Client Name" required>
                <Input
                  value={form.clientName}
                  onChange={(e) => set("clientName", e.target.value)}
                  placeholder="e.g. ABC Corporation"
                />
              </Field>
              <Field label="Contact Person" required>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => set("contactPerson", e.target.value)}
                  placeholder="e.g. Maria Santos"
                />
              </Field>
              <Field label="Mobile Number">
                <Input
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                />
              </Field>
              <Field label="Email Address">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="name@company.com"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <SectionTitle
              title="Event Information"
              subtitle="When, where and for how many guests."
            />
            <Field label="Event Name" required>
              <Input
                value={form.eventName}
                onChange={(e) => set("eventName", e.target.value)}
                placeholder="e.g. ABC Corp Year-End Party"
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Event Type">
                <Select
                  value={form.eventType}
                  onValueChange={(v) => set("eventType", v)}
                >
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
              </Field>
              <Field label="Service Style">
                <Select
                  value={form.serviceStyle}
                  onValueChange={(v) => set("serviceStyle", v as ServiceStyle)}
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
              </Field>
              <Field label="Event Date" required>
                <Input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => set("eventDate", e.target.value)}
                />
              </Field>
              <Field label="Event Time">
                <Input
                  value={form.eventTime}
                  onChange={(e) => set("eventTime", e.target.value)}
                  placeholder="e.g. 6:00 PM"
                />
              </Field>
              <Field label="Venue">
                <Input
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  placeholder="e.g. Grand Ballroom, Marco Polo"
                />
              </Field>
              <Field label="Number of Pax" required>
                <Input
                  type="number"
                  min={1}
                  value={form.pax}
                  onChange={(e) => set("pax", e.target.value)}
                  placeholder="e.g. 250"
                />
              </Field>
            </div>
            <Field label="Venue Address">
              <Input
                value={form.venueAddress}
                onChange={(e) => set("venueAddress", e.target.value)}
                placeholder="Street, City"
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <SectionTitle
              title="Commercial Information"
              subtitle="Package, menu and pricing drive your quotation."
            />

            <div>
              <Label className="mb-2 block">Package</Label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PACKAGES.map((p) => {
                  const active = form.packageTier === p.tier;
                  return (
                    <button
                      key={p.tier}
                      type="button"
                      onClick={() => choosePackage(p.tier)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-colors",
                        active
                          ? "border-primary bg-accent/50 ring-1 ring-primary"
                          : "hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{p.tier}</span>
                        {active && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {formatCurrency(p.perHead)}/head
                      </div>
                      <p className="mt-2 text-xs leading-snug text-muted-foreground">
                        {p.blurb}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Budget Per Head">
                <Input
                  type="number"
                  value={form.budgetPerHead}
                  onChange={(e) => set("budgetPerHead", e.target.value)}
                />
              </Field>
              <Field label="Menu Selection">
                <Select
                  value={form.menuSetId}
                  onValueChange={(v) => set("menuSetId", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_SETS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div>
              <Label className="mb-2 block">Add-ons</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {ADDON_CATALOG.map((a) => {
                  const checked = form.addOns.includes(a.name);
                  return (
                    <label
                      key={a.name}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors",
                        checked ? "border-primary bg-accent/40" : "hover:border-zinc-300"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleAddOn(a.name)}
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
            </div>

            <Field label="Special Requests">
              <Textarea
                value={form.specialRequests}
                onChange={(e) => set("specialRequests", e.target.value)}
                placeholder="Dietary restrictions, theme, program notes…"
                rows={3}
              />
            </Field>

            {/* Live estimate */}
            <div className="flex items-center justify-between rounded-lg border bg-accent/40 p-4">
              <div>
                <div className="text-xs text-muted-foreground">
                  Estimated total (incl. 10% service charge & 12% VAT)
                </div>
                <div className="text-2xl font-semibold tracking-tight">
                  {formatCurrency(estimate.total)}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                Updates live as you build
                <br /> the Event Record.
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Event"}
          </Button>
        )}
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}
