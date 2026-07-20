# Authentication

**Status:** placeholder. Not implemented.

## Purpose of this document

How a caller proves who they are, and how Vero decides what they may do.

## Intended approach

**Supabase Auth issues identity; Django owns authorisation.**

Supabase handles the parts that are tedious and easy to get wrong — signup,
password reset, email verification, OAuth providers, session refresh. It issues
a JWT. Django verifies that JWT and maps its subject claim onto a local `User`
row.

Authorisation is entirely Django's. Supabase knows nothing about organizations,
roles or which events a user may see, and should not.

## To be documented

- JWT verification: which Supabase key, how it is fetched and cached, clock skew
  tolerance.
- The DRF authentication class that replaces the placeholder
  `SessionAuthentication` in `backend/config/settings/base.py`.
- **User provisioning** — the Supabase user and the Django user are two records
  that must stay in step. Decide whether Django creates its row lazily on first
  authenticated request or eagerly via webhook, and what happens when they drift.
- Organization membership and role model; how the active organization is
  resolved per request.
- Permission classes, and the tenant-scoping mechanism that backs them.
- Service-to-service auth for Celery workers.
- Token lifetime and refresh handling in the web and mobile clients.

## Note on the migration path

Supabase Auth is a starting point, not a permanent commitment. Keeping
authorisation in Django means replacing the identity provider later touches one
authentication class rather than the whole permission system. Preserve that
boundary.
