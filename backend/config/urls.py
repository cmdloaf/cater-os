"""
Root URL configuration for Vero.

The API is versioned from day one — /api/v1/ — so that a breaking change later
can be shipped alongside the current version rather than in place of it.

Domain routes are commented out until each app actually exposes endpoints.
Uncomment a line at the same time as you add views to that app.
"""

from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
    # path("api/v1/organizations/", include("apps.organizations.urls")),
    # path("api/v1/users/", include("apps.users.urls")),
    # path("api/v1/clients/", include("apps.clients.urls")),
    # path("api/v1/events/", include("apps.events.urls")),
    # path("api/v1/packages/", include("apps.packages.urls")),
    # path("api/v1/menus/", include("apps.menus.urls")),
    # path("api/v1/quotations/", include("apps.quotations.urls")),
    # path("api/v1/contracts/", include("apps.contracts.urls")),
    # path("api/v1/event-orders/", include("apps.event_orders.urls")),
    # path("api/v1/checklists/", include("apps.checklists.urls")),
    # path("api/v1/payments/", include("apps.payments.urls")),
    # path("api/v1/notifications/", include("apps.notifications.urls")),
    # path("api/v1/files/", include("apps.files.urls")),
]
