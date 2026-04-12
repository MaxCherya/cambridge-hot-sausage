from rest_framework import serializers
from shop.models import Review


class AdminReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = Review
        fields = ("id", "product", "product_name", "author_name", "author_email", "rating", "title", "text", "is_approved", "created_at")
        read_only_fields = ("id", "product", "product_name", "author_name", "author_email", "rating", "title", "text", "created_at")
