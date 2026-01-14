import { NextResponse } from "next/server";

// Simple endpoint to test if webhooks can reach Vercel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Mux Webhook Test] ✅ Received POST request");
    console.log("[Mux Webhook Test] Body:", JSON.stringify(body, null, 2));
    console.log("[Mux Webhook Test] Headers:", JSON.stringify(Object.fromEntries(request.headers), null, 2));
    
    return NextResponse.json({
      success: true,
      message: "Webhook endpoint is reachable",
      receivedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Mux Webhook Test] Error:", error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

// Also handle GET for testing
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/webhooks/mux/test",
    status: "Webhook endpoint is ready to receive requests",
    configure: "In Mux dashboard, set webhook URL to: https://community-web-iota.vercel.app/api/webhooks/mux",
  });
}
