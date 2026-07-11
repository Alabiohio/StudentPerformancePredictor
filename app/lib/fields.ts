export type NumericField = {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
  hint: string;
};

export type CategoricalField = {
  name: string;
  label: string;
  options: string[];
  default: string;
  hint: string;
};

export const NUMERIC_FIELDS: NumericField[] = [
  {
    name: "Hours_Studied",
    label: "Hours Studied",
    min: 1,
    max: 44,
    step: 1,
    default: 20,
    unit: "hrs/wk",
    hint: "Weekly study time",
  },
  {
    name: "Attendance",
    label: "Attendance",
    min: 60,
    max: 100,
    step: 1,
    default: 90,
    unit: "%",
    hint: "Class attendance rate",
  },
  {
    name: "Sleep_Hours",
    label: "Sleep Hours",
    min: 4,
    max: 10,
    step: 1,
    default: 7,
    unit: "hrs/night",
    hint: "Average nightly sleep",
  },
  {
    name: "Previous_Scores",
    label: "Previous Scores",
    min: 50,
    max: 100,
    step: 1,
    default: 75,
    unit: "pts",
    hint: "Prior academic score",
  },
  {
    name: "Tutoring_Sessions",
    label: "Tutoring Sessions",
    min: 0,
    max: 8,
    step: 1,
    default: 2,
    unit: "/wk",
    hint: "Weekly tutoring",
  },
  {
    name: "Physical_Activity",
    label: "Physical Activity",
    min: 0,
    max: 6,
    step: 1,
    default: 3,
    unit: "/wk",
    hint: "Weekly activity sessions",
  },
];

export const CATEGORICAL_FIELDS: CategoricalField[] = [
  {
    name: "Parental_Involvement",
    label: "Parental Involvement",
    options: ["Low", "Medium", "High"],
    default: "Medium",
    hint: "Engagement of parents",
  },
  {
    name: "Access_to_Resources",
    label: "Access to Resources",
    options: ["Low", "Medium", "High"],
    default: "Medium",
    hint: "Learning resources available",
  },
  {
    name: "Extracurricular_Activities",
    label: "Extracurricular Activities",
    options: ["No", "Yes"],
    default: "Yes",
    hint: "Participation outside class",
  },
  {
    name: "Motivation_Level",
    label: "Motivation Level",
    options: ["Low", "Medium", "High"],
    default: "High",
    hint: "Self-reported motivation",
  },
  {
    name: "Internet_Access",
    label: "Internet Access",
    options: ["No", "Yes"],
    default: "Yes",
    hint: "Reliable internet at home",
  },
  {
    name: "Family_Income",
    label: "Family Income",
    options: ["Low", "Medium", "High"],
    default: "Medium",
    hint: "Household income bracket",
  },
  {
    name: "Teacher_Quality",
    label: "Teacher Quality",
    options: ["Low", "Medium", "High"],
    default: "High",
    hint: "Perceived teaching quality",
  },
  {
    name: "School_Type",
    label: "School Type",
    options: ["Private", "Public"],
    default: "Public",
    hint: "Type of institution",
  },
  {
    name: "Peer_Influence",
    label: "Peer Influence",
    options: ["Negative", "Neutral", "Positive"],
    default: "Positive",
    hint: "Influence of classmates",
  },
  {
    name: "Learning_Disabilities",
    label: "Learning Disabilities",
    options: ["No", "Yes"],
    default: "No",
    hint: "Diagnosed learning needs",
  },
  {
    name: "Parental_Education_Level",
    label: "Parental Education",
    options: ["College", "High School", "Postgraduate"],
    default: "College",
    hint: "Highest parental education",
  },
  {
    name: "Distance_from_Home",
    label: "Distance from Home",
    options: ["Far", "Moderate", "Near"],
    default: "Near",
    hint: "Commute to school",
  },
  {
    name: "Gender",
    label: "Gender",
    options: ["Female", "Male"],
    default: "Female",
    hint: "Student gender",
  },
];

export const MODEL_META = {
  accuracy: 0.9796,
  medianExamScore: 67,
  target: "High_Performer",
};
