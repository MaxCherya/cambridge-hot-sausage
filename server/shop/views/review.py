from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from shop.models import Product
from shop.serializers import ReviewCreateSerializer


class ReviewCreateView(generics.CreateAPIView):
    """
    POST /api/v1/shop/products/<slug>/reviews/

    Submit a review for a product. Reviews require admin approval
    before they appear publicly. The honeypot field silently rejects
    bot submissions at the serializer level.
    """

    serializer_class = ReviewCreateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        product = get_object_or_404(
            Product,
            slug=self.kwargs["product_slug"],
            is_active=True,
        )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        return Response(
            {"detail": "Review submitted. It will appear after moderation."},
            status=status.HTTP_201_CREATED,
        )
