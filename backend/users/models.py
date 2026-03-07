from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid as uuid_module
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password):
        user = self.create_user(
            email=email,
            password=password,
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=True,
            is_verified=True,
        )
        return user


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER'
        SUPPORT = 'SUPPORT'
        ADMIN = 'ADMIN'

    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=Role.choices)

    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)

    failed_login_attempts = models.PositiveIntegerField(default=0)
    last_login_attempt = models.DateTimeField(null=True, blank=True)

    date_joined = models.DateTimeField(default=timezone.now)

    is_staff = models.BooleanField(default=False)

    totp_secret = models.CharField(max_length=32, blank=True, default='')
    totp_enabled = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


class VerificationToken(models.Model):
    """Token for email verification and password reset flows."""
    TOKEN_TYPE_CHOICES = [
        ('email_verify', 'Email Verification'),
        ('password_reset', 'Password Reset'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='verification_tokens',
    )
    token = models.UUIDField(
        default=uuid_module.uuid4,
        unique=True,
        db_index=True,
    )
    token_type = models.CharField(max_length=20, choices=TOKEN_TYPE_CHOICES)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['token', 'token_type'])]

    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at

    @classmethod
    def create_for_user(cls, user, token_type, hours=24):
        """Create a new token, invalidating any existing unused ones."""
        cls.objects.filter(
            user=user,
            token_type=token_type,
            used=False,
        ).update(used=True)

        return cls.objects.create(
            user=user,
            token_type=token_type,
            expires_at=timezone.now() + timedelta(hours=hours),
        )


class UserSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    session_id = models.UUIDField(default=uuid_module.uuid4, unique=True)
    device_info = models.CharField(max_length=300, blank=True)
    browser = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_active']


class Notification(models.Model):
    """In-app notification for users."""
    class NotificationType(models.TextChoices):
        TRANSACTION = 'TRANSACTION'
        LOAN = 'LOAN'
        FRAUD = 'FRAUD'
        CREDIT_CARD = 'CREDIT_CARD'
        SYSTEM = 'SYSTEM'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', '-created_at'])]

    def __str__(self):
        return f"{self.notification_type}: {self.title}"


class AuditLog(models.Model):
    """Tracks important actions for compliance and security."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100, blank=True, default='')
    detail = models.TextField(blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['-created_at'])]

    def __str__(self):
        return f"{self.action} by {self.user} at {self.created_at}"

    @classmethod
    def log(cls, request, action, resource_type, resource_id='', detail=''):
        ip = None
        if request:
            ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or request.META.get('REMOTE_ADDR')
        return cls.objects.create(
            user=request.user if request and hasattr(request, 'user') and request.user.is_authenticated else None,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id),
            detail=detail,
            ip_address=ip,
        )
