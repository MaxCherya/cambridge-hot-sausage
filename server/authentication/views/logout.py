from django.contrib.auth import logout
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class LogoutView(APIView):
    """POST /api/v1/auth/logout — Clear session."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out."})
