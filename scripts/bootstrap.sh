#!/usr/bin/env bash
#
# First-run setup for a fresh clone of Vero.
#
#   ./scripts/bootstrap.sh
#
# Idempotent — safe to re-run.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Frontend: installing workspace dependencies"
npm install

echo "==> Backend: creating virtualenv"
if ! command -v uv >/dev/null 2>&1; then
  echo "    uv not found. Install it first:  brew install uv"
  echo "    (or create the venv by hand with python3.12 -m venv backend/.venv)"
  exit 1
fi

cd backend
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -r requirements/development.txt
cd "$REPO_ROOT"

echo "==> Environment files"
[ -f .env ] || { cp .env.example .env; echo "    created .env"; }
[ -f backend/.env ] || { cp .env.example backend/.env; echo "    created backend/.env"; }

cat <<'EOF'

Done. Next:

  1. Fill in .env and backend/.env (both are currently empty).
  2. Start the datastores:   docker compose up -d postgres redis
  3. Migrate:                cd backend && .venv/bin/python manage.py migrate
  4. Run the API:            cd backend && .venv/bin/python manage.py runserver
  5. Run the web app:        npm run dev

EOF
