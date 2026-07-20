# SCAFFOLD ONLY — development image, not hardened for production.
#
# Before deploying this: run as a non-root user, use requirements/production.txt,
# collect static files, and serve through gunicorn rather than runserver.

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first so the dependency layer is cached independently of
# application code.
COPY requirements/ /app/requirements/
RUN pip install --no-cache-dir -r requirements/development.txt

COPY . /app/

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
