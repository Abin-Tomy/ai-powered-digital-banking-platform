import uuid
from django.db import models
from django.conf import settings
from transactions.models import Transaction


class FraudFlag(models.Model):
    class Status(models.TextChoices):
        CLEAR = "CLEAR"
        SUSPICIOUS = "SUSPICIOUS"
        CONFIRMED_FRAUD = "CONFIRMED_FRAUD"
        FALSE_POSITIVE = "FALSE_POSITIVE"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name="fraud_flag"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUSPICIOUS
    )

    risk_score = models.PositiveIntegerField()
    reasons = models.JSONField()

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"FraudFlag {self.transaction.id} – {self.status}"
