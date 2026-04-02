import { NextRequest, NextResponse } from "next/server";

let leaderboard: Record<string, number> = {};
export async function POST(req: NextRequest) {
  const { userId, originalText, userText } = await req.json();

  if (!userId || !originalText || !userText) {
    return NextResponse.json({
      error: "userId, originalText болон userText шаардлагатай",
    });
  }

  const originalWords = originalText.trim().split(/\s+/);
  const userWords = userText.trim().split(/\s+/);

  let mistakes = 0;
  const maxLength = Math.max(originalWords.length, userWords.length);

  for (let i = 0; i < maxLength; i++) {
    if (originalWords[i] !== userWords[i]) {
      mistakes++;
    }
  }

  let score = 15 - mistakes;
  if (score < 0) score = 0;

  if (!leaderboard[userId]) leaderboard[userId] = 0;
  leaderboard[userId] += score;

  return NextResponse.json({
    score,
    mistakes,
    totalWords: originalWords.length,
    totalScore: leaderboard[userId],
  });
}
