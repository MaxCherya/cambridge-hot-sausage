from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from newsletter.serializers import SubscribeSerializer


class SubscribeView(APIView):
    """
    POST /api/v1/newsletter/subscribe

    Subscribe an email to the newsletter. Idempotent — duplicate
    submissions silently succeed.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Subscribed successfully."},
            status=status.HTTP_201_CREATED,
        )
