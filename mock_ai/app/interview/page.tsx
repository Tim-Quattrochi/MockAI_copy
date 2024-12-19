import Interview from "@/components/Interview";
import { Suspense } from "react";
import { InterviewSkeletonComponent } from "@/components/interview-skeleton";

export default async function interview() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<InterviewSkeletonComponent />}>
        <Interview />
      </Suspense>
    </main>
  );
}
