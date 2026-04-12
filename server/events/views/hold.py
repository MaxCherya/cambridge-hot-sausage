from datetime import timedelta

from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import EventBooking, EventConfig
from events.serializers import HoldDateSerializer


class HoldDateView(APIView):
    """
    POST /api/v1/events/hold

    Hold a date for X minutes (cinema-seat pattern).
    Client sends a unique hold_token (UUID generated client-side).
    If the date is already held/confirmed, returns 409.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = HoldDateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event_date = serializer.validated_data["date"]
        hold_token = serializer.validated_data["hold_token"]

        # Cleanup expired holds first
        EventBooking.cleanup_expired_holds()

        if not EventBooking.is_date_available(event_date):
            return Response(
                {"error": "This date is no longer available."},
                status=409,
            )

        config = EventConfig.load()
        expires_at = timezone.now() + timedelta(minutes=config.hold_duration_minutes)

        booking = EventBooking.objects.create(
            date=event_date,
            status=EventBooking.Status.HELD,
            hold_token=hold_token,
            hold_expires_at=expires_at,
        )

        return Response({
            "id": str(booking.id),
            "date": booking.date.isoformat(),
            "hold_token": booking.hold_token,
            "expires_at": booking.hold_expires_at.isoformat(),
            "hold_minutes": config.hold_duration_minutes,
        }, status=201)


class ReleaseHoldView(APIView):
    """
    DELETE /api/v1/events/hold

    Release a held date before it expires (user navigated away).
    """

    permission_classes = [AllowAny]

    def delete(self, request):
        hold_token = request.query_params.get("hold_token")
        if not hold_token:
            return Response({"error": "hold_token required"}, status=400)

        deleted, _ = EventBooking.objects.filter(
            hold_token=hold_token,
            status=EventBooking.Status.HELD,
        ).delete()

        return Response({"released": deleted > 0})
