---
name: vero-ux
description: Apply Vero's UX design principles when writing, fixing, or redesigning any part of Vero's React frontend. Use this whenever the user asks to build a new screen or component, fix or refactor an existing screen, restyle or re-layout something, or review/critique Vero frontend code or designs — even if they don't say "UX" or "design principles" explicitly. Covers the event record page, quotation/contract/BEO document editors, checklists and operational grids, dashboards, settings/templates, and record/directory views (clients, vendors, venues, menu items). Always consult this skill before generating or editing Vero frontend code, not just when the user explicitly mentions UX.
---

# Vero UX

Vero is an all-in-one catering management platform (owners, sales executives, coordinators). Its core pitch is fixing fragmentation — one event record feeding quotations, contracts, BEOs, and checklists. Every frontend decision should reinforce that single-source-of-truth story, not undercut it with inconsistent structure or scattered data entry.

Stack: React (JS/TS).

## Workflow

1. **Read the reference doc first.** Before writing or editing any code, read `references/vero-ux-principles.md` in full (or the relevant sections if it's a targeted fix). It's the source of truth for how Vero screens should be structured and styled — treat it as binding, not optional inspiration.
   - If the user attaches an updated version of the principles doc in the conversation, prefer that over the bundled copy for this session, and mention that theirs is being used.

2. **Classify what you're building or fixing.** Most Vero frontend work falls into one of these categories, each with its own section in the reference doc:
   - Event record page (§2)
   - Document generation — quote/contract/BEO editors (§3)
   - Checklists / operational modules — procurement, logistics, staffing (§4)
   - Role-specific views — owner/sales/coordinator (§5)
   - Dashboard (§6)
   - Settings, templates, branding (§7)
   - Records/directories — clients, vendors, venues, menu items (§8)

   Read the matching section closely. Also re-read §1 (core philosophy) and §9 (interaction/visual system rules) every time — they apply across all categories.

3. **Write the code.** Default to React function components with hooks, matching whatever component/styling conventions are already visible in the surrounding codebase (if the user has shared existing files, mirror their patterns — naming, folder structure, CSS approach — rather than introducing a new convention). If nothing is shared, use clean, conventional React/JS or TS.

4. **Before delivering, run it through the quick checklist** at the bottom of the reference doc (§ "Quick checklist to apply per screen"). If something in your implementation fails a checklist item, either fix it or flag it explicitly to the user with a one-line reason (e.g., "This table isn't using a real grid component yet — worth swapping in AG Grid before this ships").

5. **If a request conflicts with a principle**, don't silently override the user — implement what they asked, but note the tension briefly (e.g., "this adds a second place users can edit pricing outside the event record, which cuts against the single-source-of-truth principle in §2 — want me to route it through the event record instead?").

## Notes on scope

- This skill applies to both greenfield screens/components and fixes/refactors/restyles of existing ones — any touch of Vero frontend code.
- Data-dense screens (checklists, procurement, line-item editors) should default to a proper grid component (e.g., AG Grid) rather than a hand-rolled table, per §4.
- Anything visual or financial that a user is actively configuring (branding, pricing, discounts, templates) needs a live preview alongside the editor, not a separate preview step — per §3 and §9.
- Global (business-level) vs. event-specific settings must always be visually distinguishable — don't let styling make these look interchangeable.
