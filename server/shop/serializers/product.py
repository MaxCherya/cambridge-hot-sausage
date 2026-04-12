from rest_framework import serializers

from shop.models import Product

from .category import CategoryListSerializer
from .image import ProductImageSerializer
from .review import ReviewReadSerializer
from .variant import ProductVariantSerializer


class ProductListSerializer(serializers.ModelSerializer):
    """Compact serializer for product listings / grids."""

    primary_image = ProductImageSerializer(read_only=True)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    categories = CategoryListSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "categories",
            "primary_image",
            "min_price",
            "max_price",
            "average_rating",
            "review_count",
            "is_featured",
            "created_at",
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail pages — includes variants, images, reviews."""

    categories = CategoryListSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True, source="active_variants")
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "categories",
            "variants",
            "images",
            "reviews",
            "average_rating",
            "review_count",
            "is_featured",
            "created_at",
        )

    def get_reviews(self, obj):
        approved = obj.reviews.filter(is_approved=True)[:20]
        return ReviewReadSerializer(approved, many=True).data
