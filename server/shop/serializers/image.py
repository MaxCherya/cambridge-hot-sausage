from rest_framework import serializers

from shop.models import ProductImage


class CloudinaryImageField(serializers.ImageField):
    """Return the storage URL directly instead of building an absolute URI from the request host."""

    def to_representation(self, value):
        if not value:
            return None
        # Cloudinary storage returns full URLs; local storage returns relative paths
        url = value.url
        if url.startswith("http"):
            return url
        # Fallback for local dev — build from MEDIA_URL
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(url)
        return url


class ProductImageSerializer(serializers.ModelSerializer):
    image = CloudinaryImageField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_primary", "order")
