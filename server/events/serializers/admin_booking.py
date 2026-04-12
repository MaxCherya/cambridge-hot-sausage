from rest_framework import serializers
from events.models import EventBooking, BlockedDate, EventConfig, TimeSlot


class AdminBookingListSerializer(serializers.ModelSerializer):
    short_id = serializers.SerializerMethodField()

    class Meta:
        model = EventBooking
        fields = ("id", "short_id", "date", "status", "customer_name", "customer_email", "num_guests", "distance_miles", "price", "created_at")

    def get_short_id(self, obj):
        return obj.id.hex[:8]


class AdminBookingDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventBooking
        fields = "__all__"


class AdminBookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventBooking
        fields = ("status",)


class AdminBlockedDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedDate
        fields = ("id", "date", "reason")


class AdminEventConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventConfig
        exclude = ("id",)


class AdminTimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ("id", "label", "start_time", "end_time", "is_active", "order")
