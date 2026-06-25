from rest_framework import serializers


class HoldDateSerializer(serializers.Serializer):
    date = serializers.DateField()
    time_slot_id = serializers.IntegerField()


class CalculatePriceSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lng = serializers.FloatField()


class ConfirmBookingSerializer(serializers.Serializer):
    hold_token = serializers.CharField(max_length=64)
    lat = serializers.FloatField()
    lng = serializers.FloatField()
    num_guests = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, default="", allow_blank=True, max_length=2000)
    customer_name = serializers.CharField(max_length=200)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20, required=False, default="", allow_blank=True)
