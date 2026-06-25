/**
 * Domain types for CaterOS.
 *
 * The `EventRecord` is the single source of truth. Every generated document
 * (quotation, contract, event order, operations checklist) is derived from it
 * — see `lib/documents.ts` and `lib/pricing.ts`. Nothing here is persisted as a
 * separate document.
 */

export type EventStatus =
  | "Draft"
  | "Quotation Sent"
  | "Confirmed"
  | "Upcoming"
  | "Completed";

export const EVENT_STATUSES: EventStatus[] = [
  "Draft",
  "Quotation Sent",
  "Confirmed",
  "Upcoming",
  "Completed",
];

export type ServiceStyle =
  | "Buffet"
  | "Plated / Sit-down"
  | "Family Style"
  | "Food Stalls"
  | "Cocktail / Canapés";

export type PackageTier = "Silver" | "Gold" | "Platinum" | "Custom";

export interface ClientInfo {
  clientName: string;
  contactPerson: string;
  mobile: string;
  email: string;
}

export interface EventInfo {
  eventType: string;
  serviceStyle: ServiceStyle;
  eventDate: string; // ISO YYYY-MM-DD
  eventTime: string; // e.g. "6:00 PM"
  venue: string;
  venueAddress: string;
  pax: number;
}

export interface MenuItem {
  category: string; // e.g. "Appetizer", "Main", "Dessert"
  name: string;
}

export interface AddOn {
  name: string;
  price: number; // total price for the add-on (not per head)
}

export interface Commercial {
  packageTier: PackageTier;
  packageName: string; // e.g. "Gold Plated Package"
  budgetPerHead: number;
  menu: MenuItem[];
  addOns: AddOn[];
  /** Flat delivery / logistics fee added to the subtotal. */
  transportationFee: number;
  /** Flat discount subtracted from the grand total. */
  discount: number;
  specialRequests: string;
}

/** Free-form operational fields surfaced in the Event Order. */
export interface EventOrderDetails {
  theme: string;
  setupRequirements: string;
  ingress: string; // call time / load-in
  egress: string; // pack-up / load-out
  operationalNotes: string;
  staffNotes: string;
}

/** A single editable checklist line. `meta` holds a quantity or a time. */
export interface OpsItem {
  id: string;
  label: string;
  meta?: string;
  done: boolean;
}

/** Editable, persisted operations checklist for an event. */
export interface OperationsChecklist {
  timeline: OpsItem[];
  foodPrep: OpsItem[];
  equipment: OpsItem[];
  addons: OpsItem[];
  logistics: OpsItem[];
  notes: string;
}

export interface EventRecord {
  id: string;
  eventName: string;
  status: EventStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  client: ClientInfo;
  event: EventInfo;
  commercial: Commercial;
  order: EventOrderDetails;
  /** Reservation / down payment to confirm the booking. */
  reservationFee: number;
  /** Lazily seeded the first time the Checklist tab is edited. */
  operations?: OperationsChecklist;
}

/** Shape used by the create-event wizard before an id/timestamps exist. */
export type NewEventInput = Omit<
  EventRecord,
  "id" | "status" | "createdAt" | "updatedAt"
> & {
  status?: EventStatus;
};

export interface DashboardStats {
  upcoming: number;
  pendingQuotations: number;
  confirmed: number;
  totalEvents: number;
  draft: number;
  completed: number;
}

export type DocumentType =
  | "Quotation"
  | "Contract"
  | "Event Order"
  | "Operations Checklist";
