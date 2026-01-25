import requests
import random
from datetime import datetime, timedelta

ML_SERVICE_URL = "http://127.0.0.1:9000/predict"

def get_merchant_category(amount):
    """Dynamically determine merchant category based on transaction amount"""
    if amount < 50:
        return random.choice(["food_dining", "transportation", "convenience"])
    elif amount < 200:
        return random.choice(["retail", "grocery", "pharmacy", "gas_station"])
    elif amount < 1000:
        return random.choice(["electronics", "clothing", "home_improvement", "healthcare"])
    else:
        return random.choice(["jewelry", "automotive", "travel", "real_estate"])

def calculate_device_trust_score(user):
    """Calculate device trust score based on user login patterns"""
    # In production, this would check device fingerprints, IP history, etc.
    base_score = 0.8
    
    # Reduce trust for new accounts
    account_age = (datetime.now() - user.date_joined.replace(tzinfo=None)).days
    if account_age < 30:
        base_score -= 0.2
    
    # Factor in failed login attempts
    if user.failed_login_attempts > 0:
        base_score -= (user.failed_login_attempts * 0.1)
    
    return max(0.1, min(1.0, base_score))

def detect_location_mismatch(transaction):
    """Detect if transaction location differs from usual patterns"""
    # In production, this would check IP geolocation vs historical patterns
    # For now, randomly flag 5% of transactions as location mismatches
    return 1 if random.random() < 0.05 else 0

def is_foreign_transaction(transaction):
    """Check if transaction is international"""
    # In production, check merchant country vs account country
    # For now, randomly flag 10% as foreign
    return 1 if random.random() < 0.10 else 0

def predict_fraud(transaction):
    """
    Calls AI fraud detection service.
    Single source of truth for fraud evaluation.
    """
    
    # Calculate dynamic transaction velocity
    last_24h = datetime.now() - timedelta(hours=24)
    velocity_count = transaction.account.transactions.filter(
        created_at__gte=last_24h
    ).count()
    
    # Calculate user age (approximate from account creation)
    account_age_days = (datetime.now() - transaction.account.owner.date_joined.replace(tzinfo=None)).days
    estimated_age = 25 + min(40, account_age_days // 365 * 2)  # Estimate between 25-65

    payload = {
        "amount": float(transaction.amount),
        "transaction_hour": transaction.created_at.hour,
        "merchant_category": get_merchant_category(float(transaction.amount)),
        "foreign_transaction": is_foreign_transaction(transaction),
        "location_mismatch": detect_location_mismatch(transaction),
        "device_trust_score": calculate_device_trust_score(transaction.account.owner),
        "velocity_last_24h": velocity_count,
        "cardholder_age": estimated_age,
    }

    try:
        response = requests.post(ML_SERVICE_URL, json=payload, timeout=3)
        response.raise_for_status()
        result = response.json()

        return {
            "is_fraud": result["is_fraud"],
            "risk_score": int(abs(result["risk_score"]) * 100),
            "reason": "AI detected anomalous transaction"
        }

    except Exception:
        # Banking-grade fail-safe: never block transaction on AI outage
        return {
            "is_fraud": False,
            "risk_score": 0,
            "reason": "AI service unavailable"
        }
