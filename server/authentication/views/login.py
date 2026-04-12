from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.serializers import LoginSerializer, UserSerializer


class LoginView(APIView):
    """
    POST /api/v1/auth/login

    Authenticate with username + password. Creates a Django session
    and sets the sessionid cookie (httpOnly).
    Only staff/superuser accounts are allowed.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_staff:
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)
        return Response(UserSerializer(user).data)
