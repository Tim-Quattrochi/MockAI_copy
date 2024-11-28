"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { handleGetallResults } from "@/app/user_account/actions";
import { handleLogout } from "@/utils/supabase/helpers";

// Hooks
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";

// UI components
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "./ui/pagination";
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
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Video,
  Mic,
} from "lucide-react";
// Utilities
import { formatPauseDurations } from "@/lib/formatSeconds";
//types
import { FilterType } from "@/types";

interface FillerWord {
  word: string;
  count: number;
}

interface Pause {
  duration: number;
  start: number;
  end: number;
}

interface InterviewResult {
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

export default function UserAccount() {
  const {
    user,
    loading: userLoading,
    error: userError,
    revalidate,
  } = useUser();

  const [results, setResults] = useState<InterviewResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<
    InterviewResult[]
  >([]);
  const [sortBy, setSortBy] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<
    number | null
  >(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<
    number | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const userPicture = user?.user_metadata?.avatar_url || null;
  const uname =
    user?.user_metadata?.full_name ||
    user?.user_metadata.name ||
    "User";
  const userEmail = user?.email || "";

  const { toast, dismiss } = useToast();

  async function userInterviewHistory() {
    let results = [];
    if (user?.id && !userLoading) {
      results = await handleGetallResults(user?.id);
    }

    return results;
  }

  const fullUserHistory = userInterviewHistory();

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

  const renderPageLinks = () => {
    const pages = [];
    const maxVisiblePages = 5; // Max number of pages to show at once
    const halfVisible = Math.floor(maxVisiblePages / 2);

    // First, determine the visible range
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(currentPage + halfVisible, totalPages);

    // Ensure the visible pages range stays within the page count
    if (currentPage <= halfVisible) {
      endPage = Math.min(maxVisiblePages, totalPages);
    } else if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
    }

    // Add "First" page link if needed
    if (startPage > 1) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add the visible page range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add "Last" page link if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
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
    if (user?.id && !userLoading) {
      fullUserHistory.then((results) => {
        setResults(results);
        setFilteredResults(results);
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    const filtered = results.filter((result) => {
      if (filter === "all") return true;
      if (filter === "video") return result.video_url !== null;
      if (filter === "voice")
        return result.audio_url !== null && result.video_url === null;
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
    });
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

  const handleSortByType = (type: string) => {
    const sortedResults = [...filteredResults].sort((a, b) => {
      if (type === "technical") {
        return a.interview_type ? -1 : 1;
      } else if (type === "behavioral") {
        return a.interview_type ? 1 : -1;
      }
      return 0;
    });
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

  const toggleFeedbackExpansion = (resultId: number) => {
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
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={userPicture}
              alt={
                uname
                  ? `${uname}'s profile picture`
                  : "User's profile picture"
              }
            />
            <AvatarFallback>
              {uname.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{uname}</h2>
            <p className="text-slate-400">{userEmail}</p>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">
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
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video">Video</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="voice" id="voice" />
                    <Label htmlFor="voice">Voice</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
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
                    />
                    <Label htmlFor="behavioral">Behavioral</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="technical"
                      id="technical"
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
                      <p className="text-xl text-slate-400 mb-1">
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
                          <p className="text-1xl font-bold">
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
                          {result.filler_words.map((item) => (
                            <div key={item.word}>
                              <p className="text-sm text-slate-400">
                                {item.word}
                              </p>
                              <p className="text-lg font-bold">
                                {item.count}
                              </p>
                            </div>
                          ))}
                          0
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
                        onClick={() => handleOpenDialog(result.id)}
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
          {paginatedResults.map((result) => (
            <Card
              key={result.id}
              className="bg-slate-900 border-slate-800"
            ></Card>
          ))}

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    handlePageChange(Math.max(1, currentPage - 1))
                  }
                  className={currentPage === 1 ? "disabled" : ""}
                />
              </PaginationItem>

              {/* Ellipsis for large page numbers */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Render dynamically generated page links */}
              {renderPageLinks()}

              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(
                      Math.min(totalPages, currentPage + 1)
                    )
                  }
                  className={
                    currentPage === totalPages ? "disabled" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1" variant={"primary"}>
            <Link href="/interview">Start New Interview</Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleLogout(revalidate)}
          ></Button>
        </div>
      </div>
    </div>
  );
}
