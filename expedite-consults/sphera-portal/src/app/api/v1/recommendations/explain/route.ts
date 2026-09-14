import { NextRequest, NextResponse } from "next/server";
import { feedStore } from "@/lib/feed-store";
import { getUserAffinities } from "@/lib/events/handlers/recommendation-handler";
import { scoreContentForUser } from "@/lib/recommendations/engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("contentId");
  const userId = searchParams.get("userId") || "kwesi";

  if (!contentId) {
    return NextResponse.json({ success: false, error: "contentId is required" }, { status: 400 });
  }

  const posts = feedStore.getPosts();
  const targetPost = posts.find((p) => p.id === contentId);

  if (!targetPost) {
    return NextResponse.json({
      success: true,
      explanation: {
        contentId,
        primaryReason: "Recommended based on overall network velocity and your cybersecurity interests.",
        matchedTopics: [{ name: "Cybersecurity", userAffinityScore: 85 }],
        socialSignals: [],
        recommendationScore: 72,
        transparencyTip: "SpheraNet gives you sovereign control to adjust your algorithm sliders anytime.",
      },
    });
  }

  const userProfile = getUserAffinities(userId);
  const { explanation } = scoreContentForUser(targetPost, userProfile, userId);

  return NextResponse.json({ success: true, explanation });
}
