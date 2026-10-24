import type { IntentId } from "@/lib/learn";

export const INTENT_PAGES: Record<
  IntentId,
  { kicker: string; title: string; blurb: string; layout: "modules" | "jobs" | "lab" | "brief" | "rank" | "gallery" }
> = {
  learn: { kicker: "Clinics", title: "Watch a Spark. Pass a 60s drill.", blurb: "Entertainment is the hook. The stamp is the product.", layout: "modules" },
  academic: { kicker: "School", title: "The night before the quiz.", blurb: "Calc, CTF, and the board that finally made sense.", layout: "modules" },
  career: { kicker: "Labs", title: "Skills you can walk into a room with.", blurb: "PID that walked. Forensics that found the flag.", layout: "jobs" },
  ideas: { kicker: "Build", title: "Start something, then clinic it.", blurb: "A take is not a plan until it has a drill.", layout: "lab" },
  world: { kicker: "Why", title: "The run, the stall, the hall.", blurb: "Campus literacy — what actually happened, and the teach-back.", layout: "brief" },
  creative: { kicker: "Make", title: "Harmattan light. Beat 3.", blurb: "Craft with a drill so the feed is not just a vibe.", layout: "gallery" },
  trending: { kicker: "Hot", title: "What the hall is watching.", blurb: "Sorted by eyes. Still a clinic if it earns a stamp.", layout: "rank" },
  fun: { kicker: "Hook", title: "The bounce, then the Echo.", blurb: "Laugh first. The last turn is still a spot.", layout: "gallery" },
};
