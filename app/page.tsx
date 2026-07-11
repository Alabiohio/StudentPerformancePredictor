import Predictor from "@/app/ui/predictor";
import { MODEL_META } from "@/app/lib/fields";

const stats = [
  { value: "6,607", label: "Student records" },
  { value: "98%", label: "Model accuracy" },
  { value: "27", label: "Model features" },
  { value: `${MODEL_META.medianExamScore}`, label: "Median exam score" },
];

const topFactors = [
  { name: "Attendance", note: "Consistent class attendance" },
  { name: "Hours Studied", note: "Weekly study time" },
  { name: "Previous Scores", note: "Prior academic achievement" },
  { name: "Tutoring Sessions", note: "Targeted support" },
  { name: "Sleep Hours", note: "Rest and recovery" },
];

const steps = [
  {
    title: "Prepare the profile",
    body: "Enter a student's academic, behavioural and environmental factors using the interactive form.",
  },
  {
    title: "Run the model",
    body: "Inputs are one-hot encoded and scored by a logistic regression model trained in Python.",
  },
  {
    title: "Read the result",
    body: "Get an instant prediction of whether the student is likely to be a high performer, with a confidence score.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero-gradient">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl animate-fade-up">
            <h1 className="mt-5 text-5xl lg:text-7xl font-black font-blinker leading-[1.1] tracking-tight sm:text-6xl">
              PREDICT <span className="text-gradient">student PERFORMANCE</span>{" "}
              before exam day.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Model the likelihood that a student will be a high performer based
              on study habits, lifestyle and environment — using a logistic
              regression model trained on thousands of real student records.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#predict" className="btn-primary">
                Try the predictor
              </a>
              <a href="#how" className="btn-secondary">
                How it works
              </a>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-5">
                <dt className="text-2xl font-bold text-foreground sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-9 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Live demo
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Performance predictor
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Move the sliders and pick the options that best describe a student.
            The model updates instantly.
          </p>
        </div>
        <Predictor />
      </section>

      <section
        id="how"
        className="border-t border-border bg-card py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Methodology
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              The app wraps a machine learning pipeline built with scikit-learn.
              Categorical inputs are encoded the same way the model was trained,
              so predictions stay consistent with the offline experiments.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="glass rounded-xl p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-sm font-bold text-accent">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="card-surface rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold">
                Most influential factors
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ranked by the Random Forest feature-importance analysis.
              </p>
              <ul className="mt-5 divide-y divide-border">
                {topFactors.map((factor) => (
                  <li
                    key={factor.name}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <span className="flex items-center gap-3 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {factor.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {factor.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-surface rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold">About the target</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The model predicts a <strong>High Performer</strong> label, which
                is derived from whether a student&apos;s exam score is above or
                below the median ({MODEL_META.medianExamScore} points). Because
                the label is computed from the exam score, the very high accuracy
                partly reflects this relationship.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Logistic Regression reached{" "}
                <strong>{(MODEL_META.accuracy * 100).toFixed(1)}%</strong>{" "}
                accuracy on the held-out test set, outperforming Random Forest
                (90%) and Decision Tree (83%).
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Logistic Regression", "Random Forest", "Decision Tree"].map(
                  (model, i) => (
                    <span
                      key={model}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        i === 0
                          ? "bg-accent/15 text-accent"
                          : "bg-glass text-muted-foreground"
                      }`}
                    >
                      {model}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
