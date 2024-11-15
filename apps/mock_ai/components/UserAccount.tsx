// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useUser } from "@auth0/nextjs-auth0/client";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "./ui/card";
// import { Skeleton } from "./ui/skeleton";
// import Link from "next/link";
// import Image from "next/image";
// import { ScrollArea } from "./ui/scroll-area";

// interface FillerWords {
//   [key: string]: number;
// }

// const UserAccount = () => {
//   const { user, isLoading } = useUser();
//   const [results, setResults] = useState<any[]>([]);
//   const [sortBy, setSortBy] = useState<"asc" | "desc">("desc");
//   const [loading, setLoading] = useState(true);
//   const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
//   const [expandedFeedbackId, setExpandedFeedbackId] = useState<
//     number | null
//   >(null);

//   // Fetch results for the user
//   useEffect(() => {
//     if (user?.email) {
//       axios
//         .get("/service/get_all_results", {
//           params: { user: user?.email },
//           headers: { "Content-Type": "application/json" },
//         })
//         .then((response) => {
//           const fetchedResults = Array.isArray(response.data)
//             ? response.data
//             : [];
//           const sortedResults = fetchedResults.sort((a, b) => {
//             const dateA = new Date(a.interview_date).getTime();
//             const dateB = new Date(b.interview_date).getTime();
//             return dateB - dateA;
//           });
//           setResults(sortedResults);
//           setLoading(false);
//         })
//         .catch((error) => {
//           console.error("Error fetching results:", error);
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [user]);

//   // Sort the results by interview_date
//   const handleSortChange = (sortOrder: "asc" | "desc") => {
//     const sortedResults = [...results].sort((a, b) => {
//       const dateA = new Date(a.interview_date).getTime();
//       const dateB = new Date(b.interview_date).getTime();
//       return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
//     });
//     setSortBy(sortOrder);
//     setResults(sortedResults);
//   };

//   // Delete a result
//   const handleDelete = (resultId: number) => {
//     if (
//       window.confirm("Are you sure you want to delete this result?")
//     ) {
//       axios
//         .delete(`/service/delete_result/${resultId}`, {
//           headers: { "Content-Type": "application/json" },
//         })
//         .then(() => {
//           setResults((prevResults) =>
//             prevResults.filter((r) => r.id !== resultId)
//           );
//           alert("Result deleted successfully.");
//         })
//         .catch((error) => {
//           console.error("Error deleting result:", error);
//         });
//     }
//   };

//   // Handle feedback selection
//   const handleFeedbackChange = (
//     e: React.ChangeEvent<HTMLSelectElement>
//   ) => {
//     const feedbackId = e.target.value;
//     const feedback = results.find((r) => r.id === feedbackId);
//     setSelectedFeedback(feedback);
//   };

//   const toggleFeedbackExpansion = (resultId: number) => {
//     setExpandedFeedbackId((prevId) =>
//       prevId === resultId ? null : resultId
//     );
//   };

//   // Loading and user check
//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (!user) {
//     return (
//       <div className="hero">
//         <div className="flex-1 pt-36 padding-x">
//           <h1 className="text-2xl font-bold">
//             mockAI User Account Page
//           </h1>
//           <p>Please sign in to view your account.</p>
//           <button className="bg-primary-blue text-white mt-4 rounded-full p-2">
//             <a href="/api/auth/login">Sign In</a>
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="hero">
//       <div className="flex-1 pt-36 padding-x">
//         {/* User Profile Section */}
//         <div className="flex items-center space-x-4">
//           {user.picture && (
//             <Image
//               src={user.picture}
//               alt="User Profile"
//               className="w-16 h-16 rounded-full"
//               width={30}
//               height={37}
//             />
//           )}
//           <div>
//             <h2 className="text-xl font-bold">{user.name}</h2>
//             <p className="text-sm text-gray-600">{user.email}</p>
//           </div>
//         </div>

//         <h1 className="text-2xl font-bold mt-8 text-center">
//           Previous Interview Results
//         </h1>

