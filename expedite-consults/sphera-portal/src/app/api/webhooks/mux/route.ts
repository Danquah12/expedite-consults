import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pusherServer, pusherChannels, pusherEvents } from "@/lib/pusher";

// POST /api/webhooks/mux — Mux video lifecycle webhook
export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const eventType = event.type; // e.g. "video.asset.ready", "video.asset.errored"
    const asset = event.data;

    if (!asset?.id) {
      return NextResponse.json({ received: true });
    }

    if (eventType === "video.asset.ready") {
      const playbackId = asset.playback_ids?.[0]?.id;
      const duration = Math.round(asset.duration || 0);

      // Find and update video record by muxAssetId
      const video = await db.video.findFirst({
        where: { muxAssetId: asset.id },
      });

      if (video) {
        await db.video.update({
          where: { id: video.id },
          data: {
            muxPlaybackId: playbackId,
            thumbnailUrl: playbackId
              ? `https://image.mux.com/${playbackId}/thumbnail.jpg`
              : video.thumbnailUrl,
            duration: duration || video.duration,
            status: "ready",
          },
        });

        // Broadcast real-time update
        await pusherServer
          .trigger(
            pusherChannels.postUpdates(video.id),
            "video-ready",
            { videoId: video.id, playbackId, status: "ready" }
          )
          .catch(() => {});
      }
    } else if (eventType === "video.asset.errored") {
      const video = await db.video.findFirst({
        where: { muxAssetId: asset.id },
      });

      if (video) {
        await db.video.update({
          where: { id: video.id },
          data: { status: "failed" },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/webhooks/mux]", error);
    return NextResponse.json({ success: false, error: "Webhook handler error" }, { status: 500 });
  }
}
