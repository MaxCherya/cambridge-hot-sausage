from django.core.validators import MinValueValidator
from django.db import models


class EventConfig(models.Model):
    """
    Singleton configuration for event bookings.
    Admin edits pricing, radius, hold duration here.
    Only one row should ever exist — enforced by the save() override.
    """

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=250.00,
        help_text="Base price for an event within the free-delivery radius.",
    )

    # Distance band surcharges (cumulative on top of base_price)
    band_1_miles = models.PositiveIntegerField(default=25, help_text="End of free band (miles).")
    band_2_miles = models.PositiveIntegerField(default=50)
    band_3_miles = models.PositiveIntegerField(default=100)
    band_4_miles = models.PositiveIntegerField(default=200, help_text="Max radius.")

    band_1_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="0–25 mi surcharge (usually 0).")
    band_2_price = models.DecimalField(max_digits=10, decimal_places=2, default=50.00, help_text="25–50 mi surcharge.")
    band_3_price = models.DecimalField(max_digits=10, decimal_places=2, default=120.00, help_text="50–100 mi surcharge.")
    band_4_price = models.DecimalField(max_digits=10, decimal_places=2, default=250.00, help_text="100–200 mi surcharge.")

    max_radius_miles = models.PositiveIntegerField(default=200)
    hold_duration_minutes = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1)],
        help_text="How long a date hold lasts before auto-release.",
    )
    min_guests = models.PositiveIntegerField(default=10)
    max_guests = models.PositiveIntegerField(default=500)

    class Meta:
        verbose_name = "Event Configuration"
        verbose_name_plural = "Event Configuration"

    def __str__(self):
        return "Event Configuration"

    def save(self, *args, **kwargs):
        # Enforce singleton — always use pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def calculate_surcharge(self, distance_miles: float) -> "tuple[str, float]":
        """Return (band_label, surcharge) for a given distance."""
        if distance_miles <= self.band_1_miles:
            return f"0–{self.band_1_miles} mi", float(self.band_1_price)
        elif distance_miles <= self.band_2_miles:
            return f"{self.band_1_miles}–{self.band_2_miles} mi", float(self.band_2_price)
        elif distance_miles <= self.band_3_miles:
            return f"{self.band_2_miles}–{self.band_3_miles} mi", float(self.band_3_price)
        else:
            return f"{self.band_3_miles}–{self.band_4_miles} mi", float(self.band_4_price)

    def total_price(self, distance_miles: float) -> float:
        _, surcharge = self.calculate_surcharge(distance_miles)
        return float(self.base_price) + surcharge
