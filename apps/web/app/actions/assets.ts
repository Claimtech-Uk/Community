"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createAsset as createAssetData,
  deleteAsset as deleteAssetData,
  deleteAssetsByLesson as deleteAssetsByLessonData,
} from "@/lib/data";

/**
 * Server action to create a new asset
 * Requires ADMIN role
 */
export async function createAssetAction(data: {
  lessonId: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (!data.lessonId) {
    return { error: "Lesson ID is required" };
  }

  if (!data.filename || data.filename.trim().length === 0) {
    return { error: "Filename is required" };
  }

  if (!data.url) {
    return { error: "URL is required" };
  }

  if (!data.mimeType) {
    return { error: "MIME type is required" };
  }

  try {
    const asset = await createAssetData({
      lessonId: data.lessonId,
      filename: data.filename.trim(),
      url: data.url,
      size: data.size,
      mimeType: data.mimeType,
    });

    revalidatePath(`/admin/content/lessons/${data.lessonId}`);
    return { success: true, asset };
  } catch (error) {
    console.error("Failed to create asset:", error);
    return { error: "Failed to create asset" };
  }
}

/**
 * Server action to delete an asset
 * Requires ADMIN role
 */
export async function deleteAssetAction(id: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await deleteAssetData(id);

    revalidatePath("/admin/content");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete asset:", error);
    return { error: "Failed to delete asset" };
  }
}

/**
 * Server action to delete all assets for a lesson
 * Requires ADMIN role
 */
export async function deleteAllLessonAssetsAction(lessonId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await deleteAssetsByLessonData(lessonId);

    revalidatePath(`/admin/content/lessons/${lessonId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete assets:", error);
    return { error: "Failed to delete assets" };
  }
}
