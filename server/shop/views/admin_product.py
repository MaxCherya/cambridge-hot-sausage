from rest_framework import viewsets, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from shop.models import Product, ProductVariant, ProductImage
from shop.serializers.admin_product import (
    AdminProductListSerializer,
    AdminProductWriteSerializer,
    AdminProductDetailSerializer,
    AdminVariantSerializer,
    AdminImageSerializer,
)


class AdminProductViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    queryset = Product.objects.prefetch_related("variants", "images", "categories").order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "list":
            return AdminProductListSerializer
        if self.action in ("create", "update", "partial_update"):
            return AdminProductWriteSerializer
        return AdminProductDetailSerializer

    @action(detail=True, methods=["post"], url_path="variants")
    def add_variant(self, request, pk=None):
        product = self.get_object()
        serializer = AdminVariantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="images")
    def add_image(self, request, pk=None):
        product = self.get_object()
        serializer = AdminImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        image = serializer.save(product=product)
        # If this image is primary, unset all others
        if image.is_primary:
            ProductImage.objects.filter(
                product=product, is_primary=True,
            ).exclude(pk=image.pk).update(is_primary=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminVariantViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = AdminVariantSerializer
    queryset = ProductVariant.objects.all()


class AdminImageViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = AdminImageSerializer
    queryset = ProductImage.objects.all()

    def perform_update(self, serializer):
        instance = serializer.save()
        # When setting an image as primary, unset all others for that product
        if instance.is_primary:
            ProductImage.objects.filter(
                product=instance.product,
                is_primary=True,
            ).exclude(pk=instance.pk).update(is_primary=False)
