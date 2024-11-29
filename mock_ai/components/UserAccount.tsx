"use client";

import axios from "axios";
import Link from "next/link";

// Hooks
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";

// UI components
import { LogoutButton } from "./LogoutButton";

import {
  Button,
  Skeleton,
  ScrollArea,
  Spinner,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui";
import VideoPlayer from "./VideoPlayer";
// Pagination components
import PaginationClient from "./Pagination";
// Alert Dialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
} from "./ui/alert-dialog";
// Icons
import { ChevronDown, ChevronUp, Trash2, Mic } from "lucide-react";
// Utilities
import { formatPauseDurations } from "@/lib/formatSeconds";
import { User, AuthError } from "@supabase/supabase-js";
//types
import { FilterType, JoinedInterviewResult } from "@/types";

interface FillerWord {
  word: string;
  count: number;
}

interface Pause {
  duration: number;
  start: number;
  end: number;
}

export interface InterviewResult {
  id: string;
  question: string;
  score: number;
  transcript: string;
  filler_words: FillerWord[] | [];
  long_pauses: Pause[] | [];
  pause_durations: string;
  ai_feedback: string;
  interview_date: string;
  video_url: string | null;
  audio_url: string | null;
}

interface UserAccountClientProps {
  fullUserHistory: JoinedInterviewResult[];
  resultsPerPage: number;
  userError: AuthError | null;
  user: User;
}

