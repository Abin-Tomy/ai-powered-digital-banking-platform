import requests

ML_SERVICE_URL = "http://127.0.0.1:9000/predict"

def predict_fraud(transaction):
    """
    Calls AI fraud detection service.
    Single source of truth for fraud evaluation.
    """

    payload = {
        "amount": float(transaction.amount),
        "transaction_hour": transaction.created_at.hour,
        "merchant_category": "electronics",
        "foreign_transaction": 0,
        "location_mismatch": 0,
        "device_trust_score": 0.8,
        "velocity_last_24h": transaction.account.transactions.count(),
        "cardholder_age": 30,
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
