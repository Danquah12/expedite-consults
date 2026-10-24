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
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type HallTo =
  | "/"
  | "/home"
  | "/learn"
  | "/reels"
  | "/music"
  | "/news"
  | "/study"
  | "/hub"
  | "/battle"
  | "/paths"
  | "/hall"
  | "/openings"
  | "/ledger"
  | "/campus"
  | "/you"
  | "/market"
  | "/noctis"
  | "/start"
  | "/work";

export type HallTab = {
  to: HallTo;
  label: string;
  blurb: string;
  icon: LucideIcon;
  hash?: string;
};

export type HallArea = {
  id: "home" | "vibe" | "noctis" | "discover" | "learn" | "work" | "profile";
  label: string;
  purpose: string;
  to: HallTo;
  icon: LucideIcon;
  tabs: HallTab[];
};

/** The product is a personal growth system. Vibe is the intelligence. Home is the journey. */
export const HALL_AREAS: HallArea[] = [
  {
    id: "home",
    label: "Journey",
    purpose: "Personal dashboard",
    to: "/start",
    icon: House,
    tabs: [{ to: "/home", label: "My Journey", blurb: "Goals, progress, and what to do today", icon: House }],
  },
  {
    id: "vibe",
    label: "Noctis",
    purpose: "Personal intelligence",
    to: "/noctis",
    icon: Sparkles,
    tabs: [{ to: "/noctis", label: "Noctis", blurb: "Chat, research, roadmaps, and a source check", icon: Sparkles }],
  },
  {
    id: "discover",
    label: "Discover",
    purpose: "Find things",
    to: "/reels",
    icon: Clapperboard,
    tabs: [
      { to: "/", label: "Academy", blurb: "Discover, practice, and apply. Hall holds the films. Classroom is the practice.", icon: GraduationCap },
      { to: "/reels", label: "Reels", blurb: "Short clips by hall", icon: Clapperboard },
      { to: "/news", label: "News & Analysis", blurb: "The story, why it matters, and what to study next", icon: Radio },
      { to: "/music", label: "Music", blurb: "Songs", icon: Music2 },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    purpose: "Learn things",
    to: "/learn",
    icon: BookOpen,
    tabs: [
      { to: "/learn", label: "Learn with Noctis", blurb: "Continue your journey, video, slides, practice, and Noctis", icon: BookOpen },
      { to: "/hall", label: "Hall", blurb: "Content library. The films", icon: BookOpen },
      { to: "/study", label: "Lessons", blurb: "Individual courses", icon: BookOpen },
      { to: "/campus", label: "Knowledge", blurb: "Reference. Articles, facts, and sources", icon: BookMarked },
      { to: "/hub", label: "Hub", blurb: "Courses, range, academies", icon: Library },
      { to: "/paths", label: "Paths", blurb: "Roadmaps. A sequence, not another library", icon: Route },
    ],
  },
  {
    id: "work",
    label: "Work",
    purpose: "Advance a career",
    to: "/openings",
    icon: Compass,
    tabs: [
      { to: "/openings", label: "Career", blurb: "What to pursue, and the next step", icon: Compass },
      { to: "/market", label: "Resources", blurb: "What you use to learn, certify, and grow", icon: Wrench },
      { to: "/you", label: "Proof", blurb: "What you can verify.", icon: ScrollText, hash: "proof" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    purpose: "You",
    to: "/you",
    icon: User,
    tabs: [{ to: "/you", label: "Profile", blurb: "Your record", icon: User }],
  },
];

export const HALL_GROUPS: { label: string; tabs: HallTab[] }[] = HALL_AREAS.map((area) => ({
  label: area.label,
  tabs: area.tabs,
}));

export const HALL_TABS: HallTab[] = HALL_GROUPS.flatMap((group) => group.tabs);

export const STUDY_WING: HallTab[] = HALL_AREAS.find((area) => area.id === "learn")?.tabs ?? [];

export const MOBILE_TABS: HallTab[] = HALL_AREAS.map((area) => ({
  to: area.to,
  label: area.label,
  blurb: area.purpose,
  icon: area.icon,
}));

export function areaFor(path: string) {
  return HALL_AREAS.find((area) => areaIsActive(path, area.id));
}

export function areaIsActive(path: string, id: HallArea["id"]) {
  if (id === "home") return path === "/home" || path === "/start";
  if (id === "vibe" || id === "noctis") return path === "/noctis" || path.startsWith("/noctis/");
  if (id === "discover") return path === "/" || path === "/reels" || path.startsWith("/reels/") || path === "/news" || path.startsWith("/news/") || path === "/music" || path.startsWith("/music/");
  if (id === "learn") {
    return (
      path === "/learn" ||
      path.startsWith("/learn/") ||
      path === "/study" ||
      path.startsWith("/study/") ||
      path === "/campus" ||
      path.startsWith("/campus/") ||
      path === "/hub" ||
      path.startsWith("/hub/") ||
      path === "/paths" ||
      path.startsWith("/paths/") ||
      path === "/battle" ||
      path.startsWith("/battle/") ||
      path === "/hall" ||
      path.startsWith("/hall/")
    );
  }
  if (id === "work") {
    return (
      path === "/work" ||
      path.startsWith("/work/") ||
      path === "/openings" ||
      path.startsWith("/openings/") ||
      path === "/market" ||
      path.startsWith("/market/") ||
      path === "/ledger" ||
      path.startsWith("/ledger/")
    );
  }
  return path === "/you" || path.startsWith("/you/") || path.startsWith("/u/");
}

export function primaryActive(path: string, to: HallTo) {
  const area = HALL_AREAS.find((item) => item.to === to);
  return area ? areaIsActive(path, area.id) : tabIsActive(path, to);
}

export function tabIsActive(path: string, to: HallTo, itemHash?: string, currentHash = "") {
  const here = currentHash.replace(/^#/, "");
  if (to === "/you") {
    if (itemHash === "proof") return path === "/you" && here === "proof";
    return (path === "/you" || path.startsWith("/u/")) && here !== "proof";
  }
  if (to === "/") return path === "/";
  if (to === "/study") return path === "/study" || path.startsWith("/study/") || path === "/battle" || path.startsWith("/battle/");
  return path === to || path.startsWith(`${to}/`);
}

export function wingIsActive(path: string, to: HallTo) {
  if (to === "/study") return path === "/study" || path.startsWith("/study/") || path === "/battle" || path.startsWith("/battle/");
  if (to === "/") return path === "/";
  return path === to || path.startsWith(`${to}/`);
}
