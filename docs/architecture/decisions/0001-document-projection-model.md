# ADR 0001 — Documents are live projections with field overrides and snapshot-on-sign

**Status:** Accepted
**Date:** 2026-07-20
**Supersedes:** the implicit behaviour of the frontend prototype

## Context

Vero's premise is that the Event is the single source of truth and every
document is derived from it. The prototype does not do this.

`apps/web/lib/types.ts` stores `quotation`, `contract`, `eventOrder` and
`operations` as optional objects "lazily seeded the first time the document is
edited". Once seeded, the document is a stored copy and stops tracking the
Event.

The failure this produces:

1. User edits the quotation's notes.
2. User later changes `pax` from 120 to 145.
3. The quotation still says 120 — silently, with no indication.

That is the exact failure mode the product exists to eliminate, reintroduced
through the editing path. The snapshot behaviour is not itself wrong; the
**trigger** is. It fires on editing, which is incidental, rather than on
signing, which is meaningful.

## Decision

Documents are **live projections** of the Event, with two qualifications.

### 1. Field-level overrides

Editing a document field records an override for **that field only**. Every
other field continues to read live from the Event.

```
quotation.notes    → overridden by user, preserved verbatim
quotation.paxLabel → live from Event  (145)
quotation.charges  → live, recomputed from deriveQuote()
```

An override is a deliberate statement about presentation ("word this
differently for this client"), not a decision to stop tracking the underlying
facts. Overrides must be visibly marked in the UI so a user can see which parts
of a document have diverged from the Event and reset them.

### 2. Snapshot on signature

When a contract is signed, the entire document is frozen: the rendered content
is written to an immutable snapshot and `signed_at` is set. From that moment the
document no longer tracks the Event, because it is now a record of what was
legally agreed at a point in time.

Subsequent changes to the Event **must not** alter it. They must instead be
detected as divergence and surfaced as a prospective change order. Silent
reconciliation of a signed agreement is never acceptable.

## Consequences

**Requires:**
- An override map per document (`{field_path: value}`), not a full stored copy.
- A snapshot table or immutable JSONB column plus `signed_at`.
- Divergence detection comparing a signed snapshot against the live Event.
- UI affordances for "this field is overridden" and "reset to Event value".

**Costs:** the most expensive of the three options considered. Rendering a
document becomes projection + override merge rather than a plain read.

**Rejected alternatives:**

- *Live only, no per-document editing.* Safest and simplest, but the existing
  document editors (`doc-primitives.tsx`, `edit-section-sheet.tsx`) are built
  entirely around per-document editing, and real users do need per-client
  wording.
- *Snapshot on first edit (status quo).* Cheapest — the frontend already works
  this way — but it preserves the stale-document bug and makes it invisible.

## Related

- [../event-lifecycle.md](../event-lifecycle.md) — stage transitions and what each generates
- [ADR 0003](./0003-nested-data-storage.md) — how document content is stored
