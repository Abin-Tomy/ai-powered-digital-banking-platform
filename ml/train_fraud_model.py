import pandas as pd
import numpy as np
import joblib
import shutil

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# ── Load dataset ────────────────────────────────────────────────
df = pd.read_csv("data/creditcard.csv")

# Drop non-feature columns
df = df.drop(columns=["transaction_id"])

# ── Replace random-based features with realistic distributions ──

# foreign_transaction: flag top 15 % of amounts (anomalously high)
amount_threshold = df["amount"].quantile(0.85)
df["foreign_transaction"] = (df["amount"] > amount_threshold).astype(int)

# location_mismatch: flag late-night transactions (0-4 AM ≈ unusual hours)
df["location_mismatch"] = df["transaction_hour"].apply(
    lambda h: 1 if h < 5 else 0
)

# ── Separate features and label ────────────────────────────────
X = df.drop("is_fraud", axis=1)
y = df["is_fraud"]

# Feature groups
numeric_features = [
    "amount",
    "transaction_hour",
    "device_trust_score",
    "velocity_last_24h",
    "cardholder_age",
]

binary_features = [
    "foreign_transaction",
    "location_mismatch",
]

categorical_features = [
    "merchant_category",
]

# ── Preprocessing ──────────────────────────────────────────────
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_features),
        ("bin", "passthrough", binary_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
    ]
)

# ── Isolation Forest ───────────────────────────────────────────
model = IsolationForest(
    n_estimators=300,
    contamination=0.02,
    random_state=42,
    n_jobs=-1,
)

# ── Full pipeline ──────────────────────────────────────────────
pipeline = Pipeline(
    steps=[
        ("preprocessing", preprocessor),
        ("model", model),
    ]
)

# ── Train ──────────────────────────────────────────────────────
pipeline.fit(X)

# ── Save ───────────────────────────────────────────────────────
joblib.dump(pipeline, "fraud_model.pkl")
print("[OK] AI fraud detection model trained successfully.")

# Copy the model to ml_service/
shutil.copy("fraud_model.pkl", "../ml_service/fraud_model.pkl")
print("[OK] Model copied to ml_service/")
