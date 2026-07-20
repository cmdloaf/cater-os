"""
Vero backend project package.

Importing the Celery app here guarantees it is initialised whenever Django
starts, so the @shared_task decorator resolves to this app.
"""

from .celery import app as celery_app

__all__ = ("celery_app",)
