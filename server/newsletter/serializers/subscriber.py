from rest_framework import serializers

from newsletter.models import Subscriber


class SubscribeSerializer(serializers.Serializer):
    """
    Accepts an email for newsletter subscription.
    If the email already exists and is active, silently succeeds (idempotent).
    If it exists but was unsubscribed, reactivates it.
    """

    email = serializers.EmailField()

    def create(self, validated_data):
        subscriber, created = Subscriber.objects.get_or_create(
            email=validated_data["email"],
            defaults={"is_active": True},
        )
        if not created and not subscriber.is_active:
            subscriber.is_active = True
            subscriber.save(update_fields=["is_active", "updated_at"])
        return subscriber
