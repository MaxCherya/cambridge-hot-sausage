import calendar as cal
from datetime import date, timedelta

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import BlockedDate, EventBooking


class CalendarView(APIView):
    """
    GET /api/v1/events/calendar?year=2026&month=4

    Returns date availability for a given month.
    Cleans up expired holds before responding.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            year = int(request.query_params.get("year", date.today().year))
            month = int(request.query_params.get("month", date.today().month))
        except (ValueError, TypeError):
            return Response({"error": "Invalid year/month"}, status=400)

        # Lazy cleanup of expired holds
        EventBooking.cleanup_expired_holds()

        _, num_days = cal.monthrange(year, month)
        month_start = date(year, month, 1)
        month_end = date(year, month, num_days)
        today = date.today()

        # Get all bookings (held + confirmed) for this month
        bookings = EventBooking.objects.filter(
            date__range=(month_start, month_end),
            status__in=[EventBooking.Status.HELD, EventBooking.Status.CONFIRMED],
        ).values_list("date", "status")

        booking_map = {}
        for d, status in bookings:
            booking_map[d] = status

        # Get blocked dates for this month
        blocked = set(
            BlockedDate.objects.filter(
                date__range=(month_start, month_end),
            ).values_list("date", flat=True)
        )

        # Build day-by-day availability
        days = []
        for day_num in range(1, num_days + 1):
            d = date(year, month, day_num)
            if d < today + timedelta(days=3):
                # Must book at least 3 days in advance
                status = "past"
            elif d in blocked:
                status = "blocked"
            elif d in booking_map:
                status = booking_map[d]  # "held" or "confirmed"
            else:
                status = "available"

            days.append({"date": d.isoformat(), "status": status})

        return Response({
            "year": year,
            "month": month,
            "days": days,
        })
