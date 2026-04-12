from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from shop.models import Category
from shop.serializers import CategorySerializer

CACHE_TTL = 60 * 15  # 15 minutes


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for the category tree.
    Only root-level active categories are returned at the top level;
    children are nested via the serializer.
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

    @method_decorator(cache_page(CACHE_TTL, key_prefix="categories"))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(CACHE_TTL, key_prefix="category_detail"))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
