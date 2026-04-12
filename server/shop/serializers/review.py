from rest_framework import serializers

from shop.models import Review


class ReviewReadSerializer(serializers.ModelSerializer):
    """Public read-only view — never exposes email or honeypot."""

    class Meta:
        model = Review
        fields = (
            "id",
            "author_name",
            "rating",
            "title",
            "text",
            "created_at",
        )


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Write serializer for submitting reviews.

    The `website` field is a honeypot — it's accepted silently but any
    submission that fills it gets rejected. Bots scrape the form and
    fill every field; real users leave it empty (it's hidden via CSS
    on the frontend).
    """

    website = serializers.CharField(required=False, default="", allow_blank=True)

    class Meta:
        model = Review
        fields = (
            "author_name",
            "author_email",
            "rating",
            "title",
            "text",
            "website",
        )

    def validate_website(self, value):
        if value:
            raise serializers.ValidationError("Invalid submission.")
        return value

    def validate_text(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Review must be at least 10 characters."
            )
        return value.strip()

    def validate_author_name(self, value):
        return value.strip()
