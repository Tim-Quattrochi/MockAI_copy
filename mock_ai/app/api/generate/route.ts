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
    const model = gemini.getGenerativeModel({
      model: "gemini-1.5-flash-8b",
      systemInstruction:
        "You are an expert at job interviews who asks concise job interview questions.",
    });

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
      prompt = `As a behavioral interviewer for the ${position} position at ${company}, please generate a behavioral interview question that assesses the candidate's experiences, soft skills, and alignment with company culture.`;
    } else {
      prompt = `As a technical interviewer for the ${position} position at ${company}, please generate a technical interview question that assesses the candidate's knowledge and problem-solving skills.`;
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
