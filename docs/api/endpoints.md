# API Endpoints

**Status:** placeholder. No endpoints are implemented.

## Purpose of this document

The REST API reference: resources, methods, parameters, response shapes and
error semantics.

## Conventions (decided, not yet exercised)

- Base path is versioned from the start: `/api/v1/`.
- Resource paths are plural and kebab-cased: `/api/v1/event-orders/`.
- Routes live in each app's `urls.py` and are included from `config/urls.py`,
  which currently has them commented out — uncomment a line when that app gains
  real views.
- Pagination is `PageNumberPagination`, default page size 50.
- All list endpoints are implicitly scoped to the caller's organization. This is
  enforced server-side and is never a client-supplied filter.

## To be documented per resource

Request/response schemas, filtering and ordering parameters, permissions,
error codes, and rate limits.

Planned resources mirror the backend apps: organizations, users, clients,
events, packages, menus, quotations, contracts, event-orders, checklists,
payments, notifications, files.

`/api/v1/events/` is the important one — most other resources are reached
through it.

## Related

- [authentication.md](./authentication.md)
