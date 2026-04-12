import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from events.models import EventBooking


@csrf_exempt
@require_POST
def events_webhook(request):
    """
    Shares the same Stripe webhook endpoint as orders.
    This handler specifically looks for event booking metadata.
    Called from the main webhook dispatcher.
    """
    # This is called by the main webhook, not directly
    pass


def handle_event_booking_completed(session):
    """
    Called from the orders webhook when metadata.type == 'event_booking'.
    Confirms the booking and removes the hold expiry.
    """
    stripe.api_key = settings.STRIPE_SECRET_KEY

    hold_token = session.get("metadata", {}).get("hold_token") if isinstance(session, dict) else getattr(getattr(session, "metadata", None), "get", lambda *a: None)("hold_token")

    # Handle both dict and StripeObject
    if hasattr(session, "metadata") and hasattr(session.metadata, "get"):
        hold_token = session.metadata.get("hold_token")
    elif isinstance(session, dict):
        hold_token = session.get("metadata", {}).get("hold_token")
    else:
        hold_token = None

    if not hold_token:
        return

    try:
        booking = EventBooking.objects.get(hold_token=hold_token)
    except EventBooking.DoesNotExist:
        return

    booking.status = EventBooking.Status.CONFIRMED
    booking.hold_expires_at = None
    booking.save(update_fields=["status", "hold_expires_at", "updated_at"])
