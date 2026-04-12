from rest_framework import serializers

from shop.models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_primary", "order")

    def get_image(self, obj):
        if not obj.image:
            return None
        url = obj.image.url
        if url.startswith("http"):
            return url
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(url)
        return url
