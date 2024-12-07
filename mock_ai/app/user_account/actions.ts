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
    .order("interview_date", { ascending: false })
    .eq("user_id", uid);

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
      filler_words: JSON.parse(result.filler_words),
      long_pauses: JSON.parse(result.long_pauses),
      interview_date: new Date(
        result.interview_date
      ).toLocaleString(),
    })
  );

  console.log(serializedResults[0]);
  return serializedResults;
}
