import { prisma } from "@/lib/prisma";

export async function saveQuestion({
  question,
  name,
  company,
  position,
  interviewType,
}: {
  question: string;
  name: string;
  company: string;
  position: string;
  interviewType: string;
}) {
  return await prisma.question.create({
    data: {
      question,
      name,
      company,
      position,
      interviewType,
    },
  });
}

export async function getQuestions() {
  return await prisma.question.findMany();
}
