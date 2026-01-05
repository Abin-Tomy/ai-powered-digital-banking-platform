from django.conf import settings
from django.db import models
import uuid


User = settings.AUTH_USER_MODEL

class Account(models.Model):
    ACCOUNT_TYPE_CHOICES = (
        ('SAVINGS', 'Savings'),
        ('CURRENT', 'Current'),
    )

    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('FROZEN', 'Frozen'),
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='accounts'
    )

    account_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES
    )

    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.account_number:
            self.account_number = self.generate_account_number()
        super().save(*args, **kwargs)

    def generate_account_number(self):
        """
        Banking-grade account number generation.
        Prefix + random unique segment.
        """
        return f"ACC{uuid.uuid4().hex[:10].upper()}"

    def __str__(self):
        return f"{self.account_number} ({self.owner})"
