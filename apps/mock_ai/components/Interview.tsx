"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import axios from "axios";
import AnalysisCard from "./AnalysisCard";
import Link from "next/link";
import VoiceRecorder from "./VoiceRecorder";
import VideoRecorder from "./VideoRecorder";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/Button";
import { Label } from "./ui/label";
import { Input } from "./ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Cloud, ArrowRight } from "lucide-react";
import type { InterviewData } from "@/types";

const Interview = () => {
  const { user, error } = useUser();
  const [step, setStep] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<
    string | null
  >(null);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
  const [stepVisible, setStepVisible] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuestionFetching, setIsQuestionFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  const initialData: InterviewData = {
    name: "",
    company: "",
    position: "",
    questionType: "technical",
    recordingType: "audio",
  };
  const [interviewData, setInterviewData] = useState(initialData);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInterviewData({ ...interviewData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setInterviewData({ ...interviewData, [name]: value });
  };

  const fetchQuestion = async () => {
    setIsQuestionFetching(true);
    try {
      const response = await axios.post(
        baseUrl ? `${baseUrl}/api/generate` : "/api/generate",
        {
          name: interviewData.name,
          company: interviewData.company,
          position: interviewData.position,
          interview_type: interviewData.questionType,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSelectedQuestion(response.data.question.question);
      setIsQuestionFetching(false);
    } catch (error) {
      setIsQuestionFetching(false);
      setErrorMessage(
        "Failed to fetch the interview question. Please try again."
      );
      console.error(
        "Error fetching interview question from Gemini:",
        error
      );
    }
  };

  useEffect(() => {
    if (user && step === 5 && !selectedQuestion) {
      fetchQuestion();
    }
  }, [user, step, selectedQuestion]);

  const handleNextStep = () => {
    setStepVisible(false);
    setTimeout(() => {
      setStep(step + 1);
      setStepVisible(true);
    }, 500);
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-midnight">
        <h1 className="text-2xl font-bold text-primary-blue-100">
          Error
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sorry, but there was an error loading the page.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-midnight mx-auto">
        <h1 className="text-2xl  font-bold text-titleColor">
          Interview Meeting Room
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sorry, but you must be signed in to start your interview.
        </p>
        <a href="/signin">
          <Button className="mt-10 bg-primary-blue text-primary-blue-100 hover:bg-secondary-orange">
            Sign In to Start Your Interview
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="hero flex min-h-screen flex-col items-center justify-center  p-4">
      <Card className="w-full max-w-2xl bg-[#0a0b24]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-titleColor">
            {step !== 6 && "Interview Meeting Room"}
          </CardTitle>
          <CardDescription className="text-grey">
            {step !== 6 &&
              "Please provide your details to join the interview"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div
              className={`space-y-4 transition-opacity duration-500 ${
                !stepVisible ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={interviewData.name}
                  onChange={handleInputChange}
                  className="bg-primary-blue-100 text-black-100"
                />
              </div>
              <Button
                onClick={handleNextStep}
                className="w-full bg-primary-blue text-primary-blue-100 hover:bg-secondary-orange"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div
              className={`space-y-4 transition-opacity duration-500 ${
                !stepVisible ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={interviewData.company}
                  onChange={handleInputChange}
                  className="bg-primary-blue-100 text-black-100"
                />
              </div>
              <Button
                onClick={handleNextStep}
                className="w-full bg-primary-blue text-primary-blue-100 hover:bg-secondary-orange"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div
              className={`space-y-4 transition-opacity duration-500 ${
                !stepVisible ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={interviewData.position}
                  onChange={handleInputChange}
                  className="bg-primary-blue-100 text-black-100"
                />
              </div>
              <Button
                onClick={handleNextStep}
                className="w-full bg-primary-blue text-primary-blue-100 hover:bg-secondary-orange"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 4 && (
            <div
              className={` space-y-4 transition-opacity duration-500 ${
                !stepVisible ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="space-y-2 ">
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  name="questionType"
                  value={interviewData.questionType}
                  onValueChange={(value) =>
                    handleSelectChange("questionType", value)
                  }
                >
                  <SelectTrigger className="bg-primary-blue-100 text-black-100">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">
                      Technical
                    </SelectItem>
                    <SelectItem value="behavioral">
                      Behavioral
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleNextStep}
                className="w-full bg-primary-blue text-primary-blue-100 hover:bg-secondary-orange z-20 mt-2"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 5 && (
            <div
              className={`space-y-4 transition-opacity duration-500 ${
                !stepVisible ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="space-y-2">
                <Label htmlFor="recordingType">Recording Type</Label>
                <Select
                  name="recordingType"
                  value={interviewData.recordingType}
                  onValueChange={(value) =>
                    handleSelectChange("recordingType", value)
                  }
                >
                  <SelectTrigger className="bg-primary-blue-100 text-black-100">
                    <SelectValue placeholder="Select recording type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleNextStep}
                className="w-full bg-primary-blue text-primary-blue-100 hover:bg-secondary-orange"
              >
                Start Interview
              </Button>
            </div>
          )}

          {step === 6 && selectedQuestion && (
            <div
              className={`space-y-4 transition-opacity duration-500 ${
                !stepVisible ? "opacity-0" : "opacity-100"
              }`}
            >
              <AnalysisCard
                content={[selectedQuestion]}
                title="Interview Question Provided by mockAI"
                type="question"
                isLoading={isQuestionFetching}
              />
              {interviewData.recordingType === "audio" ? (
                <VoiceRecorder
                  selectedQuestion={selectedQuestion}
                  user={user}
                  interviewData={interviewData}
                  onRecordingComplete={() => {
                    setIsQuestionAnswered(true);
                    setIsUploading(false);
                  }}
                  setIsUploading={setIsUploading}
                />
              ) : (
                <VideoRecorder
                  selectedQuestion={selectedQuestion}
                  user={user}
                  onRecordingComplete={() => {
                    setIsQuestionAnswered(true);
                    setIsUploading(false);
                  }}
                  setIsUploading={setIsUploading}
                  isUploading={isUploading}
                />
              )}
            </div>
          )}

          {step === 6 && !selectedQuestion && (
            <div className="space-y-4 transition-opacity duration-500">
              {isQuestionFetching ? (
                <>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </>
              ) : errorMessage ? (
                <div className="rounded-lg border border-secondary-orange bg-light-white p-4 text-black-100">
                  <p className="text-center text-lg font-semibold">
                    {errorMessage}
                  </p>
                  <Button
                    onClick={fetchQuestion}
                    className="mt-4 w-full bg-primary-blue text-primary-blue-100 hover:bg-secondary-orange"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <p className="text-center text-black-100">
                  No question found, please retry.
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          {(isUploading || isQuestionAnswered) && (
            <Button
              variant={isUploading ? "outline" : "default"}
              disabled={isUploading}
              className={`w-full transition-opacity duration-500 ease-in-out ${
                isUploading
                  ? "bg-secondary-orange text-black-100 hover:bg-secondary-orange/90"
                  : "bg-primary-blue text-primary-blue-100 hover:bg-secondary-orange"
              }`}
            >
              {isUploading ? (
                <>
                  <Cloud className="mr-2 h-4 w-4" /> Uploading...
                </>
              ) : (
                <Link href="/results">View Results</Link>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Interview;
