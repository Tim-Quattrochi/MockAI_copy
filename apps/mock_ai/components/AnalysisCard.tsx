"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Loader2 } from "lucide-react";
import { Result } from "@/types";
import { Button } from "./ui/Button";
import { useState } from "react";

// This component is used to render the question or analysis from the AI.

interface QuestionProps {
  title: string;
  content: string;
  type: "question";
  isLoading?: boolean;
  handleRetry?: () => Promise<void>;
  hasError?: boolean;
  setHasError?: (hasError: boolean) => void;
}

interface AnalysisProps {
  title: string;
  content: Result[];
  type: "analysis";
  isLoading?: boolean;
  hasError?: boolean;
  setHasError?: (hasError: boolean) => void;
  handleRetry?: () => Promise<void>;
}

type AnalysisCardProps = QuestionProps | AnalysisProps;

const AnalysisCard = ({
  title,
  content,
  type,
  isLoading = false,
  handleRetry,
  hasError,
}: AnalysisCardProps) => {
  const isQuestion = type === "question";

  return (
    <Card className={"bg-[#0a0b24] border-[#2e2f61] mb-4 rounded-lg shadow-lg transition-transform hover:scale-102 max-w-2xl mx-auto"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-[#7fceff] text-2xl font-semibold flex justify-between items-center mx-auto text-center">
          {title}
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 transition-opacity duration-500 opacity-100">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ) : (
          <div className="transition-opacity duration-500 opacity-100">
            {isQuestion ? (
              <p className="text-[#f0f0f0] text-lg leading-relaxed">
                {content}
              </p>
            ) : hasError ? (
              <div className="text-center">
                <p className="text-[#f0f0f0] mb-4">
                  Failed to fetch analysis. Please try again.
                </p>
                <Button
                  className="bg-primary-blue text-white"
                  onClick={() => {
                    if (handleRetry) {
                      handleRetry();
                    }
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : Array.isArray(content) && content.length > 0 ? (
              content.map((result, i) => (
                <div
                  key={i}
                  className="bg-[#131538] p-4 rounded-lg mb-4 last:mb-0"
                >
                  <p className="text-[#f0f0f0]">
                    {result.ai_feedback || "No feedback available"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[#f0f0f0]">No analysis available</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisCard;
