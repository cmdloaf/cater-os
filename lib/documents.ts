import type {
  ContractDoc,
  DocField,
  DocGroup,
  DocLine,
  DocSection,
  EventOrderDoc,
  EventRecord,
  OperationsChecklist,
  OpsItem,
  QuotationDoc,
} from "./types";
import { deriveQuote, SERVICE_CHARGE_RATE, VAT_RATE } from "./pricing";
import { formatCurrency, formatDate } from "./utils";

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

/* ------------------------------- Documents -------------------------------- */

/** Caterer identity used to seed document headers/footers (editable after). */
export const COMPANY = {
  name: "Vero Catering",
  tagline: "Catering & Events",
  contact: "(0956) 618 8519 · hello@vero.ph · Vero Catering & Events",
};

const DEFAULT_INCLUSIONS = [
  "Uniformed Wait Staff",
  "Skirted Buffet Setup",
  "Tables & Chairs",
  "Complete Dinnerware & Cutlery",
  "Glassware",
  "Free-flowing Iced Tea",
  "Water Station",
];

let docSeq = 0;
function uid(prefix: string): string {
  docSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${docSeq}`;
}

function line(
  description: string,
  amount: number,
  kind: DocLine["kind"] = "line",
  extra: Partial<DocLine> = {}
): DocLine {
  return { id: uid("ln"), description, amount, kind, ...extra };
}

/**
 * Build the editable Quotation document from the Event Record. Seeds charges
 * from `deriveQuote` so the document opens matching the live totals; the user
 * then edits freely (document-local). Used by the Quotation tab and its Reset.
 */
export function seedQuotation(record: EventRecord): QuotationDoc {
  const q = deriveQuote(record);
  const { pax } = record.event;
  const { commercial } = record;

  const charges: DocLine[] = [
    line(commercial.packageName || "Catering Package", q.packageLine.amount, "line", {
      detail: `${pax} pax × ${formatCurrency(commercial.budgetPerHead)} / head`,
    }),
    ...commercial.addOns.map((a) => line(a.name, a.price, "line")),
  ];
  if (q.transportationFee > 0) {
    charges.push(line("Transportation Fee", q.transportationFee, "line"));
  }
  charges.push(
    line(`Service Charge (${Math.round(SERVICE_CHARGE_RATE * 100)}%)`, q.serviceCharge, "service"),
    line(`VAT (${Math.round(VAT_RATE * 100)}%)`, q.vat, "vat"),
    line("Discount", -q.discount, "discount")
  );

  const meals: DocGroup[] = [
    {
      id: uid("grp"),
      title: commercial.packageName || "Menu Inclusions",
      items: commercial.menu.map((m) => m.name),
    },
  ];

  const inclusions = [
    ...DEFAULT_INCLUSIONS,
    ...commercial.addOns.map((a) => a.name),
  ];

  const notes = [
    "This quotation is valid for 30 days from the date of issuance.",
    `A reservation fee of ${formatCurrency(record.reservationFee)} confirms your booking.`,
    commercial.specialRequests ? `Notes: ${commercial.specialRequests}` : "",
    "We look forward to the opportunity to be of service. Thank you!",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    companyName: COMPANY.name,
    companyTagline: COMPANY.tagline,
    preparedFor: record.client.clientName || record.eventName,
    dateLabel: formatDate(record.event.eventDate),
    paxLabel: `${pax} PAX`,
    termsLabel: "30 DAYS",
    venueLabel: record.event.venue || "",
    charges,
    meals,
    inclusions,
    notes,
    footerContact: COMPANY.contact,
  };
}

function field(label: string, value: string): DocField {
  return { id: uid("fld"), label, value };
}

function section(heading: string, body: string): DocSection {
  return { id: uid("sec"), heading, body };
}

/**
 * Build the editable Contract document from the Event Record. Seeds figures
 * from `deriveQuote` and carries standard catering-contract clauses as default,
 * editable copy. Used by the Contract tab and its Reset.
 */
export function seedContract(record: EventRecord): ContractDoc {
  const q = deriveQuote(record);
  const { pax, serviceStyle } = record.event;
  const { commercial } = record;
  const balance = q.total - record.reservationFee;

  const figures: DocLine[] = [
    line(commercial.packageName || "Catering Package", q.packageLine.amount, "line", {
      detail: `${pax} pax × ${formatCurrency(commercial.budgetPerHead)} / head`,
    }),
    ...commercial.addOns.map((a) => line(a.name, a.price, "line")),
    line(`Service Charge (${Math.round(SERVICE_CHARGE_RATE * 100)}%)`, q.serviceCharge, "service"),
    line(`VAT (${Math.round(VAT_RATE * 100)}%)`, q.vat, "vat"),
    line("Discount", -q.discount, "discount"),
  ];

  const inclusions: DocGroup[] = [
    {
      id: uid("grp"),
      title: "Dining",
      items: [
        "A signature buffet menu of your choice",
        "Elegantly skirted buffet set-up with well-lit buffet lamps",
        "Customer-oriented wait staff to assist and serve your guests",
        "Complete use of flatware, glassware and dinnerware",
        "Free-flowing iced tea",
        "Purified drinking water and ice for drinks",
      ],
    },
    {
      id: uid("grp"),
      title: "Décor",
      items: [
        "Custom floral centerpieces to suit the mood of your event",
        "Dressed tables with your linen of choice",
        "Monobloc chairs with floor-length seat covers",
      ],
    },
  ];

  const terms: DocSection[] = [
    section(
      "Menu Requirements",
      "Menu requirements are to be followed as discussed and agreed upon with the client."
    ),
    section(
      "Attendance of Guests",
      "The guaranteed attendance must be confirmed at least seven (7) days before the event. Charges are based on the guaranteed count; the Caterer cannot guarantee adequate food for attendance exceeding the confirmed number."
    ),
    section(
      "Payment",
      `A reservation fee of ${formatCurrency(record.reservationFee)} is required to reserve the date and is non-refundable but deductible from the total contract amount. The remaining balance of ${formatCurrency(balance)} is due no later than seven (7) days before the event.`
    ),
    section(
      "Cancellation / Postponement",
      "The client must inform the Caterer of any cancellation or postponement in writing no later than seven (7) days before the event, stating the reason. The reservation fee is transferable to a rescheduled date within six (6) months, subject to availability."
    ),
    section(
      "Service Time / Overtime",
      "Standard service time is limited to four (4) hours. An overtime fee of ₱3,000 per hour (with wait staff) applies beyond the agreed time and is payable immediately after the event."
    ),
    section(
      "Indemnity",
      "The client is responsible for the safety and security of guests' personal property. The client shall pay for the cost of broken, damaged or lost equipment, furniture, glassware or utensils based on market price."
    ),
    section(
      "Force Majeure",
      "The Caterer shall not be liable for any failure or delay caused by force majeure, including fire, earthquake, floods, typhoons, acts of God, civil disturbance, or other causes beyond its reasonable control."
    ),
  ];

  const paymentSchedule: DocLine[] = [
    line("Reservation Payment", record.reservationFee, "line", {
      detail: "Upon signing",
    }),
    line("Full Payment", balance, "line", {
      detail: "7 days before the event",
    }),
  ];

  const signatories: DocField[] = [
    field(`Authorized Representative, ${COMPANY.name}`, ""),
    field(`Client — ${record.client.clientName}`, record.client.contactPerson),
  ];

  return {
    title: "CATERING CONTRACT",
    intro: `This Catering Service Agreement is entered into between ${COMPANY.name} ("the Caterer") and ${record.client.clientName} ("the Client") for the event detailed below.`,
    fields: [
      field("Title of Event", record.eventName),
      field("Guaranteed Number of Pax", `${pax}`),
      field("Type of Service and Food", `${serviceStyle} Style of Service`),
      field("Date of Event", formatDate(record.event.eventDate)),
      field("Event Service Hours", record.event.eventTime || "—"),
      field(
        "Venue of the Event",
        [record.event.venue, record.event.venueAddress].filter(Boolean).join(", ")
      ),
    ],
    figures,
    inclusions,
    terms,
    paymentSchedule,
    signatories,
    footerContact: COMPANY.contact,
  };
}

/**
 * Build the editable Event Order document from the Event Record. Seeds the
 * particulars from the menu and the totals from `deriveQuote`. Used by the
 * Event Order tab and its Reset.
 */
export function seedEventOrder(record: EventRecord): EventOrderDoc {
  const q = deriveQuote(record);
  const { pax } = record.event;
  const { commercial } = record;

  const fields: DocField[] = [
    field("Company / Client Name", record.client.clientName),
    field("Function / Event Title", record.eventName),
    field("Function / Event Date", formatDate(record.event.eventDate)),
    field("Call Time", record.event.eventTime || "—"),
    field("Number of Guest", `${pax} pax`),
    field("Outlet", ""),
    field(
      "Function Venue",
      [record.event.venue, record.event.venueAddress].filter(Boolean).join(", ")
    ),
    field("Contact Person", record.client.contactPerson),
  ];

  const remarks = [
    `Package: ${commercial.packageName} (${formatCurrency(commercial.budgetPerHead)}/head)`,
    "Catering Event",
    "Standard buffet set-up is up to 4 hours. Extension per hour is ₱3,000 with wait staff.",
    record.order.theme ? `Theme / Motif: ${record.order.theme}` : "",
    commercial.specialRequests,
  ].filter(Boolean);

  const particulars: DocLine[] = [
    line(commercial.packageName || "Catering Package", q.packageLine.amount, "line", {
      detail: `${pax} pax × ${formatCurrency(commercial.budgetPerHead)} / head`,
    }),
    ...commercial.addOns.map((a) => line(a.name, a.price, "line")),
    ...commercial.menu.map((m) => line(m.name, 0, "line")),
  ];

  const totals: DocLine[] = [
    line("Mobilization", commercial.transportationFee, "line"),
    line(`Service Charge (${Math.round(SERVICE_CHARGE_RATE * 100)}%)`, q.serviceCharge, "service"),
    line(`VAT (${Math.round(VAT_RATE * 100)}%)`, q.vat, "vat"),
    line("Discount", -q.discount, "discount"),
  ];

  return { title: "EVENT ORDER", fields, remarks, particulars, totals };
}
