<div align="center">

# Vero

**The operating system for catering businesses.**

Create the event once. Everything else generates itself.

</div>

---

## Overview

Catering businesses run on a stack of disconnected documents. The quote is a
spreadsheet, the contract is a Word file, the banquet event order is a different
spreadsheet, and the kitchen works from a printout. When the guest count changes
from 120 to 145, someone has to remember to update all four. They don't — and
the kitchen cooks for 120.

Vero replaces that with a single **Event Workspace**. An event is entered once,
and the quotation, contract, banquet event order (BEO), operational checklists
and payment schedule are all generated from it and stay in step with it
automatically.

```
                        ┌─────────────┐
                        │    EVENT    │   ← the single source of truth
                        └──────┬──────┘
                               │
        ┌──────────┬───────────┼───────────┬──────────┐
        ▼          ▼           ▼           ▼          ▼
   Quotation   Contract   Event Order   Checklist   Payments
```

Change the event, and every document reflects it. There is nothing to
synchronise because there is only one record.

## Features

**Available today** (frontend prototype, browser-local data)

- Event workspace with details, documents and operations views
- Quotation, contract and event order generation from a single event record
- Operational checklists
- Menu, package and add-on catalogue
- Dashboard, calendar and reporting views
- Responsive layout with a mobile bottom navigation

**Planned** — see [docs/product/roadmap.md](docs/product/roadmap.md)

- Multi-tenant organizations with multiple users and roles
- Persistent PostgreSQL storage behind a REST API
- Authentication via Supabase
- Payments, invoicing and payment schedules
- Notifications, reporting and margin analysis
- AI-assisted drafting and data extraction
- Mobile app for event-day execution

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Mobile *(planned)* | React Native, Expo |
| API | Django 5.2, Django REST Framework |
| Database | PostgreSQL 17 |
| Auth | Supabase Auth (identity) + Django (authorisation) |
| Storage | Cloudflare R2 |
| Background jobs | Celery + Redis |
| Tooling | npm workspaces, uv, Ruff, Black, ESLint, Prettier, pre-commit |

## Architecture

Three decisions shape the codebase.

**1. The Event is the source of truth.** Documents are projections of the event,
not copies of it. The one exception is a signed contract, which snapshots what
was legally agreed and stops tracking. This is the product thesis and it drives
the schema — read
[docs/architecture/event-lifecycle.md](docs/architecture/event-lifecycle.md)
before writing backend models.

**2. The backend is organised by business domain, not technical layer.** Each
Django app owns one domain and holds its own models, serializers, views, URLs
and tests. There is no project-wide `models.py`. A developer working on
quotations works in `backend/apps/quotations/` and nowhere else.

**3. Identity is rented; authorisation is owned.** Supabase handles signup,
password reset and OAuth. Django decides what a user may actually see and do,
because that logic is tenant- and role-specific and would be expensive to move
later. See [docs/api/authentication.md](docs/api/authentication.md).

## Repository Structure

```
vero/
├── apps/
│   ├── web/                    # Next.js application
│   └── mobile/                 # Expo app (placeholder)
│
├── backend/
│   ├── manage.py
│   ├── config/                 # project configuration, not a domain
│   │   ├── settings/           # base.py / development.py / production.py
│   │   ├── celery.py
│   │   └── urls.py
│   ├── apps/                   # one package per business domain
│   │   ├── users/  organizations/  clients/  events/
│   │   ├── packages/  menus/  quotations/  contracts/
│   │   ├── event_orders/  checklists/  payments/
│   │   └── notifications/  files/
│   └── requirements/           # base / development / production
│
├── shared/                     # types and constants shared across clients
│   ├── types/
│   └── constants/
│
├── docs/
│   ├── architecture/           # system design, database, event lifecycle
│   ├── api/                    # endpoints, authentication
│   └── product/                # roadmap, principles
│
├── docker/                     # container definitions
├── scripts/                    # bootstrap and operational scripts
├── .github/workflows/          # CI
├── docker-compose.yml
└── .env.example
```

## Local Development

### Prerequisites

Node.js 20+, Python 3.12, and (optionally) Docker for Postgres and Redis.

### Quick start

```bash
./scripts/bootstrap.sh
```

That installs both toolchains and creates the env files. Then fill in `.env` and
`backend/.env`.

### Manual setup

**Web**

```bash
npm install          # installs the whole workspace from the root
npm run dev          # http://localhost:3000
```

**Backend**

```bash
brew install uv                                     # if not already installed
cd backend
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements/development.txt
cp ../.env.example .env                             # then fill it in
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver                # http://localhost:8000
```

**Datastores**

```bash
docker compose up -d postgres redis
```

> The web app currently stores demo data in the browser's localStorage and does
> not call the API. `apps/web/lib/store.tsx` is the single seam where `fetch()`
> calls will go.

### Useful commands

| Command | Effect |
| --- | --- |
| `npm run dev` | Web dev server |
| `npm run build` | Static export to `apps/web/out` |
| `npm run lint` | Lint the web app |
| `cd backend && .venv/bin/python manage.py check` | Django system check |
| `cd backend && .venv/bin/pytest` | Backend tests |
| `pre-commit run --all-files` | All formatters and linters |

## Deployment

**Web.** The app builds to a static export and deploys to GitHub Pages on every
push to `main` via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
The base path is derived from the repository name, so it serves correctly from
`https://<user>.github.io/<repo>/`.

Once the app talks to a real API it will need server-side rendering, at which
point `output: "export"` comes out of `apps/web/next.config.mjs` and hosting
moves to Vercel or a container.

**Backend.** Not yet deployed. The intended shape is a container running
gunicorn with `config.settings.production`, a managed PostgreSQL instance,
managed Redis, and separate Celery worker containers from the same image.

## Roadmap

The immediate priorities, in order:

1. Custom `User` model and initial migration — must land before any other
   backend work
2. Organizations and enforced multi-tenancy
3. Supabase Auth wired end to end
4. Event model and CRUD API
5. Web app reading from the API instead of localStorage

Full roadmap: [docs/product/roadmap.md](docs/product/roadmap.md).

## Contributing

1. Branch from `main`.
2. Install the hooks: `pre-commit install`.
3. Keep changes within one domain where possible — the app boundaries in
   `backend/apps/` exist to make that natural.
4. Update the relevant document in `docs/` in the same change, not afterwards.
5. Open a pull request. CI must pass.

Read [docs/architecture/event-lifecycle.md](docs/architecture/event-lifecycle.md)
and [docs/product/product-principles.md](docs/product/product-principles.md)
before your first substantial change. They settle most design arguments.

## License

Proprietary. All rights reserved. See [LICENSE](LICENSE).
