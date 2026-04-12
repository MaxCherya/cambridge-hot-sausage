import stripe
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class SessionDetailView(APIView):
    """
    GET /api/v1/orders/session?session_id=cs_xxx

    Returns order details for the thank-you page. Only exposes
    non-sensitive info (name, email, order total, receipt URL).
    """

    permission_classes = [AllowAny]

    def get(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        session_id = request.query_params.get("session_id")
        if not session_id:
            return Response({"error": "session_id required"}, status=400)

        try:
            session = stripe.checkout.Session.retrieve(
                session_id,
                expand=["payment_intent.latest_charge"],
            )
        except stripe.error.InvalidRequestError:
            return Response({"error": "Invalid session"}, status=404)

        receipt_url = ""
        pi = session.payment_intent
        if pi and hasattr(pi, "latest_charge") and pi.latest_charge:
            receipt_url = getattr(pi.latest_charge, "receipt_url", "") or ""

        customer = session.customer_details

        return Response({
            "customer_name": customer.name if customer else "",
            "customer_email": customer.email if customer else "",
            "amount_total": (session.amount_total or 0) / 100,
            "currency": session.currency or "gbp",
            "payment_status": session.payment_status or "",
            "receipt_url": receipt_url,
        })
