from django.contrib import admin
from mptt.admin import DraggableMPTTAdmin

from shop.models import Category


@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin):
    list_display = (
        "tree_actions",
        "indented_title",
        "slug",
        "is_active",
        "order",
    )
    list_display_links = ("indented_title",)
    list_editable = ("is_active", "order")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    fieldsets = (
        (None, {"fields": ("name", "slug", "parent", "description", "image")}),
        ("Visibility", {"fields": ("is_active", "order")}),
    )
