from django.contrib import admin

from events.models import BlockedDate, EventBooking, EventConfig, TimeSlot


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ("label", "start_time", "end_time", "is_active", "order")
    list_editable = ("is_active", "order")
    ordering = ("order", "start_time")


@admin.register(EventConfig)
class EventConfigAdmin(admin.ModelAdmin):
    list_display = ("__str__", "base_price", "max_radius_miles", "hold_duration_minutes")
    fieldsets = (
        ("Base Pricing", {"fields": ("base_price",)}),
        ("Distance Bands", {
            "fields": (
                ("band_1_miles", "band_1_price"),
                ("band_2_miles", "band_2_price"),
                ("band_3_miles", "band_3_price"),
                ("band_4_miles", "band_4_price"),
            ),
            "description": "Surcharge added on top of base price for each distance band.",
        }),
        ("Limits", {"fields": ("max_radius_miles", "hold_duration_minutes", "min_guests", "max_guests")}),
    )

    def has_add_permission(self, request):
        return not EventConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(BlockedDate)
class BlockedDateAdmin(admin.ModelAdmin):
    list_display = ("date", "reason")
    list_editable = ("reason",)
    ordering = ("date",)


@admin.register(EventBooking)
class EventBookingAdmin(admin.ModelAdmin):
    list_display = ("short_id", "date", "status", "customer_name", "num_guests", "distance_display", "price", "created_at")
    list_filter = ("status", "date")
    list_editable = ("status",)
    search_fields = ("customer_name", "customer_email", "location_address")
    readonly_fields = (
        "id", "hold_token", "hold_expires_at",
        "location_lat", "location_lng", "location_address", "distance_miles",
        "stripe_session_id", "created_at", "updated_at",
    )
    fieldsets = (
        (None, {"fields": ("id", "date", "status")}),
        ("Customer", {"fields": ("customer_name", "customer_email", "customer_phone")}),
        ("Event Details", {"fields": ("num_guests", "timing_start", "timing_end", "notes")}),
        ("Location", {"fields": ("location_lat", "location_lng", "location_address", "distance_miles")}),
        ("Pricing & Payment", {"fields": ("price", "stripe_session_id")}),
        ("Hold", {"fields": ("hold_token", "hold_expires_at"), "classes": ("collapse",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    @admin.display(description="ID")
    def short_id(self, obj):
        return obj.id.hex[:8]

    @admin.display(description="Distance")
    def distance_display(self, obj):
        if obj.distance_miles is None:
            return "—"
        return f"{obj.distance_miles:.0f} mi"
