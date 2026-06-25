import uuid
from datetime import timedelta

from django.db import models
from django.utils import timezone

from shop.models.base import TimeStampedModel


class PendingOrder(TimeStampedModel):
    """
    Cart snapshot stored at checkout-creation, consumed by the Stripe
    webhook when payment completes.

    Replaces the previous approach of packing the cart into Stripe
    metadata as a `|`/`:`-joined string — that path was vulnerable to
    SKU injection (admin-controlled values containing the separator)
    and capped at 500 chars per metadata value, which translated to a
    hard limit on cart size.

    Lifecycle:
      1. /checkout creates the row and records the buyer_id (also passed
         into Stripe metadata for the success-page cookie check).
      2. Webhook reads PendingOrder by `pending_id` (in metadata), builds
         the Order + OrderItems from `cart_snapshot`, and sets
         `consumed_at`.
      3. Anything still unconsumed past `expires_at` is garbage-collected.
    """

    PENDING_TTL = timedelta(hours=24)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer_id = models.CharField(max_length=64)
    cart_snapshot = models.JSONField()
    expires_at = models.DateTimeField(db_index=True)
    consumed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["expires_at"]),
            models.Index(fields=["consumed_at"]),
        ]

    def __str__(self):
        state = "consumed" if self.consumed_at else "pending"
        return f"PendingOrder {self.id.hex[:8]} ({state})"

    @classmethod
    def default_expires_at(cls):
        return timezone.now() + cls.PENDING_TTL

    @classmethod
    def cleanup_expired(cls):
        """Delete unconsumed expired rows. Called on a debounced hot path."""
        cls.objects.filter(
            consumed_at__isnull=True,
            expires_at__lt=timezone.now(),
        ).delete()
