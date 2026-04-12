from rest_framework import serializers

from events.models import EventConfig


class EventConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventConfig
        fields = (
            "base_price",
            "band_1_miles", "band_1_price",
            "band_2_miles", "band_2_price",
            "band_3_miles", "band_3_price",
            "band_4_miles", "band_4_price",
            "max_radius_miles",
            "min_guests", "max_guests",
            "hold_duration_minutes",
        )
