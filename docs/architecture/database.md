# Database

**Status:** placeholder. No schema exists yet — this is deliberate.

## Purpose of this document

The PostgreSQL schema, the reasoning behind each modelling decision, and the
migration history that matters.

## To be documented

- **Entity relationship diagram**, centred on `Event`.
- **Tenancy columns** — where `organization_id` lives and how scoping is enforced.
- **The Event aggregate** — which tables hang off Event and which merely reference it.
- **Document snapshotting** — how signed contracts freeze while the Event moves
  on. See [event-lifecycle.md](./event-lifecycle.md).
- **Money** — `DECIMAL`, never `FLOAT`. Currency stored alongside every amount.
- **Soft deletes and audit trail** — catering records have real legal and
  financial weight; a hard `DELETE` on a past event destroys evidence.
- **Indexing strategy** — date-range queries over events are the dominant read
  pattern and will be the first thing to get slow.

## Decisions already made

See [decisions/](./decisions/) for the full reasoning.

- **UUID primary keys** on every model — [ADR 0002](./decisions/0002-uuid-primary-keys.md)
- **Document line items stored as JSONB**, with checklists flagged for
  reconsideration — [ADR 0003](./decisions/0003-nested-data-storage.md)
- **Documents are live projections** with field-level overrides and a snapshot
  written on signature — [ADR 0001](./decisions/0001-document-projection-model.md).
  This one shapes the document tables more than anything else here.

## Still open before the first model

1. `AUTH_USER_MODEL` — a custom `users.User` must be in place before the very
   first `migrate` against any real database. Swapping it afterwards is
   genuinely painful. Flagged as a TODO in `backend/config/settings/base.py`.
   **This is the next task.**
2. Whether an Event can span multiple days or sessions (ceremony + reception,
   multi-day conferences). This changes the shape of the central table.
3. The tenancy enforcement mechanism — see
   [system-design.md](./system-design.md).

## Money

Every monetary column is `DECIMAL(12, 2)`, never `FLOAT`. The prototype computes
totals in JavaScript floats (`apps/web/lib/pricing.ts`); that logic moves to
Python `Decimal` server-side and the client displays the result rather than
deriving it.

Service charge (10%) and VAT (12%) are currently hardcoded module constants in
`pricing.ts`. They become per-Organization settings — rates differ by business
and change by law, and neither should require a deploy.
