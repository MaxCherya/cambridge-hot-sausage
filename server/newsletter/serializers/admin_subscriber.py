from rest_framework import serializers
from newsletter.models import Subscriber


class AdminSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ("id", "email", "is_active", "created_at")
        read_only_fields = ("id", "email", "created_at")
