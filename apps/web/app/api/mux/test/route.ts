import { NextResponse } from "next/server";
import { video, isMuxConfigured, isMuxSigningConfigured, getMuxConfigStatus } from "@/lib/mux";

export async function GET() {
  try {
    // Check Mux configuration
    const status = getMuxConfigStatus();
    
    if (!status.configured) {
      return NextResponse.json({
        status: "❌ Mux not configured",
        ...status
      });
    }
    
    // Try to list assets (test API connection)
    const assets = await video.assets.list({ limit: 1 });
    
    return NextResponse.json({
      status: "✅ Mux connected and working",
      configured: status.configured,
      signingConfigured: status.signingConfigured,
      hasAssets: assets.data && assets.data.length > 0,
      apiWorking: true,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "❌ Mux API error",
      error: error.message,
      hint: "Check MUX_TOKEN_ID and MUX_TOKEN_SECRET are correct"
    }, { status: 500 });
  }
}
