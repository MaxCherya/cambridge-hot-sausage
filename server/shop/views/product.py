from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from shop.filters import ProductFilter
from shop.models import Product
from shop.serializers import ProductDetailSerializer, ProductListSerializer

CACHE_TTL = 60 * 10  # 10 minutes


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for products.

    - List: compact cards with primary image, price range, rating.
      No server-side cache — TanStack Query handles client caching.
    - Detail: full product page — cached 10 min server-side.
    """

    permission_classes = [AllowAny]
    lookup_field = "slug"
    filterset_class = ProductFilter
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .prefetch_related(
                "categories",
                "images",
                "variants",
                "reviews",
            )
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    @method_decorator(cache_page(CACHE_TTL, key_prefix="product_detail"))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
