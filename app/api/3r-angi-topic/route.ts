import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { title, wordCount, sentenceCount } = await req.json();

    if (!title || !wordCount || !sentenceCount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const prompt = `
"${title}" сэдвээр ${wordCount} үгтэй, ${sentenceCount} өгүүлбэртэй текст бич.

RULES:
- 3-р ангийн хүүхдэд ойлгомжтой
- Монгол хүн уншаад ойлгохоор утгын хувьд тодорхой зөв байх
- Энгийн Монгол хэл
- Хүчирхийлэл, +18 агуулга хориглоно
- Зөвхөн текст буцаа (markdown битгий ашигла)

FORMAT:
{
  "sentences": ["өгүүлбэр 1","өгүүлбэр 2"]
}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: text },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
