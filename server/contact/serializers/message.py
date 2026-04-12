from rest_framework import serializers

from contact.models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Write serializer for the contact form.
    The `website` field is a honeypot — any submission with it
    filled is silently rejected.
    """

    website = serializers.CharField(required=False, default="", allow_blank=True)

    class Meta:
        model = ContactMessage
        fields = ("name", "email", "phone", "subject", "message", "website")

    def validate_website(self, value):
        if value:
            raise serializers.ValidationError("Invalid submission.")
        return value

    def validate_name(self, value):
        return value.strip()

    def validate_subject(self, value):
        stripped = value.strip()
        if len(stripped) < 3:
            raise serializers.ValidationError("Subject must be at least 3 characters.")
        return stripped

    def validate_message(self, value):
        stripped = value.strip()
        if len(stripped) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        return stripped
