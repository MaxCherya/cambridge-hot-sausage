from rest_framework import serializers
from orders.models import Order, OrderItem


class AdminOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "product_name", "variant_name", "sku", "unit_price", "quantity")


class AdminOrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(read_only=True)
    short_id = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "short_id",
            "customer_name",
            "customer_email",
            "status",
            "total",
            "created_at",
            "item_count",
            "shipping_city",
            "shipping_postal_code",
            "shipping_country",
        )

    def get_short_id(self, obj):
        return obj.id.hex[:8]


class AdminOrderDetailSerializer(serializers.ModelSerializer):
    items = AdminOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        # Explicit field list — guards against accidentally exposing future
        # internal-only columns (notes, audit fields, etc.).
        fields = (
            "id",
            "stripe_session_id",
            "stripe_payment_intent",
            "stripe_receipt_url",
            "status",
            "customer_name",
            "customer_email",
            "customer_phone",
            "shipping_name",
            "shipping_line1",
            "shipping_line2",
            "shipping_city",
            "shipping_postal_code",
            "shipping_country",
            "subtotal",
            "shipping_cost",
            "total",
            "currency",
            "items",
            "created_at",
            "updated_at",
        )


class AdminOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("status",)
