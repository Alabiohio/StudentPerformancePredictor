"use client";

import { useMemo, useState } from "react";
import {
  NUMERIC_FIELDS,
  CATEGORICAL_FIELDS,
  MODEL_META,
} from "@/app/lib/fields";
import { predict, getContributions } from "@/app/lib/model";
import ProfileFields from "@/app/ui/profile-fields";

type Values = Record<string, string | number>;

const initialValues: Values = Object.fromEntries([
  ...NUMERIC_FIELDS.map((f) => [f.name, f.default]),
  ...CATEGORICAL_FIELDS.map((f) => [f.name, f.default]),
]);

const round = (n: number) => Number(n.toFixed(3));

type Flip = {
  name: string;
  label: string;
  unit: string;
  kind: "num" | "cat";
  from: string | number;
  to: string | number;
  delta: number;
  probability: number;
};

function findFlips(base: Values): Flip[] {
  const baseRes = predict(base);
  const target = baseRes.highPerformer ? 0 : 1;
  const flips: Flip[] = [];

  for (const f of NUMERIC_FIELDS) {
    const cur = Number(base[f.name]);
    let best: { value: number; delta: number } | null = null;
    for (let v = cur + f.step; v <= f.max + 1e-9; v += f.step) {
      if (predict({ ...base, [f.name]: round(v) }).prediction === target) {
        best = { value: v, delta: v - cur };
        break;
      }
    }
    if (!best) {
      for (let v = cur - f.step; v >= f.min - 1e-9; v -= f.step) {
        if (predict({ ...base, [f.name]: round(v) }).prediction === target) {
          best = { value: v, delta: v - cur };
          break;
        }
      }
    }
    if (best) {
      const probability = predict({ ...base, [f.name]: best.value }).probability;
      flips.push({
        name: f.name,
        label: f.label,
        unit: f.unit ?? "",
        kind: "num",
        from: cur,
        to: best.value,
        delta: best.delta,
        probability,
      });
    }
  }

  for (const f of CATEGORICAL_FIELDS) {
    const cur = String(base[f.name]);
    for (const opt of f.options) {
      if (opt === cur) continue;
      const r = predict({ ...base, [f.name]: opt });
      if (r.prediction === target) {
        flips.push({
          name: f.name,
          label: f.label,
          unit: "",
          kind: "cat",
          from: cur,
          to: opt,
          delta: 0,
          probability: r.probability,
        });
      }
    }
  }

  flips.sort((a, b) => {
    const wa = a.kind === "num" ? Math.abs(a.delta) : 1e6;
    const wb = b.kind === "num" ? Math.abs(b.delta) : 1e6;
    return wa - wb;
  });

  return flips;
}

function buildCurve(base: Values, field: (typeof NUMERIC_FIELDS)[number]) {
  const points: { v: number; p: number }[] = [];
  for (let v = field.min; v <= field.max + 1e-9; v += field.step) {
    points.push({ v: round(v), p: predict({ ...base, [field.name]: v }).probability });
  }
  return points;
}

const W = 320;
const H = 150;
const PAD = 12;

