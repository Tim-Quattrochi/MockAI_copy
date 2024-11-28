import { createClient } from "@/utils/supabase/client";

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
    long_pauses: JSON.parse(result.long_pauses),
    interview_date: new Date(result.interview_date).toLocaleString(),
  };

  console.log("Serialized result:", serializedResult);

  return serializedResult;
};
