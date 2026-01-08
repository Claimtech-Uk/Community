import { prisma } from "@/lib/prisma";

// ============================================
// TYPES
// ============================================

export interface CreateAssetInput {
  lessonId: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Get all assets for a lesson
 */
export async function getAssetsByLessonId(lessonId: string) {
  return prisma.asset.findMany({
    where: { lessonId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          moduleId: true,
        },
      },
    },
  });
}

/**
 * Create a new asset
 */
export async function createAsset(data: CreateAssetInput) {
  return prisma.asset.create({
    data: {
      lessonId: data.lessonId,
      filename: data.filename,
      url: data.url,
      size: data.size,
      mimeType: data.mimeType,
    },
  });
}

/**
 * Delete an asset
 * Note: Should also delete from Vercel Blob storage
 */
export async function deleteAsset(id: string) {
  return prisma.asset.delete({
    where: { id },
  });
}

/**
 * Delete multiple assets by lesson ID
 */
export async function deleteAssetsByLessonId(lessonId: string) {
  return prisma.asset.deleteMany({
    where: { lessonId },
  });
}

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Get assets for a published lesson
 */
export async function getPublishedLessonAssets(lessonId: string) {
  // First verify the lesson is published
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, published: true },
    select: { id: true },
  });

  if (!lesson) {
    return [];
  }

  return prisma.asset.findMany({
    where: { lessonId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      url: true,
      size: true,
      mimeType: true,
    },
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get file type icon based on mime type
 */
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "spreadsheet";
  if (mimeType.includes("document") || mimeType.includes("word")) return "document";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "presentation";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "archive";
  return "file";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validate file type against allowed types
 */
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // Spreadsheets
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    // Presentations
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Archives
    "application/zip",
    "application/x-zip-compressed",
    // Text
    "text/plain",
    "text/markdown",
    // Code
    "application/json",
    "text/javascript",
    "text/typescript",
  ];

  return allowedTypes.includes(mimeType);
}
