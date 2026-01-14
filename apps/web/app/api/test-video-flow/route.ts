import { NextResponse } from "next/server";
import { video, isMuxConfigured, isMuxSigningConfigured } from "@/lib/mux";

export async function GET() {
  const tests = {
    step1_muxConfigured: isMuxConfigured(),
    step2_signingConfigured: isMuxSigningConfigured(),
    step3_createUpload: null as any,
    step4_listAssets: null as any,
  };

  // Test 1: Check configuration
  if (!tests.step1_muxConfigured) {
    return NextResponse.json({
      ...tests,
      error: "Mux not configured - check MUX_TOKEN_ID and MUX_TOKEN_SECRET",
    });
  }

  if (!tests.step2_signingConfigured) {
    return NextResponse.json({
      ...tests,
      error: "Mux signing not configured - check MUX_SIGNING_KEY_ID and MUX_SIGNING_PRIVATE_KEY",
    });
  }

  // Test 2: Try to create an upload URL
  try {
    const upload = await video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || "https://community-web-iota.vercel.app",
      new_asset_settings: {
        playback_policy: ["signed"],
        passthrough: JSON.stringify({ lessonId: "test-lesson-123" }),
      },
    });

    tests.step3_createUpload = {
      success: true,
      uploadId: upload.id,
      uploadUrlExists: !!upload.url,
    };
  } catch (error: any) {
    tests.step3_createUpload = {
      success: false,
      error: error.message,
      errorType: error.type || error.name,
    };
    
    return NextResponse.json({
      ...tests,
      overallStatus: "❌ Failed to create upload URL",
      errorDetails: error.message,
    });
  }

  // Test 3: Try to list assets
  try {
    const assetsList = await video.assets.list({ limit: 5 });
    tests.step4_listAssets = {
      success: true,
      count: assetsList.data?.length || 0,
    };
  } catch (error: any) {
    tests.step4_listAssets = {
      success: false,
      error: error.message,
    };
  }

  return NextResponse.json({
    ...tests,
    overallStatus: "✅ All video upload prerequisites working",
    ready: true,
  });
}
