import { NextResponse } from "next/server";
import { getLevelAccess } from "@/app/lib/progress-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const grade = parseInt(searchParams.get("grade") || "1");

  if (!userId) return NextResponse.json({ error: "UserId шаардлагатай" }, { status: 400 });

  const levels = await getLevelAccess(userId, grade);
  
  return NextResponse.json(levels);
}