# ADR 0003 — Document line items stored as JSONB

**Status:** Accepted
**Date:** 2026-07-20

## Context

The prototype's documents contain deeply nested, ordered, freely-edited
structures — `DocLine`, `DocGroup`, `DocField`, `DocSection` in
`apps/web/lib/types.ts`, plus `OpsItem` for checklists. A quotation holds
`charges: DocLine[]`, `meals: DocGroup[]`, `inclusions: string[]`.

Modelling each as a table means roughly six new tables, each with a
`sort_order` column and a parent foreign key, and a near-total rewrite of
`lib/documents.ts` (416 lines) and the document editors.

## Decision

**Document content is stored as JSONB** on the document row.

The deciding question was: *will anything ever query across these?* For document
lines the answer is no. They are presentation structures belonging to exactly
one document, always read as a whole, always written as a whole. A table per
shape buys referential integrity for data that has no referents.

JSONB also keeps `documents.ts` largely portable — the derivation logic can move
to Python with its shapes intact rather than being decomposed into an ORM graph
and reassembled for every render.

Postgres can index into JSONB with GIN if a query need appears later, so this is
not a one-way door.

## Explicitly reconsider for checklists

`OpsItem` is the weakest case for JSONB and is likely to move.

Checklist items are the one nested structure with a plausible cross-event query
need: completion analytics, per-item assignees, timestamped sign-offs from the
mobile app, "which prep tasks are habitually late". Those are row-shaped
concerns.

The decision here is to **start with JSONB for consistency and revisit
checklists specifically** once the mobile event-day flow is designed. Promoting
`OpsItem` to a table later is a contained migration — it touches one document
type, not the whole schema.

## Consequences

**Gains:** far fewer tables, `documents.ts` ports with its structure intact,
document reads and writes are single-row operations, and schema changes to
document shape need no migration.

**Costs:** no database-level integrity within document content — validation
becomes the serializer's job and must be taken seriously. No foreign keys from a
document line to, say, a catalogue item, so a renamed menu item does not
propagate into existing documents. Given ADR 0001 that is arguably correct
behaviour for signed documents, and needs explicit handling for live ones.

**Requires:** strict serializer-level schema validation on every JSONB write. A
malformed write that the database happily accepts is the main risk this decision
takes on.

## Related

- [ADR 0001](./0001-document-projection-model.md) — overrides also live in JSONB
- [../database.md](../database.md)
