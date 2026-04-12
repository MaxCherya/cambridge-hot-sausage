from datetime import timedelta

from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import EventBooking, EventConfig, TimeSlot
from events.serializers import HoldDateSerializer


class HoldDateView(APIView):
    """
    POST /api/v1/events/hold

    Hold a specific time slot on a date.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = HoldDateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event_date = serializer.validated_data["date"]
        time_slot_id = serializer.validated_data["time_slot_id"]
        hold_token = serializer.validated_data["hold_token"]

        EventBooking.cleanup_expired_holds()

        # Validate time slot exists
        try:
            time_slot = TimeSlot.objects.get(id=time_slot_id, is_active=True)
        except TimeSlot.DoesNotExist:
            return Response({"error": "Invalid time slot."}, status=400)

        # Check this specific slot is available
        if not EventBooking.is_slot_available(event_date, time_slot_id):
            return Response(
                {"error": "This time slot is no longer available."},
                status=409,
            )

        config = EventConfig.load()
        expires_at = timezone.now() + timedelta(minutes=config.hold_duration_minutes)

        booking = EventBooking.objects.create(
            date=event_date,
            time_slot=time_slot,
            status=EventBooking.Status.HELD,
            hold_token=hold_token,
            hold_expires_at=expires_at,
            timing_start=time_slot.start_time,
            timing_end=time_slot.end_time,
        )

        return Response({
            "id": str(booking.id),
            "date": booking.date.isoformat(),
            "time_slot": {
                "id": time_slot.id,
                "label": time_slot.label,
                "start_time": time_slot.start_time.strftime("%H:%M"),
                "end_time": time_slot.end_time.strftime("%H:%M"),
            },
            "hold_token": booking.hold_token,
            "expires_at": booking.hold_expires_at.isoformat(),
            "hold_minutes": config.hold_duration_minutes,
        }, status=201)


class ReleaseHoldView(APIView):
    """DELETE /api/v1/events/hold — Release a held slot."""

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
