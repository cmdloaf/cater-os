/**
 * Shared constants and enums for Vero.
 *
 * These are values the backend and the clients must agree on exactly. Where a
 * value also exists in Python (a Django `TextChoices` class, for example), the
 * Django definition is the source of truth and this file mirrors it.
 *
 * Intended contents:
 *   - EventStatus — the lifecycle stages in docs/architecture/event-lifecycle.md
 *   - DocumentType — quotation | contract | event_order | checklist
 *   - PaymentStatus, ServiceStyle, UserRole
 *   - Currency and locale defaults
 *
 * Nothing here yet — see docs/architecture/event-lifecycle.md for the stages
 * these enums will encode.
 */

export {};
