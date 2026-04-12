from rest_framework import serializers
from orders.models import Order, OrderItem


class AdminOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "product_name", "variant_name", "sku", "unit_price", "quantity")


class AdminOrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()
    short_id = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ("id", "short_id", "customer_name", "customer_email", "status", "total", "created_at", "item_count", "shipping_city", "shipping_postal_code", "shipping_country")

    def get_item_count(self, obj):
        return obj.items.count()

    def get_short_id(self, obj):
        return obj.id.hex[:8]


class AdminOrderDetailSerializer(serializers.ModelSerializer):
    items = AdminOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = "__all__"


class AdminOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("status",)
