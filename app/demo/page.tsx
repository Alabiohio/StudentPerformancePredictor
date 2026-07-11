import type { Metadata } from "next";
import Predictor, { type Preset } from "@/app/ui/predictor";
import InteractiveAnalysis from "@/app/ui/analysis";
import { MODEL_META } from "@/app/lib/fields";

export const metadata: Metadata = {
  title: "Live Demo · Student Performance Predictor",
  description:
    "Try the student performance predictor in real time. Load sample profiles, predict live as you adjust inputs, and see which factors drive each result.",
};

const presets: Preset[] = [
  {
    label: "Star student",
    description: "Strong study habits, support and motivation.",
    values: {
      Hours_Studied: 38,
      Attendance: 99,
      Sleep_Hours: 8,
      Previous_Scores: 95,
      Tutoring_Sessions: 5,
      Physical_Activity: 5,
      Parental_Involvement: "High",
      Access_to_Resources: "High",
      Extracurricular_Activities: "Yes",
      Motivation_Level: "High",
      Internet_Access: "Yes",
      Family_Income: "High",
      Teacher_Quality: "High",
      School_Type: "Private",
      Peer_Influence: "Positive",
      Learning_Disabilities: "No",
      Parental_Education_Level: "Postgraduate",
      Distance_from_Home: "Near",
      Gender: "Female",
    },
  },
  {
    label: "At-risk student",
    description: "Low engagement and limited resources.",
    values: {
      Hours_Studied: 4,
      Attendance: 62,
      Sleep_Hours: 5,
      Previous_Scores: 52,
      Tutoring_Sessions: 0,
      Physical_Activity: 1,
      Parental_Involvement: "Low",
      Access_to_Resources: "Low",
      Extracurricular_Activities: "No",
      Motivation_Level: "Low",
      Internet_Access: "No",
      Family_Income: "Low",
      Teacher_Quality: "Low",
      School_Type: "Public",
      Peer_Influence: "Negative",
      Learning_Disabilities: "Yes",
      Parental_Education_Level: "High School",
      Distance_from_Home: "Far",
      Gender: "Male",
    },
  },
  {
    label: "Average student",
    description: "Balanced, middle-of-the-road profile.",
    values: {
      Hours_Studied: 20,
      Attendance: 90,
      Sleep_Hours: 7,
      Previous_Scores: 75,
      Tutoring_Sessions: 2,
      Physical_Activity: 3,
      Parental_Involvement: "Medium",
      Access_to_Resources: "Medium",
      Extracurricular_Activities: "Yes",
      Motivation_Level: "High",
      Internet_Access: "Yes",
      Family_Income: "Medium",
      Teacher_Quality: "High",
      School_Type: "Public",
      Peer_Influence: "Positive",
      Learning_Disabilities: "No",
      Parental_Education_Level: "College",
      Distance_from_Home: "Near",
      Gender: "Female",
    },
  },
];

const tips = [
  {
    title: "Sample profiles",
    body: "Jump-start the demo with a star, at-risk or average student, then tweak individual factors to explore the model.",
  },
  {
    title: "Live prediction",
    body: "Turn on auto-predict to score inputs instantly as you move the sliders — no need to press the button each time.",
  },
  {
    title: "What drives the result",
    body: `After each prediction, see the top factors pushing the outcome, measured in log-odds from the logistic regression (median ${MODEL_META.medianExamScore} pts).`,
  },
];

export default function DemoPage() {
  return (
    <main>
      <section className="hero-gradient">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center animate-fade-up">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Live demo
            </span>
            <h1 className="mt-3 text-4xl font-black font-blinker leading-[1.1] tracking-tight sm:text-5xl">
              TRY THE <span className="text-gradient">predictor</span> in real
              time
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Load a sample profile, predict live as you adjust the inputs, and
              see exactly which factors drive each result.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-1 py-12 sm:px-2 sm:py-16">
        <Predictor presets={presets} live showContributions />

        <section className="mt-14">
          <div className="mb-9 text-center">
            <h2 className="mt-2 text-4xl font-bold tracking-tight">
              Go deeper with the model
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Run counterfactuals, plot how a single factor shifts the
              prediction, and compare two students side by side.
            </p>
          </div>
          <InteractiveAnalysis />
        </section>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {tips.map((tip) => (
            <div key={tip.title} className="glass rounded-xl p-6">
              <h3 className="text-base font-semibold">{tip.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tip.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl rounded-xl bg-glass px-5 py-4 text-center text-sm text-muted-foreground">
          For educational use only — predictions are illustrative and not a
          substitute for academic counselling.
        </p>
      </section>
    </main>
  );
}
