from django.db import models

from shop.models.base import TimeStampedModel


class Subscriber(TimeStampedModel):
    """Newsletter email subscriber. Unique by email, soft-unsubscribe."""

    email = models.EmailField(unique=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        status = "active" if self.is_active else "unsubscribed"
        return f"{self.email} ({status})"
