import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { status: "error", message: "Email and Name are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    return NextResponse.json(
      { status: "success", message: "User added", userId: user.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { status: "error", message: "Database error" },
      { status: 500 }
    );
  }
}
