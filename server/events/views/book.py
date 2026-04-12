import stripe
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import EventBooking, EventConfig
from events.serializers import ConfirmBookingSerializer
from events.services.geo import distance_from_cambridge, validate_location


class ConfirmBookingView(APIView):
    """
    POST /api/v1/events/book

    Confirm a held booking — validates location, calculates price,
    updates the booking record, creates a Stripe Checkout session.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        serializer = ConfirmBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Find the held booking
        try:
            booking = EventBooking.objects.get(
                hold_token=data["hold_token"],
                status=EventBooking.Status.HELD,
            )
        except EventBooking.DoesNotExist:
            return Response(
                {"error": "Hold expired or not found. Please select a date again."},
                status=409,
            )

        # Check hold hasn't expired
        if booking.is_hold_expired:
            booking.delete()
            return Response(
                {"error": "Your hold has expired. Please select a date again."},
                status=409,
            )

        config = EventConfig.load()

        # Validate guest count
        if data["num_guests"] < config.min_guests:
            return Response(
                {"error": f"Minimum {config.min_guests} guests required."},
                status=400,
            )
        if data["num_guests"] > config.max_guests:
            return Response(
                {"error": f"Maximum {config.max_guests} guests allowed."},
                status=400,
            )

        # Validate location
        geo = validate_location(data["lat"], data["lng"], config.max_radius_miles)
        if not geo.valid:
            return Response({"error": geo.error}, status=400)

        distance = distance_from_cambridge(data["lat"], data["lng"])
        total_price = config.total_price(distance)

        # Update booking with full details
        booking.location_lat = data["lat"]
        booking.location_lng = data["lng"]
        booking.location_address = geo.address
        booking.distance_miles = round(distance, 1)
        booking.price = total_price
        booking.num_guests = data["num_guests"]
        booking.timing_start = data["timing_start"]
        booking.timing_end = data["timing_end"]
        booking.notes = data.get("notes", "")
        booking.customer_name = data["customer_name"]
        booking.customer_email = data["customer_email"]
        booking.customer_phone = data.get("customer_phone", "")
        booking.save()

        # Create Stripe Checkout session
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": int(total_price * 100),
                    "product_data": {
                        "name": f"Event Booking — {booking.date.isoformat()}",
                        "description": f"{data['num_guests']} guests · {geo.address[:100]}",
                    },
                },
                "quantity": 1,
            }],
            success_url=settings.FRONTEND_URL + f"/events/success?session_id={{CHECKOUT_SESSION_ID}}&hold_token={booking.hold_token}",
            cancel_url=settings.FRONTEND_URL + "/events",
            metadata={
                "booking_id": str(booking.id),
                "hold_token": booking.hold_token,
                "type": "event_booking",
            },
            customer_email=data["customer_email"],
        )

        booking.stripe_session_id = session.id
        booking.save(update_fields=["stripe_session_id"])

        return Response({"url": session.url})
