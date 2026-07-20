/**
 * Shared TypeScript types for Vero.
 *
 * This package is the single definition of the shapes that cross a boundary —
 * between the Django API and the web app, and eventually the mobile app. Types
 * that only one app cares about belong in that app, not here.
 *
 * Intended contents once the backend has models:
 *   - API response/request DTOs mirroring the DRF serializers
 *   - The Event aggregate and its generated documents
 *     (Quotation, Contract, EventOrder, Checklist, Payment)
 *   - Pagination, error envelope and auth session shapes
 *
 * Nothing here yet — models are deliberately not designed at this stage.
 * See docs/architecture/database.md.
 */

export {};
