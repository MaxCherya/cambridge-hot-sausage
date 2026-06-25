from rest_framework import serializers

from shop.models import Product

from .category import CategoryListSerializer
from .image import ProductImageSerializer
from .review import ReviewReadSerializer
from .variant import ProductVariantSerializer


def _pick_primary_image(obj):
    """Pick the primary image from the prefetched list — no extra DB query."""
    images = list(obj.images.all())
    if not images:
        return None
    return next((i for i in images if i.is_primary), images[0])


class ProductListSerializer(serializers.ModelSerializer):
    """Compact serializer for product listings / grids."""

    primary_image = serializers.SerializerMethodField()
    min_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True, source="agg_min_price",
    )
    max_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True, source="agg_max_price",
    )
    average_rating = serializers.FloatField(read_only=True, source="agg_average_rating")
    review_count = serializers.IntegerField(read_only=True, source="agg_review_count")
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

    def get_primary_image(self, obj):
        primary = _pick_primary_image(obj)
        if not primary:
            return None
        return ProductImageSerializer(primary, context=self.context).data


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail pages — includes variants, images, reviews."""

    categories = CategoryListSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True, source="active_variants")
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True, source="agg_average_rating")
    review_count = serializers.IntegerField(read_only=True, source="agg_review_count")

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
        # Read from the filtered Prefetch on the viewset; never re-query.
        approved = getattr(obj, "approved_reviews", None)
        if approved is None:
            approved = list(obj.reviews.filter(is_approved=True)[:20])
        else:
            approved = approved[:20]
        return ReviewReadSerializer(approved, many=True).data
