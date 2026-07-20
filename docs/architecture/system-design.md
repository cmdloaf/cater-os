# System Design

**Status:** placeholder.

## Purpose of this document

The high-level shape of Vero: what the pieces are, how they talk to each other,
and where the boundaries sit. Read this first when joining the project.

## To be documented

- **Component diagram** — Next.js web client, Expo mobile client, Django/DRF
  API, PostgreSQL, Redis, Celery workers, Cloudflare R2, Supabase Auth.
- **Request path** — browser → Next.js → DRF, and where auth is verified.
- **Multi-tenancy model.** The most consequential unresolved decision:
  shared schema with an `organization` foreign key and enforced query scoping,
  versus schema-per-tenant. Whichever is chosen, the enforcement mechanism
  (middleware? manager? RLS?) must be decided at the same time — relying on
  every developer to remember a `.filter(organization=...)` is how tenant data
  leaks.
- **Document generation pipeline** — how a change to an Event propagates to the
  quotation, contract and BEO views, and which parts of that are synchronous.
- **Background job topology** — which work is queued and why.
- **Where AI fits** — assistive drafting and extraction at the edges, not in the
  path of anything the business depends on being correct.
- **Environments and promotion** — local, staging, production.

## Related

- [event-lifecycle.md](./event-lifecycle.md) — the domain model this all serves
- [database.md](./database.md) — schema decisions
