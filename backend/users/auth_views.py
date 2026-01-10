from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Registration successful"},
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = User.objects.filter(email=email).first()

        if not user or user.is_locked:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        auth_user = authenticate(request, email=email, password=password)

        if not auth_user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.is_locked = True
            user.save()

            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user.failed_login_attempts = 0
        user.last_login_attempt = timezone.now()
        user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
        })


class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class CurrentUserView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
