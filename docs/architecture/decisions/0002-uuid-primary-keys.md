# ADR 0002 — UUID primary keys

**Status:** Accepted
**Date:** 2026-07-20

## Context

Django defaults to `BigAutoField`. The choice must be made before the first
migration, because changing primary key types after data exists is a painful
migration across every foreign key in the schema.

Three facts pushed the decision:

1. **The frontend already generates string IDs client-side.** `store.tsx:68`
   produces `evt-${Date.now().toString(36)}${random}`, and `documents.ts`,
   `doc-primitives.tsx` and several pages generate their own. Integer PKs
   invalidate all of them and force a type change through `lib/types.ts`.
2. **A mobile app is planned for event-day use**, in venues with poor signal.
   Offline record creation needs client-generated IDs, or a temporary-ID
   reconciliation layer that is pure complexity.
3. **Sequential IDs leak business volume.** `/events/1847` tells a competitor —
   or a customer — how many events the organization has ever created. In
   multi-tenant B2B that is a real information disclosure.

## Decision

All models use `UUIDField(primary_key=True, default=uuid4, editable=False)`.

Set `DEFAULT_AUTO_FIELD` appropriately and define a shared abstract base model
so this is not restated (or forgotten) per model.

## Consequences

**Gains:** client-generated IDs remain valid, offline creation works without a
reconciliation layer, IDs are opaque, and records can be merged across
environments without collision.

**Costs:** 16 bytes versus 8. Worse index locality on insert — random UUIDs
scatter across the B-tree rather than appending. This is a real effect at very
high write volume and irrelevant at the scale of a catering business's event
table. If it ever matters, UUIDv7 is time-ordered and drop-in.

**Note:** URLs become long and unfriendly (`/events/8f14e45f-ceea-...`). If
readable URLs matter later, add a separate short slug or a per-organization
sequential `reference` field for humans — do not solve it by reverting the PK.

## Related

- [ADR 0001](./0001-document-projection-model.md)
- [../database.md](../database.md)
