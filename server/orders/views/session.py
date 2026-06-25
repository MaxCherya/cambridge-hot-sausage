import hmac

import stripe
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.views.checkout import BUYER_COOKIE_NAME

stripe.api_key = settings.STRIPE_SECRET_KEY


class SessionDetailView(APIView):
    """
    GET /api/v1/orders/session?session_id=cs_xxx

    Returns order details for the thank-you page. Requires the buyer-id
    cookie set during /checkout to match the session metadata — prevents
    IDOR via a leaked Stripe session ID.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        session_id = request.query_params.get("session_id")
        if not session_id:
            return Response({"error": "session_id required"}, status=400)

        buyer_cookie = request.COOKIES.get(BUYER_COOKIE_NAME, "")
        if not buyer_cookie:
            return Response({"error": "Not authorised for this order."}, status=403)

        try:
            session = stripe.checkout.Session.retrieve(
                session_id,
                expand=["payment_intent.latest_charge"],
            )
        except stripe.error.InvalidRequestError:
            return Response({"error": "Invalid session"}, status=404)

        metadata = getattr(session, "metadata", None) or {}
        expected_buyer = ""
        try:
            expected_buyer = metadata.get("buyer_id", "") or ""
        except AttributeError:
            expected_buyer = getattr(metadata, "buyer_id", "") or ""

        if not expected_buyer or not hmac.compare_digest(buyer_cookie, expected_buyer):
            return Response({"error": "Not authorised for this order."}, status=403)

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
