import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import { createClient } from "@/supabase/server";
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
      error: authError,
    } = await supabase.auth.getUser();

    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });

    const data = await req.json();
    const { name, company, position, interview_type } = data;

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
    const output = await result.response.text();

    const { data: question, error: errorWhileSavingQuestion } =
      await supabase
        .from("questions")
        .insert([
          {
            question_text: output,
            name: data.name,
            company: data.company,
            position: data.position,
            interview_type: data.interview_type,
          },
        ])
        .select()
        .single();

    if (!question || errorWhileSavingQuestion) {
      return NextResponse.json(
        { error: "An error occurred while saving the question." },
        { status: 500 }
      );
    }

    // I insert the question_id to relate the result to the question
    // and the user_id to relate the result to the user.
    // So I can query for the result after genai to update with the
    // other values.
    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .insert([
        {
          question_id: question.id,
          user_id: authedUser?.id,
        },
      ])
      .single();

    if (resultError) {
      console.log("Error saving result:", resultError);
      return NextResponse.json(
        { error: "An error occurred while creating the result." },
        { status: 500 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error in POST /api/generate:", error);

    return NextResponse.json(
      { error: "An error occurred while generating content." },
      { status: 500 }
    );
  }
}
