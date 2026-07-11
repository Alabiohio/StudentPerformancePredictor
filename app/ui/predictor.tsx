"use client";

import { useState } from "react";
import {
  NUMERIC_FIELDS,
  CATEGORICAL_FIELDS,
  MODEL_META,
} from "@/app/lib/fields";

type Values = Record<string, string | number>;

const initialValues: Values = Object.fromEntries([
  ...NUMERIC_FIELDS.map((f) => [f.name, f.default]),
  ...CATEGORICAL_FIELDS.map((f) => [f.name, f.default]),
]);

type Source = "ts" | "python";

type Result = {
  highPerformer: boolean;
  probability: number;
  confidence: number;
  source: Source;
};

export default function Predictor() {
  const [values, setValues] = useState<Values>(initialValues);
  const [source, setSource] = useState<Source>("ts");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function update(name: string, value: string | number) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setResult(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint =
      source === "python" ? "/api/predict/python" : "/api/predict";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Prediction failed.");
      }

      const data = (await response.json()) as {
        prediction: number;
        probability?: number;
      };

      const highPerformer = data.prediction === 1;
      const probability =
        typeof data.probability === "number"
          ? data.probability
          : highPerformer
            ? 1
            : 0;

      setResult({
        highPerformer,
        probability,
        confidence: highPerformer ? probability : 1 - probability,
        source,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      const hint =
        source === "python"
          ? " Make sure the Python API is running (uvicorn app:app --reload)."
          : "";
      setError(message + hint);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <form
        id="predict"
        onSubmit={handleSubmit}
        className="card-surface rounded-2xl p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3v18h18" />
                <path d="m7 14 3-3 3 3 5-5" />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                Student profile
              </h3>
              <p className="text-sm text-muted-foreground">
                Adjust the factors to model a student.
              </p>
            </div>
          </div>

          <div
            className="inline-flex shrink-0 rounded-full border border-border bg-background p-1"
            role="group"
            aria-label="Prediction source"
          >
            <button
              type="button"
              onClick={() => setSource("ts")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                source === "ts"
                  ? "bg-brand text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Built-in model
            </button>
            <button
              type="button"
              onClick={() => setSource("python")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                source === "python"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Python API
            </button>
          </div>
        </div>

        <div className="mt-7 space-y-8">
          <div>
            <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              <span className="h-px flex-1 bg-border" />
              Academic &amp; lifestyle
              <span className="h-px flex-1 bg-border" />
            </h4>
            <div className="space-y-5">
              {NUMERIC_FIELDS.map((field) => {
                const value = Number(values[field.name]);
                return (
                  <label key={field.name} className="block">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium">
                        {field.label}
                      </span>
                      <span className="rounded-md bg-accent/10 px-2 py-0.5 text-sm font-semibold text-accent">
                        {value}
                        <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
                          {field.unit}
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={value}
                      onChange={(e) =>
                        update(field.name, Number(e.target.value))
                      }
                      className="slider mt-3"
                    />
                    <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                      <span>{field.hint}</span>
                      <span>
                        {field.min}–{field.max}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              <span className="h-px flex-1 bg-border" />
              Background &amp; environment
              <span className="h-px flex-1 bg-border" />
            </h4>
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              {CATEGORICAL_FIELDS.map((field) => (
                <label key={field.name} className="block">
                  <span className="text-sm font-medium">{field.label}</span>
                  <select
                    value={String(values[field.name])}
                    onChange={(e) => update(field.name, e.target.value)}
                    className="field-input mt-1.5"
                  >
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {field.hint}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Predicting…" : "Predict performance"}
          </button>
          <button
            type="button"
            onClick={() => {
              setValues(initialValues);
              setResult(null);
              setError(null);
            }}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-secondary/10 px-4 py-3 text-sm text-secondary">
            {error}
          </p>
        )}
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card-surface rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Prediction</h3>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                source === "ts"
                  ? "bg-brand/15 text-brand"
                  : "bg-secondary/15 text-secondary"
              }`}
            >
              {source === "ts" ? "Built-in model" : "Python API"}
            </span>
          </div>
          {result ? (
            <div className="mt-6 animate-fade-up">
              <div
                className={`rounded-xl p-5 ${
                  result.highPerformer
                    ? "bg-success/[0.1] ring-1 ring-success/20"
                    : "bg-secondary/[0.1] ring-1 ring-secondary/20"
                }`}
              >
                <p className="text-sm text-muted-foreground">Likely outcome</p>
                <p
                  className={`mt-1.5 text-2xl font-bold ${
                    result.highPerformer ? "text-success" : "text-secondary"
                  }`}
                >
                  {result.highPerformer
                    ? "High Performer"
                    : "Needs Additional Support"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {result.highPerformer
                    ? "Likely to score above the median exam score."
                    : "Likely to score below the median exam score."}
                </p>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-semibold">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-fade">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      result.highPerformer ? "bg-accent" : "bg-secondary"
                    }`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>

              <p className="mt-5 rounded-lg bg-glass px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                Probability of a high-performance result:{" "}
                <span className="font-semibold text-foreground">
                  {(result.probability * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          ) : (
            <div className="mt-6 flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-glass text-brand-muted">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 3v18h18" />
                  <path d="m7 14 3-3 3 3 5-5" />
                </svg>
              </span>
              <p className="mt-3 max-w-[15rem] px-4 text-sm text-muted-foreground">
                Fill in the profile and hit predict to see the result.
              </p>
            </div>
          )}

          <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
            Model accuracy: {(MODEL_META.accuracy * 100).toFixed(1)}% ·
            Logistic Regression.
          </p>
        </div>
      </aside>
    </div>
  );
}
