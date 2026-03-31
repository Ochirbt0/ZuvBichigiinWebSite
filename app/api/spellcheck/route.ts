import { NextRequest, NextResponse } from "next/server";

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
        token: process.env.NEXT_PUBLIC_CHIMEGE_API_SPELL_CHECK!,
      },
      body: text,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const incorrects: string[] = await res.json();

    return NextResponse.json({
      originalText: text,
      incorrectWords: incorrects,
      hasErrors: incorrects.length > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
