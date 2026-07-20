# Docker

Container definitions for Vero. Referenced by `docker-compose.yml` at the
repository root.

| File | Purpose |
| --- | --- |
| `backend.Dockerfile` | Django app image. Development-grade scaffold. |

Planned additions: a hardened `backend.prod.Dockerfile` (non-root user,
gunicorn, `requirements/production.txt`, multi-stage build) and, if the web app
ever moves off static export, `web.Dockerfile`.
