from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


class LoginView(APIView):
    authentication_classes = []          # 🔑 KEY FIX
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response({'message': 'Login successful'})
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,   # True in production
            samesite='Lax'
        )
        return response


class LogoutView(APIView):
    authentication_classes = []          # 🔑 KEY FIX
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response({'message': 'Logout successful'})
        response.delete_cookie('access_token')
        return response
