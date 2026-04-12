from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser

from newsletter.models import Subscriber
from newsletter.serializers.admin_subscriber import AdminSubscriberSerializer


class AdminSubscriberViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = AdminSubscriberSerializer
    queryset = Subscriber.objects.order_by("-created_at")
    http_method_names = ["get", "patch"]
