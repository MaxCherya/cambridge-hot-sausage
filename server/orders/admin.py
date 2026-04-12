from django.contrib import admin

from orders.models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "variant_name", "sku", "unit_price", "quantity")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("short_id", "customer_name", "customer_email", "status", "total", "created_at")
    list_filter = ("status", "created_at")
    list_editable = ("status",)
    search_fields = ("id", "customer_email", "customer_name", "stripe_session_id")
    readonly_fields = (
        "id", "stripe_session_id", "stripe_payment_intent",
        "customer_email", "customer_name",
        "shipping_name", "shipping_line1", "shipping_line2",
        "shipping_city", "shipping_postal_code", "shipping_country",
        "subtotal", "shipping_cost", "total", "currency",
        "stripe_receipt_url", "created_at", "updated_at",
    )
    inlines = [OrderItemInline]
    fieldsets = (
        (None, {"fields": ("id", "status", "stripe_session_id", "stripe_payment_intent")}),
        ("Customer", {"fields": ("customer_name", "customer_email")}),
        ("Shipping", {"fields": (
            "shipping_name", "shipping_line1", "shipping_line2",
            "shipping_city", "shipping_postal_code", "shipping_country",
        )}),
        ("Totals", {"fields": ("subtotal", "shipping_cost", "total", "currency", "stripe_receipt_url")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    @admin.display(description="Order ID")
    def short_id(self, obj):
        return obj.id.hex[:8]
