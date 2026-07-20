# Vero UX Design Principles — Source of Truth

Condensed from 10 Eleken UX case studies (Privado Dining, Sessionboard, Spoonfed, Floret, TendrX, Process Place, ClearPoint Strategy, PicaSaaS, Drenchworks, Photobooth Supply). Use this as the design reference in prompts when redesigning or building Vero screens.

Vero context: all-in-one catering management platform. One event record feeds quotations, contracts, BEOs, and operational checklists. Users: catering owners, sales executives, event coordinators. Visual direction: clean, modern, Notion/Airtable/Linear-inspired.

---

## 1. Core philosophy: remove ambiguity, don't add flexibility

Vero's entire reason to exist is fixing fragmentation (Excel, Word, Canva, PDFs, chat, paper). The design should reinforce that, not undercut it.

- Every event should follow the same locked structure end-to-end: inquiry → quote → contract → BEO → checklist → execution. Don't let two coordinators build the same event type two different ways.
- Prioritize visual hierarchy so hard it's almost boring: at any moment, the user's eye should land on exactly the field to fill or button to click next. Pair every icon with a text label — never rely on icon meaning alone.
- Flexibility belongs in *content* (menus, pricing, templates, branding), not in *structure* (screen layout, navigation, workflow steps). Universal tools fail here because everyone uses them differently; Vero should not repeat that mistake.
- Don't over-simplify document generation for the sake of a cleaner form. Keep every section a caterer actually uses (menu line items, custom fees, tags) even if it adds visual complexity — customization beats minimalism when the customization is real business need.

## 2. The event record: one page, not five

- Event details, client contact info, documents, calendar, menu, finances, checklist, and payments should live on **one event page**, not scattered across separate pages that force navigation.
- Pattern: fixed left panel for always-visible essentials (client info, event basics, status) + tabbed right panel for everything else (quote, contract, BEO, checklist, menu, finances, messages). Tabs/sections should be collapsible to manage density.
- This single-page consolidation is the most important structural decision in the whole redesign — it's the UI expression of Vero's "one source of truth" pitch. If it's not visually obvious that everything lives in one record, the core value prop doesn't land.

## 3. Document generation (quotation, contract, BEO)

Treat every generated document's editor with the same four-part structure, so quote/contract/BEO editors feel like the same tool wearing different skins:

1. **General** — client/event basics, naming, status (draft/sent/signed).
2. **Visual/Branding** — logo, color, font, template choice — apply a business's branding in one click.
3. **Content** — pulled live from the event record: menu, packages, add-ons, pricing, discounts, taxes, special requests.
4. **Scheduling/Delivery** — expiration dates, send dates, signature deadlines.

Additional rules:
- **Live preview beside every editor**, not a separate "preview" step — caterers are visually judging whether a document looks professional as they build it. This applies to templates, branding, and pricing changes alike.
- **Auto-recalculate totals** the instant a line item, discount, tax, or fee changes — never require a manual "recalculate" action.
- **Custom fields and adjustable line items** (sliders, custom fees/tags) should be first-class, not buried in an "advanced" mode.
- When something changes in the event record, design explicitly how that change **propagates and is visibly confirmed** across the already-generated quote/contract/BEO/checklist — don't leave users guessing whether a document is stale.
- If AI ever assists document generation (auto-drafting a BEO, suggesting checklist items), use a step-by-step flow: configure → select scope → review/compare AI output → summary of what changed. Never a single black-box "generate" button with no review step.

## 4. Checklists and operational modules (procurement, logistics, staffing)

