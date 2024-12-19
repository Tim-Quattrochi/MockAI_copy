"use client";
import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  useCallback,
} from "react";
import { useUser } from "@/hooks/useUser";
import { defineStepper } from "@stepperize/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AnalysisCard from "./AnalysisCard";
import VideoRecorder from "./VideoRecorder";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/Button";
import { Label } from "./ui/label";
import { Input } from "./ui/Input";
import StepProgress from "./step-progress";
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
import { ArrowRight } from "lucide-react";
import {
  type InterviewData,
  type Question,
  type QuestionResponse,
} from "@/types";
import { cn } from "@/lib/utils";

const initialData: InterviewData = {
  name: "",
  company: "",
  position: "",
  questionType: "technical",
};

const { useStepper, steps } = defineStepper(
  {
    id: "name",
    key: "name",
    label: "Name",
    description: "Your Name",
    isCompleted: false,
  },
  {
    id: "company",
    key: "company",
    label: "Company",
    description: "Your Dream Company",
    isCompleted: false,
  },
  {
    id: "position",
    key: "position",
    label: "Position",
    description: "Your Dream Position",
    isCompleted: false,
  },
  {
    id: "questionType",
    key: "questionType",
    label: "Question Type",
    description: "Technical or Behavioral",
    isCompleted: false,
  },
  {
    id: "start interview",
    key: "start interview",
    label: "Start Interview",
    description: "Start Interview",
    isCompleted: false,
  }
);

