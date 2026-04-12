from django.contrib import admin

from shop.models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "author_name",
        "product",
        "rating",
        "is_approved",
        "created_at",
    )
    list_filter = ("is_approved", "rating", "created_at")
    list_editable = ("is_approved",)
    search_fields = ("author_name", "author_email", "title", "text")
    readonly_fields = ("author_name", "author_email", "rating", "title", "text", "product", "created_at")
    fieldsets = (
        (None, {"fields": ("product", "author_name", "author_email")}),
        ("Content", {"fields": ("rating", "title", "text")}),
        ("Moderation", {"fields": ("is_approved",)}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    actions = ["approve_reviews", "reject_reviews"]

    @admin.action(description="Approve selected reviews")
    def approve_reviews(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f"{updated} review(s) approved.")

    @admin.action(description="Reject selected reviews")
    def reject_reviews(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f"{updated} review(s) rejected.")
