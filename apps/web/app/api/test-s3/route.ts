import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

export async function GET() {
  const checks = {
    awsAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID ? "✓ Set" : "✗ Missing",
    awsSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY ? "✓ Set" : "✗ Missing",
    awsRegion: process.env.AWS_REGION || "✗ Not set (defaulting to eu-west-2)",
    awsBucket: process.env.AWS_S3_BUCKET || "✗ Not set (defaulting to evolution-community)",
  };

  // If credentials are not set, return early
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return NextResponse.json({
      ...checks,
      status: "❌ AWS credentials not configured",
      note: "Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to Vercel environment variables"
    });
  }

  // Try to connect to S3
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "eu-west-2",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const bucket = process.env.AWS_S3_BUCKET || "evolution-community";

    // Try to list objects (just to test connection)
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1,
    });

    await s3Client.send(listCommand);

    return NextResponse.json({
      ...checks,
      status: "✅ S3 connection successful",
      bucketAccessible: "✓ Can access bucket",
    });
  } catch (error: any) {
    return NextResponse.json({
      ...checks,
      status: "❌ S3 connection failed",
      error: error.message,
      errorCode: error.Code || error.$metadata?.httpStatusCode,
      hint: error.message.includes("credentials") 
        ? "Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
        : error.message.includes("bucket")
        ? "Check your AWS_S3_BUCKET name and permissions"
        : "Check AWS region and credentials"
    }, { status: 500 });
  }
}
