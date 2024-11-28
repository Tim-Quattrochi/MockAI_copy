import { createClient } from "@/utils/supabase/client";
import interview from "../interview/page";

export async function handleGetallResults(uid: string) {
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

  const serializedResults = results.map((result) => ({
    ...result,
    question: result.question.question,
    company: result.question.company,
    interview_type: result.question.interview_type,
    name: result.question.name,
    id: result.id,
    question_id: result.question_id,
    filler_words: JSON.parse(result.filler_words),
    long_pauses: JSON.parse(result.long_pauses),
    interview_date: new Date(result.interview_date).toLocaleString(),
  }));

  console.log("Serialized results from actionms:", serializedResults);

  return serializedResults;
}
