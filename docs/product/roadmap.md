# Roadmap

**Status:** placeholder. Sequencing is a starting proposal, not a commitment.

## Purpose of this document

What is being built, in what order, and why that order. Dates deliberately
omitted until there is a delivery track record to base them on.

## Now — foundation

- [x] Frontend prototype (localStorage-backed, no API)
- [x] Monorepo structure, Django backend initialised
- [ ] Custom `User` model and initial migration *(must land before anything else)*
- [ ] Organizations and multi-tenancy enforcement
- [ ] Supabase Auth integration end to end
- [ ] Event model and CRUD API
- [ ] Web app reads from the API instead of `localStorage`

## Next — the core loop

- [ ] Clients, menus, packages
- [ ] Quotation generation and versioning
- [ ] Contract generation and snapshot-on-signature
- [ ] Event Order (BEO)
- [ ] Operations checklists
- [ ] File storage on R2, PDF export

## Later — operating a business on it

- [ ] Payments and payment schedules
- [ ] Notifications (email first)
- [ ] Reporting and margin analysis
- [ ] Mobile app for event-day execution
- [ ] AI assistance — drafting, extraction, anomaly detection

## Not now

Things worth explicitly not building yet: a public API, marketplace
integrations, white-labelling, and multi-currency. Each is a real request from
somebody, and each is cheaper to add after the core loop is proven than to carry
through it.

## Related

- [product-principles.md](./product-principles.md)
- [../architecture/event-lifecycle.md](../architecture/event-lifecycle.md)
