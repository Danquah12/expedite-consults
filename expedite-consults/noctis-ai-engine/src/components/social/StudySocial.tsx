import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Bookmark,
  Calendar,
  Clapperboard,
  Ellipsis,
  FileText,
  Flame,
  Grid3x3,
  GraduationCap,
  HelpCircle,
  Home,
  Image as ImageIcon,
  MessageCircle,
  MessageSquare,
  Music,
  Newspaper,
  Plus,
  Search,
  Share2,
  Smile,
  ThumbsUp,
  Trophy,
  Users,
  Video,
  X,
} from "lucide-react";
import { NoctisMark } from "@/components/brand/NoctisMark";
import { cn } from "@/lib/utils";

/*
 * Visual mockup only: every name, post and number below is sample data.
 * Palette and layout follow Facebook's web app:
 *   canvas #f0f2f5, card white, primary #1877f2, text #050505 / #65676b, hover #e4e6eb.
 *   Top bar (logo + search | 5 center tabs | action circles), left shortcuts rail,
 *   center column (stories, composer, feed), right rail (suggestions, events, contacts).
 */

const FB = {
  blue: "text-[#1877f2]",
  bgBlue: "bg-[#1877f2]",
  soft: "bg-[#e7f3ff]",
};
const HOVER = "hover:bg-[#e4e6eb]";
const CIRCLE = "grid size-10 shrink-0 place-items-center rounded-full bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]";

type PostKind = "question" | "note" | "resource" | "session";

export const GROUPS = [
  { id: "orgo", name: "Organic Chemistry Crew", members: 1280, color: "bg-emerald-500" },
  { id: "secplus", name: "CompTIA Security+ Sprint", members: 842, color: "bg-sky-500" },
  { id: "calc2", name: "Calculus II Survivors", members: 2310, color: "bg-violet-500" },
  { id: "mcat", name: "Med School MCAT Prep", members: 3950, color: "bg-rose-500" },
];

const STORIES = [
  { name: "Ama Boateng", tone: "from-amber-400 to-orange-600", initials: "AB", ring: "bg-amber-500" },
  { name: "Kofi Mensah", tone: "from-sky-400 to-indigo-600", initials: "KM", ring: "bg-sky-600" },
  { name: "Lena Park", tone: "from-emerald-400 to-teal-600", initials: "LP", ring: "bg-emerald-600" },
  { name: "Dev Patel", tone: "from-fuchsia-400 to-purple-600", initials: "DP", ring: "bg-fuchsia-600" },
];

export const POSTS: {
  id: number;
  author: string;
  initials: string;
  tone: string;
  group: string;
  time: string;
  kind: PostKind;
  title: string;
  body: string;
  likes: number;
  comments: number;
  shares: number;
}[] = [
  {
    id: 1,
    author: "Ama Boateng",
    initials: "AB",
    tone: "bg-amber-500",
    group: "Organic Chemistry Crew",
    time: "12m",
    kind: "question",
    title: "Can someone explain SN1 vs SN2 in one sentence?",
    body: "I keep mixing up when the nucleophile matters. Exam is Friday. Any trick that stuck for you?",
    likes: 48,
    comments: 23,
    shares: 3,
  },
  {
    id: 2,
    author: "Kofi Mensah",
    initials: "KM",
    tone: "bg-sky-600",
    group: "CompTIA Security+ Sprint",
    time: "1h",
    kind: "note",
    title: "Domain 3 cheat sheet: Security Architecture",
    body: "Zero trust, segmentation, defense in depth, and the 6 cloud shared-responsibility examples that always show up. 2 pages, free to copy.",
    likes: 212,
    comments: 41,
    shares: 67,
  },
  {
    id: 3,
    author: "Lena Park",
    initials: "LP",
    tone: "bg-emerald-600",
    group: "Calculus II Survivors",
    time: "3h",
    kind: "session",
    title: "Live study room tonight, 8 PM: Integration by parts",
    body: "We'll work 10 problems together, 25 minutes on, 5 off. Camera optional. Bring your hardest one.",
    likes: 96,
    comments: 12,
    shares: 9,
  },
  {
    id: 4,
    author: "Dev Patel",
    initials: "DP",
    tone: "bg-fuchsia-600",
    group: "Med School MCAT Prep",
    time: "Yesterday",
    kind: "resource",
    title: "Free MCAT psych/soc flashcard deck (600 cards)",
    body: "Built from my study notes over 3 months. Tagged by topic so you can drill weak spots.",
    likes: 530,
    comments: 88,
    shares: 140,
  },
];

