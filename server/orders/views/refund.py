import stripe
from django.conf import settings
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order


class RefundOrderView(APIView):
    """
    POST /api/v1/admin/orders/<id>/refund

    Refunds a paid order via Stripe. Requires the admin to confirm
    by sending { "confirm": true } in the body.
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        # Safety: require explicit confirmation
        if not request.data.get("confirm"):
            return Response(
                {"error": "Send { \"confirm\": true } to proceed with refund."},
                status=400,
            )

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)

        if order.status == Order.Status.CANCELLED:
            return Response({"error": "Order is already cancelled/refunded."}, status=400)

        if not order.stripe_payment_intent:
            return Response({"error": "No payment intent found for this order."}, status=400)

        # Issue Stripe refund
        try:
            refund = stripe.Refund.create(
                payment_intent=order.stripe_payment_intent,
            )
        except stripe.error.StripeError as e:
            return Response({"error": f"Stripe error: {str(e)}"}, status=400)

        # Update order status
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])

        return Response({
            "detail": "Order refunded successfully.",
            "refund_id": refund.id,
            "refund_status": refund.status,
            "amount_refunded": refund.amount / 100,
        })
