from django.contrib import admin

from contact.models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "status", "created_at")
    list_filter = ("status", "created_at")
    list_editable = ("status",)
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "phone", "subject", "message", "created_at")
    fieldsets = (
        (None, {"fields": ("name", "email", "phone")}),
        ("Content", {"fields": ("subject", "message")}),
        ("Status", {"fields": ("status",)}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    actions = ["mark_read", "mark_replied", "mark_archived"]

    @admin.action(description="Mark as read")
    def mark_read(self, request, queryset):
        queryset.update(status=ContactMessage.Status.READ)

    @admin.action(description="Mark as replied")
    def mark_replied(self, request, queryset):
        queryset.update(status=ContactMessage.Status.REPLIED)

    @admin.action(description="Archive")
    def mark_archived(self, request, queryset):
        queryset.update(status=ContactMessage.Status.ARCHIVED)
