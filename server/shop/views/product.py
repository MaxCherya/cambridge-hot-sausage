from django.core.cache import cache
from django.db.models import Avg, Count, IntegerField, Max, Min, OuterRef, Prefetch, Subquery
from django.db.models.functions import Coalesce
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from shop.cache_versions import get_products_version
from shop.filters import ProductFilter
from shop.models import Product, ProductVariant, Review
from shop.serializers import ProductDetailSerializer, ProductListSerializer

CACHE_TTL = 60 * 10  # 10 minutes


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for products.

    - List: compact cards with primary image, price range, rating.
      No server-side cache — TanStack Query handles client caching.
    - Detail: full product page — cached 10 min server-side, with a
      version-keyed cache key. Invalidation is O(1) via cache.incr in
      the model signals (see shop.signals.cache).
    """

    permission_classes = [AllowAny]
    lookup_field = "slug"
    filterset_class = ProductFilter
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        variants_qs = ProductVariant.objects.filter(
            product=OuterRef("pk"),
            is_active=True,
        )
        reviews_qs = Review.objects.filter(
            product=OuterRef("pk"),
            is_approved=True,
        )

        return (
            Product.objects
            .filter(is_active=True)
            .annotate(
                agg_min_price=Subquery(
                    variants_qs.order_by("price").values("price")[:1]
                ),
                agg_max_price=Subquery(
                    variants_qs.order_by("-price").values("price")[:1]
                ),
                agg_average_rating=Subquery(
                    reviews_qs.values("product")
                    .annotate(avg=Avg("rating"))
                    .values("avg")[:1]
                ),
                agg_review_count=Coalesce(
                    Subquery(
                        reviews_qs.values("product")
                        .annotate(c=Count("id"))
                        .values("c")[:1],
                        output_field=IntegerField(),
                    ),
                    0,
                ),
            )
            .prefetch_related(
                "categories",
                "images",
                "variants",
                Prefetch(
                    "reviews",
                    queryset=Review.objects.filter(is_approved=True).order_by("-created_at"),
                    to_attr="approved_reviews",
                ),
            )
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def retrieve(self, request, *args, **kwargs):
        version = get_products_version()
        cache_key = f"shop:v{version}:product_detail:{kwargs.get(self.lookup_field, '')}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        # Only cache successful 200s — never persist a 404/500 response.
        if response.status_code == 200:
            cache.set(cache_key, response.data, CACHE_TTL)
        return response
