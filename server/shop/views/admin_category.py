from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser

from shop.models import Category
from shop.serializers.admin_category import AdminCategorySerializer, AdminCategoryWriteSerializer


class AdminCategoryViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    queryset = Category.objects.all()

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return AdminCategoryWriteSerializer
        return AdminCategorySerializer

    def get_queryset(self):
        if self.action == "list":
            return Category.objects.filter(parent__isnull=True)
        return Category.objects.all()
