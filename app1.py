import streamlit as st
import joblib
import pandas as pd

# Load the model and the exact feature columns list from training
model = joblib.load("student_model.pkl")
model_columns = joblib.load("model_columns.pkl")
    
st.title("🎓 Complete Student Performance Predictor")
st.write("Input all student metrics below to evaluate performance classification.")

# --- CATEGORY 1: ACADEMIC & STUDY HABITS ---
st.subheader("📚 Academic & Study Habits")
col1, col2 = st.columns(2)
with col1:
    hours = st.number_input("Hours Studied (Per Week)", 0, 40, 15)
    attendance = st.number_input("Attendance Rate (%)", 0, 100, 90)
    tutoring = st.number_input("Tutoring Sessions (Per Month)", 0, 10, 2)
with col2:
    sleep = st.number_input("Sleep Hours (Per Night)", 0, 14, 7)
    previous = st.number_input("Previous Scores", 0, 100, 75)
    motivation = st.selectbox("Motivation Level", ["Low", "Medium", "High"], index=1)

# --- CATEGORY 2: SCHOOL & ENVIRONMENT ---
st.subheader("🏫 School & Environment")
col3, col4 = st.columns(2)
with col3:
    teacher_quality = st.selectbox("Teacher Quality", ["Low", "Medium", "High"], index=1)
    school_type = st.selectbox("School Type", ["Public", "Private"])
    peer_influence = st.selectbox("Peer Influence", ["Negative", "Neutral", "Positive"], index=1)
with col4:
    distance_home = st.selectbox("Distance from Home", ["Near", "Moderate", "Far"], index=0)
    learning_disabilities = st.selectbox("Learning Disabilities", ["No", "Yes"])
    resources = st.selectbox("Access to Resources", ["Low", "Medium", "High"], index=1)

# --- CATEGORY 3: LIFESTYLE & PARENTAL BACKGROUND ---
st.subheader("🏠 Lifestyle & Family Background")
col5, col6 = st.columns(2)
with col5:
    extracurricular = st.selectbox("Extracurricular Activities", ["No", "Yes"])
    internet = st.selectbox("Internet Access", ["No", "Yes"])
    parent_education = st.selectbox("Parental Education Level", ["High School", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "PhD"], index=0)
with col6:
    parent_involvement = st.selectbox("Parental Involvement", ["Low", "Medium", "High"], index=1)
    family_income = st.selectbox("Family Income Level", ["Low", "Medium", "High"], index=1)

col7, col8 = st.columns(2)
with col7:
    physical_activity = st.number_input("Physical Activity (Hours/Week)", 0, 30, 4)
with col8:
    gender = st.selectbox("Gender", ["Male", "Female"])

# --- PREDICTION LOGIC ---
if st.button("Predict Performance Tier", type="primary"):
    # Create the raw dataframe map containing ALL 20 student dimensions
    student_raw = pd.DataFrame({
        "Hours_Studied": [hours],
        "Attendance": [attendance],
        "Sleep_Hours": [sleep],
        "Previous_Scores": [previous],
        "Motivation_Level": [motivation],
        "Tutoring_Sessions": [tutoring],
        "Teacher_Quality": [teacher_quality],
        "School_Type": [school_type],
        "Peer_Influence": [peer_influence],
        "Physical_Activity": [physical_activity],
        "Learning_Disabilities": [learning_disabilities],
        "Parental_Education_Level": [parent_education],
        "Parental_Involvement": [parent_involvement],
        "Access_to_Resources": [resources],
        "Extracurricular_Activities": [extracurricular],
        "Distance_from_Home": [distance_home],
        "Family_Income": [family_income],
        "Internet_Access": [internet],
        "Gender": [gender]
    })

    # Transform all text fields into structural dummy columns
    student_encoded = pd.get_dummies(student_raw, drop_first=True)

    # ALIGN WITH THE MODEL'S 28 EXPECTED INPUTS
    # This automatically map matching fields and fills unused subcategories with 0
    student_final = student_encoded.reindex(columns=model_columns, fill_value=0)

    # Compute prediction tracking execution
    prediction = model.predict(student_final)

    # Render localized feedback tier
    if prediction[0] == 1:
        st.success("🎯 **Predicted Category:** High Performer (Top 50% of Distribution)")
    else:
        st.error("📉 **Predicted Category:** Standard/Lower Performer (Bottom 50% of Distribution)")
