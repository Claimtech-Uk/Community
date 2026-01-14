import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  uploadToS3,
  deleteFromS3ByUrl,
  generateAssetKey,
  isS3Configured,
} from "@/lib/s3";

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed",
];

// Max file size: 10MB
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check S3 configuration
    if (!isS3Configured()) {
      return NextResponse.json(
        { error: "S3 storage not configured. Please set AWS credentials." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const lessonId = formData.get("lessonId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!lessonId) {
      return NextResponse.json({ error: "No lessonId provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique S3 key
    const key = generateAssetKey(lessonId, file.name);

    // Upload to S3
    let url: string;
    try {
      url = await uploadToS3(key, buffer, file.type);
    } catch (s3Error) {
      console.error("S3 upload failed:", s3Error);
      const errorMessage = s3Error instanceof Error ? s3Error.message : "Unknown S3 error";
      return NextResponse.json(
        { 
          error: "S3 upload failed",
          details: errorMessage,
          hint: "Check AWS credentials and bucket permissions in Vercel environment variables"
        },
        { status: 500 }
      );
    }

    // Create asset record
    const asset = await prisma.asset.create({
      data: {
        lessonId,
        filename: file.name,
        url: url,
        size: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to upload file",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json({ error: "No assetId provided" }, { status: 400 });
    }

    // Get asset
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Delete from S3
    try {
      await deleteFromS3ByUrl(asset.url);
    } catch (s3Error) {
      console.error("S3 delete error:", s3Error);
      // Continue with database deletion even if S3 delete fails
    }

    // Delete asset record
    await prisma.asset.delete({
      where: { id: assetId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
