import { NextResponse } from "next/server";
import { predict, type PredictInput } from "@/app/lib/model";

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

  const input = body as PredictInput;
  const result = predict(input);

  return NextResponse.json(result);
}
