from django.contrib import admin
from django.utils.html import format_html

from shop.models import Product

from .inlines import ProductImageInline, ProductVariantInline


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "is_active",
        "is_featured",
        "variant_count",
        "price_range",
        "rating_display",
        "created_at",
    )
    list_filter = ("is_active", "is_featured", "categories")
    list_editable = ("is_active", "is_featured")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ("categories",)
    inlines = [ProductVariantInline, ProductImageInline]
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("name", "slug", "description", "categories")}),
        ("Visibility", {"fields": ("is_active", "is_featured")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .prefetch_related("variants", "reviews", "categories")
        )

    @admin.display(description="Variants")
    def variant_count(self, obj):
        return obj.variants.count()

    @admin.display(description="Price")
    def price_range(self, obj):
        min_p = obj.min_price
        max_p = obj.max_price
        if min_p is None:
            return "—"
        if min_p == max_p:
            return f"£{min_p}"
        return f"£{min_p} – £{max_p}"

    @admin.display(description="Rating")
    def rating_display(self, obj):
        avg = obj.average_rating
        count = obj.review_count
        if avg is None:
            return "—"
        return format_html("{} ★ <small>({})</small>", avg, count)
