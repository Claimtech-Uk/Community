import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { video, isMuxConfigured, getMuxConfigStatus } from "@/lib/mux";
import { prisma } from "@/lib/prisma";

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

    // Get the current lesson to check for existing video
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { muxAssetId: true },
    });

    // If there's an existing Mux asset, delete it to save storage costs
    if (lesson?.muxAssetId) {
      try {
        await video.assets.delete(lesson.muxAssetId);
        console.log(`Deleted old Mux asset: ${lesson.muxAssetId}`);
      } catch (error) {
        console.error(`Failed to delete old Mux asset ${lesson.muxAssetId}:`, error);
        // Continue anyway - new video should still work
      }
      
      // Clear the old video data immediately
      await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          muxAssetId: null,
          muxPlaybackId: null,
          videoDuration: null,
        },
      });
    }

    // Create a direct upload URL from Mux
    // The URL expires in 1 hour by default
    console.log("[Mux Upload] Creating upload for lesson:", lessonId);
    console.log("[Mux Upload] CORS origin:", process.env.NEXT_PUBLIC_APP_URL);
    
    const upload = await video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      new_asset_settings: {
        playback_policy: ["signed"],
        // Pass lesson ID as metadata so we can link it in webhook
        passthrough: JSON.stringify({ lessonId }),
      },
    });

    console.log("[Mux Upload] ✅ Upload URL created:", upload.id);

    return NextResponse.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
    });
  } catch (error: any) {
    console.error("[Mux Upload] ❌ Error creating upload URL:", error);
    console.error("[Mux Upload] Error type:", error.type || error.name);
    console.error("[Mux Upload] Error message:", error.message);
    console.error("[Mux Upload] Error response:", error.response?.data);
    
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
      { 
        error: "Failed to create upload URL",
        details: errorMessage,
        errorType: error.type || error.name,
        muxError: error.response?.data || null,
      },
      { status: 500 }
    );
  }
}