const KIND_META: Record<PostKind, { label: string; icon: typeof HelpCircle; chip: string }> = {
  question: { label: "Question", icon: HelpCircle, chip: "bg-amber-100 text-amber-800" },
  note: { label: "Notes", icon: FileText, chip: "bg-sky-100 text-sky-800" },
  resource: { label: "Resource", icon: BookOpen, chip: "bg-emerald-100 text-emerald-800" },
  session: { label: "Study session", icon: Video, chip: "bg-violet-100 text-violet-800" },
};

const COURSES = [
  { title: "Security+ SY0-701 crash course", sub: "Free · 12 lessons", tone: "from-sky-400 to-indigo-600" },
  { title: "Calculus II: series and sequences", sub: "Free · 9 lessons", tone: "from-violet-400 to-purple-600" },
];

const EVENTS = [
  { title: "Integration by parts", when: "Tonight · 8:00 PM" },
  { title: "Network+ Ports Bootcamp", when: "Tomorrow · 6:30 PM" },
  { title: "Anki marathon", when: "Sat · 10:00 AM" },
];

const CONTACTS = [
  { name: "Ama Boateng", doing: "Orgo · 42 min", tone: "bg-amber-500", initials: "AB" },
  { name: "Kofi Mensah", doing: "Security+ · 1h 10m", tone: "bg-sky-600", initials: "KM" },
  { name: "Lena Park", doing: "Calc II · 18 min", tone: "bg-emerald-600", initials: "LP" },
  { name: "Zoe Rivers", doing: "Essay draft · 25 min", tone: "bg-rose-500", initials: "ZR" },
];

export function Avatar({ initials, tone, size = "size-10" }: { initials: string; tone: string; size?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full text-xs font-bold text-white", size, tone)}>
      {initials}
    </span>
  );
}

/** Facebook top bar: logo + search on the left, five center tabs, circular actions on the right. */
export function TopBar({ current = "home" }: { current?: "home" | "groups" | "rooms" | "none" }) {
  const navigate = useNavigate();
  const tabs = [
    { icon: Home, label: "Home", to: "/social", active: current === "home" },
    { icon: Clapperboard, label: "Reels", to: "/watch" },
    { icon: Users, label: "Groups", to: "/groups", active: current === "groups" },
    { icon: Video, label: "Study rooms", to: "/rooms", active: current === "rooms" },
    { icon: Trophy, label: "Leaderboard" },
  ] as const;
  return (
    <header className="sticky top-0 z-30 grid h-14 grid-cols-[auto_1fr_auto] items-center gap-2 bg-white px-3 shadow-[0_1px_2px_rgba(0,0,0,0.2)] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="flex min-w-0 items-center gap-2">
        <Link to="/social" className="shrink-0" title="noctis.social">
          <NoctisMark className="size-10" />
        </Link>
        <label className="flex h-10 min-w-0 items-center gap-2 rounded-full bg-[#f0f2f5] px-3 text-[#65676b] md:w-60">
          <Search className="size-4 shrink-0" />
          <input
            placeholder="Search noctis"
            onKeyDown={(e) => {
              if (e.key === "Enter") void navigate({ to: "/search", search: { q: e.currentTarget.value } });
            }}
            className="hidden min-w-0 flex-1 bg-transparent text-[15px] text-[#050505] outline-none placeholder:text-[#65676b] sm:block"
          />
        </label>
      </div>
      <nav className="hidden h-full items-stretch gap-1 md:flex">
        {tabs.map((t) => {
          const Icon = t.icon;
          const inner = (
            <>
              <span className={cn("grid h-10 w-24 place-items-center rounded-lg", t.active ? FB.blue : `text-[#65676b] ${HOVER}`)}>
                <Icon className="size-6" />
              </span>
              {t.active ? <span className={cn("absolute inset-x-1 bottom-0 h-[3px] rounded-t", FB.bgBlue)} /> : null}
            </>
          );
          const cls = "relative flex items-center";
          return "to" in t && t.to ? (
            <Link key={t.label} to={t.to} title={t.label} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={t.label} title={t.label} className={cls}>
              {inner}
            </button>
          );
        })}
      </nav>
      <div className="flex items-center justify-end gap-2">
        <button className={cn(CIRCLE, "hidden sm:grid")} title="Menu">
          <Grid3x3 className="size-5" />
        </button>
        <Link to="/messages" className={CIRCLE} title="Messenger">
          <MessageCircle className="size-5" />
        </Link>
        <Link to="/notifications" className={cn(CIRCLE, "relative")} title="Notifications">
          <Bell className="size-5" />
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#e41e3f] px-1 text-[11px] font-bold text-white">
            3
          </span>
        </Link>
        <Link to="/me" title="Your profile">
          <Avatar initials="YOU" tone="bg-[#1c1e21]" />
        </Link>
      </div>
    </header>
  );
}

