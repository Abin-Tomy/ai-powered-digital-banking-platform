import uuid
from django.db import models
from django.conf import settings
from accounts.models import Account


class Transaction(models.Model):
    class Type(models.TextChoices):
        DEBIT = 'DEBIT'
        CREDIT = 'CREDIT'

    class Status(models.TextChoices):
        SUCCESS = 'SUCCESS'
        FAILED = 'FAILED'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name='transactions'
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=Type.choices)

    reference = models.CharField(max_length=64, db_index=True)
    description = models.CharField(max_length=255)

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.SUCCESS
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['account']),
            models.Index(fields=['reference']),
        ]

    def __str__(self):
        return f"{self.type} {self.amount} on {self.account.account_number}"


class IdempotencyKey(models.Model):
    key = models.CharField(max_length=64)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("key", "user")
