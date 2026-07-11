"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  NUMERIC_FIELDS,
  CATEGORICAL_FIELDS,
  MODEL_META,
} from "@/app/lib/fields";
import { getContributions } from "@/app/lib/model";
import ProfileFields from "@/app/ui/profile-fields";

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

export type Preset = {
  label: string;
  description: string;
  values: Partial<Values>;
};

type PredictorProps = {
  presets?: Preset[];
  live?: boolean;
  showContributions?: boolean;
};

export default function Predictor({
  presets,
  live = false,
  showContributions = false,
}: PredictorProps) {
  const [values, setValues] = useState<Values>(initialValues);
  const [source, setSource] = useState<Source>("ts");
  const [liveOn, setLiveOn] = useState(live);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const runPredict = useCallback(async (payload: Values, src: Source) => {
    setLoading(true);
    setError(null);

    const endpoint = src === "python" ? "/api/predict/python" : "/api/predict";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        source: src,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      const hint =
        src === "python"
          ? " Make sure the Python API is running (uvicorn app:app --reload)."
          : "";
      setError(message + hint);
    } finally {
      setLoading(false);
    }
  }, []);

  function update(name: string, value: string | number) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setResult(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runPredict(values, source);
  }

  function applyPreset(preset: Preset) {
    setValues((prev) => ({ ...prev, ...preset.values }) as Values);
    setResult(null);
  }

  useEffect(() => {
    if (!liveOn) return;
    const timer = setTimeout(() => {
      runPredict(values, source);
    }, 400);
    return () => clearTimeout(timer);
  }, [values, source, liveOn, runPredict]);

  const contributions = useMemo(() => {
    if (!showContributions || !result) return [];
    return getContributions(values)
      .slice()
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 6);
  }, [showContributions, result, values]);

  const maxContribution = contributions.reduce(
    (max, c) => Math.max(max, Math.abs(c.contribution)),
    0
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <form
        id="predict"
        onSubmit={handleSubmit}
        className="lg:bg-card lg:border lg:border-border lg:rounded-2xl p-6 sm:px-4 sm:py-6 lg:p-8"
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

        {presets && presets.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                title={preset.description}
                className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {live && (
          <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={liveOn}
              onChange={(e) => setLiveOn(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Predict automatically as I change inputs
          </label>
        )}

        <div className="mt-7">
          <ProfileFields values={values} onChange={update} />
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

              {contributions.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-sm font-semibold">What drives this result</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Top factors pushing the prediction, by model weight.
                  </p>
                  <ul className="mt-4 space-y-3">
                    {contributions.map((c) => {
                      const positive = c.contribution >= 0;
                      const width =
                        maxContribution > 0
                          ? (Math.abs(c.contribution) / maxContribution) * 100
                          : 0;
                      return (
                        <li key={c.key}>
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="font-medium text-foreground">
                              {c.label}
                            </span>
                            <span
                              className={
                                positive ? "text-success" : "text-secondary"
                              }
                            >
                              {positive ? "+" : "−"}
                              {Math.abs(c.contribution).toFixed(1)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-fade">
                            <div
                              className={`h-full rounded-full ${
                                positive ? "bg-success" : "bg-secondary"
                              }`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                    Contributions are in log-odds units. The model sums them
                    with the baseline to produce the final probability.
                  </p>
                </div>
              )}
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