function RailRow({ icon: Icon, label, to, tone = FB.blue }: { icon: typeof Home; label: string; to: string; tone?: string }) {
  return (
    <Link to={to} className={cn("flex items-center gap-3 rounded-lg p-2", HOVER)}>
      <Icon className={cn("size-7", tone)} />
      <span className="text-[15px] font-medium text-[#050505]">{label}</span>
    </Link>
  );
}

/** Facebook left rail: profile first, then shortcuts, then "Your groups". */
export function LeftRail() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[300px] shrink-0 overflow-y-auto p-2 pt-4 lg:block">
      <Link to="/me" className={cn("flex items-center gap-3 rounded-lg p-2", HOVER)}>
        <Avatar initials="YOU" tone="bg-[#1c1e21]" />
        <span className="text-[15px] font-medium text-[#050505]">Your profile</span>
      </Link>
      <RailRow icon={Users} label="Study groups" to="/groups" />
      <RailRow icon={GraduationCap} label="Courses" to="/courses" />
      <RailRow icon={Clapperboard} label="Reels" to="/watch" tone="text-[#e41e3f]" />
      <RailRow icon={Trophy} label="Certifications" to="/certs" tone="text-[#1877f2]" />
      <RailRow icon={Calendar} label="Study sessions" to="/rooms" tone="text-[#f7b928]" />
      <RailRow icon={Bookmark} label="Saved notes" to="/you" tone="text-[#a033ff]" />
      <RailRow icon={Newspaper} label="Study news" to="/updates" />
      <RailRow icon={Trophy} label="Jobs" to="/jobs" tone="text-[#45bd62]" />
      <RailRow icon={Bookmark} label="Marketplace" to="/marketplace" tone="text-[#f3425f]" />
      <RailRow icon={Music} label="Focus music" to="/focus" tone="text-[#2abba7]" />
      <div className="flex items-center gap-3 rounded-lg p-2">
        <Flame className="size-7 text-orange-500" />
        <span className="text-[15px] font-medium text-[#050505]">7-day study streak</span>
      </div>
      <hr className="my-2 ml-2 border-[#ced0d4]" />
      <p className="px-2 pb-1 text-[17px] font-semibold text-[#65676b]">Your groups</p>
      {GROUPS.map((g) => (
        <button key={g.name} className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", HOVER)}>
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold text-white", g.color)}>
            {g.name[0]}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium text-[#050505]">{g.name}</span>
            <span className="text-xs text-[#65676b]">{g.members.toLocaleString()} members</span>
          </span>
        </button>
      ))}
    </aside>
  );
}

/** Facebook stories row: "Create story" card first, then 9:16 cards with a ringed avatar. */
function Stories() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      <Link to="/reels" className="relative flex h-52 flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
        <div className="grid flex-1 place-items-center bg-[#e4e6eb] text-[#65676b]">
          <Clapperboard className="size-10" />
        </div>
        <div className="relative px-2 pb-2 pt-6 text-center text-[13px] font-semibold text-[#050505]">
          <span className={cn("absolute -top-4 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full border-4 border-white text-white", FB.bgBlue)}>
            <Plus className="size-4" />
          </span>
          Create reel
        </div>
      </Link>
      {STORIES.map((s, i) => (
        <Link
          key={s.name}
          to="/reels"
          className={cn("relative flex h-52 items-end rounded-xl bg-gradient-to-b p-2 shadow-[0_1px_2px_rgba(0,0,0,0.2)]", s.tone, i === 3 && "hidden sm:flex")}
        >
          <span className={cn("absolute left-2 top-2 grid size-10 place-items-center rounded-full border-4 border-[#1877f2] text-xs font-bold text-white", s.ring)}>
            {s.initials}
          </span>
          <span className="text-[13px] font-semibold text-white drop-shadow">{s.name}</span>
        </Link>
      ))}
    </div>
  );
}

