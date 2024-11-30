"use client";

import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useUser } from "@/hooks/useUser";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Button } from "./ui/Button";
import { getResultByQuestionId } from "@/lib/database/feedback";
import { Progress } from "./ui/progress";
import { useRouter } from "next/navigation";
import { Info, ClipboardPenLine } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Result } from "@/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "./ui/checkbox";
import { Skeleton } from "./ui/skeleton";
import { Save, LogOut, Play } from "lucide-react";
import AnalysisCard from "./AnalysisCard";
import { LogoutButton } from "./LogoutButton";

const Results = () => {
  const { user, revalidate } = useUser();
  const [results, setResults] = useState<Result[]>([]);
  const [saveResults, setSaveResults] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsSaved, setResultsSaved] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  const searchParams = useSearchParams();

  const question = searchParams.get("question");
  const questionId = searchParams.get("questionId");

  const { toast } = useToast();

  const supabase = createClient();

  const { email } = user;

  const router = useRouter();

  useEffect(() => {
    if (questionId) {
      fetchResults(questionId);
    }
  }, [questionId]);

  const fetchResults = async (qid) => {
    setResultsLoading(true);
    try {
      const results = await getResultByQuestionId(questionId);

      setResults([results]);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleSaveToggle = () => {
    setSaveResults(!saveResults);
  };

  const handleSaveResults = async () => {
    if (results?.length === 0) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong..",
        description: "There was a problem saving your results.",
      });
      return;
    }

    if (saveResults) {
      const payload = {
        user: email,
        results: results.map((result) => ({
          question_id: result.question_id,
          question: result.question,
          transcript: result.transcript,
          score: result.score,
          filler_word_count: result.filler_words,
          long_pauses: result.long_pauses,
          pause_durations: result.pause_durations,
          ai_feedback: result.ai_feedback || "",
        })),
      };

      console.log("Saving results payload:", payload);

      try {
        await axios.post("/service/save_results", payload);
        toast({
          variant: "success",
          title: "Saved",
          description: "Your results have been saved successfully.",
        });
        setResultsSaved(true);
      } catch (error) {
        console.error("Error saving results:", error);
      }
    } else {
      console.log("Save results is not enabled.");
    }
  };

  const handleStartNewInterview = () => {
    router.push("/interview");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#050614] text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your Interview Feedback Powered by mockAI
      </h1>

      {resultsLoading ? (
        <Card className="bg-[#0a0b24] border-[#2e2f61] mb-6">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ) : results.length > 0 ? (
        results.map((result, index) => (
          <Card
            key={index}
            className="bg-[#0a0b24] border-[#2e2f61] mb-6"
          >
            <CardHeader>
              <CardTitle className="flex text-[#7fceff] mx-auto">
                Report
                <ClipboardPenLine className="ml-4 h-6 w-6 text-[#5fbfd7]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-[#1a1c3d] rounded-lg p-6 border-b border-[#2e2f61]">
                  <h3 className="text-xl font-bold text-[#7fceff] mb-2">
                    Question
                  </h3>
                  <p className="text-[#f0f0f0]">{question}</p>
                </div>

                <div className="bg-[#1a1c3d] rounded-lg p-6 border-b border-[#2e2f61]">
                  <h3 className="text-xl font-bold text-[#7fceff] mb-2">
                    Transcript
                  </h3>
                  <p className="text-[#f0f0f0]">
                    {result.transcript}
                  </p>
                </div>

                <div className="bg-[#131538] rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-[#7fceff]/20 border-b border-[#2e2f61]">
                  <h3 className="text-xl font-bold text-[#7fceff] mb-2">
                    Filler Words
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.filler_words.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#202341] rounded-lg p-4 flex justify-between items-center transition-all hover:shadow-lg hover:shadow-[#7fceff]/20"
                      >
                        <span className="text-[#ff6db3] font-bold bg-[#ff6db3]/20 py-1 px-3 rounded-md">
                          {item.word}
                        </span>
                        <span className="text-[#7fceff] font-bold">
                          {item.count}
                        </span>
                        <Progress
                          value={
                            (item.count /
                              Math.max(
                                ...result.filler_words.map(
                                  (fw) => fw.count
                                )
                              )) *
                            100
                          }
                          className="w-full h-2 bg-[#2e2f61] ml-2"
                          indicatorClassName="bg-gradient-to-r from-[#7fceff] to-[#ff6db3]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1c3d] rounded-lg p-6 border-b border-[#2e2f61]">
                  <h3 className="text-xl font-bold text-[#7fceff] mb-2">
                    Long Pauses
                  </h3>
                  <p className="text-[#f0f0f0]">
                    {!result.long_pauses.length ? (
                      "No long pauses detected."
                    ) : (
                      <span>
                        {result.long_pauses.length} long pauses
                        detected.
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-[#1a1c3d] rounded-lg p-6 border-b border-[#2e2f61]">
                  <h3 className="text-xl font-bold text-[#7fceff] mb-2">
                    Pause Durations
                  </h3>
                  <p className="text-[#f0f0f0]">
                    {result.pause_durations === "" ||
                    result.pause_durations === 0 ? (
                      "Fantastic work! You had no pauses longer than 10 seconds. Long pauses during interviews can sometimes convey hesitation or lack of preparation, and they might make the interviewer question your confidence. By keeping your responses fluid, you demonstrated a clear, composed, and thoughtful communication style."
                    ) : (
                      <span>
                        {result.pause_durations} pauses of 10 seconds
                        or more detected. Consider practicing how to
                        gather your thoughts quickly to maintain the
                        flow of conversation and confidence in your
                        responses.
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-[#1a1c3d] rounded-lg p-6">
                  <h3 className="text-xl font-bold text-[#7fceff] mb-2">
                    Interview Date
                  </h3>
                  <p className="text-[#f0f0f0]">
                    {result.interview_date}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="bg-[#0a0b24] border-[#2e2f61] mb-6">
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10">
              <div className="text-6xl mb-4">
                <Info style={{ color: "#7fceff" }} />
              </div>

              <p className="text-[#f0f0f0] text-lg mb-2">
                Oops, it looks like there are no results available
                right now.
              </p>

              <p className="text-[#7fceff] text-sm mb-6">
                Try starting a new interview to get your feedback!
              </p>

              <Button
                onClick={handleStartNewInterview}
                className="bg-[#ff6db3] text-[#050614] hover:bg-[#ff6db3]/90"
              >
                <Play className="mr-2 h-4 w-4" /> Start New Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AnalysisCard
        title="Mock AI Analysis"
        type="analysis"
        content={results[0]?.ai_feedback}
        isLoading={analysisLoading}
        hasError={analysisError}
        handleRetry={() => fetchAIAnalysis(results)}
      />

      {/* Hide the save results checkbox and button when the results are already saved.*/}
      {!resultsSaved && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveResults"
              checked={saveResults}
              onCheckedChange={handleSaveToggle}
            />
            <label
              htmlFor="saveResults"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Save Results
            </label>
          </div>
          <Button
            onClick={handleSaveResults}
            className="bg-[#7fceff] text-[#050614] hover:bg-[#7fceff]/90"
            disabled={!saveResults}
          >
            <Save className="mr-2 h-4 w-4" /> Save Results
          </Button>
        </div>
      )}

      <div className="flex justify-between">
        {results.length > 0 && (
          <div className="flex justify-between">
            <Button
              onClick={handleStartNewInterview}
              className="bg-[#ff6db3] text-[#050614] hover:bg-[#ff6db3]/90"
            >
              <Play className="mr-2 h-4 w-4" /> Start New Interview
            </Button>
          </div>
        )}

        <LogoutButton
          className="text-[#ff6db3] border-[#ff6db3] hover:bg-[#ff6db6]"
          variant="outline"
        />
      </div>
    </div>
  );
};

export default function ResultsPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Results />
    </Suspense>
  );
}
