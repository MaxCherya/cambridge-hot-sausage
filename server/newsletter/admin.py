from django.contrib import admin

from newsletter.models import Subscriber


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    list_editable = ("is_active",)
    search_fields = ("email",)
    readonly_fields = ("created_at", "updated_at")
