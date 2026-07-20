"""
Production settings.

Everything here assumes it is running behind a TLS-terminating proxy. Values are
read from the environment with no permissive defaults — the app should fail to
boot rather than start up insecure.
"""

from .base import *  # noqa: F403
from .base import env  # noqa: F401

DEBUG = False

SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

# --------------------------------------------------------------------------
# Transport security
# --------------------------------------------------------------------------

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 365  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# --------------------------------------------------------------------------
# Object storage — Cloudflare R2 via the S3-compatible API
# --------------------------------------------------------------------------
# R2 is S3-compatible, so django-storages' S3 backend works unchanged provided
# the endpoint URL points at the R2 account and signature v4 is used.
# Uncomment once the bucket exists and the credentials are in the environment.
#
# STORAGES = {
#     "default": {
#         "BACKEND": "storages.backends.s3.S3Storage",
#         "OPTIONS": {
#             "bucket_name": env("R2_BUCKET_NAME"),
#             "endpoint_url": env("R2_ENDPOINT_URL"),
#             "access_key": env("R2_ACCESS_KEY_ID"),
#             "secret_key": env("R2_SECRET_ACCESS_KEY"),
#             "region_name": "auto",
#             "signature_version": "s3v4",
#             "default_acl": None,
#             "querystring_auth": True,
#         },
#     },
#     "staticfiles": {
#         "BACKEND": "django.contrib.staticfiles.storage.ManifestStaticFilesStorage",
#     },
# }

# Celery must never run inline in production.
CELERY_TASK_ALWAYS_EAGER = False
