import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const questions = await prisma.question.findMany();

    return NextResponse.json(questions);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching questions:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    } else {
      console.error("An unknown error occurred");
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
