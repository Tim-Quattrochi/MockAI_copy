import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserIdByEmail(
  email: string
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      console.log("User not found");
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    throw new Error("Failed to fetch user ID");
  } finally {
    await prisma.$disconnect();
  }
}

// Example Usage:
// const email = "user@example.com";
// getUserIdByEmail(email)
//   .then((userId) => {
//     if (userId) {
//       console.log(`User ID: ${userId}`);
//     } else {
//       console.log("No user found with this email.");
//     }
//   })
//   .catch((error) => console.error(error));
