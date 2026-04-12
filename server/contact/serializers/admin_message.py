from rest_framework import serializers
from contact.models import ContactMessage


class AdminContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "phone", "subject", "message", "status", "created_at")
        read_only_fields = ("id", "name", "email", "phone", "subject", "message", "created_at")