export default function InteractiveAnalysis() {
  const [tab, setTab] = useState<"whatif" | "sensitivity" | "compare">("whatif");
  const [values, setValues] = useState<Values>(initialValues);
  const [sensName, setSensName] = useState(NUMERIC_FIELDS[0].name);
  const [compare, setCompare] = useState<Values>(initialValues);

  const main = predict(values);
  const flips = useMemo(() => findFlips(values), [values]);

  const sensField =
    NUMERIC_FIELDS.find((f) => f.name === sensName) ?? NUMERIC_FIELDS[0];
  const curve = useMemo(() => buildCurve(values, sensField), [values, sensField]);

  const aResult = predict(values);
  const bResult = predict(compare);
  const driverDiff = useMemo(() => {
    const ca = getContributions(values);
    const cb = getContributions(compare);
    const mapB = new Map(cb.map((c) => [c.key, c.contribution]));
    return ca
      .map((c) => ({
        label: c.label,
        delta: (mapB.get(c.key) ?? 0) - c.contribution,
      }))
      .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
      .slice(0, 5);
  }, [values, compare]);

  function setValue(name: string, value: string | number) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }
  function setCompareValue(name: string, value: string | number) {
    setCompare((prev) => ({ ...prev, [name]: value }));
  }

  const tabs = [
    { id: "whatif", label: "What-if" },
    { id: "sensitivity", label: "Sensitivity" },
    { id: "compare", label: "Compare" },
  ] as const;

  const toX = (v: number) =>
    PAD + ((v - sensField.min) / (sensField.max - sensField.min)) * (W - PAD * 2);
  const toY = (p: number) => PAD + (1 - p) * (H - PAD * 2);
  const linePath = curve.map((pt, i) => `${i === 0 ? "M" : "L"}${toX(pt.v).toFixed(1)} ${toY(pt.p).toFixed(1)}`).join(" ");
  const curV = Number(values[sensField.name]);
  const curP = predict({ ...values, [sensField.name]: curV }).probability;

  return (
    <div className="lg:bg-card lg:border lg:border-border lg:rounded-2xl p-6 sm:px-4 sm:py-8 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Interactive analysis</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore the model with instant, client-side predictions.
          </p>
        </div>
        <div
          className="inline-flex shrink-0 rounded-full border border-border bg-background p-1"
          role="group"
          aria-label="Analysis mode"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-brand text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "whatif" && (
        <div className="mt-7 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-4 rounded-lg bg-glass px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              Adjust the profile on the left, then look at the list on the
              right. It shows the <strong>easiest single change</strong> — to
              just one factor — that would make the model switch its prediction
              from its current verdict to the opposite one. Lower-effort changes
              are listed first.
            </p>
            <ProfileFields values={values} onChange={setValue} />
          </div>
          <div>
            <div
              className={`rounded-xl p-5 ${
                main.highPerformer
                  ? "bg-success/[0.1] ring-1 ring-success/20"
                  : "bg-secondary/[0.1] ring-1 ring-secondary/20"
              }`}
            >
              <p className="text-sm text-muted-foreground">Current outcome</p>
              <p
                className={`mt-1.5 text-2xl font-bold ${
                  main.highPerformer ? "text-success" : "text-secondary"
                }`}
              >
                {main.highPerformer ? "High Performer" : "Needs Additional Support"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(main.probability * 100).toFixed(1)}% probability of a high
                result.
              </p>
            </div>

            <h3 className="mt-6 text-sm font-semibold">
              Smallest changes that flip the outcome
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              “Flip” means the model changes its mind about whether this student
              is a high performer.
            </p>
            {flips.length === 0 ? (
              <p className="mt-3 rounded-lg bg-glass px-4 py-3 text-sm text-muted-foreground">
                No single factor change flips this prediction — it is very
                confident either way.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {flips.slice(0, 6).map((flip) => (
                  <li key={flip.name} className="flex items-center justify-between py-3 first:pt-0">
                    <span className="font-medium">{flip.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {flip.kind === "num" ? (
                        <>
                          {flip.from}
                          {flip.unit} →{" "}
                          <span className="font-semibold text-foreground">
                            {flip.to}
                            {flip.unit}
                          </span>
                        </>
                      ) : (
                        <>
                          {flip.from} →{" "}
                          <span className="font-semibold text-foreground">
                            {flip.to}
                          </span>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "sensitivity" && (
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="card-surface rounded-xl border border-glass-border p-5">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Pick one factor and watch how the predicted probability moves as
              that factor changes — everything else stays fixed at the values on
              the right. Points <strong>above the dashed line</strong> mean the
              model expects a high performer; points below mean it does not. The
              dot shows where your current profile sits.
            </p>
            <label className="text-sm font-medium">Factor</label>
            <select
              value={sensName}
              onChange={(e) => setSensName(e.target.value)}
              className="field-input mt-1.5"
            >
              {NUMERIC_FIELDS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.label}
                </option>
              ))}
            </select>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mt-5 w-full"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Probability vs ${sensField.label}`}
            >
              <line
                x1={PAD}
                y1={toY(0.5)}
                x2={W - PAD}
                y2={toY(0.5)}
                stroke="var(--border-color)"
                strokeDasharray="4 4"
              />
              <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
              <circle cx={toX(curV)} cy={toY(curP)} r="4" fill="var(--secondary)" />
            </svg>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>
                {sensField.min}
                {sensField.unit}
              </span>
              <span className="text-secondary">
                dashed = 50% threshold
              </span>
              <span>
                {sensField.max}
                {sensField.unit}
              </span>
            </div>
          </div>
          <div>
            <ProfileFields values={values} onChange={setValue} />
          </div>
        </div>
      )}

      {tab === "compare" && (
        <div className="mt-7 space-y-6">
          <p className="rounded-lg bg-glass px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            Build two students side by side and compare their predictions. The
            cards above show each verdict instantly; the summary below
            highlights the factors that push the two outcomes apart the most —
            useful for seeing <em>why</em> one profile looks stronger than the
            other.
          </p>

          <div className="sticky top-20 z-10 rounded-xl border border-glass-border bg-background/90 p-4 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className={`rounded-lg p-3 ${
                  aResult.highPerformer
                    ? "bg-success/[0.1] ring-1 ring-success/20"
                    : "bg-secondary/[0.1] ring-1 ring-secondary/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Student A
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      aResult.highPerformer ? "text-success" : "text-secondary"
                    }`}
                  >
                    {aResult.highPerformer ? "High Performer" : "Needs Support"}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-fade">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${aResult.probability * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {(aResult.probability * 100).toFixed(1)}% probability
                </p>
              </div>
              <div
                className={`rounded-lg p-3 ${
                  bResult.highPerformer
                    ? "bg-success/[0.1] ring-1 ring-success/20"
                    : "bg-secondary/[0.1] ring-1 ring-secondary/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Student B
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      bResult.highPerformer ? "text-success" : "text-secondary"
                    }`}
                  >
                    {bResult.highPerformer ? "High Performer" : "Needs Support"}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-fade">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${bResult.probability * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {(bResult.probability * 100).toFixed(1)}% probability
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-2xl font-black text-accent">Student A</h3>
              <ProfileFields values={values} onChange={setValue} />
            </div>
            <div>
              <h3 className="mb-3 text-2xl font-black text-secondary">
                Student B
              </h3>
              <ProfileFields values={compare} onChange={setCompareValue} />
            </div>
          </div>

          <div>
            <h3 className="mt-6 text-sm font-semibold">
              Where the two profiles differ most
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Higher bars mean that factor explains more of the gap between the
              two predictions.
            </p>
            <ul className="mt-3 space-y-3">
              {driverDiff.map((d) => {
                const positive = d.delta >= 0;
                return (
                  <li key={d.label}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {d.label}
                      </span>
                      <span className={positive ? "text-success" : "text-secondary"}>
                        {positive ? "Favours Student B" : "Favours Student A"} ·{" "}
                        {Math.abs(d.delta).toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-fade">
                      <div
                        className={`h-full rounded-full ${
                          positive ? "bg-success" : "bg-secondary"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.abs(d.delta) * 8)}%`,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
        Model accuracy: {(MODEL_META.accuracy * 100).toFixed(1)}% · Logistic
        Regression · computed in your browser.
      </p>
    </div>
  );
}
