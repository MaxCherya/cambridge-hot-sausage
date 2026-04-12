from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/shop/", include("shop.urls")),
    path("api/v1/orders/", include("orders.urls")),
    path("api/v1/contact", include("contact.urls")),
    path("api/v1/newsletter/", include("newsletter.urls")),
    path("api/v1/events/", include("events.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
