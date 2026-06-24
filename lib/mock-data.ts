import type { EventRecord } from "./types";

/**
 * Seed events. The store (`lib/store.tsx`) loads these on first run and then
 * persists any changes to localStorage. Replace this with an API fetch later.
 */
export const SEED_EVENTS: EventRecord[] = [
  {
    id: "evt-1001",
    eventName: "ABC Corp Year-End Party",
    status: "Confirmed",
    createdAt: "2026-05-28T09:12:00.000Z",
    updatedAt: "2026-06-22T03:45:00.000Z",
    client: {
      clientName: "ABC Corporation",
      contactPerson: "Maria Santos",
      mobile: "+63 917 555 0142",
      email: "maria.santos@abccorp.com",
    },
    event: {
      eventType: "Corporate Christmas Party",
      serviceStyle: "Buffet",
      eventDate: "2026-12-18",
      eventTime: "6:00 PM",
      venue: "Grand Ballroom, Marco Polo Ortigas",
      venueAddress: "Sapphire Rd, Ortigas Center, Pasig City",
      pax: 250,
    },
    commercial: {
      packageTier: "Gold",
      packageName: "Gold Buffet Package",
      budgetPerHead: 1450,
      menu: [
        { category: "Appetizer", name: "Caesar Salad Station" },
        { category: "Appetizer", name: "Pumpkin Soup" },
        { category: "Main", name: "Roast Beef with Gravy" },
        { category: "Main", name: "Herb-Crusted Salmon" },
        { category: "Main", name: "Chicken Cordon Bleu" },
        { category: "Main", name: "Truffle Mac & Cheese" },
        { category: "Dessert", name: "Assorted Holiday Pastries" },
        { category: "Beverage", name: "Bottomless Iced Tea & Soda" },
      ],
      addOns: [
        { name: "Live Carving Station", price: 28000 },
        { name: "Mobile Bar (4 hrs)", price: 35000 },
        { name: "LED Wall & Stage Lighting", price: 45000 },
      ],
      specialRequests:
        "Vegetarian option for 20 guests. Company logo on stage backdrop. Program ends 10 PM.",
    },
    order: {
      theme: "Emerald & Gold — Festive Corporate",
      setupRequirements:
        "Stage with backdrop, 25 round tables of 10, registration area, photo wall.",
      ingress: "2:00 PM",
      egress: "11:30 PM",
      operationalNotes:
        "Coordinate with venue AV team. Sound check by 4 PM. Awarding segment at 8 PM requires spotlight.",
      staffNotes:
        "Formal black tie attire for service staff. Event lead to coordinate with client HR (Maria).",
    },
    reservationFee: 50000,
  },
  {
    id: "evt-1002",
    eventName: "Reyes–Gonzales Wedding",
    status: "Upcoming",
    createdAt: "2026-03-10T01:00:00.000Z",
    updatedAt: "2026-06-20T08:20:00.000Z",
    client: {
      clientName: "Patricia Reyes",
      contactPerson: "Patricia Reyes",
      mobile: "+63 920 555 0188",
      email: "patricia.reyes@gmail.com",
    },
    event: {
      eventType: "Wedding Reception",
      serviceStyle: "Plated / Sit-down",
      eventDate: "2026-07-04",
      eventTime: "5:30 PM",
      venue: "The Glass Garden, Pasig",
      venueAddress: "Frontera Verde, Ortigas Ave, Pasig City",
      pax: 180,
    },
    commercial: {
      packageTier: "Platinum",
      packageName: "Platinum Plated Wedding Package",
      budgetPerHead: 2200,
      menu: [
        { category: "Appetizer", name: "Smoked Salmon Roulade" },
        { category: "Soup", name: "Wild Mushroom Cappuccino" },
        { category: "Salad", name: "Burrata & Heirloom Tomato" },
        { category: "Main", name: "Beef Tenderloin Medallion" },
        { category: "Main", name: "Pan-Seared Sea Bass" },
        { category: "Dessert", name: "Deconstructed Tiramisu" },
        { category: "Beverage", name: "Wine Pairing & Sparkling Cider" },
      ],
      addOns: [
        { name: "5-Tier Wedding Cake", price: 42000 },
        { name: "Champagne Tower", price: 25000 },
        { name: "Grazing Table", price: 38000 },
      ],
      specialRequests:
        "No pork. Kids' meals for 12. First dance at 7 PM — clear floor. Pastel floral styling.",
    },
    order: {
      theme: "Garden Romance — Blush & Ivory",
      setupRequirements:
        "18 round tables of 10, couple's sweetheart table, cake table, gift & signing table, aisle styling.",
      ingress: "1:00 PM",
      egress: "11:00 PM",
      operationalNotes:
        "Coordinate with wedding planner (Bliss Events). Plated service synced to program. Couple grand entrance at 6 PM.",
      staffNotes:
        "1 waiter per 2 tables for synchronized plated service. Formal attire. Discreet, white-glove service.",
    },
    reservationFee: 80000,
  },
  {
    id: "evt-1003",
    eventName: "TechNova Product Launch",
    status: "Quotation Sent",
    createdAt: "2026-06-12T05:30:00.000Z",
    updatedAt: "2026-06-23T11:10:00.000Z",
    client: {
      clientName: "TechNova Philippines Inc.",
      contactPerson: "Daniel Cruz",
      mobile: "+63 918 555 0271",
      email: "daniel.cruz@technova.ph",
    },
    event: {
      eventType: "Product Launch & Cocktails",
      serviceStyle: "Cocktail / Canapés",
      eventDate: "2026-08-15",
      eventTime: "7:00 PM",
      venue: "The Penthouse, BGC",
      venueAddress: "30th St cor 9th Ave, Bonifacio Global City, Taguig",
      pax: 120,
    },
    commercial: {
      packageTier: "Gold",
      packageName: "Gold Cocktail Reception Package",
      budgetPerHead: 1650,
      menu: [
        { category: "Canapé", name: "Tuna Tartare on Crisp" },
        { category: "Canapé", name: "Prosciutto & Melon Skewer" },
        { category: "Canapé", name: "Mini Wagyu Sliders" },
        { category: "Canapé", name: "Truffle Arancini" },
        { category: "Station", name: "Cheese & Charcuterie Board" },
        { category: "Dessert", name: "Petit Fours Selection" },
        { category: "Beverage", name: "Signature Cocktail Bar" },
      ],
      addOns: [
        { name: "Premium Open Bar (3 hrs)", price: 55000 },
        { name: "Branded Cocktail Napkins", price: 8000 },
      ],
      specialRequests:
        "Tech-forward presentation. Brand colors (blue/white). Roving servers only — no seated tables.",
    },
    order: {
      theme: "Modern Minimalist — Blue & White",
      setupRequirements:
        "Cocktail high tables (15), product display plinths, bar counter, roving service.",
      ingress: "3:00 PM",
      egress: "11:00 PM",
      operationalNotes:
        "Program is press + demo heavy. Food service pauses during 30-min keynote at 8 PM.",
      staffNotes:
        "Roving canapé service. Bartenders in branded aprons. Discreet, fast clearing.",
    },
    reservationFee: 40000,
  },
  {
    id: "evt-1004",
    eventName: "Isabella's 18th Debut",
    status: "Draft",
    createdAt: "2026-06-21T14:00:00.000Z",
    updatedAt: "2026-06-24T02:00:00.000Z",
    client: {
      clientName: "Grace Villanueva",
      contactPerson: "Grace Villanueva",
      mobile: "+63 905 555 0319",
      email: "grace.villanueva@yahoo.com",
    },
    event: {
      eventType: "18th Birthday Debut",
      serviceStyle: "Buffet",
      eventDate: "2026-09-20",
      eventTime: "6:30 PM",
      venue: "Rizal Ballroom, Makati Shangri-La",
      venueAddress: "Ayala Ave cor Makati Ave, Makati City",
      pax: 150,
    },
    commercial: {
      packageTier: "Gold",
      packageName: "Gold Celebration Buffet",
      budgetPerHead: 1350,
      menu: [
        { category: "Appetizer", name: "Garden Fresh Salad Bar" },
        { category: "Main", name: "Baked Salmon in Lemon Butter" },
        { category: "Main", name: "Beef Caldereta" },
        { category: "Main", name: "Buttered Chicken" },
        { category: "Main", name: "Seafood Marinara Pasta" },
        { category: "Dessert", name: "Dessert Buffet & Fountain" },
      ],
      addOns: [
        { name: "Chocolate Fountain", price: 15000 },
        { name: "Photo Booth (4 hrs)", price: 18000 },
      ],
      specialRequests:
        "18 roses / 18 candles program. Rose gold theme. Dance floor at center.",
    },
    order: {
      theme: "Rose Gold Enchanted Evening",
      setupRequirements:
        "15 round tables, stage for cotillion, dance floor, dessert wall.",
      ingress: "2:30 PM",
      egress: "11:00 PM",
      operationalNotes:
        "Cotillion de honor program. Coordinate timing of grand entrance & 18 roses.",
      staffNotes: "Smart casual service attire. Attentive dessert station refills.",
    },
    reservationFee: 30000,
  },
  {
    id: "evt-1005",
    eventName: "DOH Regional Health Summit",
    status: "Completed",
    createdAt: "2026-01-15T02:00:00.000Z",
    updatedAt: "2026-05-30T09:00:00.000Z",
    client: {
      clientName: "Department of Health — Region IV-A",
      contactPerson: "Dr. Ramon Lim",
      mobile: "+63 917 555 0455",
      email: "events@doh-calabarzon.gov.ph",
    },
    event: {
      eventType: "Conference / Seminar Buffet",
      serviceStyle: "Buffet",
      eventDate: "2026-05-22",
      eventTime: "8:00 AM",
      venue: "Convention Hall, Tagaytay International Convention Center",
      venueAddress: "Tagaytay-Nasugbu Hwy, Tagaytay City",
      pax: 400,
    },
    commercial: {
      packageTier: "Silver",
      packageName: "Silver Conference Package (AM/PM + Lunch)",
      budgetPerHead: 850,
      menu: [
        { category: "AM Snack", name: "Clubhouse Sandwich & Brewed Coffee" },
        { category: "Lunch", name: "Pork Menudo" },
        { category: "Lunch", name: "Chicken Afritada" },
        { category: "Lunch", name: "Pancit Canton" },
        { category: "Lunch", name: "Steamed Rice & Fresh Fruits" },
        { category: "PM Snack", name: "Bibingka & Hot Tsokolate" },
      ],
      addOns: [{ name: "Extra Coffee Station (whole day)", price: 22000 }],
      specialRequests:
        "Strict 10:00 AM and 3:00 PM snack timing. Halal options for 30 delegates.",
    },
    order: {
      theme: "Government Formal — Clean & Functional",
      setupRequirements:
        "Theater seating for 400, 2 buffet lines, registration, secretariat tables.",
      ingress: "5:00 AM",
      egress: "6:00 PM",
      operationalNotes:
        "High-volume, fast turnover. Two buffet lines to avoid queue. Strict program timing.",
      staffNotes:
        "Large crew. Stagger breaks. Coordinate with secretariat for headcount changes.",
    },
    reservationFee: 60000,
  },
  {
    id: "evt-1006",
    eventName: "Sunrise Foundation Gala",
    status: "Confirmed",
    createdAt: "2026-04-02T07:00:00.000Z",
    updatedAt: "2026-06-19T05:15:00.000Z",
    client: {
      clientName: "Sunrise Children's Foundation",
      contactPerson: "Andrea Mercado",
      mobile: "+63 922 555 0507",
      email: "andrea@sunrisefoundation.org",
    },
    event: {
      eventType: "Charity Fundraising Gala",
      serviceStyle: "Plated / Sit-down",
      eventDate: "2026-10-11",
      eventTime: "6:00 PM",
      venue: "Forbes Pavilion, Manila Polo Club",
      venueAddress: "McKinley Rd, Forbes Park, Makati City",
      pax: 200,
    },
    commercial: {
      packageTier: "Platinum",
      packageName: "Platinum Gala Dinner Package",
      budgetPerHead: 2500,
      menu: [
        { category: "Appetizer", name: "Seared Scallop & Pea Purée" },
        { category: "Soup", name: "Lobster Bisque" },
        { category: "Main", name: "Braised Short Rib / Sea Bass Duo" },
        { category: "Dessert", name: "Valrhona Chocolate Dome" },
        { category: "Beverage", name: "Premium Wine Pairing" },
      ],
      addOns: [
        { name: "String Quartet (3 hrs)", price: 48000 },
        { name: "Auction Stage & AV Package", price: 60000 },
      ],
      specialRequests:
        "Black-tie gala. Silent auction area. Reserved head table for 12 honorees.",
    },
    order: {
      theme: "Black Tie Elegance — Deep Green & Gold",
      setupRequirements:
        "20 round tables of 10, gala stage, auction display, registration & donation desk.",
      ingress: "12:00 PM",
      egress: "12:00 AM",
      operationalNotes:
        "Formal program with awarding & auction. Plated service paced to host's cues.",
      staffNotes:
        "White-glove plated service. Black tie. Coordinate with foundation's event committee.",
    },
    reservationFee: 100000,
  },
];
