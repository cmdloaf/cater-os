# Architecture Decision Records

Decisions that were expensive to make and would be expensive to reverse. Each
records the context at the time, what was chosen, and what was given up.

An ADR is not updated when the decision changes — a new ADR supersedes it, and
the old one stays as a record of the reasoning. That history is the point.

| # | Decision | Status |
| --- | --- | --- |
| [0001](./0001-document-projection-model.md) | Documents are live projections with field overrides and snapshot-on-sign | Accepted |
| [0002](./0002-uuid-primary-keys.md) | UUID primary keys | Accepted |
| [0003](./0003-nested-data-storage.md) | Document line items stored as JSONB | Accepted |

## When to write one

If the answer to "why is it like this?" is a paragraph rather than a sentence,
and getting it wrong would cost more than a day to undo — write an ADR.
