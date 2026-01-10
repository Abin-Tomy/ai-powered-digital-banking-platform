from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


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
