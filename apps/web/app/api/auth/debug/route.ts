import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    // Auth
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "✓ Set" : "✗ Missing",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✓ Set" : "✗ Missing",
    authSecret: process.env.AUTH_SECRET ? "✓ Set" : "✗ Missing",
    
    // Database
    databaseUrl: process.env.DATABASE_URL ? "✓ Set" : "✗ Missing",
    directUrl: process.env.DIRECT_URL ? "✓ Set" : "✗ Missing",
    
    // Mux Video
    muxTokenId: process.env.MUX_TOKEN_ID ? "✓ Set" : "✗ Missing",
    muxTokenSecret: process.env.MUX_TOKEN_SECRET ? "✓ Set" : "✗ Missing",
    muxSigningKeyId: process.env.MUX_SIGNING_KEY_ID ? "✓ Set" : "✗ Missing",
    muxSigningPrivateKey: process.env.MUX_SIGNING_PRIVATE_KEY ? "✓ Set" : "✗ Missing",
    muxWebhookSecret: process.env.MUX_WEBHOOK_SECRET ? "✓ Set" : "✗ Missing",
    
    // AWS S3
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ? "✓ Set" : "✗ Missing",
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? "✓ Set" : "✗ Missing",
    awsRegion: process.env.AWS_REGION || "Not set",
    awsS3Bucket: process.env.AWS_S3_BUCKET || "Not set",
    
    // Stripe
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? "✓ Set" : "✗ Missing",
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? "✓ Set" : "✗ Missing",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? "✓ Set" : "✗ Missing",
    stripeMonthlyPriceId: process.env.STRIPE_MONTHLY_PRICE_ID ? "✓ Set" : "✗ Missing",
    stripeAnnualPriceId: process.env.STRIPE_ANNUAL_PRICE_ID ? "✓ Set" : "✗ Missing",
    
    // Mailgun
    mailgunApiKey: process.env.MAILGUN_API_KEY ? "✓ Set" : "✗ Missing",
    mailgunDomain: process.env.MAILGUN_DOMAIN || "Not set",
    
    // App
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "Not set",
    nodeEnv: process.env.NODE_ENV,
  });
}
