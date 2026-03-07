from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import (
    RegisterView, LoginView, LogoutView, CurrentUserView,
    SendVerificationEmailView, VerifyEmailView,
    ForgotPasswordView, ResetPasswordView,
)
from .views import UserListView

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

    # Admin
    path('admin/users/', UserListView.as_view()),
]
