import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { video, isMuxConfigured, getMuxConfigStatus } from "@/lib/mux";

// GET endpoint to check Mux configuration status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = getMuxConfigStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Mux config check error:", error);
    return NextResponse.json(
      { configured: false, signingConfigured: false, missing: ["Unknown error"] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Mux is configured
    if (!isMuxConfigured()) {
      const status = getMuxConfigStatus();
      return NextResponse.json(
        { 
          error: "Mux not configured", 
          notConfigured: true,
          missing: status.missing,
          message: "Video uploads require Mux credentials. Please add MUX_TOKEN_ID and MUX_TOKEN_SECRET to your environment variables."
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    // Create a direct upload URL from Mux
    // The URL expires in 1 hour by default
    const upload = await video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      new_asset_settings: {
        playback_policy: ["signed"],
        // Pass lesson ID as metadata so we can link it in webhook
        passthrough: JSON.stringify({ lessonId }),
      },
    });

    return NextResponse.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
    });
  } catch (error) {
    console.error("Mux upload URL error:", error);
    
    // Check if it's a configuration error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("not configured")) {
      return NextResponse.json(
        { 
          error: "Mux not configured", 
          notConfigured: true,
          message: errorMessage
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
