import type { EventRecord, OperationsChecklist, OpsItem } from "./types";
import { deriveQuote } from "./pricing";

/**
 * Pure derivations: Event Record -> operational document data.
 *
 * The quotation/contract/event-order previews read directly off the record (and
 * `deriveQuote`). The operations checklist + staffing + timeline are computed
 * here from pax and service style so they always reflect the latest record.
 */

export interface ChecklistItem {
  label: string;
  qty: string;
  category: "Tables & Seating" | "Service Equipment" | "Stations" | "Linens";
}

export interface StaffLine {
  role: string;
  count: number;
}

export interface TimelineStep {
  phase: "Ingress" | "Setup" | "Service Start" | "Pack-up";
  time: string;
  note: string;
}

export interface OperationsPlan {
  checklist: ChecklistItem[];
  staff: StaffLine[];
  timeline: TimelineStep[];
}

/** Round up to the nearest multiple — used to size tables/linens to guests. */
function per(pax: number, divisor: number, min = 1): number {
  return Math.max(min, Math.ceil(pax / divisor));
}

export function deriveOperations(record: EventRecord): OperationsPlan {
  const { pax, serviceStyle, eventTime } = record.event;
  const isBuffet = serviceStyle === "Buffet" || serviceStyle === "Family Style";

  const guestTables = per(pax, 8); // 8 guests per round table
  const buffetTables = per(pax, 60, isBuffet ? 1 : 0);
  const chafingDishes = per(pax, 25, isBuffet ? 4 : 2);

  const checklist: ChecklistItem[] = [
    { label: "Guest Round Tables", qty: `${guestTables} tables`, category: "Tables & Seating" },
    { label: "Monobloc / Tiffany Chairs", qty: `${pax} chairs`, category: "Tables & Seating" },
    { label: "Buffet Tables", qty: `${Math.max(buffetTables, 2)} tables`, category: "Tables & Seating" },
    { label: "Table Cloths", qty: `${guestTables + Math.max(buffetTables, 2)} pcs`, category: "Linens" },
    { label: "Table Runners & Skirting", qty: `${guestTables} sets`, category: "Linens" },
    { label: "Cloth Napkins", qty: `${pax} pcs`, category: "Linens" },
    { label: "Chafing Dishes", qty: `${chafingDishes} units`, category: "Service Equipment" },
    { label: "Serving Utensils Set", qty: `${chafingDishes} sets`, category: "Service Equipment" },
    { label: "Dinnerware & Cutlery", qty: `${pax} sets`, category: "Service Equipment" },
    { label: "Glassware", qty: `${pax} pcs`, category: "Service Equipment" },
    { label: "Coffee Station", qty: "1 station", category: "Stations" },
    { label: "Water / Beverage Station", qty: `${per(pax, 80)} station(s)`, category: "Stations" },
    { label: "Dessert Station", qty: "1 station", category: "Stations" },
  ];

  const waiters = per(pax, 25, 2);
  const buffetAttendants = per(pax, 60, 2);
  const eventLeads = per(pax, 150, 1);
  const staff: StaffLine[] = [
    { role: "Waiters", count: waiters },
    { role: "Buffet Attendants", count: buffetAttendants },
    { role: "Event Lead", count: eventLeads },
    { role: "Kitchen / Food Runners", count: per(pax, 70, 1) },
    { role: "Bartender", count: per(pax, 120, 1) },
  ];

  const timeline: TimelineStep[] = [
    { phase: "Ingress", time: record.order.ingress || "3 hrs before", note: "Load-in, venue access & equipment delivery" },
    { phase: "Setup", time: "2 hrs before", note: "Table layout, linens, stations & styling" },
    { phase: "Service Start", time: eventTime || "On call time", note: "Guest arrival, food service begins" },
    { phase: "Pack-up", time: record.order.egress || "1 hr after program", note: "Egress, equipment teardown & cleanup" },
  ];

  return { checklist, staff, timeline };
}

/** Convenience: total amount for an event (used on dashboard + cards). */
export function eventTotal(record: EventRecord): number {
  return deriveQuote(record).total;
}

let opsSeq = 0;
function opsItem(label: string, meta?: string): OpsItem {
  opsSeq += 1;
  return { id: `ops-${Date.now().toString(36)}-${opsSeq}`, label, meta, done: false };
}

/**
 * Build the initial editable checklist from the Event Record. Used to seed
 * `record.operations` the first time the Checklist tab is touched, and by the
 * "Reset" action to regenerate the auto-derived version.
 */
export function seedOperations(record: EventRecord): OperationsChecklist {
  const plan = deriveOperations(record);
  const { eventTime } = record.event;
  const { ingress, egress } = record.order;

  const timeline: OpsItem[] = [
    opsItem("Ingress", ingress || "3 hrs before call time"),
    opsItem("Setup Complete", "2 hrs before call time"),
    opsItem("Guests Arrive", eventTime || "On call time"),
    opsItem("Service Starts", eventTime || "On call time"),
    opsItem("Egress", egress || "1 hr after program"),
  ];

  const foodPrep: OpsItem[] = record.commercial.menu.map((m) =>
    opsItem(`Prepare ${m.name}`)
  );

  const equipment: OpsItem[] = plan.checklist.map((c) =>
    opsItem(c.label, c.qty)
  );

  const addons: OpsItem[] = record.commercial.addOns.map((a) =>
    opsItem(a.name)
  );

  const logistics: OpsItem[] = [
    opsItem("Confirm Parking Slot"),
    opsItem("Loading / Unloading Area"),
    opsItem("Power Source / Outlets"),
    opsItem("Water Source"),
    opsItem("Stage Access"),
    opsItem("Ingress Schedule", ingress || "Day before"),
  ];

  return { timeline, foodPrep, equipment, addons, logistics, notes: "" };
}