const Interview = () => {
  const { user, error } = useUser();
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(initialData);
  const [selectedQuestion, setSelectedQuestion] =
    useState<Question | null>(null);
  const [stepVisible, setStepVisible] = useState(true);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isQuestionFetching, setIsQuestionFetching] = useState(true); // for AnalysisCard
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  const nameRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const stepper = useStepper();

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

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setInterviewData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (name: string, value: string) => {
      setInterviewData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    []
  );

  const fetchQuestion = useCallback(async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("API base URL is not defined");

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
    }
  }, [interviewData]);

  useEffect(() => {
    if (user && step === 5 && !selectedQuestion) {
      fetchQuestion();
    }
  }, [user, step, selectedQuestion, fetchQuestion]);

  const handleNextStep = () => {
    stepper.next();
    setStepVisible(false);
    setTimeout(() => {
      setStep(step + 1);
      setStepVisible(true);
    }, 500);
  };

  const handleQuitInterview = () => {
    stepper.reset();
    setStepVisible(false);
    setInterviewData(initialData);
    setSelectedQuestion(null);
    setHasUploaded(false);
    setErrorMessage(null);

    setTimeout(() => {
      setStep(1);
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

  return (
    <div className="hero flex flex-col p-6 items-center justify-center">
      <StepProgress
        steps={steps}
        currentStep={stepper.current.index}
        hasUploaded={hasUploaded}
      />
      <Card className="w-full mt-8 max-w-2xl bg-[#0a0b24]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-headingColor">
            {step !== 6 && "Interview Meeting Room"}
          </CardTitle>
          <CardDescription className="text-grey">
            {step !== 5 &&
              "Please provide your details to join the interview"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stepper.switch({
              name: () => (
                <InterviewQuestion
                  handleChange={handleChange}
                  value={interviewData.name}
                  handleNextStep={handleNextStep}
                  labelText={stepper.current.label}
                  stepVisible={stepVisible}
                  name={stepper.current.id}
                />
              ),
              position: () => (
                <InterviewQuestion
                  handleChange={handleChange}
                  value={interviewData.position}
                  handleNextStep={handleNextStep}
                  labelText="Position"
                  stepVisible={stepVisible}
                  name="position"
                />
              ),
              company: () => (
                <InterviewQuestion
                  handleChange={handleChange}
                  value={interviewData.company}
                  handleNextStep={handleNextStep}
                  labelText={stepper.current.label}
                  stepVisible={stepVisible}
                  name={stepper.current.id}
                />
              ),
              questionType: () => (
                <InterviewQuestionType
                  handleSelectChange={handleSelectChange}
                  value={interviewData.questionType}
                  handleNextStep={handleNextStep}
                  labelText={stepper.current.label}
                  stepVisible={stepVisible}
                  name="questionType"
                />
              ),
              "start interview": () => (
                <div
                  className={`space-y-4 transition-opacity duration-500 ${
                    !stepVisible ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {selectedQuestion && (
                    <>
                      <AnalysisCard
                        content={selectedQuestion.question_text}
                        title="Interview Question Provided by mockAI"
                        type="question"
                        isLoading={isQuestionFetching}
                      />
                      <VideoRecorder
                        selectedQuestion={
                          selectedQuestion.question_text
                        }
                        questionId={selectedQuestion.id}
                        user={user}
                        onUploadStatusChange={
                          handleUploadStatusChange
                        }
                        interviewData={interviewData}
                      />
                    </>
                  )}
                </div>
              ),
            })}
            {!stepper.isLast ? (
              <>
                <div className="flex justify-end gap-4">
                  <span className="mr-auto">
                    <Button
                      className="mr-auto bg-red-500 border-red-500 text-white hover:bg-red-600"
                      onClick={stepper.reset}
                      variant={`outline`}
                    >
                      Reset
                    </Button>
                  </span>
                  <Button
                    variant="secondary"
                    onClick={stepper.prev}
                    disabled={stepper.isFirst}
                  >
                    Back
                  </Button>
                  <Button onClick={handleNextStep} type="submit">
                    {stepper.isLast ? "Start Interview" : "Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              ""
            )}
          </div>

          {step === 5 && !selectedQuestion && (
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
          {hasUploaded && (
            <Button
              variant="default"
              disabled={!hasUploaded}
              className="w-full transition-opacity duration-500 ease-in-out bg-primary-blue text-primary-blue-100 hover:bg-secondary-orange flex items-center justify-center opacity-100"
            >
              <div className="flex" onClick={handleNavigateToResults}>
                View Results
                <ArrowRight className="ml-2 h-4 w-4 self-center" />
              </div>
            </Button>
          )}
        </CardFooter>
        {stepper.isLast && (
          <Button
            variant="destructive"
            onClick={handleQuitInterview}
            className="absolute bottom-4 right-4"
          >
            Cancel Interview
          </Button>
        )}
      </Card>
    </div>
  );
};

export default Interview;

interface InterviewQuestionProps {
  value: string;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNextStep: () => void;
  stepVisible: boolean;
  labelText: string;
  name: string;
}

function InterviewQuestion({
  value,
  labelText,
  handleChange,
  handleNextStep,
  stepVisible,
  name,
}: InterviewQuestionProps) {
  return (
    <div
      className={`space-y-4 transition-opacity duration-500 ${
        !stepVisible ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="space-y-2">
        <Label>
          {labelText}
          <Input
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === "Return") {
                handleNextStep();
              }
            }}
            className="bg-primary-blue-100 text-black-100"
          />
        </Label>
      </div>
    </div>
  );
}

type InterviewQuestionTypeProps = InterviewQuestionProps & {
  handleSelectChange: (name: string, value: string) => void;
};

function InterviewQuestionType({
  value,
  labelText,
  handleSelectChange,
  stepVisible,
}: InterviewQuestionTypeProps) {
  return (
    <div
      className={` space-y-4 transition-opacity duration-500 ${
        !stepVisible ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="space-y-2 ">
        <Label htmlFor="questionType">{labelText}</Label>
        <Select
          name="questionType"
          value={value}
          onValueChange={(value) =>
            handleSelectChange("questionType", value)
          }
        >
          <SelectTrigger className="bg-primary-blue-100 text-black-100">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="behavioral">Behavioral</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
