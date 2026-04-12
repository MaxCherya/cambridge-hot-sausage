import uuid

from django.db import models

from .base import TimeStampedModel
from .product import Product


class ProductVariant(TimeStampedModel):
    """
    A purchasable variant of a product. Admin defines any combination
    of attributes via the name field (e.g. "Large + Extra Mustard",
    "Regular", "Spicy — Gluten-free bun").

    Flexible by design — no rigid attribute schema. Like AliExpress/Temu,
    the admin can create whatever variant labels make sense per product.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
    )
    name = models.CharField(
        max_length=300,
        help_text='Freeform label, e.g. "Large", "Spicy + Onions", "Combo".',
    )
    sku = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        blank=True,
        help_text="Auto-generated if left blank.",
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Original price before discount. Shown as strikethrough.",
    )
    stock = models.PositiveIntegerField(
        default=0,
        help_text="0 = out of stock. Leave high for unlimited supply.",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "price"]
        indexes = [
            models.Index(fields=["product", "is_active"]),
        ]

    def __str__(self):
        return f"{self.product.name} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = f"CHS-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    @property
    def in_stock(self):
        return self.stock > 0
