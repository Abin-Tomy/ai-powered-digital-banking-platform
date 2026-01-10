import uuid
from django.db import models
from django.conf import settings


class Account(models.Model):
    class AccountType(models.TextChoices):
        SAVINGS = 'SAVINGS'
        CURRENT = 'CURRENT'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE'
        FROZEN = 'FROZEN'
        CLOSED = 'CLOSED'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    account_number = models.CharField(
        max_length=20,
        unique=True,
        db_index=True
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='accounts'
    )

    account_type = models.CharField(
        max_length=20,
        choices=AccountType.choices
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "account_type"],
                condition=models.Q(account_type="SAVINGS"),
                name="one_savings_account_per_user"
            )
        ]

    def __str__(self):
        return f"{self.account_number} ({self.owner.email})"
