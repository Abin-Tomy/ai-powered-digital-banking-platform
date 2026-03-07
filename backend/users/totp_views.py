import pyotp
import qrcode
import base64
from io import BytesIO

from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from drf_spectacular.utils import extend_schema

from .models import User, AuditLog


@extend_schema(tags=['2fa'])
class TOTPSetupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        secret = pyotp.random_base32()
        user.totp_secret = secret
        user.totp_enabled = False
        user.save(update_fields=['totp_secret', 'totp_enabled'])

        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(name=user.email, issuer_name="Digital Bank")

        img = qrcode.make(uri)
        buf = BytesIO()
        img.save(buf, format='PNG')
        qr_base64 = base64.b64encode(buf.getvalue()).decode()

        return Response({
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_base64}",
            "manual_entry_key": secret,
        })


@extend_schema(tags=['2fa'])
class TOTPVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '')
        user = request.user

        if not user.totp_secret:
            return Response({"detail": "2FA not set up."}, status=400)

        totp = pyotp.TOTP(user.totp_secret)
        if totp.verify(code, valid_window=1):
            user.totp_enabled = True
            user.save(update_fields=['totp_enabled'])
            AuditLog.log(request, 'PROFILE_UPDATED', 'User', user.id, '2FA enabled by user')
            return Response({"detail": "2FA enabled successfully."})
        return Response({"detail": "Invalid code. Try again."}, status=400)


@extend_schema(tags=['2fa'])
class TOTPDisableView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '')
        user = request.user

        if not user.totp_enabled:
            return Response({"detail": "2FA is not enabled."})

        totp = pyotp.TOTP(user.totp_secret)
        if totp.verify(code, valid_window=1):
            user.totp_enabled = False
            user.totp_secret = ''
            user.save(update_fields=['totp_enabled', 'totp_secret'])
            AuditLog.log(request, 'PROFILE_UPDATED', 'User', user.id, '2FA disabled by user')
            return Response({"detail": "2FA disabled."})
        return Response({"detail": "Invalid code."}, status=400)


@extend_schema(tags=['2fa'])
class TOTPAuthenticateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        temp_token = request.data.get('temp_token', '')
        code = request.data.get('code', '')

        cache_key = f"2fa_temp_{temp_token}"
        user_id = cache.get(cache_key)
        if not user_id:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code, valid_window=1):
            return Response(
                {"detail": "Invalid authentication code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache.delete(cache_key)

        refresh = RefreshToken.for_user(user)
        from .serializers import UserSerializer
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })
