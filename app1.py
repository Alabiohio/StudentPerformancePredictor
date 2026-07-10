import streamlit as st
import joblib
import pandas as pd

# Load the model and the exact feature columns list from training
model = joblib.load("student_model.pkl")
model_columns = joblib.load("model_columns.pkl")
    
st.title("Student Performance Predictor")

# 1. Numerical Inputs
hours = st.number_input("Hours Studied", 0, 20, 5)
attendance = st.number_input("Attendance", 0, 100, 80)
sleep = st.number_input("Sleep Hours", 0, 12, 7)
previous = st.number_input("Previous Scores", 0, 100, 70)

# 2. Categorical Inputs (Add the text options your model expects)
# Note: Add options for ALL categorical columns you used during training here
access_resources = st.selectbox("Access to Resources", ["Low", "Medium", "High"])
distance_home = st.selectbox("Distance from Home", ["Near", "Moderate", "Far"])
extracurricular = st.selectbox("Extracurricular Activities", ["No", "Yes"])

if st.button("Predict"):
    # Create the raw dataframe from user inputs
    student_raw = pd.DataFrame({
        "Hours_Studied": [hours],
        "Attendance": [attendance],
        "Sleep_Hours": [sleep],
        "Previous_Scores": [previous],
        "Access_to_Resources": [access_resources],
        "Distance_from_Home": [distance_home],
        "Extracurricular_Activities": [extracurricular]
    })

    # Transform text categories into 1s and 0s
    student_encoded = pd.get_dummies(student_raw, drop_first=True)

    # CRITICAL FIX: Align columns with training data. 
    # This automatically adds all missing dummy columns and sets them to 0.
    student_final = student_encoded.reindex(columns=model_columns, fill_value=0)

    # Make the prediction
    prediction = model.predict(student_final)

    # Display results
    if prediction[0] == 1:
        st.success("High Performer")
    else:
        st.error("Low Performer")
