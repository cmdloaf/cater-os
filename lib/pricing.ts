import type { EventRecord } from "./types";

/** Standard rates used across all generated documents. */
export const SERVICE_CHARGE_RATE = 0.1; // 10%
export const VAT_RATE = 0.12; // 12% (Philippines)

export interface QuoteLine {
  label: string;
  detail: string;
  amount: number;
}

export interface Quote {
  packageLine: QuoteLine;
  addOnLines: QuoteLine[];
  subtotal: number;
  serviceCharge: number;
  vat: number;
  total: number;
  perHead: number;
}

/**
 * Derive the full pricing breakdown from an Event Record.
 *
 * This is a pure function — the quotation, contract and dashboard totals all
 * read from here, so editing pax / budget / add-ons on the record updates every
 * document at once.
 */
export function deriveQuote(record: EventRecord): Quote {
  const { pax } = record.event;
  const { budgetPerHead, packageName, addOns } = record.commercial;

  const packageAmount = budgetPerHead * pax;
  const packageLine: QuoteLine = {
    label: packageName,
    detail: `${pax} pax × ${formatPlain(budgetPerHead)} / head`,
    amount: packageAmount,
  };

  const addOnLines: QuoteLine[] = addOns.map((a) => ({
    label: a.name,
    detail: "Add-on",
    amount: a.price,
  }));

  const subtotal =
    packageAmount + addOns.reduce((sum, a) => sum + a.price, 0);
  const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
  const vat = (subtotal + serviceCharge) * VAT_RATE;
  const total = subtotal + serviceCharge + vat;

  return {
    packageLine,
    addOnLines,
    subtotal,
    serviceCharge,
    vat,
    total,
    perHead: pax > 0 ? total / pax : 0,
  };
}

function formatPlain(n: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(n);
}
