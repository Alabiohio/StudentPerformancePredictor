import { NextResponse } from "next/server";

const PYTHON_API =
  (process.env.PYTHON_API_URL ?? process.env.NEXT_PUBLIC_PYTHON_API)?.replace(
    /\/$/,
    ""
  ) ?? "http://localhost:8000";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be an object." },
      { status: 400 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${PYTHON_API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      {
        error: `Could not reach the Python API at ${PYTHON_API}. Start it with: uvicorn app:app --reload`,
      },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: data.error ?? "Python API returned an error." },
      { status: 502 }
    );
  }

  const data = (await upstream.json()) as {
    prediction: number;
    probability?: number;
  };

  // Normalize to P(class 1) so it matches the built-in route's `probability`.
  const prob1 =
    typeof data.probability === "number"
      ? data.prediction === 1
        ? data.probability
        : 1 - data.probability
      : undefined;

  return NextResponse.json({
    prediction: data.prediction,
    probability: prob1,
  });
}
