from django.urls import path

from newsletter.views import SubscribeView

urlpatterns = [
    path("subscribe", SubscribeView.as_view(), name="newsletter-subscribe"),
]