- These are dense, table/list-heavy screens — treat them like TendrX/Drenchworks treated theirs, not like a marketing page.
- **Avoid 3-level navigation.** Flatten deep hierarchies (event → checklist → category → item) into tabs plus breadcrumbs.
- **Use a proven data-grid component** (e.g., AG Grid) for any spreadsheet-like table — checklists, procurement lists, line-item editors. Sorting, inline edit, and filtering are expected, not optional.
- When adding a brand-new module to Vero (a new checklist type, a rentals tracker, a staffing planner), sequence the design work: **logic/structure first → table/grid design second → cross-document flows third → visual polish last.** Don't prettify before the IA is validated.
- Global settings (business-level menu, pricing rules, branding) and event-specific overrides (one event's custom discount, special request) must be **visually separated at all times** — never let a coordinator risk editing the wrong scope.

## 5. Roles: owner, sales executive, coordinator

- Design each role's primary flow deliberately — a distinct default view and primary action per role — rather than one generic dashboard with permission toggles hidden underneath.
  - **Owner**: pipeline health, profitability, upcoming events.
  - **Sales executive**: create/manage quotes, client communication, deal status.
  - **Coordinator**: checklist, logistics, day-of execution.
- Keep permission logic simple and consistently applied (e.g., viewer vs. editor vs. admin), the same way across every module — don't let permission rules vary screen to screen.

## 6. Dashboard = "brain center"

- The top-level dashboard should be the single place to see pipeline status, upcoming events, profitability trend, and outstanding checklist/action items — not a dumping ground for every possible metric.
- Strong visual hierarchy: direct attention to what needs action now (overdue tasks, expiring quotes, unsigned contracts) before ambient stats.
- Consider a profitability-aware calendar view (heatmap of expected/actual profit per date) alongside a standard event calendar — owners think in terms of "which days are worth the most," not just "what's scheduled."
- Offer both a Kanban/card view and a list/calendar view of the event pipeline (inquiry → quote → contract → BEO → execution) — different roles scan a pipeline differently.

## 7. Settings, templates, and customization

- **Templates should be reusable, combinable building blocks** — separate template types for menu packages, contract clauses, BEO sections, and checklist sets that users mix per event, rather than duplicating a whole document or rebuilding from scratch.
- Reuse the same lightweight setup pattern (name + logo + color, a few steps) everywhere branding is configured — initial business onboarding, new document template, new package — so users don't have to relearn a different flow each time.
- Segment settings into clearly labeled zones (Dashboard / Account / Business settings / Templates / Team & roles) so users always know what scope they're editing.
- Guard against customization breaking accessibility or consistency: enforce contrast/heading rules in any caterer-facing branding tool, and maintain one real design system (documented, enforced components) so the same button/table/badge doesn't drift into five different looks across the app. This risk is high specifically because Vero promises deep customization.

## 8. Records, search, and directories (clients, vendors, venues, menu items)

- Grid overview + detail drawer/profile pattern: searchable grid showing key fields at a glance, click-through to a full profile without losing the list context (slide-out drawer preferred over full navigation away).
- Use general search + filters, not rigid category trees, for browsing large catalogs (menu items, packages, vendors).
- If the same client, vendor, or venue can be entered multiple times across different events, design a duplicate-detection and guided merge flow (flag likely duplicates → side-by-side field comparison → merge → soft-delete losers with a log) before this becomes a data-integrity problem.

## 9. Interaction and visual system rules

- **Color carries meaning, not decoration.** Restrained base palette (neutral/monochrome-leaning) for most UI; a small reserved accent set specifically for alerts, destructive actions, and status (overdue, paid, signed, pending).
- **Let users act from where they are.** Renaming, duplicating, or deleting an event/quote/checklist item should be possible from that item's own page — never force a detour back to a master list for a common action.
- **Preview before commit, everywhere a choice has a visual or financial effect** — document templates, discount rules, branding, filters/styles.
- Responsive by default: dense tables and dashboards should scroll or reflow gracefully on smaller screens rather than condensing into illegibility (relevant if/when Vero ships a coordinator-facing mobile or tablet view for event-day use).
- If Vero ever ships a companion mobile/tablet app (e.g., day-of checklist execution), design cross-platform consistency as a requirement from day one — retrofitting it later (as Photobooth Supply had to) is expensive and confusing for users who switch devices.

## 10. Process discipline (for the redesign itself, not just the product)

- Audit before redesigning: map current architecture, user flows, and pain points before proposing new screens. Don't jump straight to visuals.
- Wireframe structure first, visual design second — validate the skeleton (layout, navigation, information architecture) before investing in polish.
- Prototype the hardest, most data-dense screen first (e.g., a multi-vendor procurement list or a full BEO editor) — it's the highest-risk pattern and the best test of whether the underlying structure holds up.
- When redesigning a live product incrementally, consider an "80% stays, 20% changes" approach for early rounds: fix what's clearly broken (navigation, outdated patterns) while leaving working elements alone, saving bigger structural changes for a later, validated pass.

---

## Quick checklist to apply per screen

When designing or reviewing any Vero screen, check it against:

- [ ] Does this screen pull from the single event record, or does it duplicate data entry?
- [ ] Is there one primary action the eye is drawn to?
- [ ] Is global vs. event-specific scope visually unambiguous?
- [ ] Is there a live preview if the user is configuring something visual or financial?
- [ ] Are dense tables using a real grid component with sort/filter/inline edit?
- [ ] Is navigation flat (tabs + breadcrumbs), not 3+ levels deep?
- [ ] Does color indicate status/urgency, not just decoration?
- [ ] Can the user act on this item without leaving the page/list they're on?
- [ ] Does this match the role viewing it (owner/sales/coordinator), or is it a generic view for everyone?