export default function UserAccountClient({
  fullUserHistory,
  resultsPerPage,
  userError,
  user,
}: UserAccountClientProps) {
  const [results, setResults] = useState<JoinedInterviewResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<
    JoinedInterviewResult[]
  >([]);
  const [sortBy, setSortBy] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<
    string | null
  >(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<
    number | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userLoading, setUserLoading] = useState(true);

  const {
    id: userId,
    email,
    user_metadata: { name, picture, fullname },
  } = user;

  const { toast, dismiss } = useToast();

  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const totalPages = Math.ceil(
    filteredResults.length / resultsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" | "success" = "default"
  ) => {
    const myToast = toast({
      title,
      description,
      variant,
    });

    setTimeout(() => dismiss(myToast.id), 5000);
  };

  const handleOpenDialog = (resultId: number) => {
    setSelectedResultId(resultId);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (userId && !userError) {
      setLoading(false);
      setResults(fullUserHistory);
      setFilteredResults(fullUserHistory);
      setUserLoading(false);
    }
    setUserLoading(false);
  }, [userId]);

  useEffect(() => {
    const filtered = results.filter(
      (result: JoinedInterviewResult) => {
        if (filter === "all") return true;
        if (filter === "video") return result.video_url !== null;
        if (filter === "voice")
          return (
            result.audio_url !== null && result.video_url === null
          );

        if (filter === "behavioral")
          return result.interview_type === "behavioral";
        if (filter === "technical")
          return result.interview_type === "technical";
        if (filter === "behavioral-video")
          return (
            result.interview_type === "behavioral" &&
            result.video_url !== null
          );
        if (filter === "behavioral-voice")
          return (
            result.interview_type === "behavioral" &&
            result.audio_url !== null &&
            result.video_url === null
          );
        if (filter === "technical-video")
          return (
            result.interview_type === "technical" &&
            result.video_url !== null
          );
        if (filter === "technical-voice")
          return (
            result.interview_type === "technical" &&
            result.audio_url !== null &&
            result.video_url === null
          );
        return false;
      }
    );
    setFilteredResults(filtered);
  }, [filter, results]);

  const handleSortChange = (sortOrder: "asc" | "desc") => {
    const sortedResults = [...filteredResults].sort((a, b) => {
      const dateA = new Date(a.interview_date).getTime();
      const dateB = new Date(b.interview_date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    setSortBy(sortOrder);
    setFilteredResults(sortedResults);
  };

  const handleDelete = () => {
    if (!selectedResultId) return;

    axios
      .delete(`/service/delete_result/${selectedResultId}`, {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        setResults((prevResults) =>
          prevResults.filter((r) => Number(r.id) !== selectedResultId)
        );
        setFilteredResults((prevResults) =>
          prevResults.filter((r) => Number(r.id) !== selectedResultId)
        );
        showToast("Success", "Interview Deleted", "success");
      })
      .catch((error) => {
        console.error("Error deleting result:", error);
      })
      .finally(() => {
        setDialogOpen(false);
        setSelectedResultId(null);
      });
  };

  const toggleFeedbackExpansion = (resultId: string) => {
    setExpandedFeedbackId((prevId) =>
      prevId === resultId ? null : resultId
    );
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="large" className="w-[300px] h-[20px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 overflow-hidden bg-slate-800">
            <AvatarImage
              src={picture || ""}
              alt={
                name
                  ? `${name}'s profile picture`
                  : "User's profile picture"
              }
            />
            <AvatarFallback>
              {name.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-slate-500">{email}</p>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4 font-heading">
            Previous Interview Results
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <p>Sort by Date:</p>
              <Select
                value={sortBy}
                onValueChange={(value: "asc" | "desc") =>
                  handleSortChange(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    Oldest to Newest
                  </SelectItem>
                  <SelectItem value="desc">
                    Newest to Oldest
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Filter by Media Type
                </h3>
                <RadioGroup
                  defaultValue="all"
                  className="flex flex-wrap space-x-4"
                  onValueChange={(value) =>
                    setFilter(value as FilterType)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="all"
                      id="all"
                      className="text-sm rounded-full border-2 border-slate-700 p-2 transition-all duration-200 hover:bg-slate-700 focus:ring-2 focus:ring-primary-500 checked:bg-primary-blue-200 checked:border-transparent"
                    />
                    <Label
                      htmlFor="all"
                      className="text-sm text-slate-300"
                    >
                      All
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="video"
                      id="video"
                      className="text-sm rounded-full border-2 border-slate-700 p-2 transition-all duration-200 hover:bg-slate-700 focus:ring-2 focus:ring-primary-500 checked:bg-primary-blue-200 checked:border-transparent"
                    />
                    <Label
                      htmlFor="video"
                      className="text-sm text-slate-300"
                    >
                      Video
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="voice"
                      id="voice"
                      className="text-sm rounded-full border-2 border-slate-700 p-2 transition-all duration-200 hover:bg-slate-700 focus:ring-2 focus:ring-primary-500 checked:bg-primary-500 checked:border-transparent"
                    />
                    <Label
                      htmlFor="voice"
                      className="text-sm text-slate-300"
                    >
                      Voice
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 slate-200">
                  Filter by Interview Type
                </h3>
                <RadioGroup
                  defaultValue="all"
                  className="flex flex-wrap space-x-4"
                  onValueChange={(value) =>
                    setFilter(value as FilterType)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="behavioral"
                      id="behavioral"
                      className="text-sm rounded-full border-2 border-slate-700 p-2 transition-all duration-200 hover:bg-slate-700 focus:ring-2 focus:ring-primary-500 checked:bg-primary-blue-200 checked:border-transparent"
                    />
                    <Label htmlFor="behavioral">Behavioral</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="technical"
                      id="technical"
                      className="text-sm rounded-full border-2 border-slate-700 p-2 transition-all duration-200 hover:bg-slate-700 focus:ring-2 focus:ring-primary-500 checked:bg-primary-blue-200 checked:border-transparent"
                    />
                    <Label htmlFor="technical">Technical</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : filteredResults.length > 0 ? (
            <div>
              {paginatedResults.map((result) => {
                {
                  result.filler_words?.length > 0 ? (
                    result.filler_words.map((item, index) => (
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
                      </div>
                    ))
                  ) : (
                    <p className="text-[#f0f0f0]">
                      No filler words found
                    </p>
                  );
                }
                return (
                  <Card
                    key={result.id}
                    className="bg-slate-900 border-slate-800"
                  >
                    <CardHeader>
                      <p className="text-md md:text-2xl text-center font-subheading text-primary mb-1">
                        Question
                      </p>
                      <CardTitle className="text-xl text-slate-200">
                        {result.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">
                            Score
                          </p>
                          <p className="text-1xl font-bold text-purple-400">
                            {result.score
                              ? Math.round(result.score)
                              : "Score not available"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">
                            Interview Date
                          </p>
                          <p className="text-lg">
                            {new Date(
                              result.interview_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Transcript
                        </p>
                        <p className="text-slate-300 line-clamp-3">
                          {result.transcript
                            ? result.transcript
                            : "Transcript not available"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Filler Words
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {result.filler_words.length > 0 ? (
                            result.filler_words.map(
                              (item: FillerWord) => (
                                <div key={item.word}>
                                  <p className="text-sm text-slate-400">
                                    {item.word}
                                  </p>
                                  <p className="text-lg font-bold">
                                    {item.count}
                                  </p>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-slate-300">
                              No filler words found
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">
                            Long Pauses
                          </p>
                          <p className="text-lg font-bold">
                            {result.long_pauses ? (
                              result.long_pauses.length
                            ) : (
                              <span>0</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">
                            Pause Durations
                          </p>
                          <p className="text-lg font-bold">
                            {formatPauseDurations(
                              result.pause_durations
                            )}
                          </p>
                        </div>
                      </div>

                      {result.ai_feedback ? (
                        <div>
                          <Button
                            variant="outline"
                            onClick={() =>
                              toggleFeedbackExpansion(result.id)
                            }
                            className="w-full justify-between"
                          >
                            AI Feedback
                            {expandedFeedbackId === result.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          {expandedFeedbackId === result.id && (
                            <ScrollArea className="h-[200px] mt-2 rounded-md border border-slate-800 p-4">
                              <p className="text-slate-300">
                                {result.ai_feedback}
                              </p>
                            </ScrollArea>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-800 p-4 rounded-md">
                          <p className="text-slate-400 text-center">
                            AI feedback not available for this
                            interview.
                          </p>
                        </div>
                      )}
                      {result.video_url && (
                        <div className="p-4">
                          <h1 className="text-xl font-semibold mb-4">
                            Interview Video
                          </h1>
                          <VideoPlayer
                            controls={true}
                            src={result.video_url}
                          />
                        </div>
                      )}
                      {result.audio_url && !result.video_url && (
                        <div>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full"
                          >
                            <a
                              href={result.audio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Mic className="mr-2 h-4 w-4" />
                              Listen to Interview Audio
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleOpenDialog(Number(result.id))
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span className="font-bold">
                          Delete Result
                        </span>
                      </Button>
                      <AlertDialog
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the selected
                              interview result.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setDialogOpen(false)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="z-20"
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <p className="text-center text-lg">
                  No results available for the selected filter.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          <PaginationClient
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalPages={totalPages}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1" variant={"primary"}>
            <Link href="/interview">Start New Interview</Link>
          </Button>

          <LogoutButton
            variant="outline"
            className="flex-1 text-white bg-light-white"
          />
        </div>
      </div>
    </div>
  );
}
