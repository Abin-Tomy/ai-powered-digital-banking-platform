from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import (
    RegisterView, LoginView, LogoutView, CurrentUserView,
    SendVerificationEmailView, VerifyEmailView,
    ForgotPasswordView, ResetPasswordView,
)
from .views import UserListView
from .credit_views import CreditScoreView
from .notification_views import NotificationListView, MarkNotificationReadView, MarkAllNotificationsReadView
from .audit_views import AuditLogView
from .customer360_views import Customer360View
from .totp_views import TOTPSetupView, TOTPVerifyView, TOTPDisableView, TOTPAuthenticateView
from .session_views import SessionListView, SessionRevokeView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('auth/me/', CurrentUserView.as_view()),
    path('auth/token/refresh/', TokenRefreshView.as_view()),

    # Email verification & password reset
    path('auth/send-verification/', SendVerificationEmailView.as_view()),
    path('auth/verify-email/', VerifyEmailView.as_view()),
    path('auth/forgot-password/', ForgotPasswordView.as_view()),
    path('auth/reset-password/', ResetPasswordView.as_view()),

    # 2FA TOTP
    path('auth/2fa/setup/', TOTPSetupView.as_view()),
    path('auth/2fa/verify/', TOTPVerifyView.as_view()),
    path('auth/2fa/disable/', TOTPDisableView.as_view()),
    path('auth/2fa/authenticate/', TOTPAuthenticateView.as_view()),

    # Sessions
    path('users/sessions/', SessionListView.as_view()),
    path('users/sessions/<uuid:session_id>/', SessionRevokeView.as_view()),

    # Credit score
    path('users/credit-score/', CreditScoreView.as_view(), name='credit-score'),

    # Notifications
    path('notifications/', NotificationListView.as_view()),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view()),
    path('notifications/read-all/', MarkAllNotificationsReadView.as_view()),

    # Audit Log (Admin only)
    path('admin/audit-log/', AuditLogView.as_view()),

    # Customer 360 (Support/Admin)
    path('support/customer360/<int:user_id>/', Customer360View.as_view()),

    # Admin
    path('admin/users/', UserListView.as_view()),
]
