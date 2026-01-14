import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "✓ Set" : "✗ Missing",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✓ Set" : "✗ Missing",
    authSecret: process.env.AUTH_SECRET ? "✓ Set" : "✗ Missing",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "Not set",
    nodeEnv: process.env.NODE_ENV,
  });
}
