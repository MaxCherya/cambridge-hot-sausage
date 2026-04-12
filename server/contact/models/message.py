from django.core.validators import RegexValidator
from django.db import models

from shop.models.base import TimeStampedModel

phone_validator = RegexValidator(
    regex=r"^\+?[\d\s\-()]{7,20}$",
    message="Enter a valid phone number.",
)


class ContactMessage(TimeStampedModel):
    """
    A message submitted via the public contact form.
    Stored in DB for admin review. Honeypot field catches bots.
    """

    class Status(models.TextChoices):
        NEW = "new", "New"
        READ = "read", "Read"
        REPLIED = "replied", "Replied"
        ARCHIVED = "archived", "Archived"

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[phone_validator],
    )
    subject = models.CharField(max_length=200)
    message = models.TextField(max_length=5000)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )

    # Honeypot — bots fill this, real users don't see it
    website = models.URLField(blank=True, editable=False)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.name} — {self.subject}"
