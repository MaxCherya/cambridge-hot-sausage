from django_filters import rest_framework as filters

from shop.models import Product


class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(
        field_name="categories__slug",
        lookup_expr="exact",
        help_text="Filter by category slug.",
    )
    min_price = filters.NumberFilter(
        field_name="variants__price",
        lookup_expr="gte",
        label="Minimum price",
    )
    max_price = filters.NumberFilter(
        field_name="variants__price",
        lookup_expr="lte",
        label="Maximum price",
    )
    featured = filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = Product
        fields = ["category", "min_price", "max_price", "featured"]
