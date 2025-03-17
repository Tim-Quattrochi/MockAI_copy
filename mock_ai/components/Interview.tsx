"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import AnalysisCard from "./AnalysisCard";
import VideoRecorder from "./VideoRecorder";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ArrowRight, Info } from "lucide-react";
import {
  type InterviewData,
  type Question,
  type QuestionResponse,
} from "@/types";

const initialData: InterviewData = {
  name: "",
  company: "",
  position: "",
  questionType: "technical",
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  dreamPosition: z.string().min(2, {
    message: "Dream position must be at least 2 characters.",
  }),
  dreamCompany: z.string().min(2, {
    message: "Dream company must be at least 2 characters.",
  }),
  interviewType: z.enum(["behavioral", "technical"], {
    required_error: "Please select an interview type.",
  }),
});

const Interview = () => {
  const { user, error } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [interviewData, setInterviewData] = useState(initialData);
  const [selectedQuestion, setSelectedQuestion] =
    useState<Question | null>(null);

  const [hasUploaded, setHasUploaded] = useState(false);
  const [isQuestionFetching, setIsQuestionFetching] = useState(true); // for AnalysisCard
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );
  const [controller, setController] =
    useState<AbortController | null>(null);
  const [isInterviewCanceled, setIsInterviewCanceled] =
    useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] =
    useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dreamPosition: "",
      dreamCompany: "",
      interviewType: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setInterviewData({
      name: values.name,
      company: values.dreamCompany,
      position: values.dreamPosition,
      questionType: values.interviewType,
    });
    console.log(values);
    setIsInterviewStarted(true);

    setIsLoading(false);
  }

  const handleUploadStatusChange = useCallback((status: boolean) => {
    setHasUploaded(status);
  }, []);

  useEffect(() => {
    if (user && nameRef.current) {
      nameRef.current.value =
        user.user_metadata.name || user.user_metadata.full_name || "";
      setInterviewData((prevData) => ({
        ...prevData,
        name: nameRef.current?.value || "",
      }));
    }
  }, [user]);

  const handleNavigateToResults = () => {
    if (!selectedQuestion) return;

    router.push(
      `/results?question=${encodeURIComponent(
        selectedQuestion.question_text
      )}&questionId=${encodeURIComponent(selectedQuestion.id)}`
    );
  };

  const fetchQuestion = useCallback(async () => {
    if (isInterviewCanceled) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("API base URL is not defined");

    const abortController = new AbortController();
    setController(abortController);

    setIsQuestionFetching(true);
    try {
      const response = await axios.post<QuestionResponse>(
        `${baseUrl}/api/generate`,
        {
          name: interviewData.name,
          company: interviewData.company,
          position: interviewData.position,
          interview_type: interviewData.questionType,
        },
        {
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
        }
      );

      setSelectedQuestion(response.data.question);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to fetch interview question"
        );
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    } finally {
      setIsQuestionFetching(false);
      setController(null);
    }
  }, [interviewData, isInterviewCanceled]);

  useEffect(() => {
    if (isInterviewStarted && !selectedQuestion) {
      fetchQuestion();
    }
  }, [isInterviewStarted, selectedQuestion, fetchQuestion]);

  const handleQuitInterview = () => {
    if (controller) {
      controller.abort();
    }
    setIsInterviewCanceled(true);

    setInterviewData(initialData);
    setSelectedQuestion(null);
    setHasUploaded(false);
    setErrorMessage(null);
    setIsInterviewStarted(false);

    setTimeout(() => {
      setIsInterviewCanceled(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [controller]);

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 px-4">
      {!isInterviewStarted && (
        <Card className="w-full bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-headingColor">
              Prepare for Your Dream Interview
            </CardTitle>
            <CardDescription>
              Fill in the details to start your practice interview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dreamPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dream Position</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Software Engineer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dreamCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dream Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tech Innovators Inc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interviewType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interview Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interview type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="behavioral">
                            Behavioral
                          </SelectItem>
                          <SelectItem value="technical">
                            Technical
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Start Interview
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isInterviewStarted && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <VideoRecorder
              selectedQuestion={selectedQuestion?.question_text || ""}
              questionId={selectedQuestion?.id || ""}
              user={user}
              onUploadStatusChange={handleUploadStatusChange}
              interviewData={interviewData}
              isInterviewCanceled={isInterviewCanceled}
            />
          </div>
          <div className="space-y-6">
            {selectedQuestion && !isInterviewCanceled && (
              <AnalysisCard
                content={selectedQuestion.question_text}
                title="Interview Question"
                type="question"
                isLoading={isQuestionFetching}
              />
            )}

            {!selectedQuestion && isQuestionFetching && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedQuestion &&
              !isQuestionFetching &&
              errorMessage && (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-lg font-semibold text-red-500">
                      {errorMessage}
                    </p>
                    <Button
                      onClick={fetchQuestion}
                      className="mt-4 w-full"
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}

            {hasUploaded && (
              <Button
                variant="default"
                disabled={!hasUploaded}
                className="w-full transition-opacity duration-500 ease-in-out flex items-center justify-center opacity-100"
                onClick={handleNavigateToResults}
              >
                View Results
                <ArrowRight className="ml-2 h-4 w-4 self-center" />
              </Button>
            )}

            <Dialog
              open={showCancelConfirmation}
              onOpenChange={setShowCancelConfirmation}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Cancel Interview
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Interview</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel the interview? All
                    progress will be lost.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelConfirmation(false)}
                  >
                    No, continue
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleQuitInterview}
                  >
                    Yes, cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Interview Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Maintain good posture and eye contact</li>
                  <li>
                    Use specific examples to support your answers
                  </li>
                  <li>
                    Listen carefully to the question before answering
                  </li>
                  <li>
                    It's okay to take a moment to think before
                    responding
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
