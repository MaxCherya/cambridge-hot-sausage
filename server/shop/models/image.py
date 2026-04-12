from django.db import models

from .base import TimeStampedModel
from .product import Product


class ProductImage(TimeStampedModel):
    """
    Multiple images per product with ordering and a primary flag.
    First image is the hero, rest are gallery — same pattern as
    major e-commerce platforms.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="products/%Y/%m/")
    alt_text = models.CharField(max_length=300, blank=True)
    is_primary = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Main image shown in listings and hero position.",
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-is_primary", "order"]
        indexes = [
            models.Index(fields=["product", "-is_primary", "order"]),
        ]

    def __str__(self):
        label = " [PRIMARY]" if self.is_primary else ""
        return f"{self.product.name} — image #{self.order}{label}"
