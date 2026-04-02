import { NextRequest, NextResponse } from "next/server";

const wordsByGrade: Record<string, string[]> = {
  "1": ["гэр", "ном", "цэцэг", "хавар", "мод"],
  "2": ["хүүхэд", "сурагч", "хонь", "сайн", "цэцэрлэг"],
  "3": ["номын сан", "өдөр тутам", "урлаг", "багш", "бичиг"],
  "4": ["багшийн үг", "сургалтын материал", "түүх", "улс төр", "шинжлэх ухаан"],
  "5": [
    "шинжлэх ухаан",
    "түүхийн судалгаа",
    "математик",
    "биологи",
    "судалгааны ажил",
  ],
};

function shuffle(word: string) {
  let result = word;

  while (result === word) {
    result = word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  return result;
}

export async function GET(req: NextRequest) {
  const grade = req.nextUrl.searchParams.get("grade") || "1";
  const words = wordsByGrade[grade] || wordsByGrade["1"];
  const original = words[Math.floor(Math.random() * words.length)];
  const anagram = shuffle(original);

  return NextResponse.json({ original, anagram });
}

export async function POST(req: NextRequest) {
  const { original, answer } = await req.json();

  if (!original || !answer) {
    return NextResponse.json({
      correct: false,
      error: "original болон answer шаардлагатай",
    });
  }

  const correct = original === answer;

  return NextResponse.json({ correct });
}
