import { Grade, Level, TOPICS } from "@/app/constants/topics";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { wordCount, sentenceCount, grade, level } = await req.json();

    if (!wordCount || !sentenceCount || !grade || !level) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const topicsByGrade = TOPICS[grade as Grade];
    const topicList = topicsByGrade?.[level as Level];

    if (!topicList || topicList.length === 0) {
      return NextResponse.json(
        { error: "No topics found for grade/level" },
        { status: 400 },
      );
    }

    const selectedTopic =
      topicList[Math.floor(Math.random() * topicList.length)];

    const prompt = `
"${selectedTopic}" сэдвээр нэг өгүүлбэрт ${wordCount} үгийг багтааж, ${sentenceCount} өгүүлбэр бич.

RULES:
- ${grade}-р ангийн хүүхдэд ойлгомжтой
- Монгол хэлний найруулга зөв
- Энгийн, тодорхой хэллэг
- Хүчирхийлэл, +18 агуулга хориглоно
- Зөвхөн JSON буцаа

FORMAT:
{
  "sentences": ["өгүүлбэр 1","өгүүлбэр 2"]
}
`;

    const response = await openai.responses.create({
      model: "gpt-5.2",
      input: prompt,
    });

    const text = response.output_text;

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: text },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
