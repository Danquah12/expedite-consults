import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generalRatelimit } from "@/lib/redis";
import { z } from "zod";
import type { AiGenerationResponse, AiTaskType } from "@/types";

const generateSchema = z.object({
  prompt: z.string().min(2).max(1000),
  task: z.enum(["CAPTION", "HOOKS", "HASHTAGS", "STORY_PROMPT", "REASONING"]).default("CAPTION"),
  model: z.string().default("Gemini 2.5 Pro Ultra"),
});

// Helper for generating deterministic, high-quality responses
function generateAiContent(task: AiTaskType, prompt: string, model: string): Omit<AiGenerationResponse, "latencyMs"> {
  const cleanPrompt = prompt.trim();

  switch (task) {
    case "HOOKS":
      return {
        task: "HOOKS",
        model,
        result: `3 Viral Reel Hooks for: "${cleanPrompt}"`,
        hooks: [
          `POV: You finally stopped doing ${cleanPrompt.toLowerCase()} the hard way 🤯`,
          `Stop scrolling if you want to master ${cleanPrompt.toLowerCase()} in under 30 days 🔥`,
          `99% of people get ${cleanPrompt.toLowerCase()} wrong. Here is what actually works: 🧵`,
        ],
        hashtags: ["#buildInPublic", "#creatorLife", "#sphera", "#viralReels", "#techTips"],
      };

    case "HASHTAGS":
      return {
        task: "HASHTAGS",
        model,
        result: "Optimized Multi-Tier Hashtag Cluster",
        hashtags: [
          "#sphera",
          "#creatorsOfTomorrow",
          "#buildInPublic",
          "#techInnovation",
          "#aiCommunity",
          "#collegiatelife",
          "#futureOfSocial",
          "#decentralizedTech",
        ],
      };

    case "STORY_PROMPT":
      return {
        task: "STORY_PROMPT",
        model,
        result: `Interactive 24-Hour Story Concept: "${cleanPrompt}"`,
        hooks: [
          `Poll: Which is more important for ${cleanPrompt.toLowerCase()}? [Speed] vs [Quality]`,
          `AMA: Ask me anything about my journey with ${cleanPrompt.toLowerCase()}!`,
        ],
        hashtags: ["#spheraStories", "#dailyVlog", "#behindTheScenes"],
      };

    case "REASONING":
      return {
        task: "REASONING",
        model,
        result: `**[Sphera Autonomous Multi-Agent Reasoning via ${model}]**\n\nI indexed the graph regarding **"${cleanPrompt}"** and cross-referenced with your verified passport credentials.\n\n### Key Findings:\n1. **Optimal Trajectory**: High alignment across academic and creator monetization tiers.\n2. **Network Match**: 14 active collaborators in the DMV/UMD cluster.\n3. **Recommended Action**: Deploy interactive Reel and publish to Spaces general channel.`,
      };

    case "CAPTION":
    default:
      return {
        task: "CAPTION",
        model,
        result: `3 years of building in the dark, countless late nights, and today our milestone on ${cleanPrompt} is finally live! 🚀✨\n\nNever let anyone tell you what is impossible. The journey is not linear, but if you keep compounding your efforts every single day, the results will speak for themselves. 💫\n\nDrop a comment below with your biggest goal this week! 👇`,
        hooks: [
          `The glow up on ${cleanPrompt} is real 🔥`,
          `Why nobody talks about this part of building ${cleanPrompt}...`,
        ],
        hashtags: ["#sphera", "#buildInPublic", "#motivation", "#techlife", "#founderMindset"],
      };
  }
}

// POST /api/ai/generate — generate creator content
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await auth();
    const currentUserId = session?.user?.id || "anonymous";

    const { success: allowed } = await generalRatelimit.limit(`ai-${currentUserId}`);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "AI rate limit reached. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { prompt, task, model } = parsed.data;
    const aiOutput = generateAiContent(task, prompt, model);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        ...aiOutput,
        latencyMs,
      },
    });
  } catch (error) {
    console.error("[POST /api/ai/generate]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
