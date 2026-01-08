import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import { prisma } from "@/lib/prisma";

// Disable body parsing - we need raw body for signature verification
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("mux-signature");

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      try {
        // Verify the webhook signature
        Mux.Webhooks.verifySignature(body, {
          "mux-signature": signature,
        }, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    console.log(`Mux webhook received: ${type}`);

    switch (type) {
      case "video.asset.ready": {
        // Video has finished processing and is ready for playback
        const { id: assetId, playback_ids, duration, passthrough } = data;

        if (!passthrough) {
          console.log("No passthrough data, skipping...");
          return NextResponse.json({ received: true });
        }

        let lessonId: string;
        try {
          const metadata = JSON.parse(passthrough);
          lessonId = metadata.lessonId;
        } catch {
          console.error("Failed to parse passthrough:", passthrough);
          return NextResponse.json({ received: true });
        }

        if (!lessonId) {
          console.log("No lessonId in passthrough, skipping...");
          return NextResponse.json({ received: true });
        }

        // Get the signed playback ID
        const signedPlaybackId = playback_ids?.find(
          (p: { policy: string }) => p.policy === "signed"
        )?.id;

        if (!signedPlaybackId) {
          console.error("No signed playback ID found for asset:", assetId);
          return NextResponse.json({ received: true });
        }

        // Update the lesson with video information
        await prisma.lesson.update({
          where: { id: lessonId },
          data: {
            muxAssetId: assetId,
            muxPlaybackId: signedPlaybackId,
            videoDuration: Math.round(duration || 0),
          },
        });

        console.log(`Updated lesson ${lessonId} with video: ${assetId}`);
        break;
      }

      case "video.asset.errored": {
        // Video processing failed
        const { passthrough, errors } = data;
        console.error("Video asset errored:", errors);

        if (passthrough) {
          try {
            const metadata = JSON.parse(passthrough);
            const lessonId = metadata.lessonId;
            
            if (lessonId) {
              // Clear any partial video data
              await prisma.lesson.update({
                where: { id: lessonId },
                data: {
                  muxAssetId: null,
                  muxPlaybackId: null,
                  videoDuration: null,
                },
              });
              console.log(`Cleared video data for lesson ${lessonId} due to error`);
            }
          } catch {
            // Ignore parse errors
          }
        }
        break;
      }

      case "video.upload.asset_created": {
        // Upload completed, asset is being created
        // We store the asset ID so we can track processing status
        const { asset_id, passthrough } = data;

        if (!passthrough) {
          return NextResponse.json({ received: true });
        }

        let lessonId: string;
        try {
          const metadata = JSON.parse(passthrough);
          lessonId = metadata.lessonId;
        } catch {
          return NextResponse.json({ received: true });
        }

        if (lessonId && asset_id) {
          // Store the asset ID to track processing
          await prisma.lesson.update({
            where: { id: lessonId },
            data: {
              muxAssetId: asset_id,
              // Clear playback ID until processing is complete
              muxPlaybackId: null,
            },
          });
          console.log(`Lesson ${lessonId} video upload started, asset: ${asset_id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