/** Facebook composer: avatar + prompt pill, divider, three actions (Live, Photo, Feeling). */
export function Composer() {
  return (
    <section className="rounded-lg bg-white p-3 pb-2 shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-2">
        <Avatar initials="YOU" tone="bg-[#1c1e21]" />
        <button className="h-10 min-w-0 flex-1 truncate rounded-full bg-[#f0f2f5] px-4 text-left text-[17px] text-[#65676b] hover:bg-[#e4e6eb]">
          What are you studying today?
        </button>
      </div>
      <hr className="my-3 border-[#ced0d4]" />
      <div className="grid grid-cols-3">
        <button className={cn("flex items-center justify-center gap-2 rounded-lg py-2 text-[15px] font-semibold text-[#65676b]", HOVER)}>
          <Video className="size-6 text-[#f3425f]" /> <span className="hidden sm:inline">Live study room</span>
          <span className="sm:hidden">Live</span>
        </button>
        <button className={cn("flex items-center justify-center gap-2 rounded-lg py-2 text-[15px] font-semibold text-[#65676b]", HOVER)}>
          <ImageIcon className="size-6 text-[#45bd62]" /> <span className="hidden sm:inline">Notes / photo</span>
          <span className="sm:hidden">Notes</span>
        </button>
        <button className={cn("flex items-center justify-center gap-2 rounded-lg py-2 text-[15px] font-semibold text-[#65676b]", HOVER)}>
          <Smile className="size-6 text-[#f7b928]" /> <span className="hidden sm:inline">Subject / mood</span>
          <span className="sm:hidden">Mood</span>
        </button>
      </div>
    </section>
  );
}

