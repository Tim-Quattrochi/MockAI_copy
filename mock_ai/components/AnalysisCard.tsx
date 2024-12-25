"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Loader2 } from "lucide-react";
import { Question, Result } from "@/types";
import { Button } from "./ui/Button";

// This component is used to render the question or analysis from the AI.

interface QuestionProps {
  title: string;
  content: Question["question_text"];
  type: "question";
  isLoading?: boolean;
  handleRetry?: () => Promise<void>;
  hasError?: boolean;
  setHasError?: (hasError: boolean) => void;
}

interface AnalysisProps {
  title: string;
  content: Result["ai_feedback"];
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

  console.log("content", content);

  return (
    <Card
      className={
        "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4 rounded-lg shadow-lg transition-transform hover:scale-105 max-w-2xl mx-auto"
      }
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-primary text-2xl font-semibold flex justify-between items-center mx-auto text-center">
          {title}
          {isLoading && (
            <Loader2 className="h-5 w-5 animate-spin ml-2 text-primary" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="transition-all duration-300 ease-in-out">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <Skeleton className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700" />
              <Skeleton className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700" />
              <Skeleton className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700" />
              <Skeleton className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700" />
              <Skeleton className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700" />
              <Skeleton className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700" />
            </div>
          ) : isQuestion ? (
            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
              {content}
            </p>
          ) : hasError ? (
            <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <p className="text-red-800 dark:text-red-200 mb-4">
                Failed to fetch analysis. Please try again.
              </p>
              <Button
                variant="outline"
                className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => {
                  if (handleRetry) {
                    handleRetry();
                  }
                }}
              >
                Retry
              </Button>
            </div>
          ) : content ? (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg mb-4 last:mb-0 shadow-sm">
              <p className="text-gray-800 dark:text-gray-200">
                {content}
              </p>
            </div>
          ) : (
            <p className="text-gray-800 dark:text-gray-200 italic">
              No analysis available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisCard;
