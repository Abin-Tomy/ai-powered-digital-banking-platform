"""
Email service using Resend for transactional emails.
"""
import resend
from django.conf import settings


resend.api_key = settings.RESEND_API_KEY


def send_verification_email(user, token):
    """Send email verification link to a newly registered user."""
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    resend.Emails.send({
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": user.email,
        "subject": "Verify your banking account",
        "html": f"""
        <h2>Welcome to Digital Bank</h2>
        <p>Hi {user.full_name},</p>
        <p>Please verify your email address to activate your account.</p>
        <a href="{verify_url}"
           style="background:#2563eb;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:6px;display:inline-block">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
        <p>If you did not create this account, ignore this email.</p>
        """,
    })


def send_password_reset_email(user, token):
    """Send password reset link."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    resend.Emails.send({
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": user.email,
        "subject": "Reset your password",
        "html": f"""
        <h2>Password Reset Request</h2>
        <p>Hi {user.full_name},</p>
        <p>We received a request to reset your password.</p>
        <a href="{reset_url}"
           style="background:#dc2626;color:white;padding:12px 24px;
                  text-decoration:none;border-radius:6px;display:inline-block">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
        """,
    })