/** Facebook post card: header with ... and X, text, counts, Like/Comment/Share bar, comment box. */
export function Post({ post }: { post: (typeof POSTS)[number] }) {
  const [liked, setLiked] = useState(false);
  const meta = KIND_META[post.kind];
  const Icon = meta.icon;
  const action = cn("flex items-center justify-center gap-2 rounded-md py-2 text-[15px] font-semibold text-[#65676b]", HOVER);
  return (
    <article className="rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
      <header className="flex items-start gap-2 p-3 pb-2">
        <Avatar initials={post.initials} tone={post.tone} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight text-[#050505]">
            {post.author} <span className="font-normal text-[#65676b]">› {post.group}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#65676b]">
            {post.time}
            <span className={cn("flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold", meta.chip)}>
              <Icon className="size-3" />
              {meta.label}
            </span>
          </p>
        </div>
        <button className={cn("grid size-8 place-items-center rounded-full text-[#65676b]", HOVER)} title="More">
          <Ellipsis className="size-5" />
        </button>
        <button className={cn("grid size-8 place-items-center rounded-full text-[#65676b]", HOVER)} title="Hide post">
          <X className="size-5" />
        </button>
      </header>
      <div className="px-3 pb-3">
        <h3 className="text-[15px] font-semibold text-[#050505]">{post.title}</h3>
        <p className="mt-1 text-[15px] leading-snug text-[#050505]">{post.body}</p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 text-[15px] text-[#65676b]">
        <span className="flex items-center gap-1.5">
          <span className={cn("grid size-[18px] place-items-center rounded-full text-white", FB.bgBlue)}>
            <ThumbsUp className="size-3" />
          </span>
          {post.likes + (liked ? 1 : 0)}
        </span>
        <span className="text-[15px]">
          {post.comments} comments · {post.shares} shares
        </span>
      </div>
      <div className="mx-3 grid grid-cols-3 border-y border-[#ced0d4] py-1">
        <button onClick={() => setLiked((v) => !v)} className={cn(action, liked && FB.blue)}>
          <ThumbsUp className={cn("size-5", liked && "fill-current")} /> Helpful
        </button>
        <button className={action}>
          <MessageSquare className="size-5" /> Comment
        </button>
        <button className={action}>
          <Share2 className="size-5" /> Share
        </button>
      </div>
      <div className="flex items-center gap-2 p-3">
        <Avatar initials="YOU" tone="bg-[#1c1e21]" size="size-8" />
        <input
          placeholder="Write a comment..."
          className="h-9 min-w-0 flex-1 rounded-full bg-[#f0f2f5] px-3 text-[15px] text-[#050505] outline-none placeholder:text-[#65676b]"
        />
      </div>
    </article>
  );
}

/** Facebook right rail: "Sponsored" (here: suggested courses), events, then "Contacts". */
export function RightRail() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[300px] shrink-0 overflow-y-auto p-2 pt-4 xl:block">
      <p className="px-2 pb-2 text-[17px] font-semibold text-[#65676b]">Suggested courses</p>
      {COURSES.map((c) => (
        <Link key={c.title} to="/learn" className={cn("flex items-center gap-3 rounded-lg p-2", HOVER)}>
          <span className={cn("size-[100px] shrink-0 rounded-lg bg-gradient-to-br", c.tone)} />
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold leading-tight text-[#050505]">{c.title}</span>
            <span className="text-[13px] text-[#65676b]">{c.sub}</span>
          </span>
        </Link>
      ))}
      <hr className="my-2 ml-2 border-[#ced0d4]" />
      <p className="px-2 pb-1 text-[17px] font-semibold text-[#65676b]">Upcoming sessions</p>
      {EVENTS.map((e) => (
        <button key={e.title} className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", HOVER)}>
          <Calendar className="size-7 shrink-0 text-[#f7b928]" />
          <span className="min-w-0 text-[15px] text-[#050505]">
            <span className="font-semibold">{e.title}</span>
            <span className="block text-[13px] text-[#65676b]">{e.when}</span>
          </span>
        </button>
      ))}
      <hr className="my-2 ml-2 border-[#ced0d4]" />
      <div className="flex items-center justify-between px-2 pb-1">
        <p className="text-[17px] font-semibold text-[#65676b]">Contacts</p>
        <div className="flex gap-1 text-[#65676b]">
          <Search className="size-5" />
          <Ellipsis className="size-5" />
        </div>
      </div>
      {CONTACTS.map((p) => (
        <button key={p.name} className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", HOVER)}>
          <span className="relative">
            <Avatar initials={p.initials} tone={p.tone} size="size-9" />
            <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#f0f2f5] bg-[#31a24c]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium text-[#050505]">{p.name}</span>
            <span className="block truncate text-xs text-[#65676b]">{p.doing}</span>
          </span>
        </button>
      ))}
    </aside>
  );
}

export function MobileNav() {
  const items = [
    { icon: Home, label: "Home", to: "/social" },
    { icon: Users, label: "Groups", to: "/groups" },
    { icon: Clapperboard, label: "Reels", to: "/watch" },
    { icon: GraduationCap, label: "Learn", to: "/courses" },
    { icon: Bell, label: "Alerts", to: "/social" },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-stretch border-t border-[#ced0d4] bg-white md:hidden">
      {items.map(({ icon: Icon, label, to }, i) => (
        <Link
          key={label}
          to={to}
          className={cn("relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-[#65676b]", i === 0 && FB.blue)}
        >
          {i === 0 ? <span className={cn("absolute inset-x-3 top-0 h-[3px] rounded-b", FB.bgBlue)} /> : null}
          <Icon className="size-6" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function StudySocial() {
  return (
    <div className="min-h-dvh bg-[#f0f2f5] text-[#050505]">
      <TopBar />
      <div className="mx-auto flex max-w-[1920px] justify-between">
        <LeftRail />
        <main className="mx-auto flex w-full max-w-[680px] flex-col gap-4 px-2 pb-20 pt-4 md:pb-8">
          <Stories />
          <Composer />
          {POSTS.map((p) => (
            <Post key={p.id} post={p} />
          ))}
        </main>
        <RightRail />
      </div>
      <MobileNav />
    </div>
  );
}