//         {/* Sort by Date */}
//         <div className="flex items-center justify-between mt-4 text-black">
//           <p className="text-white">Sort by Date:</p>
//           <select
//             value={sortBy}
//             onChange={(e) =>
//               handleSortChange(e.target.value as "asc" | "desc")
//             }
//             className="border p-2 rounded-md"
//           >
//             <option value="asc">Oldest to Newest</option>
//             <option value="desc">Newest to Oldest</option>
//           </select>
//         </div>
//         {results.length > 0 ? (
//           <Card className="space-y-4 mt-4 text-black">
//             {results.map((result) => {
//               const fillerWords: FillerWords = result.filler_words
//                 ? JSON.parse(result.filler_words)
//                 : {};

//               return (
//                 <div
//                   key={result.id}
//                   className="result-card p-4 border rounded-md bg-white shadow-sm"
//                 >
//                   <CardHeader>
//                     <CardTitle className="text-lg font-bold mb-2">
//                       Question: {result.question}
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-sm space-y-1">
//                       <p>
//                         <strong>Score:</strong> {result.score}
//                       </p>
//                       <p>
//                         <strong>Transcript:</strong>{" "}
//                         <span className="block truncate">
//                           {result.transcript}
//                         </span>
//                       </p>
//                       <div>
//                         <strong>Filler Words:</strong>
//                         <ul className="list-disc ml-4">
//                           {Object.entries(fillerWords)
//                             .filter(([word, count]) => count > 0)
//                             .map(([word, count]) => (
//                               <li key={word}>
//                                 <span className="font-semibold">
//                                   {word}:
//                                 </span>{" "}
//                                 {count}
//                               </li>
//                             ))}
//                         </ul>
//                       </div>
//                       <p>
//                         <strong>Long Pauses:</strong>{" "}
//                         {result.long_pauses}
//                       </p>
//                       <p>
//                         <strong>Pause Durations:</strong>{" "}
//                         {result.pause_durations}
//                       </p>
//                       <div>
//                         <p className="text-gray-700">
//                           {expandedFeedbackId === result.id ? (
//                             result.ai_feedback
//                           ) : result.ai_feedback ? (
//                             <ScrollArea className="h-72 w-full rounded-md border">
//                               <div className="p-4">
//                                 <h4 className="mb-4 text-sm font-medium leading-none text-center">
//                                   AI Feedback:
//                                 </h4>
//                                 {result.ai_feedback}
//                               </div>
//                             </ScrollArea>
//                           ) : (
//                             "No AI feedback available"
//                           )}
//                         </p>
//                       </div>
//                       <p>
//                         <strong>Interview Date:</strong>{" "}
//                         {new Date(
//                           result.interview_date
//                         ).toLocaleDateString()}
//                       </p>

//                       {/* Check if video is available */}
//                       {result.video_url ? (
//                         <div className="mt-2">
//                           <video
//                             controls
//                             preload="metadata"
//                             src={result.video_url}
//                             className="w-full rounded-md"
//                           />
//                         </div>
//                       ) : (
//                         <p>No video available for this interview.</p>
//                       )}
//                     </div>
//                   </CardContent>
//                   <CardFooter>
//                     {/* Delete button */}
//                     <button
//                       onClick={() => handleDelete(result.id)}
//                       className="bg-red-500 text-white mt-4 rounded-full px-4 py-2 text-sm"
//                     >
//                       Delete Result
//                     </button>
//                   </CardFooter>
//                 </div>
//               );
//             })}
//           </Card>
//         ) : (
//           <p className="mt-4">
//             <div className="space-y-4 transition-opacity duration-500">
//               {loading ? (
//                 <div className="flex flex-col space-y-3">
//                   <Skeleton className="h-[490px] w-full rounded-xl bg-white" />
//                   <Skeleton className="h-[490px] w-full rounded-xl" />
//                 </div>
//               ) : !loading && results.length <= 0 ? (
//                 <div className="rounded-lg border border-secondary-orange bg-light-white p-4 text-black-100">
//                   <p className="text-center text-lg font-semibold">
//                     No results available.
//                   </p>
//                 </div>
//               ) : (
//                 <p className="text-center text-black-100">
//                   No results found, please retry.
//                 </p>
//               )}
//             </div>
//           </p>
//         )}

