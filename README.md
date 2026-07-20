# CaterOS

A high-fidelity, frontend-only MVP of **CaterOS** — a catering operations platform
built around a single source of truth: the **Event Record**.

Enter event information once, and CaterOS generates everything from it:

```
Event Record
  ↓
Quotation  →  Contract  →  Event Order  →  Operations Checklist
```

Edit the Event Record and every document updates automatically.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** + **lucide-react**
- No backend — mock data with a client-side store (localStorage), structured so
  the data layer can later be swapped for a Django REST Framework API. See
  [`lib/store.tsx`](lib/store.tsx) — the single seam where `fetch()` calls would go.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to the dashboard.

## Build a static site

```bash
npm run build      # outputs a static site to ./out
npx serve out      # preview the static build locally
```

## Publish to GitHub Pages (share for feedback)

The repo ships with a GitHub Actions workflow that builds and deploys
automatically. The site's base path is derived from the repository name, so it
works under `https://<your-username>.github.io/<repo>/` with no config edits.

1. **Create a repo and push** (the default branch must be `main`):

   ```bash
   git init
   git add -A
   git commit -m "Initial commit: CaterOS MVP"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```

2. In the repo on GitHub, go to **Settings → Pages** and set
   **Source = "GitHub Actions"**.

3. Every push to `main` now deploys. Your shareable URL appears in
   **Settings → Pages** and in the Actions run summary:

   ```
   https://<your-username>.github.io/<repo>/
   ```

> **Tip:** Demo data persists in the browser via localStorage. Each tester gets
> their own local copy seeded from the sample events — they can create and edit
> events freely without affecting anyone else.

## Project structure

```
app/                 # routes (App Router)
  dashboard/         # Screen 1 — events table + stats
  events/new/        # Screen 2 — create-event wizard
  events/view/       # Screen 3 — Event Record (Details / Documents / Operations)
  import/            # Screen 4 — import data + detection workflow
  documents/         # all-documents index
  templates/         # template gallery
  settings/          # profile / company / billing
components/
  ui/                # shadcn/ui primitives
  layout/            # sidebar, top bar, app shell
  event/             # event-record feature components
lib/
  types.ts           # EventRecord + document types
  mock-data.ts       # seed events
  pricing.ts         # quote derivation (subtotal, service charge, VAT, total)
  documents.ts       # pure event → document derivations
  store.tsx          # data provider (the future-API seam)
```
