import { NextRequest } from "next/server";
export async function GET(request: NextRequest) {
  const users = [
    { id: 1, email: "user1@example.com", joined: "2023-01-15", total_questions: 5 },
    { id: 2, email: "user2@example.com", joined: "2023-03-20", total_questions: 10 },
  ];

  return new Response(JSON.stringify({ users }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
