"""
Celery application for Vero.

Background work this will eventually carry: rendering quotation/contract/BEO
PDFs, notification fan-out, payment reminders and scheduled reports.

No tasks are defined yet. `autodiscover_tasks` picks up a `tasks.py` in any
installed app as soon as one appears, so adding work later needs no change here.
"""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

app = Celery("vero")

# Read config from Django settings, taking only keys prefixed CELERY_.
app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Smoke test that the worker is wired up: `debug_task.delay()`."""
    print(f"Request: {self.request!r}")
