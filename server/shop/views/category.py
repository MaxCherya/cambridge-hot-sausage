from django.core.cache import cache
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from shop.cache_versions import get_categories_version
from shop.models import Category
from shop.serializers import CategorySerializer

CACHE_TTL = 60 * 15  # 15 minutes


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for the category tree.
    Only root-level active categories are returned at the top level;
    children are nested via the serializer.

    Both list and retrieve use version-keyed caching — invalidation is
    O(1) via cache.incr in the model signals.
    """

    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Category.objects
            .filter(is_active=True, parent__isnull=True)
            .prefetch_related("children", "products")
        )

    def list(self, request, *args, **kwargs):
        version = get_categories_version()
        cache_key = f"shop:v{version}:categories:list:{request.get_full_path()}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            cache.set(cache_key, response.data, CACHE_TTL)
        return response

    def retrieve(self, request, *args, **kwargs):
        version = get_categories_version()
        cache_key = f"shop:v{version}:category_detail:{kwargs.get(self.lookup_field, '')}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200:
            cache.set(cache_key, response.data, CACHE_TTL)
        return response
