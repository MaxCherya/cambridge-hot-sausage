from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from .base import TimeStampedModel
from .product import Product


class Review(TimeStampedModel):
    """
    User-submitted product review. Requires admin approval before
    it appears on the storefront.

    Includes a honeypot field (website) to catch bots — any submission
    with that field filled is silently rejected at the serializer level.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    author_name = models.CharField(max_length=150)
    author_email = models.EmailField(
        help_text="Never exposed via the API — admin-only.",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    title = models.CharField(max_length=200, blank=True)
    text = models.TextField(max_length=2000)
    is_approved = models.BooleanField(default=False, db_index=True)

    # Honeypot — bots will fill this. The API serializer silently
    # rejects any submission where this field is non-empty.
    website = models.URLField(blank=True, editable=False)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["product", "is_approved", "-created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(rating__gte=1, rating__lte=5),
                name="review_rating_range",
            ),
        ]

    def __str__(self):
        return f"{self.author_name} — {self.rating}★ on {self.product.name}"
