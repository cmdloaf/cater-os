"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
  Save,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog-store";
import {
  COURSE_OPTIONS,
  EVENT_TYPES,
  MENU_COURSES,
  type MenuCourse,
} from "@/lib/catalog";
import type { AddOn, MenuItem, NewEventInput } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { SERVICE_CHARGE_RATE, VAT_RATE } from "@/lib/pricing";

const STEPS = [
  { n: 1, label: "Event Info" },
  { n: 2, label: "Catering Details" },
  { n: 3, label: "Review & Save" },
];

/** Time options in 30-minute increments, e.g. "12:00 AM" … "11:30 PM". */
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h24 = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  const period = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${minutes} ${period}`;
});

interface FormState {
  // client
  clientName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  // event
  eventType: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  venueAddress: string;
  pax: string;
  theme: string;
  // catering
  packageName: string;
  menu: Record<string, string>;
  addOns: string[];
  transportationFee: string;
  discount: string;
  discountMode: "amount" | "percent";
  discountPercent: string;
  specialRequests: string;
}

function initialMenu(): Record<string, string> {
  return Object.fromEntries(
    MENU_COURSES.map((c) => [c, COURSE_OPTIONS[c][0]])
  );
}

const INITIAL: FormState = {
  clientName: "",
  contactPerson: "",
  mobile: "",
  email: "",
  eventType: EVENT_TYPES[1],
  eventDate: "",
  eventTime: "",
  venue: "",
  venueAddress: "",
  pax: "150",
  theme: "",
  packageName: "",
  menu: initialMenu(),
  addOns: [],
  transportationFee: "5000",
  discount: "0",
  discountMode: "amount",
  discountPercent: "0",
  specialRequests: "",
};

export default function CreateEventPage() {
  const router = useRouter();
  const { createEvent } = useStore();
  const { packages, addOns: addOnCatalog } = useCatalog();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL,
    packageName: "",
  }));

  // Default to the first package once the catalog is available.
  const activePackage =
    packages.find((p) => p.name === form.packageName) ?? packages[0];

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const selectedAddOns: AddOn[] = useMemo(
    () => addOnCatalog.filter((a) => form.addOns.includes(a.name)),
    [addOnCatalog, form.addOns]
  );

  const pricing = useMemo(() => {
    const pax = Number(form.pax) || 0;
    const perHead = activePackage?.perHead ?? 0;
    const packageAmount = pax * perHead;
    const addOnsTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
    const transport = Number(form.transportationFee) || 0;
    const subtotal = packageAmount + addOnsTotal + transport;
    const discount =
      form.discountMode === "percent"
        ? Math.round((subtotal * (Number(form.discountPercent) || 0)) / 100)
        : Number(form.discount) || 0;
    const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
    const vat = (subtotal + serviceCharge) * VAT_RATE;
    const total = subtotal + serviceCharge + vat - discount;
    return {
      pax,
      perHead,
      packageAmount,
      addOnsTotal,
      transport,
      discount,
      subtotal,
      serviceCharge,
      vat,
      total,
    };
  }, [
    form.pax,
    form.transportationFee,
    form.discount,
    form.discountMode,
    form.discountPercent,
    activePackage,
    selectedAddOns,
  ]);

  const canNext =
    step === 1
      ? form.clientName.trim() && form.contactPerson.trim() && form.eventDate
      : true;

  function toggleAddOn(name: string) {
    setForm((f) => ({
      ...f,
      addOns: f.addOns.includes(name)
        ? f.addOns.filter((a) => a !== name)
        : [...f.addOns, name],
    }));
  }

  function adjustPax(delta: number) {
    const next = Math.max(1, (Number(form.pax) || 0) + delta);
    set("pax", String(next));
  }

  function menuItems(): MenuItem[] {
    return MENU_COURSES.map((c) => ({ category: c, name: form.menu[c] })).filter(
      (m) => m.name
    );
  }

  async function handleSave() {
    setSaving(true);
    const pax = Number(form.pax) || 0;
    const reservationFee = Math.max(
      10000,
      Math.round((pricing.total * 0.2) / 5000) * 5000
    );

    const input: NewEventInput = {
      eventName: form.clientName.trim(),
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
        serviceStyle: "Buffet",
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        venue: form.venue.trim(),
        venueAddress: form.venueAddress.trim(),
        pax,
      },
      commercial: {
        packageTier: activePackage?.tier ?? "Custom",
        packageName: activePackage?.name ?? "Custom Package",
        budgetPerHead: activePackage?.perHead ?? 0,
        menu: menuItems(),
        addOns: selectedAddOns,
        transportationFee: Number(form.transportationFee) || 0,
        discount: pricing.discount,
        specialRequests: form.specialRequests.trim(),
      },
      order: {
        theme: form.theme.trim(),
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
          Create New Event
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Enter details once — CaterOS generates the quotation, contract, event
          order & operations checklist.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const active = step === s.n;
          const done = step > s.n;
          return (
            <div key={s.n} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-primary text-primary-foreground",
                    !active && !done && "border-zinc-300 text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : s.n}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    active || done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px w-8 sm:w-16",
                    step > s.n ? "bg-primary" : "bg-zinc-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 1 — Event Info */}
      {step === 1 && (
        <div className="space-y-6">
          <Card className="p-6">
            <SectionTitle title="Client Information" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Client Name" required>
                <Input
                  value={form.clientName}
                  onChange={(e) => set("clientName", e.target.value)}
                  placeholder="e.g. Amplify Philippines"
                />
              </Field>
              <Field label="Contact Person" required>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => set("contactPerson", e.target.value)}
                  placeholder="e.g. Ms. Marianne Dela Cruz"
                />
              </Field>
              <Field label="Contact Number">
                <Input
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  placeholder="0917 123 4567"
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
          </Card>

          <Card className="p-6">
            <SectionTitle title="Event Information" />
            <div className="grid gap-5 sm:grid-cols-3">
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
              <Field label="Event Date" required>
                <Input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => set("eventDate", e.target.value)}
                />
              </Field>
              <Field label="Event Time">
                <Input
                  list="time-slots"
                  value={form.eventTime}
                  onChange={(e) => set("eventTime", e.target.value)}
                  placeholder="e.g. 11:00 AM"
                />
                <datalist id="time-slots">
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </Field>
              <Field label="Venue">
                <Input
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  placeholder="e.g. Bulb Studios Makati"
                />
              </Field>
              <Field label="Venue Address">
                <Input
                  value={form.venueAddress}
                  onChange={(e) => set("venueAddress", e.target.value)}
                  placeholder="e.g. P. Burgos St. Makati City"
                />
              </Field>
              <Field label="Expected Pax" required>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustPax(-10)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={form.pax}
                    onChange={(e) => set("pax", e.target.value)}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustPax(10)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Theme / Motif (Optional)">
                <Input
                  value={form.theme}
                  onChange={(e) => set("theme", e.target.value)}
                  placeholder="e.g. Modern Corporate"
                />
              </Field>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 2 — Catering Details */}
      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <SectionTitle title="Package & Menu" />
              <Field label="Package" required>
                <Select
                  value={activePackage?.name ?? ""}
                  onValueChange={(v) => set("packageName", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name} — {formatCurrency(p.perHead)} / pax
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Separator className="my-5" />

              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Menu Selection
              </div>
              <div className="space-y-3">
                {MENU_COURSES.map((course) => (
                  <div
                    key={course}
                    className="grid grid-cols-3 items-center gap-3"
                  >
                    <Label className="text-sm">{course}</Label>
                    <div className="col-span-2">
                      <Select
                        value={form.menu[course]}
                        onValueChange={(v) =>
                          setForm((f) => ({
                            ...f,
                            menu: { ...f.menu, [course]: v },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COURSE_OPTIONS[course as MenuCourse].map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-5" />

              <Field label="Special Requests (Optional)">
                <Textarea
                  value={form.specialRequests}
                  onChange={(e) => set("specialRequests", e.target.value)}
                  placeholder="Any special instructions or requests?"
                  rows={3}
                />
              </Field>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <SectionTitle title="Add-ons" />
              <div className="space-y-2">
                {addOnCatalog.map((a) => {
                  const checked = form.addOns.includes(a.name);
                  return (
                    <label
                      key={a.name}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors",
                        checked
                          ? "border-primary bg-accent/40"
                          : "hover:border-zinc-300"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleAddOn(a.name)}
                        />
                        <span className="text-sm font-medium">{a.name}</span>
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatCurrency(a.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
              <Button asChild variant="ghost" size="sm" className="mt-3">
                <Link href="/addons">
                  <Plus className="h-4 w-4" /> Create New Add-on
                </Link>
              </Button>
            </Card>

            <PricingSummary
              pricing={pricing}
              transportationFee={form.transportationFee}
              onTransport={(v) => set("transportationFee", v)}
              editable
              discountMode={form.discountMode}
              discountAmount={form.discount}
              discountPercent={form.discountPercent}
              onDiscountMode={(m) => set("discountMode", m)}
              onDiscountAmount={(v) => set("discount", v)}
              onDiscountPercent={(v) => set("discountPercent", v)}
            />
          </div>
        </div>
      )}

      {/* STEP 3 — Review & Save */}
      {step === 3 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <SectionTitle title="Client & Event" />
              <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                <ReviewRow label="Client" value={form.clientName || "—"} />
                <ReviewRow
                  label="Contact Person"
                  value={form.contactPerson || "—"}
                />
                <ReviewRow label="Contact Number" value={form.mobile || "—"} />
                <ReviewRow label="Email" value={form.email || "—"} />
                <ReviewRow label="Event Type" value={form.eventType} />
                <ReviewRow label="Date" value={form.eventDate || "—"} />
                <ReviewRow label="Time" value={form.eventTime || "—"} />
                <ReviewRow label="Venue" value={form.venue || "—"} />
                <ReviewRow label="Pax" value={`${form.pax} guests`} />
                <ReviewRow label="Theme / Motif" value={form.theme || "—"} />
              </div>
            </Card>

            <Card className="p-6">
              <SectionTitle title="Catering" />
              <ReviewRow
                label="Package"
                value={`${activePackage?.name ?? "—"} (${formatCurrency(
                  activePackage?.perHead ?? 0
                )} / pax)`}
              />
              <Separator className="my-3" />
              <div className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
                {menuItems().map((m) => (
                  <div key={m.category} className="flex gap-2 text-sm">
                    <span className="w-28 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                      {m.category}
                    </span>
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
              {selectedAddOns.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Add-ons
                  </div>
                  <ul className="space-y-1">
                    {selectedAddOns.map((a) => (
                      <li
                        key={a.name}
                        className="flex justify-between text-sm"
                      >
                        <span>{a.name}</span>
                        <span className="tabular-nums">
                          {formatCurrency(a.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </div>

          <div>
            <PricingSummary
              pricing={pricing}
              transportationFee={form.transportationFee}
              discountMode={form.discountMode}
              discountAmount={form.discount}
              discountPercent={form.discountPercent}
            />
          </div>
        </div>
      )}

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
        {step === 1 && (
          <Button onClick={() => setStep(2)} disabled={!canNext}>
            Next: Catering Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {step === 2 && (
          <Button onClick={() => setStep(3)}>
            Next: Review & Save
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {step === 3 && (
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Event"}
          </Button>
        )}
      </div>
    </div>
  );
}

function PricingSummary({
  pricing,
  transportationFee,
  onTransport,
  editable,
  discountMode,
  discountAmount,
  discountPercent,
  onDiscountMode,
  onDiscountAmount,
  onDiscountPercent,
}: {
  pricing: {
    pax: number;
    perHead: number;
    packageAmount: number;
    addOnsTotal: number;
    subtotal: number;
    discount: number;
    serviceCharge: number;
    vat: number;
    total: number;
  };
  transportationFee: string;
  onTransport?: (v: string) => void;
  editable?: boolean;
  discountMode: "amount" | "percent";
  discountAmount: string;
  discountPercent: string;
  onDiscountMode?: (m: "amount" | "percent") => void;
  onDiscountAmount?: (v: string) => void;
  onDiscountPercent?: (v: string) => void;
}) {
  return (
    <Card className="p-6">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Pricing Summary
      </div>
      <div className="space-y-2 text-sm">
        <Line
          label={`${pricing.pax} pax × ${formatCurrency(pricing.perHead)}`}
          value={pricing.packageAmount}
        />
        <Line label="Add-ons Total" value={pricing.addOnsTotal} />
        {editable ? (
          <EditableLine
            label="Transportation Fee"
            value={transportationFee}
            onChange={onTransport!}
          />
        ) : (
          <Line label="Transportation Fee" value={Number(transportationFee) || 0} />
        )}
        <Line label="Service Charge (10%)" value={pricing.serviceCharge} />
        <Line label="VAT (12%)" value={pricing.vat} />
        {editable ? (
          <DiscountLine
            mode={discountMode}
            amount={discountAmount}
            percent={discountPercent}
            resolved={pricing.discount}
            subtotal={pricing.subtotal}
            onMode={onDiscountMode!}
            onAmount={onDiscountAmount!}
            onPercent={onDiscountPercent!}
          />
        ) : (
          <Line label="Discount" value={pricing.discount} negative />
        )}
      </div>
      <Separator className="my-4" />
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold">TOTAL</span>
        <span className="text-xl font-semibold text-primary tabular-nums">
          {formatCurrency(pricing.total)}
        </span>
      </div>
    </Card>
  );
}

function DiscountLine({
  mode,
  amount,
  percent,
  resolved,
  subtotal,
  onMode,
  onAmount,
  onPercent,
}: {
  mode: "amount" | "percent";
  amount: string;
  percent: string;
  resolved: number;
  subtotal: number;
  onMode: (m: "amount" | "percent") => void;
  onAmount: (v: string) => void;
  onPercent: (v: string) => void;
}) {
  const effectivePct = subtotal > 0 ? (resolved / subtotal) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Discount</span>
          <div className="inline-flex overflow-hidden rounded-md border">
            {(["amount", "percent"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onMode(m)}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium transition-colors",
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {m === "amount" ? "₱" : "%"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {mode === "percent" ? (
            <>
              <Input
                type="number"
                min={0}
                value={percent}
                onChange={(e) => onPercent(e.target.value)}
                className="h-8 w-20 text-right tabular-nums"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">–₱</span>
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => onAmount(e.target.value)}
                className="h-8 w-24 text-right tabular-nums"
              />
            </>
          )}
        </div>
      </div>
      <div className="text-right text-xs text-muted-foreground">
        {mode === "percent"
          ? `= –${formatCurrency(resolved)}`
          : `≈ ${effectivePct.toFixed(1)}% of subtotal`}
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">
        {negative && value > 0 ? "–" : ""}
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function EditableLine({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">₱</span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-24 text-right tabular-nums"
        />
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-4 text-lg font-semibold">{title}</h2>;
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}
