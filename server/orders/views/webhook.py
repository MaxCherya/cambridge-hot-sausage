import stripe
from django.conf import settings
from django.db.models import F
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from orders.models import Order, OrderItem
from shop.models import ProductVariant


def _stripe_attr(obj, key, default=""):
    """Safely read an attribute from a StripeObject or dict."""
    if obj is None:
        return default
    try:
        val = obj[key]
        return val if val is not None else default
    except (KeyError, TypeError):
        return getattr(obj, key, default) or default


@csrf_exempt
@require_POST
def stripe_webhook(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = getattr(session, "metadata", None)
        booking_type = _stripe_attr(metadata, "type")

        if booking_type == "event_booking":
            from events.views.webhook import handle_event_booking_completed
            handle_event_booking_completed(session)
        else:
            _handle_checkout_completed(session)

    return HttpResponse(status=200)


def _handle_checkout_completed(session):
    """Create an Order from a completed Stripe Checkout session."""

    session_id = session["id"]

    if Order.objects.filter(stripe_session_id=session_id).exists():
        return

    full_session = stripe.checkout.Session.retrieve(
        session_id,
        expand=["payment_intent.latest_charge"],
    )

    receipt_url = ""
    pi = getattr(full_session, "payment_intent", None)
    if pi:
        charge = getattr(pi, "latest_charge", None)
        if charge:
            receipt_url = getattr(charge, "receipt_url", "") or ""

    shipping = getattr(full_session, "shipping_details", None)
    address = getattr(shipping, "address", None) if shipping else None

    shipping_cost_obj = getattr(full_session, "shipping_cost", None)
    shipping_amount = getattr(shipping_cost_obj, "amount_total", 0) if shipping_cost_obj else 0

    customer = getattr(full_session, "customer_details", None)

    order = Order.objects.create(
        stripe_session_id=session_id,
        stripe_payment_intent=getattr(pi, "id", "") if pi else str(pi or ""),
        status=Order.Status.PAID,
        customer_email=getattr(customer, "email", "") if customer else "",
        customer_name=getattr(customer, "name", "") if customer else "",
        shipping_name=getattr(shipping, "name", "") if shipping else "",
        shipping_line1=getattr(address, "line1", "") if address else "",
        shipping_line2=getattr(address, "line2", "") or "" if address else "",
        shipping_city=getattr(address, "city", "") or "" if address else "",
        shipping_postal_code=getattr(address, "postal_code", "") or "" if address else "",
        shipping_country=getattr(address, "country", "") or "" if address else "",
        subtotal=(getattr(full_session, "amount_subtotal", 0) or 0) / 100,
        shipping_cost=shipping_amount / 100,
        total=(getattr(full_session, "amount_total", 0) or 0) / 100,
        currency=getattr(full_session, "currency", "gbp") or "gbp",
        stripe_receipt_url=receipt_url,
    )

    # Parse items from metadata
    metadata = getattr(full_session, "metadata", None)
    items_str = _stripe_attr(metadata, "items")

    for entry in items_str.split("|"):
        parts = entry.split(":")
        if len(parts) != 3:
            continue
        variant_id, quantity, sku = int(parts[0]), int(parts[1]), parts[2]

        try:
            variant = ProductVariant.objects.select_related("product").get(id=variant_id)
        except ProductVariant.DoesNotExist:
            continue

        OrderItem.objects.create(
            order=order,
            product_name=variant.product.name,
            variant_name=variant.name,
            sku=sku,
            unit_price=variant.price,
            quantity=quantity,
        )

        ProductVariant.objects.filter(id=variant_id, stock__gte=quantity).update(
            stock=F("stock") - quantity,
        )
