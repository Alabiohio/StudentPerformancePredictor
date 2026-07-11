"use client";

import { NUMERIC_FIELDS, CATEGORICAL_FIELDS } from "@/app/lib/fields";

type Values = Record<string, string | number>;

export default function ProfileFields({
  values,
  onChange,
}: {
  values: Values;
  onChange: (name: string, value: string | number) => void;
}) {
  return (
    <div className="space-y-8">
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
                  <span className="text-sm font-medium">{field.label}</span>
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
                  onChange={(e) => onChange(field.name, Number(e.target.value))}
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
                onChange={(e) => onChange(field.name, e.target.value)}
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
  );
}
