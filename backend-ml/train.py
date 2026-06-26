import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import LabelEncoder
import joblib

# Load synthetic data
df = pd.read_csv("students.csv")

# Feature engineering
df["absence_rate"] = df["absences_this_month"] / 30
df["avg_score"] = (df["math_score"] + df["science_score"]) / 2
df["grade_risk"] = (df["math_score"] < 40).astype(int) + (df["science_score"] < 40).astype(int)
df["seasonal_weight"] = df["seasonal_flag"].astype(int) * 1.3
df["combined_risk"] = df["absence_rate"] * df["grade_risk"] * (1 + df["seasonal_weight"])

# Select features
FEATURES = [
    "absences_this_month",
    "absence_streak",
    "math_score",
    "science_score",
    "seasonal_flag",
    "absence_rate",
    "avg_score",
    "grade_risk",
    "seasonal_weight",
    "combined_risk",
]

X = df[FEATURES].astype(float)
y = df["dropout_label"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train XGBoost
model = XGBClassifier(
    n_estimators=100,
    max_depth=4,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    use_label_encoder=False,
    eval_metric="logloss",
    random_state=42,
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=False,
)

# Evaluate
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("\n=== EduSight XGBoost Model ===")
print(f"AUC-ROC Score: {roc_auc_score(y_test, y_prob):.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["Not at risk", "At risk"]))

# Save model and feature list
joblib.dump(model, "model.pkl")
joblib.dump(FEATURES, "features.pkl")
print("\nModel saved → model.pkl")
print("Features saved → features.pkl")