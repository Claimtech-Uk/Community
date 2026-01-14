import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { video } from "@/lib/mux";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "assetId required" }, { status: 400 });
    }

    // Check if asset is linked to a lesson
    const lesson = await prisma.lesson.findFirst({
      where: { muxAssetId: assetId },
      select: { id: true, title: true }
    });

    // Delete from Mux
    await video.assets.delete(assetId);
    console.log(`[Mux] Deleted asset: ${assetId}`);

    // If linked to lesson, clear the reference
    if (lesson) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          muxAssetId: null,
          muxPlaybackId: null,
          videoDuration: null,
        }
      });
      console.log(`[Mux] Cleared video from lesson: ${lesson.title}`);
    }

    return NextResponse.json({
      success: true,
      deletedAssetId: assetId,
      wasLinkedToLesson: !!lesson,
      lessonTitle: lesson?.title,
    });
  } catch (error: any) {
    console.error("[Mux] Delete asset error:", error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
