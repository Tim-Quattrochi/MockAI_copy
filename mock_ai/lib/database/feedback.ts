import { createClient } from "@/supabase/client";

const supabase = createClient();

export const getResultByQuestionId = async (
  id: string
): Promise<Result | null> => {
  const { data: result, error } = await supabase
    .from("results")
    .select("*")
    .eq("question_id", id)
    .single();

  if (error) {
    console.error("Error fetching result:", error);
    return null;
  }

  const serializedResult = {
    ...result,
    filler_words: JSON.parse(result.filler_words),
    long_pause_count: result.long_pause_count,
    interview_date: new Date(result.interview_date).toLocaleString(),
    score: result.score,
  };

  return serializedResult;
};

export const getAllResults = async (
  uid: string
): Promise<Result[]> => {
  const { data: results, error } = await supabase
    .from("results")
    .select("*")
    .eq("user_id", uid)
    .order("interview_date", { ascending: false });

  if (error) {
    console.error("Error fetching results:", error);
    return [];
  }

  const serializedResults = results.map((result) => ({
    ...result,
    filler_words: JSON.parse(result.filler_words),
    long_pauses: JSON.parse(result.long_pauses),
    interview_date: new Date(result.interview_date).toLocaleString(),
  }));

  console.log("Serialized results:", serializedResults);

  return serializedResults;
};
