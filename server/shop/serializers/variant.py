from rest_framework import serializers

from shop.models import ProductVariant


class ProductVariantSerializer(serializers.ModelSerializer):
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "name",
            "sku",
            "price",
            "compare_at_price",
            "stock",
            "in_stock",
            "order",
        )
