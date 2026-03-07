"""
AI Fraud Detection Service Integration.

Builds real behavioral features from transaction data and calls the
ML micro-service for fraud scoring.
"""
import requests
from datetime import timedelta

from django.db.models import Avg, Count
from django.utils import timezone

from transactions.models import Transaction
from django.conf import settings as django_settings

ML_SERVICE_URL = getattr(django_settings, 'ML_SERVICE_URL', 'http://localhost:9000')


# ── Feature helpers ──────────────────────────────────────────────

def categorize_by_amount(amount):
    """Determine merchant category based on transaction amount."""
    if amount < 500:
        return "retail"
    elif amount < 2000:
        return "dining"
    elif amount < 10000:
        return "travel"
    else:
        return "luxury"


def build_fraud_features(transaction, account, user) -> dict:
    """
    Build a feature dict for the ML fraud service using *real*
    behavioural signals derived from the transaction and user history.
    """
    amount = float(transaction.amount)

    # ── velocity: transactions in last 24 h ──
    velocity_last_24h = Transaction.objects.filter(
        account=account,
        created_at__gte=timezone.now() - timedelta(hours=24),
    ).count()

    # ── cardholder_age: years since sign-up ──
    age_days = (timezone.now().date() - user.date_joined.date()).days
    cardholder_age = max(age_days // 365, 0)

    # ── foreign_transaction: amount > 4× user's personal average ──
    avg_amount = Transaction.objects.filter(
        account=account,
    ).aggregate(avg=Avg("amount"))["avg"]

    if avg_amount is None or amount > float(avg_amount) * 4:
        foreign_transaction = 1
    else:
        foreign_transaction = 0

    # ── location_mismatch: transacting at an unusual hour ──
    past_hours = list(
        Transaction.objects.filter(account=account)
        .values_list("created_at__hour", flat=True)
    )
    current_hour = timezone.now().hour

    if len(past_hours) < 5:
        location_mismatch = 0          # not enough history to judge
    elif current_hour not in past_hours:
        location_mismatch = 1          # unusual hour for this user
    else:
        location_mismatch = 0

    # ── device_trust_score (placeholder – will use device fingerprinting later) ──
    device_trust_score = 0.8

    return {
        "amount": amount,
        "transaction_hour": current_hour,
        "device_trust_score": device_trust_score,
        "velocity_last_24h": velocity_last_24h,
        "cardholder_age": cardholder_age,
        "foreign_transaction": foreign_transaction,
        "location_mismatch": location_mismatch,
        "merchant_category": categorize_by_amount(amount),
    }


# ── Public API ──────────────────────────────────────────────────

def predict_fraud(transaction, account, user):
    """
    Call the AI fraud-detection micro-service.

    Returns a dict with keys: is_fraud, risk_score, reason.
    On any failure the function returns is_fraud=False (fail-safe).
    """
    payload = build_fraud_features(transaction, account, user)

    try:
        response = requests.post(f"{ML_SERVICE_URL}/predict", json=payload, timeout=3)
        response.raise_for_status()
        result = response.json()

        risk_score = int(abs(result["risk_score"]) * 100)

        # Broadcast live alert if flagged as fraud
        if result["is_fraud"]:
            broadcast_fraud_alert(transaction, risk_score, user)

        return {
            "is_fraud": result["is_fraud"],
            "risk_score": risk_score,
            "reason": "AI detected anomalous transaction",
        }

    except Exception:
        # Banking-grade fail-safe: never block a transaction on AI outage
        return {
            "is_fraud": False,
            "risk_score": 0,
            "reason": "AI service unavailable",
        }


def broadcast_fraud_alert(transaction, risk_score, user):
    """Push a real-time fraud alert to all connected admin/support dashboards."""
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "fraud_alerts",
            {
                "type": "fraud.alert",
                "transaction_id": str(transaction.id),
                "risk_score": round(float(risk_score), 4),
                "amount": str(transaction.amount),
                "user_email": user.email,
                "timestamp": timezone.now().isoformat(),
            },
        )
    except Exception:
        # Never let alert broadcasting block or fail a transaction
        pass

