"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Button } from "./ui/Button";
import { getResultByQuestionId } from "@/lib/database/feedback";
import { Progress } from "./ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";
import { useRouter } from "next/navigation";
import { Info, ClipboardPenLine } from "lucide-react";
import { Result } from "@/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import { Play } from "lucide-react";
import AnalysisCard from "./AnalysisCard";
import { LogoutButton } from "./LogoutButton";
import { cn } from "@/lib/utils";

const Results = () => {
  const [results, setResults] = useState<Result | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState(false);

  const searchParams = useSearchParams();

  const question = searchParams.get("question");
  const questionId = searchParams.get("questionId");

  const supabase = createClient();

  const router = useRouter();

  useEffect(() => {
    if (questionId) {
      fetchResults(questionId);
    }
  }, [questionId]);

  const fetchResults = async (qid: string) => {
    setResultsLoading(true);
    try {
      const results = await getResultByQuestionId(qid);

      setResults(results);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleStartNewInterview = () => {
    router.push("/interview");
  };

  // TODO: show score.
  const getScoreStyles = (score: number) => {
    return cn(
      "bg-[#1a1c3d] rounded-full p-8 cursor-pointer border transition-colors",

      {
        "border-[#7fceff] text-[#7fceff]": score >= 90,
        "border-chart-2 text-chart-2": score >= 70 && score < 90,
        "border-secondary-orange text-secondary-orange":
          score >= 50 && score < 70,
        "border-destructive text-destructive": score < 50,
      }
    );
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
      ) : results ? (
        <Card className="bg-[#0a0b24] border-[#2e2f61] mb-6">
          <CardHeader>
            <CardTitle className="flex text-[#7fceff] mx-auto my-6">
              Report
              <ClipboardPenLine className="ml-4 h-6 w-6 text-[#5fbfd7]" />
            </CardTitle>
            <div className="flex justify-center my-6">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div
                    className={getScoreStyles(results?.score || 0)}
                  >
                    <span className="text-4xl font-bold">
                      {results?.score}%
                    </span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-[#0a0b24] border-[#2e2f61]">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[#7fceff] font-semibold">
                      Interview Score
                    </h4>
                    <p className="text-[#f0f0f0] text-sm">
                      This score reflects your overall interview
                      performance based on clarity, confidence, and
                      content delivery.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
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
                <p className="text-[#f0f0f0]">{results.transcript}</p>
              </div>

              <div className="bg-[#131538] rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-[#7fceff]/20 border-b border-[#2e2f61]">
                <h3 className="text-xl font-bold text-[#7fceff] mb-2">
                  Filler Words
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.filler_words &&
                    results?.filler_words.map((item, index) => (
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
                                ...results.filler_words.map(
                                  (fw) => fw.count
                                )
                              )) *
                            100
                          }
                          className="w-full h-2 bg-[#2e2f61] ml-2"
                        />
                      </div>
                    ))}
                  {!results?.filler_words.length && (
                    <p className="text-[#f0f0f0]">
                      No filler words detected. Great job!
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[#1a1c3d] rounded-lg p-6 border-b border-[#2e2f61]">
                <h3 className="text-xl font-bold text-[#7fceff] mb-2">
                  Long Pauses
                </h3>
                <p className="text-[#f0f0f0]">
                  <span>
                    {results.long_pause_count} long pauses detected.
                  </span>
                </p>
              </div>

              <div className="bg-[#1a1c3d] rounded-lg p-6 border-b border-[#2e2f61]">
                <h3 className="text-xl font-bold text-[#7fceff] mb-2">
                  Pause Durations
                </h3>
                <p className="text-[#f0f0f0]">
                  {!results.pause_durations.length ? (
                    "Fantastic work! You had no pauses longer than 10 seconds. Long pauses during interviews can sometimes convey hesitation or lack of preparation, and they might make the interviewer question your confidence. By keeping your responses fluid, you demonstrated a clear, composed, and thoughtful communication style."
                  ) : (
                    <span>
                      {results.pause_durations} pauses of 10 seconds
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
                  {results.interview_date}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
        content={results?.ai_feedback || ""}
        isLoading={analysisLoading}
        hasError={analysisError}
        handleRetry={() =>
          questionId ? fetchResults(questionId) : Promise.resolve()
        }
      />

      <div className="flex justify-between">
        {results && (
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
