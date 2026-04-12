import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from shop.models import ProductVariant


class CreateCheckoutSessionView(APIView):
    """
    POST /api/v1/orders/checkout

    Accepts a list of {variant_id, quantity} from the client-side cart,
    validates them against the DB, and creates a Stripe Checkout session
    with shipping address collection.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        cart_items = request.data.get("items", [])
        if not cart_items:
            return Response(
                {"error": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate and build Stripe line items
        variant_ids = [item["variant_id"] for item in cart_items]
        variants = ProductVariant.objects.filter(
            id__in=variant_ids,
            is_active=True,
            product__is_active=True,
        ).select_related("product")

        variant_map = {v.id: v for v in variants}

        line_items = []
        metadata_items = []

        for item in cart_items:
            variant = variant_map.get(item["variant_id"])
            if not variant:
                return Response(
                    {"error": f"Variant {item['variant_id']} not found or inactive."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            quantity = int(item.get("quantity", 1))
            if quantity < 1:
                return Response(
                    {"error": "Quantity must be at least 1."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if variant.stock < quantity:
                return Response(
                    {"error": f"{variant.product.name} — {variant.name} is out of stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            line_items.append({
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": int(variant.price * 100),
                    "product_data": {
                        "name": variant.product.name,
                        "description": variant.name,
                        "metadata": {"sku": variant.sku},
                    },
                },
                "quantity": quantity,
            })

            metadata_items.append(
                f"{variant.id}:{quantity}:{variant.sku}"
            )

        # Create Stripe Checkout session
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            phone_number_collection={"enabled": True},
            line_items=line_items,
            shipping_address_collection={
                "allowed_countries": [
                    "GB", "US", "FR", "DE", "ES", "IT", "NL", "BE",
                    "IE", "PT", "AT", "CH", "SE", "DK", "NO", "FI",
                    "PL", "CZ", "JP", "CN", "AU", "CA",
                ],
            },
            shipping_options=[
                {
                    "shipping_rate_data": {
                        "type": "fixed_amount",
                        "fixed_amount": {"amount": 350, "currency": "gbp"},
                        "display_name": "Royal Mail Standard",
                        "delivery_estimate": {
                            "minimum": {"unit": "business_day", "value": 3},
                            "maximum": {"unit": "business_day", "value": 5},
                        },
                    },
                },
                {
                    "shipping_rate_data": {
                        "type": "fixed_amount",
                        "fixed_amount": {"amount": 695, "currency": "gbp"},
                        "display_name": "Royal Mail Tracked 24",
                        "delivery_estimate": {
                            "minimum": {"unit": "business_day", "value": 1},
                            "maximum": {"unit": "business_day", "value": 2},
                        },
                    },
                },
            ],
            success_url=settings.FRONTEND_URL + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=settings.FRONTEND_URL + "/cart",
            metadata={
                "items": "|".join(metadata_items),
            },
        )

        return Response({"url": session.url})
