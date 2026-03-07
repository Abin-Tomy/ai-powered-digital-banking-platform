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
