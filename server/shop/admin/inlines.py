from django.contrib import admin

from shop.models import ProductImage, ProductVariant


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ("name", "sku", "price", "compare_at_price", "stock", "is_active", "order")
    readonly_fields = ("sku",)
    ordering = ("order", "price")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "is_primary", "order")
    ordering = ("-is_primary", "order")
