from rest_framework import viewsets, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from shop.models import Review
from shop.serializers.admin_review import AdminReviewSerializer


class AdminReviewViewSet(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
    serializer_class = AdminReviewSerializer
    queryset = Review.objects.select_related("product").order_by("-created_at")
    http_method_names = ["get", "patch", "delete"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        review = self.get_object()
        review.is_approved = True
        review.save(update_fields=["is_approved", "updated_at"])
        return Response(AdminReviewSerializer(review).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        review = self.get_object()
        review.is_approved = False
        review.save(update_fields=["is_approved", "updated_at"])
        return Response(AdminReviewSerializer(review).data)
