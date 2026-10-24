import {
  BookMarked,
  BookOpen,
  Clapperboard,
  Compass,
  GraduationCap,
  House,
  Library,
  Music2,
  Radio,
  Route,
  ScrollText,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { HallTo } from "@/lib/hall-nav";

export const DOOR_IDS = ["vibe", "journey", "discover", "learn", "work", "more"] as const;
export type DoorId = (typeof DOOR_IDS)[number];

export type DoorItem = {
  to: HallTo;
  label: string;
  blurb: string;
  icon: LucideIcon;
  hash?: string;
};

export type Door = {
  id: Exclude<DoorId, "more">;
  label: string;
  blurb: string;
  icon: LucideIcon;
  items: DoorItem[];
};

export const DOORS: Door[] = [
  {
    id: "vibe",
    label: "Noctis",
    blurb: "Ask anything",
    icon: Sparkles,
    items: [{ to: "/noctis", label: "Ask Noctis", blurb: "Chat, research, and a lesson", icon: Sparkles }],
  },
  {
    id: "journey",
    label: "Journey",
    blurb: "Today and your goals",
    icon: House,
    items: [{ to: "/home", label: "My Journey", blurb: "Where you are, and the next move", icon: House }],
  },
  {
    id: "discover",
    label: "Discover",
    blurb: "Films, news, and reels",
    icon: Clapperboard,
    items: [
      { to: "/", label: "Academy", blurb: "Discover, practice, and apply", icon: GraduationCap, hash: "feed" },
      { to: "/reels", label: "Reels", blurb: "Short clips by hall", icon: Clapperboard },
      { to: "/news", label: "News & Analysis", blurb: "The story, and what to study next", icon: Radio },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    blurb: "Hall, lessons, paths",
    icon: BookOpen,
    items: [
      { to: "/learn", label: "Learn with Noctis", blurb: "Continue your journey, video, slides, and practice", icon: BookOpen },
      { to: "/hall", label: "Hall", blurb: "The films", icon: BookOpen },
      { to: "/study", label: "Lessons", blurb: "Courses and practice", icon: BookOpen },
      { to: "/paths", label: "Paths", blurb: "A sequence, not another library", icon: Route },
    ],
  },
  {
    id: "work",
    label: "Work",
    blurb: "Career and proof",
    icon: Compass,
    items: [
      { to: "/openings", label: "Career", blurb: "What to pursue, and the next step", icon: Compass },
      { to: "/you", label: "Proof", blurb: "What you can verify", icon: ScrollText, hash: "proof" },
    ],
  },
];

export const MORE_DOOR: { id: "more"; label: string; blurb: string; items: DoorItem[] } = {
  id: "more",
  label: "More",
  blurb: "The rest of Noctis",
  items: [
    { to: "/music", label: "Music", blurb: "Songs", icon: Music2 },
    { to: "/campus", label: "Knowledge", blurb: "Articles, facts, and sources", icon: BookMarked },
    { to: "/hub", label: "Hub", blurb: "Courses, range, and academies", icon: Library },
    { to: "/market", label: "Resources", blurb: "What you use to learn and certify", icon: Wrench },
  ],
};

export function isDoorId(value: unknown): value is DoorId {
  return typeof value === "string" && (DOOR_IDS as readonly string[]).includes(value);
}

const DOOR_KEY = "vibe-door";

export function rememberDoor(id: DoorId) {
  try {
    sessionStorage.setItem(DOOR_KEY, id);
  } catch {
    /* private mode can block the store */
  }
}

export function forgetDoor() {
  try {
    sessionStorage.removeItem(DOOR_KEY);
  } catch {
    /* private mode can block the store */
  }
}

export function rememberedDoor(): DoorId | undefined {
  try {
    const value = sessionStorage.getItem(DOOR_KEY);
    return isDoorId(value) ? value : undefined;
  } catch {
    return undefined;
  }
}
