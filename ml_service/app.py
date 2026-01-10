from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# Load trained ML pipeline
model = joblib.load("fraud_model.pkl")

app = FastAPI(title="AI Fraud Detection Service")


class TransactionInput(BaseModel):
    amount: float
    transaction_hour: int
    merchant_category: str
    foreign_transaction: int
    location_mismatch: int
    device_trust_score: float
    velocity_last_24h: int
    cardholder_age: int


@app.post("/predict")
def predict_fraud(txn: TransactionInput):
    # Convert input to DataFrame (matches training schema)
    df = pd.DataFrame([txn.dict()])

    prediction = model.predict(df)[0]
    score = model.decision_function(df)[0]

    return {
        "is_fraud": bool(prediction == -1),
        "risk_score": float(score)
    }
