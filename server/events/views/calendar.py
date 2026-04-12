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
    Each day includes which time slots are still available.
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

        # Active time slots
        slots = list(
            TimeSlot.objects.filter(is_active=True)
            .order_by("order", "start_time")
            .values("id", "label", "start_time", "end_time")
        )
        slot_ids = {s["id"] for s in slots}

        # Format time slots for response
        slot_list = [
            {
                "id": s["id"],
                "label": s["label"],
                "start_time": s["start_time"].strftime("%H:%M"),
                "end_time": s["end_time"].strftime("%H:%M"),
            }
            for s in slots
        ]

        # Get all bookings (held + confirmed) for this month with slot info
        bookings = EventBooking.objects.filter(
            date__range=(month_start, month_end),
            status__in=[EventBooking.Status.HELD, EventBooking.Status.CONFIRMED],
        ).values_list("date", "time_slot_id", "status")

        # Map: date → set of booked slot IDs
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
                status = "past"
                available_slots = []
            elif d in blocked:
                status = "blocked"
                available_slots = []
            else:
                booked = booked_slots_by_date.get(d, {})
                available_slots = [
                    {
                        **sl,
                        "status": "booked" if sl["id"] in booked else "available",
                    }
                    for sl in slot_list
                    if sl["id"] in slot_ids
                ]
                all_booked = all(s["status"] == "booked" for s in available_slots) if available_slots else False
                status = "full" if all_booked else "available"

            days.append({
                "date": d.isoformat(),
                "status": status,
                "slots": available_slots,
            })

        return Response({
            "year": year,
            "month": month,
            "time_slots": slot_list,
            "days": days,
        })
