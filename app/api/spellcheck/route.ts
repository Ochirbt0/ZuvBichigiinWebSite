import { NextRequest, NextResponse } from "next/server";

function calculateScore(errors: number) {
  if (errors === 0) return 10;
  if (errors === 1) return 9;
  if (errors === 2) return 7;
  return 5;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const res = await fetch("https://api.bolor.net/v1.2/spell-check", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        token: process.env.BOLOR_API_TOKEN!,
      },
      body: text,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const incorrects: string[] = await res.json();

    const errors = incorrects.length;
    const score = calculateScore(errors);

    return NextResponse.json({
      originalText: text,
      incorrectWords: incorrects,
      errors,
      score,

      hasErrors: errors > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
