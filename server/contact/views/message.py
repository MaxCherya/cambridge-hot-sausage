from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from contact.serializers import ContactMessageSerializer


class ContactMessageCreateView(generics.CreateAPIView):
    """
    POST /api/v1/contact

    Submit a contact form message. Stored in DB for admin review.
    Honeypot field silently rejects bot submissions.
    """

    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Message sent. We'll get back to you shortly."},
            status=status.HTTP_201_CREATED,
        )
