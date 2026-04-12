from django.db import models
from django.utils.text import slugify

from .base import TimeStampedModel
from .category import Category


class Product(TimeStampedModel):
    """
    A product listing. Has many variants (each with its own price/stock),
    many images, and many reviews. Assigned to one or more categories.
    """

    name = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True, db_index=True)
    description = models.TextField(blank=True)
    categories = models.ManyToManyField(
        Category,
        related_name="products",
        blank=True,
    )
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Shown in featured/highlighted sections on the storefront.",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_active", "is_featured"]),
            models.Index(fields=["is_active", "-created_at"]),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        return self.images.filter(is_primary=True).first() or self.images.first()

    @property
    def min_price(self):
        result = self.variants.filter(is_active=True).aggregate(models.Min("price"))
        return result["price__min"]

    @property
    def max_price(self):
        result = self.variants.filter(is_active=True).aggregate(models.Max("price"))
        return result["price__max"]

    @property
    def average_rating(self):
        result = self.reviews.filter(is_approved=True).aggregate(models.Avg("rating"))
        avg = result["rating__avg"]
        return round(avg, 1) if avg else None

    @property
    def review_count(self):
        return self.reviews.filter(is_approved=True).count()

    @property
    def active_variants(self):
        return self.variants.filter(is_active=True)
