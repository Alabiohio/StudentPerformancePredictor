# Student Performance Predictor

## Overview

This project uses machine learning techniques to predict whether a student is a high performer or a low performer based on academic, behavioral, and environmental factors. The objective was to identify the factors that most influence student performance and build predictive models capable of classifying students accurately.

## Dataset

The dataset contains 6,607 student records and 20 attributes, including:

* Hours Studied
* Attendance
* Sleep Hours
* Previous Scores
* Motivation Level
* Internet Access
* Family Income
* Teacher Quality
* Physical Activity
* Tutoring Sessions
* Exam Score

The original dataset did not contain a pass/fail target variable. Therefore, a new target variable called High_Performer was created using the median exam score as the threshold.

## Data Preprocessing

The following preprocessing steps were performed:

* Loaded the dataset using Pandas.
* Identified and handled missing values in Teacher_Quality, Parental_Education_Level, and Distance_from_Home using mode imputation.
* Created the High_Performer target variable.
* Encoded categorical variables using one-hot encoding.
* Split the dataset into training and testing sets using an 80/20 ratio.

## Models Tested

### Logistic Regression

Accuracy: 97.96%

This model achieved the highest performance and demonstrated excellent classification capability.

### Random Forest

Accuracy: 90.02%

The Random Forest model provided strong predictive performance and was used to determine feature importance.

### Decision Tree

Accuracy: 83%

## Feature Importance

The most influential features identified by the Random Forest model were:

1. Attendance
2. Hours Studied
3. Previous Scores
4. Tutoring Sessions
5. Sleep Hours

These findings suggest that consistent attendance and study habits have the strongest relationship with academic performance.

## Evaluation Metrics

The Logistic Regression model achieved:

* Accuracy: 97.96%
* Precision: 98%
* Recall: 98%
* F1-Score: 98%

The confusion matrix showed only 27 incorrect predictions out of 1,322 test samples.

## Conclusion

The project successfully demonstrated how machine learning can be used to predict student performance using academic and lifestyle factors. Logistic Regression produced the best results, achieving nearly 98% accuracy. Attendance, study hours, and previous academic achievement were identified as the most important predictors of performance.

Future improvements may include hyperparameter tuning, cross-validation, model deployment, and the development of a web application for real-time predictions.
