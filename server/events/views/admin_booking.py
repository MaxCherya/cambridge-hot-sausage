from rest_framework import viewsets, generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser

from events.models import EventBooking, BlockedDate, EventConfig
from events.serializers.admin_booking import (
    AdminBookingListSerializer,
    AdminBookingDetailSerializer,
    AdminBookingStatusSerializer,
    AdminBlockedDateSerializer,
    AdminEventConfigSerializer,
)


class AdminBookingViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    queryset = EventBooking.objects.order_by("-created_at")
    http_method_names = ["get", "patch"]

    def get_serializer_class(self):
        if self.action == "list":
            return AdminBookingListSerializer
        if self.action == "partial_update":
            return AdminBookingStatusSerializer
        return AdminBookingDetailSerializer


class AdminBlockedDateViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = AdminBlockedDateSerializer
    queryset = BlockedDate.objects.order_by("date")


class AdminEventConfigView(generics.RetrieveUpdateAPIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = AdminEventConfigSerializer

    def get_object(self):
        return EventConfig.load()
