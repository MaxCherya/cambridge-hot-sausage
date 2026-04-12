from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.serializers import UserSerializer


class MeView(APIView):
    """GET /api/v1/auth/me — Return current authenticated user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
