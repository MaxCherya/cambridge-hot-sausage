from rest_framework import serializers
from shop.models import Product, ProductVariant, ProductImage, Category


class AdminVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ("id", "name", "sku", "price", "compare_at_price", "stock", "is_active", "order")
        read_only_fields = ("id", "sku")


class AdminImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_primary", "order")
        read_only_fields = ("id",)


class AdminProductListSerializer(serializers.ModelSerializer):
    variant_count = serializers.SerializerMethodField()
    category_names = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ("id", "name", "slug", "is_active", "is_featured", "variant_count", "category_names", "created_at")

    def get_variant_count(self, obj):
        return obj.variants.count()

    def get_category_names(self, obj):
        return list(obj.categories.values_list("name", flat=True))


class AdminProductWriteSerializer(serializers.ModelSerializer):
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
