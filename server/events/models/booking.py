import uuid

from django.db import models
from django.utils import timezone

from shop.models.base import TimeStampedModel


class BlockedDate(models.Model):
    """Dates the admin has blocked off (holidays, maintenance, etc.)."""

    date = models.DateField(unique=True, db_index=True)
    reason = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["date"]

    def __str__(self):
        return f"{self.date} — {self.reason or 'Blocked'}"


class EventBooking(TimeStampedModel):
    """
    An event booking with cinema-seat hold pattern.

    Lifecycle:
      1. User selects date → status=HELD, hold_expires_at set
      2. User completes form + pays → status=CONFIRMED
      3. Hold expires without payment → status auto-reverts to available
         (no row needed — the held row is cleaned up on read)
      4. Admin or user cancels → status=CANCELLED
    """

    class Status(models.TextChoices):
        HELD = "held", "Held"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(db_index=True)
    time_slot = models.ForeignKey(
        "events.TimeSlot",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
        help_text="The time slot for this booking.",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.HELD,
        db_index=True,
    )
    hold_token = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="Client-side token to identify the holder.",
    )
    hold_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the hold auto-releases.",
    )

    # Location
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    location_address = models.TextField(blank=True)
    distance_miles = models.FloatField(null=True, blank=True)

    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Event details
    num_guests = models.PositiveIntegerField(null=True, blank=True)
    timing_start = models.TimeField(null=True, blank=True)
    timing_end = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True, max_length=2000)

    # Customer
    customer_name = models.CharField(max_length=200, blank=True)
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)

    # Stripe
    stripe_session_id = models.CharField(max_length=255, blank=True, db_index=True)

    class Meta:
        ordering = ["date"]
        indexes = [
            models.Index(fields=["date", "status"]),
            models.Index(fields=["hold_token"]),
        ]

    def __str__(self):
        return f"{self.date} — {self.status} ({self.customer_name or 'No name'})"

    @property
    def is_hold_expired(self):
        if self.status != self.Status.HELD:
            return False
        if not self.hold_expires_at:
            return True
        return timezone.now() >= self.hold_expires_at

    @classmethod
    def cleanup_expired_holds(cls):
        """Delete holds that have expired. Called lazily on calendar reads."""
        cls.objects.filter(
            status=cls.Status.HELD,
            hold_expires_at__lt=timezone.now(),
        ).delete()

    @classmethod
    def is_date_available(cls, date):
        """Check if any slot on this date is still available."""
        cls.cleanup_expired_holds()
        from events.models.timeslot import TimeSlot
        active_slots = TimeSlot.objects.filter(is_active=True).count()
        booked = cls.objects.filter(
            date=date,
            status__in=[cls.Status.HELD, cls.Status.CONFIRMED],
        ).count()
        return booked < max(active_slots, 1)

    @classmethod
    def is_slot_available(cls, date, time_slot_id):
        """Check if a specific slot on a date is available."""
        cls.cleanup_expired_holds()
        return not cls.objects.filter(
            date=date,
            time_slot_id=time_slot_id,
            status__in=[cls.Status.HELD, cls.Status.CONFIRMED],
        ).exists()
