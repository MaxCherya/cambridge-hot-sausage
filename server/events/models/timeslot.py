from django.db import models


class TimeSlot(models.Model):
    """
    Admin-defined time slots for event bookings.
    Each slot is a window (e.g. 11:00–15:00) that customers can book.
    Multiple slots per day are independently bookable.
    """

    label = models.CharField(
        max_length=100,
        help_text='Display name, e.g. "Lunch Service", "Evening Service".',
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveIntegerField(default=0)
    max_bookings_per_day = models.PositiveIntegerField(
        default=1,
        help_text="Max simultaneous bookings for this slot on a single day (usually 1).",
    )

    class Meta:
        ordering = ["order", "start_time"]

    def __str__(self):
        return f"{self.label} ({self.start_time.strftime('%H:%M')}–{self.end_time.strftime('%H:%M')})"
