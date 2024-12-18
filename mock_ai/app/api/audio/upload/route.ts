import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user: authedUser },
    } = await supabase.auth.getUser();

    if (!authedUser) {
      return NextResponse.json(
        { error: "User not authenticated." },
        { status: 401 }
      );
    }

    // form data from VoiceRecorder which is rendered by Interview.tsx
    const formData = await request.formData();
    const videoFile = formData.get("videoFile") as File;

    let signedUrl: string | null = null;

    if (videoFile) {
      const videoPath = `${authedUser.id}/video_${Date.now()}.webm`;

      const { data: videoData, error: videoError } =
        await supabase.storage
          .from("video-interviews")
          .upload(videoPath, videoFile, {
            contentType: videoFile.type,
            upsert: false,
          });

      if (videoError) throw videoError;

      const { data: videoUrlData } = await supabase.storage
        .from("video-interviews")
        .createSignedUrl(videoPath, 120 * 120);

      signedUrl = videoUrlData?.signedUrl ?? null;
    }

    if (!signedUrl) {
      throw new Error("Failed to generate signed URL");
    }

    return NextResponse.json({
      signedUrl,
    });
  } catch (error) {
    console.error("Error in POST /api/audio/upload:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "An unexpected error occurred.",
          details: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
