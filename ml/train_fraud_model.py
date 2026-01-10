import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Load dataset
df = pd.read_csv("data/creditcard.csv")

# Drop non-feature columns
df = df.drop(columns=["transaction_id"])

# Separate features and label
X = df.drop("is_fraud", axis=1)
y = df["is_fraud"]

# Feature groups
numeric_features = [
    "amount",
    "transaction_hour",
    "device_trust_score",
    "velocity_last_24h",
    "cardholder_age"
]

binary_features = [
    "foreign_transaction",
    "location_mismatch"
]

categorical_features = [
    "merchant_category"
]

# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_features),
        ("bin", "passthrough", binary_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
    ]
)

# Isolation Forest (AI fraud detection)
model = IsolationForest(
    n_estimators=300,
    contamination=0.02,
    random_state=42,
    n_jobs=-1
)

# Full pipeline
pipeline = Pipeline(
    steps=[
        ("preprocessing", preprocessor),
        ("model", model),
    ]
)

# Train model
pipeline.fit(X)

# Save trained pipeline
joblib.dump(pipeline, "fraud_model.pkl")

print("✅ AI fraud detection model trained successfully.")
