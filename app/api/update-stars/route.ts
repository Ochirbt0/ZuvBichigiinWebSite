import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
 
export async function POST(req: Request) {
  const { userId } = await auth(); 
 
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
 
  try {
    const { age, grade, nickname } = await req.json();
    const client = await clerkClient(); 
 
    const updatedUser = await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        age: age,
        grade: grade,
        nickname: nickname,
      },
    });
 
    return NextResponse.json({ metadata: updatedUser.publicMetadata });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}