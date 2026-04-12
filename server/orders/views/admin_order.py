from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser

from orders.models import Order
from orders.serializers import AdminOrderListSerializer, AdminOrderDetailSerializer, AdminOrderStatusSerializer


class AdminOrderViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    queryset = Order.objects.prefetch_related("items").order_by("-created_at")
    http_method_names = ["get", "patch"]

    def get_serializer_class(self):
        if self.action == "list":
            return AdminOrderListSerializer
        if self.action == "partial_update":
            return AdminOrderStatusSerializer
        return AdminOrderDetailSerializer
