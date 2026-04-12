from django.urls import path

from orders.views import CreateCheckoutSessionView, SessionDetailView, stripe_webhook

urlpatterns = [
    path("checkout", CreateCheckoutSessionView.as_view(), name="checkout"),
    path("session", SessionDetailView.as_view(), name="session-detail"),
    path("webhook", stripe_webhook, name="stripe-webhook"),
]
