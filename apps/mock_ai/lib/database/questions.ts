import { Question } from "@/types";
import { createClient } from "@/utils/supabase/server";

const supabasePromise = createClient();

export async function saveQuestion(data: {
  question: string;
  name: string;
  company: string;
  position: string;
  interviewType: string;
}): Promise<Question> {
  const supabase = await supabasePromise;
  const { data: savedQuestion, error } = await supabase
    .from("question")
    .insert([
      {
        question: data.question,
        name: data.name,
        company: data.company,
        position: data.position,
        interviewType: data.interviewType,
      },
    ])
    .single();

  if (error) {
    throw new Error(`Error saving question: ${error.message}`);
  }

  return savedQuestion;
}

export async function getQuestions() {
  const supabase = await supabasePromise;
  const { data: questions, error } = await supabase
    .from("question")
    .select("*");

  if (error) {
    throw new Error(`Error fetching questions: ${error.message}`);
  }

  return questions;
}
