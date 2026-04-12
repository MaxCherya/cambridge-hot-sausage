from django.db import models

# Monday=0 ... Sunday=6 (Python weekday convention)
DAY_CHOICES = [
    (0, "Monday"),
    (1, "Tuesday"),
    (2, "Wednesday"),
    (3, "Thursday"),
    (4, "Friday"),
    (5, "Saturday"),
    (6, "Sunday"),
]


class TimeSlot(models.Model):
    """
    Admin-defined time slots for event bookings.
    Each slot has day-of-week rules — admin can assign different
    slots to different days (e.g. Lunch Mon-Fri, Evening Fri-Sat).
    """

    label = models.CharField(
        max_length=100,
        help_text='Display name, e.g. "Lunch Service", "Evening Service".',
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveIntegerField(default=0)

    # Day-of-week rules: comma-separated day numbers (0=Mon, 6=Sun)
    # Empty means "all days"
    available_days = models.CharField(
        max_length=20,
        blank=True,
        default="",
        help_text='Comma-separated day numbers (0=Mon, 6=Sun). Empty = every day. e.g. "0,1,2,3,4" for weekdays.',
    )

    class Meta:
        ordering = ["order", "start_time"]

    def __str__(self):
        days = self.get_day_labels()
        day_str = f" ({days})" if days != "Every day" else ""
        return f"{self.label} ({self.start_time.strftime('%H:%M')}–{self.end_time.strftime('%H:%M')}){day_str}"

    def get_day_numbers(self) -> list[int]:
        """Return list of day numbers this slot is available on. Empty list = all days."""
        if not self.available_days.strip():
            return []
        return [int(d.strip()) for d in self.available_days.split(",") if d.strip().isdigit()]

    def get_day_labels(self) -> str:
        nums = self.get_day_numbers()
        if not nums:
            return "Every day"
        day_map = dict(DAY_CHOICES)
        return ", ".join(day_map.get(n, "?") for n in sorted(nums))

    def is_available_on(self, weekday: int) -> bool:
        """Check if this slot is available on a given weekday (0=Mon, 6=Sun)."""
        nums = self.get_day_numbers()
        return not nums or weekday in nums
