from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser

from contact.models import ContactMessage
from contact.serializers.admin_message import AdminContactMessageSerializer


class AdminContactMessageViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = AdminContactMessageSerializer
    queryset = ContactMessage.objects.order_by("-created_at")
    http_method_names = ["get", "patch"]
