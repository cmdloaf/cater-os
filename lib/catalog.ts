import type { AddOn, MenuItem, PackageTier, ServiceStyle } from "./types";

/** Reference catalogs used by the create-event wizard and import screen. */

export const EVENT_TYPES = [
  "Corporate Christmas Party",
  "Corporate Event",
  "Wedding Reception",
  "18th Birthday Debut",
  "Birthday Party",
  "Product Launch & Cocktails",
  "Conference / Seminar Buffet",
  "Charity Fundraising Gala",
  "Anniversary Celebration",
  "Private Dinner",
];

export const SERVICE_STYLES: ServiceStyle[] = [
  "Buffet",
  "Plated / Sit-down",
  "Family Style",
  "Food Stalls",
  "Cocktail / Canapés",
];

export interface PackageOption {
  tier: PackageTier;
  name: string;
  perHead: number;
  blurb: string;
}

export const PACKAGES: PackageOption[] = [
  {
    tier: "Silver",
    name: "Silver Package",
    perHead: 850,
    blurb: "3 mains, 1 dessert, drinks. Great for conferences & seminars.",
  },
  {
    tier: "Gold",
    name: "Gold Package",
    perHead: 1450,
    blurb: "4 mains, appetizer, dessert station, bottomless drinks.",
  },
  {
    tier: "Platinum",
    name: "Platinum Package",
    perHead: 2200,
    blurb: "Premium plated multi-course, wine pairing, full styling.",
  },
  {
    tier: "Custom",
    name: "Custom Package",
    perHead: 1200,
    blurb: "Build your own menu and pricing.",
  },
];

export interface MenuSet {
  id: string;
  label: string;
  items: MenuItem[];
}

export const MENU_SETS: MenuSet[] = [
  {
    id: "filipino-feast",
    label: "Classic Filipino Feast",
    items: [
      { category: "Appetizer", name: "Lumpiang Shanghai" },
      { category: "Main", name: "Beef Caldereta" },
      { category: "Main", name: "Chicken Adobo sa Gata" },
      { category: "Main", name: "Pancit Bihon Guisado" },
      { category: "Main", name: "Grilled Bangus" },
      { category: "Dessert", name: "Leche Flan & Buko Pandan" },
      { category: "Beverage", name: "Iced Tea & Soda" },
    ],
  },
  {
    id: "international-buffet",
    label: "International Buffet",
    items: [
      { category: "Appetizer", name: "Caesar Salad Station" },
      { category: "Main", name: "Roast Beef with Gravy" },
      { category: "Main", name: "Herb-Crusted Salmon" },
      { category: "Main", name: "Chicken Cordon Bleu" },
      { category: "Main", name: "Truffle Mac & Cheese" },
      { category: "Dessert", name: "Assorted Pastries" },
      { category: "Beverage", name: "Bottomless Iced Tea & Soda" },
    ],
  },
  {
    id: "premium-plated",
    label: "Premium Plated Set",
    items: [
      { category: "Appetizer", name: "Smoked Salmon Roulade" },
      { category: "Soup", name: "Wild Mushroom Cappuccino" },
      { category: "Main", name: "Beef Tenderloin Medallion" },
      { category: "Main", name: "Pan-Seared Sea Bass" },
      { category: "Dessert", name: "Deconstructed Tiramisu" },
      { category: "Beverage", name: "Wine Pairing" },
    ],
  },
  {
    id: "cocktail-canapes",
    label: "Cocktail Canapés",
    items: [
      { category: "Canapé", name: "Tuna Tartare on Crisp" },
      { category: "Canapé", name: "Mini Wagyu Sliders" },
      { category: "Canapé", name: "Truffle Arancini" },
      { category: "Station", name: "Cheese & Charcuterie Board" },
      { category: "Dessert", name: "Petit Fours Selection" },
      { category: "Beverage", name: "Signature Cocktail Bar" },
    ],
  },
];

export const ADDON_CATALOG: AddOn[] = [
  { name: "Mobile Bar (4 hrs)", price: 35000 },
  { name: "Live Carving Station", price: 28000 },
  { name: "Grazing Table", price: 38000 },
  { name: "Chocolate Fountain", price: 15000 },
  { name: "Photo Booth (4 hrs)", price: 18000 },
  { name: "LED Wall & Stage Lighting", price: 45000 },
  { name: "String Quartet (3 hrs)", price: 48000 },
  { name: "Premium Open Bar (3 hrs)", price: 55000 },
];
