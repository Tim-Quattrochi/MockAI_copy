import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveQuestion } from "@/lib/database/questions";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not defined in the environment variables.",
        },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user: authedUser },
    } = await supabase.auth.getUser();

    if (!authedUser) {
      return NextResponse.json(
        { error: "User is not authenticated." },
        { status: 401 }
      );
    }

    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = gemini.getGenerativeModel({ model: "gemini-pro" });

    const data = await req.json();
    const { name, company, position, interview_type } = data;

    console.log("NAME FROM GENERATE!!: ,", name);

    if (!name || !company || !position || !interview_type) {
      return NextResponse.json(
        {
          error:
            "All fields (name, company, position, interview_type) are required.",
        },
        { status: 400 }
      );
    }

    let prompt = "";

    if (interview_type === "behavioral") {
      prompt = `You are an interviewer for a website called 'mockAI'. You are interviewing ${name} for the position of ${position} at ${company}. The interview type is a ${interview_type} interview. Ask a behavioral question that focuses on ${name}'s experience, how they manage teamwork, leadership, conflict resolution, and communication skills in professional settings. Avoid generic questions like 'what would you do in a difficult situation?'. The question should be specific to scenarios they are likely to encounter in the ${position} role. Ask ${name} to answer the question within 3 minutes. DO NOT include any markdown in your response. Address them by their name.`;
    } else {
      prompt = `You are an interviewer for a website called 'mockAI'. You are interviewing ${name} for the position of ${position} at ${company}. The interview type is a ${interview_type} interview. Ask a ${interview_type} question to ${name}. The goal of this question is to understand how ${name} handles a situation relevant to the role of ${position}. Ask ${name} to answer the question within 3 minutes. DO NOT include any markdown in your response. Address them by their name.`;
    }

    const result = await model.generateContent(prompt);

    const output = result.response.text();

    const savedQuestion = await saveQuestion({
      question: output,
      name,
      company,
      position,
      interviewType: interview_type,
    });

    if (!savedQuestion) {
      return NextResponse.json(
        { error: "An error occurred while saving the question." },
        { status: 500 }
      );
    }

    console.log(authedUser);

    const existingUser = await prisma.user.findUnique({
      where: { id: authedUser.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const createResult = await prisma.result.create({
      data: {
        questionId: savedQuestion.id,
        userId: authedUser?.id || "",
        transcript: "",
        fillerWords: {},
        longPauses: {},
        pauseDurations: "",
        aiFeedback: "",
        audioUrl: "",
        videoUrl: "",
      },
    });

    return NextResponse.json({ question: savedQuestion });
  } catch (error) {
    console.error("Error in POST /api/generate:", error);

    return NextResponse.json(
      { error: "An error occurred while generating content." },
      { status: 500 }
    );
  }
}
