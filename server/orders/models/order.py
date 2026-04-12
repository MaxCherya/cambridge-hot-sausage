import uuid

from django.db import models

from shop.models.base import TimeStampedModel


class Order(TimeStampedModel):
    """
    Created after Stripe confirms payment via webhook.
    Stores shipping address and line items as a snapshot
    (decoupled from product/variant changes).
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stripe_session_id = models.CharField(max_length=255, unique=True, db_index=True)
    stripe_payment_intent = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=200, blank=True)

    # Shipping address snapshot
    shipping_name = models.CharField(max_length=200, blank=True)
    shipping_line1 = models.CharField(max_length=300, blank=True)
    shipping_line2 = models.CharField(max_length=300, blank=True)
    shipping_city = models.CharField(max_length=100, blank=True)
    shipping_postal_code = models.CharField(max_length=20, blank=True)
    shipping_country = models.CharField(max_length=2, blank=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="gbp")

    stripe_receipt_url = models.URLField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
        ]

    def __str__(self):
        return f"Order {self.id.hex[:8]} — {self.status}"


class OrderItem(TimeStampedModel):
    """Snapshot of a line item at the time of purchase."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product_name = models.CharField(max_length=300)
    variant_name = models.CharField(max_length=300)
    sku = models.CharField(max_length=64)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product_name} — {self.variant_name} x{self.quantity}"

    @property
    def line_total(self):
        return self.unit_price * self.quantity
