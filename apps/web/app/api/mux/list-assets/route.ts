import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { video } from "@/lib/mux";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // List all Mux assets
    const muxAssets = await video.assets.list({ limit: 100 });
    
    // Get all lessons with Mux assets
    const lessonsWithVideo = await prisma.lesson.findMany({
      where: {
        muxAssetId: { not: null }
      },
      select: {
        id: true,
        title: true,
        muxAssetId: true,
        muxPlaybackId: true,
        module: {
          select: {
            title: true,
          }
        }
      }
    });

    // Map lesson IDs to titles for easy lookup
    const lessonMap = new Map(
      lessonsWithVideo.map(l => [l.muxAssetId, {
        lessonId: l.id,
        title: `${l.module.title} → ${l.title}`,
        hasPlaybackId: !!l.muxPlaybackId,
      }])
    );

    // Categorize assets
    const assets = muxAssets.data.map((asset: any) => {
      const lessonInfo = lessonMap.get(asset.id);
      return {
        assetId: asset.id,
        status: asset.status,
        duration: asset.duration,
        createdAt: asset.created_at,
        playbackIds: asset.playback_ids?.length || 0,
        isLinkedToLesson: !!lessonInfo,
        lessonTitle: lessonInfo?.title || "Not linked to any lesson",
        lessonId: lessonInfo?.lessonId,
        canDelete: !lessonInfo || !lessonInfo.hasPlaybackId, // Can delete if not linked or lesson doesn't have playback ID
      };
    });

    const orphanedAssets = assets.filter(a => !a.isLinkedToLesson);
    const linkedAssets = assets.filter(a => a.isLinkedToLesson);

    return NextResponse.json({
      totalAssets: muxAssets.data.length,
      planLimit: 10,
      remaining: 10 - muxAssets.data.length,
      linkedAssets,
      orphanedAssets, // These can be safely deleted
      allAssets: assets,
    });
  } catch (error: any) {
    console.error("[Mux] List assets error:", error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
