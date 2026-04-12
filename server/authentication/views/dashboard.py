from django.db.models import Sum
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from contact.models import ContactMessage
from events.models import EventBooking
from newsletter.models import Subscriber
from orders.models import Order


class DashboardView(APIView):
    """
    GET /api/v1/auth/dashboard

    Aggregated metrics for the admin dashboard.
    """

    permission_classes = [IsAdminUser]

    def get(self, request):
        # Order metrics
        orders = Order.objects.all()
        total_orders = orders.count()
        total_revenue = orders.filter(status=Order.Status.PAID).aggregate(
            total=Sum("total")
        )["total"] or 0

        # Booking metrics
        bookings = EventBooking.objects.all()
        pending_bookings = bookings.filter(status=EventBooking.Status.HELD).count()
        confirmed_bookings = bookings.filter(status=EventBooking.Status.CONFIRMED).count()

        # Contact messages
        unread_messages = ContactMessage.objects.filter(status=ContactMessage.Status.NEW).count()

        # Newsletter
        subscriber_count = Subscriber.objects.filter(is_active=True).count()

        # Recent items
        recent_orders = list(
            orders.order_by("-created_at")[:5].values(
                "id", "customer_name", "customer_email", "status", "total", "created_at"
            )
        )
        recent_bookings = list(
            bookings.filter(status__in=["held", "confirmed"])
            .order_by("-created_at")[:5]
            .values(
                "id", "date", "customer_name", "status", "price", "num_guests", "created_at"
            )
        )

        return Response({
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "pending_bookings": pending_bookings,
            "confirmed_bookings": confirmed_bookings,
            "unread_messages": unread_messages,
            "subscriber_count": subscriber_count,
            "recent_orders": recent_orders,
            "recent_bookings": recent_bookings,
        })
