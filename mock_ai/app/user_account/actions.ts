import { createClient } from "@/supabase/server";
import { JoinedInterviewResult } from "@/types";

export async function handleGetallResults(
  uid: string
): Promise<JoinedInterviewResult[]> {
  if (!uid) {
    throw new Error("User ID is required.");
  }
  const supabase = await createClient();
  const { data: results, error } = await supabase
    .from("results")
    .select(`*, question:question_id(*)`)
    .eq("user_id", uid)
    .order("interview_date", { ascending: false });

  if (error) {
    console.error("Error fetching results:", error);
    return [];
  }

  const serializedResults: JoinedInterviewResult[] = results.map(
    (result) => ({
      ...result,
      question: result.question.question,
      company: result.question.company,
      interview_type: result.question.interview_type,
      name: result.question.name,
      id: result.id,
      question_id: result.question_id,
      filler_words: result.filler_words || [],
      long_pauses: result.long_pauses || [],
      interview_date: new Date(
        result.interview_date
      ).toLocaleString(),
      score: result.score || 0,
      ai_feedback: result.ai_feedback || "",
    })
  );

  console.log(serializedResults[0]);
  return serializedResults;
}
