from decimal import Decimal, InvalidOperation

import stripe
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Case, F, IntegerField, Value, When
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from orders.models import Order, OrderItem, PendingOrder
from shop.models import ProductVariant

stripe.api_key = settings.STRIPE_SECRET_KEY

ALLOWED_METADATA_TYPES = {"shop_order", "event_booking"}

# Debounce cleanup of expired PendingOrder rows so the webhook hot path
# doesn't issue a DELETE on every event.
PENDING_CLEANUP_LOCK = "orders:pending_cleanup_lock"
PENDING_CLEANUP_TTL = 60 * 10  # 10 minutes


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

        if booking_type not in ALLOWED_METADATA_TYPES:
            return HttpResponse(status=400)

        if booking_type == "event_booking":
            from events.views.webhook import handle_event_booking_completed
            handle_event_booking_completed(session)
        else:
            _handle_checkout_completed(session)

        # Opportunistic, debounced GC for abandoned carts.
        if cache.add(PENDING_CLEANUP_LOCK, "1", timeout=PENDING_CLEANUP_TTL):
            PendingOrder.cleanup_expired()

    return HttpResponse(status=200)


def _handle_checkout_completed(session):
    """Create an Order from a completed Stripe Checkout session."""

    session_id = session["id"]

    if Order.objects.filter(stripe_session_id=session_id).exists():
        return

    metadata = getattr(session, "metadata", None)
    pending_id = _stripe_attr(metadata, "pending_id")
    if not pending_id:
        # Old-format session (no PendingOrder) — refuse rather than create
        # an order with no items.
        return

    try:
        pending = PendingOrder.objects.get(id=pending_id)
    except (PendingOrder.DoesNotExist, ValueError):
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

    collected = getattr(full_session, "collected_information", None)
    shipping = None
    address = None

    if collected:
        shipping = getattr(collected, "shipping_details", None)
    if not shipping:
        shipping = getattr(full_session, "shipping_details", None)

    if shipping:
        address = getattr(shipping, "address", None)

    customer = getattr(full_session, "customer_details", None)
    if not address and customer:
        address = getattr(customer, "address", None)

    shipping_cost_obj = getattr(full_session, "shipping_cost", None)
    shipping_amount = getattr(shipping_cost_obj, "amount_total", 0) if shipping_cost_obj else 0

    # Re-fetch variants once to attach the current product/variant names
    # to OrderItem (preserving snapshot semantics if the variant was
    # since renamed). For deleted variants we fall back to the snapshot.
    snapshot = pending.cart_snapshot or []
    variant_ids = [int(item["variant_id"]) for item in snapshot if "variant_id" in item]
    variants_now = {
        v.id: v
        for v in ProductVariant.objects.select_related("product").filter(id__in=variant_ids)
    }

    with transaction.atomic():
        if Order.objects.filter(stripe_session_id=session_id).exists():
            return

        order = Order.objects.create(
            stripe_session_id=session_id,
            stripe_payment_intent=getattr(pi, "id", "") if pi else str(pi or ""),
            status=Order.Status.PAID,
            customer_email=getattr(customer, "email", "") if customer else "",
            customer_name=getattr(customer, "name", "") if customer else "",
            customer_phone=getattr(customer, "phone", "") or "" if customer else "",
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

        order_items = []
        stock_when_cases = []
        stock_variant_ids = []
        for item in snapshot:
            try:
                variant_id = int(item["variant_id"])
                quantity = int(item["quantity"])
            except (KeyError, ValueError, TypeError):
                continue
            if quantity <= 0:
                continue

            variant = variants_now.get(variant_id)
            product_name = (variant.product.name if variant else item.get("product_name", "")) or ""
            variant_name = (variant.name if variant else item.get("variant_name", "")) or ""
            sku = (variant.sku if variant else item.get("sku", "")) or ""

            try:
                unit_price = Decimal(str(item.get("unit_price", "0")))
            except InvalidOperation:
                unit_price = variant.price if variant else Decimal("0")

            order_items.append(OrderItem(
                order=order,
                product_name=product_name,
                variant_name=variant_name,
                sku=sku,
                unit_price=unit_price,
                quantity=quantity,
            ))
            if variant is not None:
                stock_when_cases.append(When(id=variant_id, then=Value(quantity)))
                stock_variant_ids.append(variant_id)

        OrderItem.objects.bulk_create(order_items)

        if stock_when_cases:
            ProductVariant.objects.filter(id__in=stock_variant_ids).update(
                stock=F("stock") - Case(
                    *stock_when_cases,
                    default=Value(0),
                    output_field=IntegerField(),
                ),
            )

        PendingOrder.objects.filter(id=pending.id).update(consumed_at=timezone.now())
