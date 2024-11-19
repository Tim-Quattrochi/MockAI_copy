import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Make sure to import Prisma client (adjust path if necessary)

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json(); // Get email and name from the request body

    if (!email || !name) {
      return NextResponse.json(
        { status: "error", message: "Email and Name are required" },
        { status: 400 }
      );
    }

    // Save the user to Supabase (or your Prisma database)
    await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    return NextResponse.json(
      { status: "success", message: "User saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving user to Supabase:", error);
    return NextResponse.json(
      { status: "error", message: "Database error" },
      { status: 500 }
    );
  }
}
