from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

# Load both the model and the exact column layout from training
model = joblib.load("student_model.pkl")
model_columns = joblib.load("model_columns.pkl")

@app.post("/predict")
def predict(data: dict):
    # 1. Convert the incoming JSON dictionary into a DataFrame row
    df_raw = pd.DataFrame([data])

    # 2. Convert text columns into dummy variables (1s and 0s)
    df_encoded = pd.get_dummies(df_raw, drop_first=True)

    # 3. CRITICAL FIX: Align the API input layout with your training layout.
    # This dynamically builds all 28 expected columns and fills missing ones with 0.
    df_final = df_encoded.reindex(columns=model_columns, fill_value=0)

    # 4. Generate the prediction safely
    prediction = model.predict(df_final)

    return {
        "prediction": int(prediction[0])
    }
