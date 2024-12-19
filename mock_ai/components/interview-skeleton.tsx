'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function InterviewSkeletonComponent() {
  return (
    <div className="min-h-screen bg-[#050614] p-6">
      <header className="flex justify-between items-center mb-20">
        {/* Logo skeleton */}
        <Skeleton className="h-12 w-12 rounded-lg bg-[#131538]" />
        
        {/* Nav links skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16 bg-[#131538]" />
          <Skeleton className="h-4 w-16 bg-[#131538]" />
          <Skeleton className="h-8 w-8 rounded-full bg-[#131538]" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        <Card className="bg-[#0a0b24] border-[#2e2f61]">
          <CardHeader className="space-y-4">
            {/* Title skeleton */}
            <Skeleton className="h-8 w-64 mx-auto bg-[#131538]" />
            {/* Subtitle skeleton */}
            <Skeleton className="h-4 w-80 mx-auto bg-[#131538]" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Input label skeleton */}
            <Skeleton className="h-4 w-24 bg-[#131538]" />
            
            {/* Input field skeleton */}
            <Skeleton className="h-12 w-full bg-[#131538] rounded-md" />
            
            {/* Button skeleton */}
            <Skeleton className="h-12 w-full bg-[#131538] rounded-md mt-8" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}