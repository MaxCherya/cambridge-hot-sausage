from rest_framework import serializers
from shop.models import Product, ProductVariant, ProductImage, Category


class AdminVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ("id", "name", "sku", "price", "compare_at_price", "stock", "is_active", "order")
        read_only_fields = ("id", "sku")


class AdminImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_primary", "order")
        read_only_fields = ("id",)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image and hasattr(instance.image, 'url'):
            url = instance.image.url
            if url.startswith("http"):
                data["image"] = url
        return data


class AdminProductListSerializer(serializers.ModelSerializer):
    variant_count = serializers.IntegerField(read_only=True)
    category_names = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "is_active", "is_featured", "variant_count", "category_names", "created_at")

    def get_category_names(self, obj):
        # Read from the prefetched M2M cache — no extra query.
        return [c.name for c in obj.categories.all()]


class AdminProductWriteSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "description", "categories", "is_active", "is_featured")
        read_only_fields = ("id",)


class AdminProductDetailSerializer(serializers.ModelSerializer):
    variants = AdminVariantSerializer(many=True, read_only=True)
    images = AdminImageSerializer(many=True, read_only=True)
    categories = serializers.PrimaryKeyRelatedField(many=True, queryset=Category.objects.all())

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "description", "categories", "is_active", "is_featured", "variants", "images", "created_at", "updated_at")