//         {/* Start new interview and sign out buttons */}
//         <div className="flex flex-col space-y-4 mt-6">
//           <Link
//             href="/interview"
//             className="bg-primary-blue text-white rounded-full py-2 text-center"
//           >
//             Start New Interview
//           </Link>
//           <a
//             href="/api/auth/logout"
//             className="bg-primary-blue text-white rounded-full py-2 text-center"
//           >
//             Sign Out
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserAccount;

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Video,
  Mic,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
} from "./ui/alert-dialog";

interface FillerWords {
  [key: string]: number;
}

interface InterviewResult {
  id: number;
  question: string;
  score: number;
  transcript: string;
  filler_words: string;
  long_pauses: number;
  pause_durations: number;
  ai_feedback: string;
  interview_date: string;
  video_url: string | null;
  audio_url: string | null;
}

type FilterType = "all" | "video" | "voice";

export default function UserAccount() {
  const { user, isLoading } = useUser();
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

  const { toast, dismiss } = useToast();

  const showToast = (title, description, variant) => {
    const myToast = toast({
      title: title,
      description: description,
      variant: variant,
    });

    setTimeout(() => {
      dismiss(myToast.id);
    }, 5000);
  };

  const handleOpenDialog = (resultId: number) => {
    setSelectedResultId(resultId);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (user?.email) {
      axios
        .get("/service/get_all_results", {
          params: { user: user.email },
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          const fetchedResults = Array.isArray(response.data)
            ? response.data
            : [];
          const sortedResults = fetchedResults.sort((a, b) => {
            return (
              new Date(b.interview_date).getTime() -
              new Date(a.interview_date).getTime()
            );
          });
          setResults(sortedResults);
          setFilteredResults(sortedResults);
        })
        .catch((error) => {
          console.error("Error fetching results:", error);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    const filtered = results.filter((result) => {
      if (filter === "all") return true;
      if (filter === "video") return result.video_url !== null;
      if (filter === "voice")
        return result.audio_url !== null && result.video_url === null;
      return true;
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

  const handleDelete = () => {
    if (!selectedResultId) return;

    axios
      .delete(`/service/delete_result/${selectedResultId}`, {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        setResults((prevResults) =>
          prevResults.filter((r) => r.id !== selectedResultId)
        );
        setFilteredResults((prevResults) =>
          prevResults.filter((r) => r.id !== selectedResultId)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50">
        <h1 className="text-3xl font-bold mb-4">
          mockAI User Account
        </h1>
        <p className="mb-6">Please sign in to view your account.</p>
        <Button asChild>
          <a href="/api/auth/login">Sign In</a>
        </Button>
      </div>
    );
  }
  console.log(user.picture);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={user.picture || undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback>
              {user.name ? user.name[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-slate-400">{user.email}</p>
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
            <RadioGroup
              defaultValue="all"
              className="flex space-x-4"
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

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map((result) => {
                const fillerWords: FillerWords = JSON.parse(
                  result.filler_words
                );
                return (
                  <Card
                    key={result.id}
                    className="bg-slate-900 border-slate-800"
                  >
                    <CardHeader>
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
                          <p className="text-2xl font-bold">
                            {result.score}
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
                          {result.transcript}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Filler Words
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(fillerWords)
                            .filter(([, count]) => count > 0)
                            .map(([word, count]) => (
                              <div
                                key={word}
                                className="bg-slate-800 p-2 rounded-md"
                              >
                                <p className="text-sm font-medium">
                                  {word}
                                </p>
                                <p className="text-lg font-bold">
                                  {count}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">
                            Long Pauses
                          </p>
                          <p className="text-lg font-bold">
                            {result.long_pauses}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">
                            Pause Durations
                          </p>
                          <p className="text-lg font-bold">
                            {result.pause_durations}
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
                        <div>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full"
                          >
                            <a
                              href={result.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Video className="mr-2 h-4 w-4" />
                              View Interview Video
                            </a>
                          </Button>
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
                        Delete Result
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

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href="/interview">Start New Interview</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <a href="/api/auth/logout">Sign Out</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
