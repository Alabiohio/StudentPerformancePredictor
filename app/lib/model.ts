import modelData from "../model.json";

type ModelField =
  | { type: "num"; name: string }
  | { type: "cat"; field: string; level: string };

const columns = modelData.columns as string[];
const coef = modelData.coef as number[];
const intercept = modelData.intercept as number;
const fields = modelData.fields as ModelField[];

export type PredictInput = Record<string, string | number>;

export type PredictResult = {
  prediction: 0 | 1;
  probability: number;
  highPerformer: boolean;
  confidence: number;
};

export type Contribution = {
  key: string;
  label: string;
  contribution: number;
};

export function getContributions(input: PredictInput): Contribution[] {
  return fields.map((field, i) => {
    let value = 0;
    let label = "";

    if (field.type === "num") {
      const raw = input[field.name];
      value = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
      if (Number.isNaN(value)) value = 0;
      label = field.name.replace(/_/g, " ");
    } else {
      value = String(input[field.field]) === field.level ? 1 : 0;
      label = `${field.field.replace(/_/g, " ")}: ${field.level}`;
    }

    return { key: columns[i], label, contribution: coef[i] * value };
  });
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function predict(input: PredictInput): PredictResult {
  let z = intercept;

  columns.forEach((_, i) => {
    const field = fields[i];
    let value = 0;

    if (field.type === "num") {
      const raw = input[field.name];
      value = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
      if (Number.isNaN(value)) value = 0;
    } else {
      value = String(input[field.field]) === field.level ? 1 : 0;
    }

    z += coef[i] * value;
  });

  const probability = sigmoid(z);
  const highPerformer = probability >= 0.5;

  return {
    prediction: highPerformer ? 1 : 0,
    probability,
    highPerformer,
    confidence: highPerformer ? probability : 1 - probability,
  };
}
