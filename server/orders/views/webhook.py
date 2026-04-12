import stripe
from django.conf import settings
from django.db.models import F
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from orders.models import Order, OrderItem
from shop.models import ProductVariant


@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    POST /api/v1/orders/webhook

    Handles Stripe webhook events. The main event we care about is
    checkout.session.completed — this creates the Order record and
    decrements stock.
    """
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

    # Extract receipt URL from the charge
    receipt_url = ""
    pi = full_session.payment_intent
    if pi and hasattr(pi, "latest_charge") and pi.latest_charge:
        receipt_url = getattr(pi.latest_charge, "receipt_url", "") or ""

    # Shipping details
    shipping = full_session.shipping_details
    address = shipping.address if shipping else None

    shipping_cost_obj = full_session.shipping_cost
    shipping_amount = shipping_cost_obj.amount_total if shipping_cost_obj else 0

    customer = full_session.customer_details

    order = Order.objects.create(
        stripe_session_id=session_id,
        stripe_payment_intent=pi.id if pi and hasattr(pi, "id") else str(pi or ""),
        status=Order.Status.PAID,
        customer_email=customer.email if customer else "",
        customer_name=customer.name if customer else "",
        shipping_name=shipping.name if shipping else "",
        shipping_line1=address.line1 if address else "",
        shipping_line2=address.line2 or "" if address else "",
        shipping_city=address.city or "" if address else "",
        shipping_postal_code=address.postal_code or "" if address else "",
        shipping_country=address.country or "" if address else "",
        subtotal=(full_session.amount_subtotal or 0) / 100,
        shipping_cost=shipping_amount / 100,
        total=(full_session.amount_total or 0) / 100,
        currency=full_session.currency or "gbp",
        stripe_receipt_url=receipt_url,
    )

    # Parse items from metadata and create OrderItems + decrement stock
    metadata = full_session.metadata
    items_str = metadata.get("items", "") if metadata else ""

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
