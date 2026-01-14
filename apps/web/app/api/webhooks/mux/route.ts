import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

// Disable body parsing - we need raw body for signature verification
export const runtime = "nodejs";

// Verify Mux webhook signature manually
function verifyMuxSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Mux signature format: t=timestamp,v1=signature
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
    const sigHash = parts.find((p) => p.startsWith("v1="))?.slice(3);

    if (!timestamp || !sigHash) {
      return false;
    }

    // Create expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    // Use timing-safe comparison
    return timingSafeEqual(
      Buffer.from(sigHash),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("mux-signature");

    console.log("[Mux Webhook] ========== NEW REQUEST ==========");
    console.log("[Mux Webhook] Timestamp:", new Date().toISOString());
    console.log("[Mux Webhook] Has signature:", !!signature);

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const isValid = verifyMuxSignature(body, signature, webhookSecret);
      console.log("[Mux Webhook] Signature verification:", isValid ? "✅ VALID" : "❌ INVALID");
      
      if (!isValid) {
        console.error("[Mux Webhook] ❌ Signature verification failed - rejecting webhook");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    } else if (webhookSecret && !signature) {
      console.warn("[Mux Webhook] ⚠️ Secret configured but no signature in request - allowing anyway");
    } else {
      console.log("[Mux Webhook] No webhook secret configured - processing without verification");
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    console.log(`[Mux Webhook] Event type: ${type}`);
    console.log(`[Mux Webhook] Event data:`, JSON.stringify(data, null, 2));

    switch (type) {
      case "video.asset.ready": {
        // Video has finished processing and is ready for playback
        const { id: assetId, playback_ids, duration, passthrough } = data;

        console.log(`[Mux Webhook] video.asset.ready - asset_id: ${assetId}, duration: ${duration}`);
        console.log(`[Mux Webhook] playback_ids:`, JSON.stringify(playback_ids));

        if (!passthrough) {
          console.log("[Mux Webhook] No passthrough data, skipping...");
          return NextResponse.json({ received: true });
        }

        let lessonId: string;
        try {
          const metadata = JSON.parse(passthrough);
          lessonId = metadata.lessonId;
          console.log(`[Mux Webhook] Parsed lessonId: ${lessonId}`);
        } catch (error) {
          console.error("[Mux Webhook] Failed to parse passthrough:", passthrough, error);
          return NextResponse.json({ received: true });
        }

        if (!lessonId) {
          console.log("[Mux Webhook] No lessonId in passthrough, skipping...");
          return NextResponse.json({ received: true });
        }

        // Get the signed playback ID
        const signedPlaybackId = playback_ids?.find(
          (p: { policy: string }) => p.policy === "signed"
        )?.id;

        console.log(`[Mux Webhook] Found signed playback ID: ${signedPlaybackId}`);

        if (!signedPlaybackId) {
          console.error("[Mux Webhook] ❌ No signed playback ID found for asset:", assetId);
          console.error("[Mux Webhook] Available playback_ids:", playback_ids);
          return NextResponse.json({ received: true });
        }

        // Update the lesson with video information
        const updatedLesson = await prisma.lesson.update({
          where: { id: lessonId },
          data: {
            muxAssetId: assetId,
            muxPlaybackId: signedPlaybackId,
            videoDuration: Math.round(duration || 0),
          },
        });

        console.log(`[Mux Webhook] ✅ Updated lesson ${lessonId} with video: ${assetId}`);
        console.log(`[Mux Webhook] ✅ Playback ID: ${signedPlaybackId}, Duration: ${Math.round(duration || 0)}s`);
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

        console.log(`[Mux Webhook] video.upload.asset_created - asset_id: ${asset_id}`);
        console.log(`[Mux Webhook] passthrough:`, passthrough);

        if (!passthrough) {
          console.log("[Mux Webhook] No passthrough data, skipping");
          return NextResponse.json({ received: true });
        }

        let lessonId: string;
        try {
          const metadata = JSON.parse(passthrough);
          lessonId = metadata.lessonId;
          console.log(`[Mux Webhook] Parsed lessonId: ${lessonId}`);
        } catch (error) {
          console.error("[Mux Webhook] Failed to parse passthrough:", error);
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
          console.log(`[Mux Webhook] ✅ Updated lesson ${lessonId} with asset ${asset_id} (processing)`);
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
