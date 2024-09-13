import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play } from "lucide-react";

interface Question {
  question: string[];
  title: string;
}

interface QuestionsProps {
  questions: string;
  selectedQuestion: Question | null;
  onSelectQuestion: (question: Question) => void;
  setNotification: (notification: string | null) => void;
}

export function Questions({
  questions,
  selectedQuestion,
  onSelectQuestion,
  setNotification,
}: QuestionsProps) {
  function handleQuestionClick(q: Question) {
    console.log("Selected question:", q);
    onSelectQuestion(q);
    setNotification(null);
  }

  return (
    <Card className="bg-[#0a0b24] border-[#2e2f61]">
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] pr-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                selectedQuestion?.id === q.id
                  ? "bg-[#131538] border-l-4 border-[#ff6db3]"
                  : "hover:bg-[#131538] border-l-4 border-transparent"
              }`}
              onClick={() => handleQuestionClick(q)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[#f0f0f0] text-base font-medium pr-4">
                  {q.question}
                </h3>
                <PlayIcon
                  selected={selectedQuestion?.id === q.id}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface PlayIconProps {
  selected: boolean;
}

function PlayIcon({ selected }: PlayIconProps) {
  return (
    <div
      className={`rounded-full p-2 transition-all duration-200 ${
        selected
          ? "bg-[#ff6db3] text-[#050614]"
          : "bg-[#7fceff] text-[#050614]"
      }`}
    >
      <Play size={16} className={selected ? "animate-pulse" : ""} />
    </div>
  );
}
