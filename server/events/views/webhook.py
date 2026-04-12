from events.models import EventBooking


def handle_event_booking_completed(session):
    """
    Called from the orders webhook when metadata.type == 'event_booking'.
    Confirms the booking and removes the hold expiry.
    """
    metadata = getattr(session, "metadata", None)

    hold_token = None
    if metadata is not None:
        try:
            hold_token = metadata["hold_token"]
        except (KeyError, TypeError):
            hold_token = getattr(metadata, "hold_token", None)

    if not hold_token:
        return

    try:
        booking = EventBooking.objects.get(hold_token=hold_token)
    except EventBooking.DoesNotExist:
        return

    booking.status = EventBooking.Status.CONFIRMED
    booking.hold_expires_at = None
    booking.save(update_fields=["status", "hold_expires_at", "updated_at"])
