import calendar as cal
from collections import defaultdict
from datetime import date, timedelta

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import BlockedDate, EventBooking, TimeSlot


class CalendarView(APIView):
    """
    GET /api/v1/events/calendar?year=2026&month=4

    Returns date + slot availability for a given month.
    Slots are filtered per day based on day-of-week rules.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            year = int(request.query_params.get("year", date.today().year))
            month = int(request.query_params.get("month", date.today().month))
        except (ValueError, TypeError):
            return Response({"error": "Invalid year/month"}, status=400)

        EventBooking.cleanup_expired_holds()

        _, num_days = cal.monthrange(year, month)
        month_start = date(year, month, 1)
        month_end = date(year, month, num_days)
        today = date.today()

        # Load all active time slots with their day rules
        slot_objects = list(
            TimeSlot.objects.filter(is_active=True).order_by("order", "start_time")
        )

        # Get bookings for the month
        bookings = EventBooking.objects.filter(
            date__range=(month_start, month_end),
            status__in=[EventBooking.Status.HELD, EventBooking.Status.CONFIRMED],
        ).values_list("date", "time_slot_id", "status")

        booked_slots_by_date = defaultdict(dict)
        for d, slot_id, status in bookings:
            if slot_id:
                booked_slots_by_date[d][slot_id] = status

        blocked = set(
            BlockedDate.objects.filter(
                date__range=(month_start, month_end),
            ).values_list("date", flat=True)
        )

        days = []
        for day_num in range(1, num_days + 1):
            d = date(year, month, day_num)

            if d < today + timedelta(days=3):
                days.append({"date": d.isoformat(), "status": "past", "slots": []})
                continue

            if d in blocked:
                days.append({"date": d.isoformat(), "status": "blocked", "slots": []})
                continue

            # Filter slots available on this day of week
            weekday = d.weekday()  # 0=Mon, 6=Sun
            day_slots = [s for s in slot_objects if s.is_available_on(weekday)]

            booked = booked_slots_by_date.get(d, {})
            slot_list = [
                {
                    "id": s.id,
                    "label": s.label,
                    "start_time": s.start_time.strftime("%H:%M"),
                    "end_time": s.end_time.strftime("%H:%M"),
                    "status": "booked" if s.id in booked else "available",
                }
                for s in day_slots
            ]

            if not slot_list:
                status = "blocked"  # No slots configured for this day
            elif all(s["status"] == "booked" for s in slot_list):
                status = "full"
            else:
                status = "available"

            days.append({"date": d.isoformat(), "status": status, "slots": slot_list})

        return Response({"year": year, "month": month, "days": days})
