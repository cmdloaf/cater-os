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

## Decisions to make before writing the first model

1. `AUTH_USER_MODEL` — a custom `users.User` must be in place before the very
   first `migrate` against any real database. Swapping it afterwards is
   genuinely painful. This is flagged as a TODO in
   `backend/config/settings/base.py`.
2. Primary keys — UUID or BigAutoField. UUIDs avoid leaking record counts and
   make client-generated IDs possible; they cost index locality.
3. Whether an Event can span multiple days or sessions. This changes the shape
   of the central table, so resolve it first.
