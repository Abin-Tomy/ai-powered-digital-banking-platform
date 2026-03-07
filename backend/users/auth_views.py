from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
from django.http import JsonResponse
import uuid

from drf_spectacular.utils import extend_schema

from .models import User, VerificationToken, AuditLog, UserSession
from .serializers import RegisterSerializer, UserSerializer
from .email_service import send_verification_email, send_password_reset_email

from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited
from django.utils.decorators import method_decorator


def ratelimit_handler(request, exception):
    if isinstance(exception, Ratelimited):
        return JsonResponse(
            {"detail": "Too many requests. Please try again later."},
            status=429,
        )
    raise exception


@extend_schema(tags=['auth'])
@method_decorator(ratelimit(key='ip', rate='3/m', method='POST', block=True), name='post')
class RegisterView(APIView):
    permission_classes = []

    @extend_schema(summary='Register a new user', request=RegisterSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send verification email (fail-safe: never block registration)
        token_obj = VerificationToken.create_for_user(user, 'email_verify', hours=24)
        try:
            send_verification_email(user, str(token_obj.token))
        except Exception:
            pass

        return Response(
            {
                "message": "Registration successful. Check your email to verify your account.",
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=['auth'])
@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='post')
class LoginView(APIView):
    permission_classes = []

    @extend_schema(summary='Login with email and password')
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = User.objects.filter(email=email).first()

        if not user or user.is_locked:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        auth_user = authenticate(request, email=email, password=password)

        if not auth_user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.is_locked = True
            user.save()

            AuditLog.log(request, 'LOGIN_FAILED', 'User', user.id, f'Failed login for {email}')

            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user.failed_login_attempts = 0
        user.last_login_attempt = timezone.now()
        user.save()

        # 2FA check
        if user.totp_enabled:
            temp_token = str(uuid.uuid4())
            cache.set(f"2fa_temp_{temp_token}", user.id, 300)
            return Response({
                "requires_2fa": True,
                "temp_token": temp_token,
            })

        refresh = RefreshToken.for_user(user)

        AuditLog.log(request, 'LOGIN_SUCCESS', 'User', user.id, f'Successful login for {email}')

        # Create session record
        self._create_session(request, user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })

    def _create_session(self, request, user):
        try:
            from user_agents import parse as parse_ua
            ua_string = request.META.get('HTTP_USER_AGENT', '')
            ua = parse_ua(ua_string)
            ip = (
                request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
                or request.META.get('REMOTE_ADDR', '')
            )
            UserSession.objects.create(
                user=user,
                device_info=f"{ua.device.family} — {ua.os.family} {ua.os.version_string}",
                browser=f"{ua.browser.family} {ua.browser.version_string}",
                ip_address=ip or None,
            )
        except Exception:
            pass


@extend_schema(tags=['auth'])
class LogoutView(APIView):
    @extend_schema(summary='Logout and blacklist refresh token')
    def post(self, request):
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        AuditLog.log(request, 'LOGOUT', 'User', request.user.id if request.user.is_authenticated else '')
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=['auth'])
class CurrentUserView(APIView):
    @extend_schema(summary='Get current authenticated user', responses={200: UserSerializer})
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# ── Email Verification & Password Reset ─────────────────────────


@extend_schema(tags=['auth'])
class SendVerificationEmailView(APIView):
    """POST /api/auth/send-verification/ — resend verification email."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "If this email exists, a verification link has been sent."})

        if user.is_verified:
            return Response({"detail": "Email already verified."})

        token_obj = VerificationToken.create_for_user(user, 'email_verify', hours=24)
        try:
            send_verification_email(user, str(token_obj.token))
        except Exception:
            pass
        return Response({"detail": "Verification email sent."})


@extend_schema(tags=['auth'])
class VerifyEmailView(APIView):
    """POST /api/auth/verify-email/ — verify email with token."""
    permission_classes = [AllowAny]

    def post(self, request):
        token_str = request.data.get('token')
        try:
            token_obj = VerificationToken.objects.get(
                token=token_str,
                token_type='email_verify',
            )
        except (VerificationToken.DoesNotExist, ValueError):
            return Response({"detail": "Invalid token."}, status=400)

        if not token_obj.is_valid():
            return Response({"detail": "Token expired or already used."}, status=400)

        token_obj.user.is_verified = True
        token_obj.user.save(update_fields=['is_verified'])
        token_obj.used = True
        token_obj.save(update_fields=['used'])

        return Response({"detail": "Email verified successfully."})


@method_decorator(ratelimit(key='ip', rate='3/h', method='POST', block=True), name='post')
@extend_schema(tags=['auth'])
class ForgotPasswordView(APIView):
    """POST /api/auth/forgot-password/ — request password reset email."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "If this email exists, a reset link has been sent."})

        token_obj = VerificationToken.create_for_user(user, 'password_reset', hours=1)
        try:
            send_password_reset_email(user, str(token_obj.token))
        except Exception:
            pass
        return Response({"detail": "If this email exists, a reset link has been sent."})


@extend_schema(tags=['auth'])
class ResetPasswordView(APIView):
    """
    GET  /api/auth/reset-password/?token=<uuid>  — validate token
    POST /api/auth/reset-password/                — confirm reset
    """
    permission_classes = [AllowAny]

    def get(self, request):
        token_str = request.query_params.get('token')
        try:
            token_obj = VerificationToken.objects.get(
                token=token_str,
                token_type='password_reset',
            )
            if token_obj.is_valid():
                return Response({"valid": True})
            return Response({"valid": False, "detail": "Token expired."}, status=400)
        except (VerificationToken.DoesNotExist, ValueError):
            return Response({"valid": False, "detail": "Invalid token."}, status=400)

    def post(self, request):
        token_str = request.data.get('token')
        new_password = request.data.get('password')

        if not new_password or len(new_password) < 8:
            return Response(
                {"detail": "Password must be at least 8 characters."},
                status=400,
            )

        try:
            token_obj = VerificationToken.objects.get(
                token=token_str,
                token_type='password_reset',
            )
        except (VerificationToken.DoesNotExist, ValueError):
            return Response({"detail": "Invalid token."}, status=400)

        if not token_obj.is_valid():
            return Response({"detail": "Token expired or already used."}, status=400)

        user = token_obj.user
        user.set_password(new_password)
        user.save()
        token_obj.used = True
        token_obj.save(update_fields=['used'])

        AuditLog.log(request, 'PASSWORD_RESET', 'User', user.id, f'Password reset for {user.email}')

        return Response({"detail": "Password reset successful."})
