from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load both the model and the exact column layout from training
model = joblib.load("student_model.pkl")
model_columns = joblib.load("model_columns.pkl")

NUMERIC_COLUMNS = [
    "Hours_Studied",
    "Attendance",
    "Sleep_Hours",
    "Previous_Scores",
    "Tutoring_Sessions",
    "Physical_Activity",
]

CATEGORICAL_COLUMNS = [
    "Parental_Involvement",
    "Access_to_Resources",
    "Extracurricular_Activities",
    "Motivation_Level",
    "Internet_Access",
    "Family_Income",
    "Teacher_Quality",
    "School_Type",
    "Peer_Influence",
    "Learning_Disabilities",
    "Parental_Education_Level",
    "Distance_from_Home",
    "Gender",
]

# Map each categorical field to the dummy levels present in the training layout.
dummy_levels = {}
for column in model_columns:
    for field in CATEGORICAL_COLUMNS:
        if column.startswith(field + "_"):
            dummy_levels.setdefault(field, []).append(column[len(field) + 1 :])
            break


def encode(data: dict) -> pd.DataFrame:
    row = {}
    for column in NUMERIC_COLUMNS:
        row[column] = data.get(column, 0)
    for field in CATEGORICAL_COLUMNS:
        value = str(data.get(field, ""))
        for level in dummy_levels.get(field, []):
            row[f"{field}_{level}"] = 1 if value == level else 0
    return pd.DataFrame([row]).reindex(columns=model_columns, fill_value=0)


@app.post("/predict")
def predict(data: dict):
    df_final = encode(data)

    prediction = int(model.predict(df_final)[0])
    probability = float(model.predict_proba(df_final)[0][prediction])

    return {
        "prediction": prediction,
        "probability": probability,
    }
