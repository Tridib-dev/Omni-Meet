import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateServerUserToken } from "@/lib/stream/server-client";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = await generateServerUserToken(userId);
    return new NextResponse(token, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[POST /api/stream/token]", error);
    return NextResponse.json({ message: "Failed to generate token" }, { status: 500 });
  }
}
