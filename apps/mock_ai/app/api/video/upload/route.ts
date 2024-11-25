import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const filePath = formData.get("filePath") as string;

    if (!file || !filePath) {
      return NextResponse.json(
        { error: "File and filePath are required." },
        { status: 400 }
      );
    }
    console.log("VIDEO FORM DATA: ", formData);

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filePath, file, {
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload the file." },
        { status: 500 }
      );
    } else {
      const { data } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      console.log("URL FROM SUPA:", data.publicUrl);
    }

    return NextResponse.json({
      message: "File uploaded successfully.",
      data,
    });
  } catch (error) {
    console.error("Error in POST /api/upload:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
