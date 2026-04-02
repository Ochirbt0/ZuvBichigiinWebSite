import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const players = await prisma.user.findMany({
      orderBy: {
        score: "desc",
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        score: true,
      },
    });

    const topThree = players.slice(0, 3);
    const others = players.slice(3);

    return NextResponse.json({
      topThree: {
        gold: topThree[0] || null,
        silver: topThree[1] || null,
        bronze: topThree[2] || null,
      },
      others,
    });
  } catch (error) {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
