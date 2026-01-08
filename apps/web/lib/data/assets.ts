import { prisma } from "@/lib/prisma";

// ===========================================
// ASSET CRUD OPERATIONS
// ===========================================

/**
 * Create a new asset attached to a lesson
 */
export async function createAsset(data: {
  lessonId: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}) {
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
 * Get a single asset by ID
 */
export async function getAsset(id: string) {
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
 * Get all assets for a lesson
 */
export async function getAssetsByLesson(lessonId: string) {
  return prisma.asset.findMany({
    where: { lessonId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Delete an asset
 */
export async function deleteAsset(id: string) {
  return prisma.asset.delete({
    where: { id },
  });
}

/**
 * Delete all assets for a lesson
 */
export async function deleteAssetsByLesson(lessonId: string) {
  return prisma.asset.deleteMany({
    where: { lessonId },
  });
}

/**
 * Get total storage used by assets (in bytes)
 */
export async function getTotalAssetSize() {
  const result = await prisma.asset.aggregate({
    _sum: { size: true },
  });
  return result._sum.size ?? 0;
}

/**
 * Get asset count
 */
export async function getAssetCount() {
  return prisma.asset.count();
}

/**
 * Get asset count by mime type
 */
export async function getAssetCountByType() {
  const assets = await prisma.asset.groupBy({
    by: ["mimeType"],
    _count: true,
  });

  return assets.reduce(
    (acc, curr) => {
      acc[curr.mimeType] = curr._count;
      return acc;
    },
    {} as Record<string, number>
  );
}
