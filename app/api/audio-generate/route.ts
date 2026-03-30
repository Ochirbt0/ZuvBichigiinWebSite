import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!process.env.NEXT_PUBLIC_CHIMEGE_API_KEY) {
      return NextResponse.json(
        { error: "Missing CHIMEGE_API_KEY" },
        { status: 500 },
      );
    }

    const res = await fetch("https://api.chimege.com/v1.2/synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "plain/text",
        Token: `${process.env.NEXT_PUBLIC_CHIMEGE_API_KEY}`,
      },
      body: text,
    });

    // console.log("HAS KEY:", !!process.env.NEXT_PUBLIC_CHIMEGE_API_KEY);

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "Chimege API failed", detail: errText },
        { status: res.status },
      );
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
