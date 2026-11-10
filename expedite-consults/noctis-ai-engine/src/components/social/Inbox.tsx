import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Camera,
  Check,
  Ellipsis,
  FileText,
  Flame,
  GraduationCap,
  Image as ImageIcon,
  Mic,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { Avatar, Composer, GROUPS, POSTS, Post } from "@/components/social/StudySocial";
import { GroupsLayout } from "@/components/social/Groups";
import { cn } from "@/lib/utils";

/* Visual mockup only: every person, message, notification and stat below is sample data. */

const BTN_BLUE = "bg-[#1877f2] text-white hover:bg-[#166fe5]";
const BTN_GREY = "bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]";
const HOVER = "hover:bg-[#e4e6eb]";
const CARD = "rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]";

const PEOPLE = [
  { name: "Ama Boateng", initials: "AB", tone: "bg-amber-500", line: "Organic Chemistry · 12 mutual groups" },
  { name: "Kofi Mensah", initials: "KM", tone: "bg-sky-600", line: "Security+ mentor" },
  { name: "Lena Park", initials: "LP", tone: "bg-emerald-600", line: "Calculus II · Mentor" },
  { name: "Dev Patel", initials: "DP", tone: "bg-fuchsia-600", line: "MCAT prep · 600-card deck author" },
  { name: "Zoe Rivers", initials: "ZR", tone: "bg-rose-500", line: "Essay writing" },
];

const COURSES = [
  { id: "sec701", title: "Security+ SY0-701 crash course", sub: "Free · 12 lessons" },
  { id: "calc2", title: "Calculus II: series and sequences", sub: "Free · 9 lessons" },
  { id: "orgo", title: "Organic Chemistry: reaction mechanisms", sub: "Free · 15 lessons" },
];

/* ---------------------------------- Profile ---------------------------------- */

const PROFILE_TABS = ["Posts", "About", "Courses", "Stamps", "Friends"] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

const STAMPS = [
  { name: "7-day streak", tone: "bg-orange-100 text-orange-600", icon: Flame },
  { name: "First drill passed", tone: "bg-emerald-100 text-emerald-600", icon: Check },
  { name: "Security+ Domain 1", tone: "bg-sky-100 text-sky-600", icon: Trophy },
  { name: "Helpful x50", tone: "bg-violet-100 text-violet-600", icon: Users },
];

/** /me: Facebook timeline. Cover, avatar, Intro card, tabs, post feed. */
export function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>("Posts");
  const posts = POSTS.slice(0, 2).map((p) => ({ ...p, author: "You", initials: "YOU", tone: "bg-[#1c1e21]" }));
  return (
    <GroupsLayout wide current="none">
      <section className={cn(CARD, "overflow-hidden")}>
        <div className="relative h-44 bg-gradient-to-br from-[#0b1220] via-[#1c2f55] to-[#1877f2] sm:h-72">
          <button className={cn("absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md px-3 py-2 text-[14px] font-semibold", BTN_GREY)}>
            <Camera className="size-4" /> Edit cover
          </button>
        </div>
        <div className="px-4">
          <div className="-mt-12 flex flex-wrap items-end gap-4 sm:-mt-16">
            <Avatar initials="YOU" tone="bg-[#1c1e21] ring-4 ring-white" size="size-28 sm:size-40 text-xl" />
            <div className="min-w-0 flex-1 pb-2">
              <h1 className="text-[28px] font-bold leading-tight text-[#050505]">Your Name</h1>
              <p className="text-[15px] text-[#65676b]">128 friends · 4 study groups · Level 5</p>
            </div>
            <div className="flex gap-2 pb-3">
              <button className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-[15px] font-semibold", BTN_BLUE)}>
                <Plus className="size-4" /> Add to story
              </button>
              <button className={cn("rounded-md px-4 py-2 text-[15px] font-semibold", BTN_GREY)}>Edit profile</button>
            </div>
          </div>
        </div>
        <nav className="mx-4 mt-2 flex gap-1 overflow-x-auto border-t border-[#ced0d4]">
          {PROFILE_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative shrink-0 px-4 py-3.5 text-[15px] font-semibold",
                tab === t ? "text-[#1877f2]" : cn("my-1 rounded-md py-2.5 text-[#65676b]", HOVER),
              )}
            >
              {t}
              {tab === t ? <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-t bg-[#1877f2]" /> : null}
            </button>
          ))}
        </nav>
      </section>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="flex flex-col gap-4">
          <section className={cn(CARD, "p-4")}>
            <h2 className="mb-3 text-[20px] font-bold">Intro</h2>
            <p className="text-center text-[15px] text-[#050505]">Studying for Security+ and Calculus II. Coffee, flashcards, repeat.</p>
            <ul className="mt-3 space-y-3 text-[15px] text-[#050505]">
              <li className="flex items-center gap-3">
                <GraduationCap className="size-5 text-[#65676b]" /> Studies Computer Science
              </li>
              <li className="flex items-center gap-3">
                <Flame className="size-5 text-orange-500" /> 7-day study streak
              </li>
              <li className="flex items-center gap-3">
                <BookOpen className="size-5 text-[#65676b]" /> 212 study hours this term
              </li>
            </ul>
          </section>
          <section className={cn(CARD, "p-4")}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[20px] font-bold">Friends</h2>
              <span className="text-[15px] text-[#1877f2]">See all</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PEOPLE.slice(0, 3).concat(PEOPLE.slice(3, 5)).map((p) => (
                <div key={p.name} className="text-center">
                  <span className={cn("mx-auto grid aspect-square w-full place-items-center rounded-lg text-xl font-bold text-white", p.tone)}>
                    {p.initials}
                  </span>
                  <p className="mt-1 truncate text-[13px] font-semibold text-[#050505]">{p.name}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          {tab === "Posts" ? (
            <>
              <Composer />
              {posts.map((p) => (
                <Post key={p.id} post={p} />
              ))}
            </>
          ) : null}
          {tab === "About" ? (
            <section className={cn(CARD, "p-4")}>
              <h2 className="mb-3 text-[20px] font-bold">About</h2>
              <p className="text-[15px] text-[#050505]">Overview, education and study goals would live here.</p>
            </section>
          ) : null}
          {tab === "Courses" ? (
            <section className={cn(CARD, "p-4")}>
              <h2 className="mb-3 text-[20px] font-bold">Courses in progress</h2>
              {COURSES.map((c, i) => (
                <div key={c.id} className="border-b border-[#e4e6eb] py-3 last:border-0">
                  <p className="text-[15px] font-semibold text-[#050505]">{c.title}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e6eb]">
                    <div className="h-full rounded-full bg-[#1877f2]" style={{ width: `${70 - i * 25}%` }} />
                  </div>
                  <p className="mt-1 text-[13px] text-[#65676b]">{70 - i * 25}% complete</p>
                </div>
              ))}
            </section>
          ) : null}
          {tab === "Stamps" ? (
            <section className={cn(CARD, "p-4")}>
              <h2 className="mb-3 text-[20px] font-bold">Stamps earned</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {STAMPS.map(({ name, tone, icon: Icon }) => (
                  <div key={name} className="flex items-center gap-3 rounded-lg border border-[#ced0d4] p-3">
                    <span className={cn("grid size-12 place-items-center rounded-full", tone)}>
                      <Icon className="size-6" />
                    </span>
                    <p className="text-[15px] font-semibold text-[#050505]">{name}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {tab === "Friends" ? (
            <section className={cn(CARD, "p-4")}>
              <h2 className="mb-3 text-[20px] font-bold">Friends</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {PEOPLE.map((p) => (
                  <div key={p.name} className="flex items-center gap-3 rounded-lg border border-[#ced0d4] p-3">
                    <Avatar initials={p.initials} tone={p.tone} size="size-14" />
                    <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#050505]">{p.name}</p>
                    <Ellipsis className="size-5 text-[#65676b]" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </GroupsLayout>
  );
}

/* -------------------------------- Notifications ------------------------------- */

type Note = { id: number; initials: string; tone: string; text: string; time: string; unread: boolean; group: string };

const NOTES: Note[] = [
  { id: 1, initials: "AB", tone: "bg-amber-500", text: "Ama Boateng replied to your question in Organic Chemistry Crew", time: "2m", unread: true, group: "New" },
  { id: 2, initials: "LP", tone: "bg-emerald-600", text: "Study room starting: Integration by parts at 8:00 PM", time: "1h", unread: true, group: "New" },
  { id: 3, initials: "KM", tone: "bg-sky-600", text: "Kofi Mensah invited you to join CompTIA Security+ Sprint", time: "3h", unread: true, group: "New" },
  { id: 4, initials: "DP", tone: "bg-fuchsia-600", text: "Dev Patel and 41 others found your notes helpful", time: "Yesterday", unread: false, group: "Earlier" },
  { id: 5, initials: "7", tone: "bg-orange-500", text: "Your 7-day streak is safe. Study today to reach 8", time: "Yesterday", unread: false, group: "Earlier" },
  { id: 6, initials: "ZR", tone: "bg-rose-500", text: "Zoe Rivers accepted your friend request", time: "2d", unread: false, group: "Earlier" },
];

/** /notifications: Facebook notifications list. All/Unread filter, New and Earlier sections. */
export function NotificationsPage() {
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const [read, setRead] = useState<Set<number>>(new Set());
  const items = NOTES.filter((n) => filter === "All" || (n.unread && !read.has(n.id)));
  return (
    <GroupsLayout current="none">
      <section className={cn(CARD, "mx-auto w-full max-w-[680px] p-4")}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#050505]">Notifications</h1>
          <button onClick={() => setRead(new Set(NOTES.map((n) => n.id)))} className="text-[15px] font-semibold text-[#1877f2] hover:underline">
            Mark all as read
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {(["All", "Unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("rounded-full px-3 py-1.5 text-[15px] font-semibold", filter === f ? "bg-[#e7f3ff] text-[#1877f2]" : BTN_GREY)}
            >
              {f}
            </button>
          ))}
        </div>
        {["New", "Earlier"].map((g) => {
          const rows = items.filter((n) => n.group === g);
          if (rows.length === 0) return null;
          return (
            <div key={g} className="mt-4">
              <h2 className="px-1 text-[17px] font-semibold text-[#050505]">{g}</h2>
              {rows.map((n) => {
                const unread = n.unread && !read.has(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => setRead((s) => new Set(s).add(n.id))}
                    className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", HOVER)}
                  >
                    <Avatar initials={n.initials} tone={n.tone} size="size-14" />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[15px] leading-snug text-[#050505]", unread && "font-semibold")}>{n.text}</span>
                      <span className={cn("text-[13px]", unread ? "font-semibold text-[#1877f2]" : "text-[#65676b]")}>{n.time}</span>
                    </span>
                    {unread ? <span className="size-3 shrink-0 rounded-full bg-[#1877f2]" /> : null}
                  </button>
                );
              })}
            </div>
          );
        })}
        {items.length === 0 ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-[15px] text-[#65676b]">
            <Bell className="size-5" /> You're all caught up.
          </p>
        ) : null}
      </section>
    </GroupsLayout>
  );
}

/* ----------------------------------- Messages ---------------------------------- */

type Msg = { from: "me" | "them"; text: string };
const CHATS: { id: string; name: string; initials: string; tone: string; last: string; time: string; group?: boolean; msgs: Msg[] }[] = [
  {
    id: "orgo",
    name: "Organic Chemistry Crew",
    initials: "OC",
    tone: "bg-emerald-500",
    last: "Ama: bring your hardest problem",
    time: "5m",
    group: true,
    msgs: [
      { from: "them", text: "Anyone free for a quick SN2 review tonight?" },
      { from: "me", text: "Yes, I'm in. 8 PM works." },
      { from: "them", text: "bring your hardest problem" },
    ],
  },
  {
    id: "kofi",
    name: "Kofi Mensah",
    initials: "KM",
    tone: "bg-sky-600",
    last: "Sent you the Domain 3 sheet",
    time: "1h",
    msgs: [
      { from: "them", text: "Sent you the Domain 3 sheet" },
      { from: "me", text: "Thank you! Reading it now." },
    ],
  },
  {
    id: "lena",
    name: "Lena Park",
    initials: "LP",
    tone: "bg-emerald-600",
    last: "See you in the room",
    time: "3h",
    msgs: [
      { from: "me", text: "Joining the problem room at 8?" },
      { from: "them", text: "See you in the room" },
    ],
  },
];

/** /messages: Messenger layout. Conversation list on the left, thread on the right. */
export function MessagesPage() {
  const [active, setActive] = useState(CHATS[0].id);
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<Record<string, Msg[]>>({});
  const chat = CHATS.find((c) => c.id === active) ?? CHATS[0];
  const thread = [...chat.msgs, ...(extra[chat.id] ?? [])];
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setExtra((e) => ({ ...e, [chat.id]: [...(e[chat.id] ?? []), { from: "me", text }] }));
    setDraft("");
  };
  return (
    <GroupsLayout wide current="none">
      <section className={cn(CARD, "grid h-[calc(100dvh-8rem)] min-h-[480px] overflow-hidden md:grid-cols-[320px_1fr]")}>
        <div className="flex min-h-0 flex-col border-r border-[#ced0d4]">
          <div className="p-3">
            <h1 className="text-2xl font-bold text-[#050505]">Chats</h1>
            <label className="mt-2 flex h-9 items-center gap-2 rounded-full bg-[#f0f2f5] px-3 text-[#65676b]">
              <Search className="size-4" />
              <input placeholder="Search Messenger" className="min-w-0 flex-1 bg-transparent text-[15px] text-[#050505] outline-none placeholder:text-[#65676b]" />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {CHATS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", c.id === active ? "bg-[#e7f3ff]" : HOVER)}
              >
                <Avatar initials={c.initials} tone={c.tone} size="size-14" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-[#050505]">{c.name}</span>
                  <span className="block truncate text-[13px] text-[#65676b]">
                    {c.last} · {c.time}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-col">
          <header className="flex items-center gap-3 border-b border-[#ced0d4] p-3">
            <Avatar initials={chat.initials} tone={chat.tone} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-[#050505]">{chat.name}</p>
              <p className="text-[12px] text-[#65676b]">{chat.group ? "Study group chat" : "Active now"}</p>
            </div>
            <Phone className="size-5 text-[#1877f2]" />
            <Video className="size-5 text-[#1877f2]" />
          </header>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
            {thread.map((m, i) => (
              <div key={`${chat.id}-${i}`} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                <span
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-[15px] leading-snug",
                    m.from === "me" ? "bg-[#1877f2] text-white" : "bg-[#e4e6eb] text-[#050505]",
                  )}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <footer className="flex items-center gap-2 border-t border-[#ced0d4] p-3">
            <Mic className="size-5 shrink-0 text-[#1877f2]" />
            <ImageIcon className="size-5 shrink-0 text-[#1877f2]" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Aa"
              className="h-9 min-w-0 flex-1 rounded-full bg-[#f0f2f5] px-3 text-[15px] text-[#050505] outline-none placeholder:text-[#65676b]"
            />
            <Smile className="size-5 shrink-0 text-[#1877f2]" />
            <button onClick={send} className="grid size-9 place-items-center rounded-full text-[#1877f2] hover:bg-[#e4e6eb]" title="Send">
              <Send className="size-5" />
            </button>
          </footer>
        </div>
      </section>
    </GroupsLayout>
  );
}

/* ------------------------------------ Search ----------------------------------- */

const FILTERS = ["All", "People", "Groups", "Courses", "Posts"] as const;
type SearchFilter = (typeof FILTERS)[number];

/** /search?q=: Facebook search results with a left filter list (People, Groups, Courses, Posts). */
export function SearchPage({ q }: { q: string }) {
  const [filter, setFilter] = useState<SearchFilter>("All");
  const [query, setQuery] = useState(q);
  const needle = query.trim().toLowerCase();
  const match = (s: string) => !needle || s.toLowerCase().includes(needle);
  const people = PEOPLE.filter((p) => match(p.name) || match(p.line));
  const groups = GROUPS.filter((g) => match(g.name));
  const courses = COURSES.filter((c) => match(c.title));
  const posts = POSTS.filter((p) => match(p.title) || match(p.body));
  const show = (f: SearchFilter) => filter === "All" || filter === f;
  const total = people.length + groups.length + courses.length + posts.length;
  return (
    <GroupsLayout wide current="none">
      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        <aside className={cn(CARD, "h-fit p-3")}>
          <h1 className="px-2 pb-2 text-2xl font-bold text-[#050505]">Search results</h1>
          <label className="mb-2 flex h-10 items-center gap-2 rounded-full bg-[#f0f2f5] px-3 text-[#65676b]">
            <Search className="size-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search noctis"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[#050505] outline-none placeholder:text-[#65676b]"
            />
          </label>
          <p className="px-2 py-1 text-[15px] font-semibold text-[#65676b]">Filters</p>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "block w-full rounded-lg px-3 py-2.5 text-left text-[15px] font-semibold",
                filter === f ? "bg-[#e7f3ff] text-[#1877f2]" : cn("text-[#050505]", HOVER),
              )}
            >
              {f}
            </button>
          ))}
        </aside>
        <div className="flex min-w-0 flex-col gap-4">
          {show("People") && people.length > 0 ? (
            <section className={cn(CARD, "p-4")}>
              <h2 className="mb-2 text-[20px] font-bold">People</h2>
              {people.map((p) => (
                <div key={p.name} className="flex items-center gap-3 py-2">
                  <Avatar initials={p.initials} tone={p.tone} size="size-14" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[17px] font-semibold text-[#050505]">{p.name}</p>
                    <p className="truncate text-[13px] text-[#65676b]">{p.line}</p>
                  </div>
                  <button className={cn("rounded-md px-4 py-2 text-[15px] font-semibold", BTN_GREY)}>Add friend</button>
                </div>
              ))}
            </section>
          ) : null}
          {show("Groups") && groups.length > 0 ? (
            <section className={cn(CARD, "p-4")}>
              <h2 className="mb-2 text-[20px] font-bold">Groups</h2>
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-3 py-2">
                  <span className={cn("grid size-14 place-items-center rounded-lg text-xl font-bold text-white", g.color)}>{g.name[0]}</span>
                  <div className="min-w-0 flex-1">
                    <Link to="/groups/$groupId" params={{ groupId: g.id }} className="block truncate text-[17px] font-semibold text-[#050505] hover:underline">
                      {g.name}
                    </Link>
                    <p className="text-[13px] text-[#65676b]">{g.members.toLocaleString()} members</p>
                  </div>
                  <Link to="/groups/$groupId" params={{ groupId: g.id }} className={cn("rounded-md px-4 py-2 text-[15px] font-semibold", BTN_GREY)}>
                    View
                  </Link>
                </div>
              ))}
            </section>
          ) : null}
          {show("Courses") && courses.length > 0 ? (
            <section className={cn(CARD, "p-4")}>
              <h2 className="mb-2 text-[20px] font-bold">Courses</h2>
              {courses.map((c) => (
                <Link key={c.id} to="/learn" className={cn("flex items-center gap-3 rounded-lg p-2", HOVER)}>
                  <span className="grid size-14 place-items-center rounded-lg bg-[#e7f3ff] text-[#1877f2]">
                    <GraduationCap className="size-7" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-semibold text-[#050505]">{c.title}</span>
                    <span className="text-[13px] text-[#65676b]">{c.sub}</span>
                  </span>
                </Link>
              ))}
            </section>
          ) : null}
          {show("Posts") && posts.length > 0 ? posts.map((p) => <Post key={p.id} post={p} />) : null}
          {total === 0 ? (
            <section className={cn(CARD, "p-8 text-center")}>
              <FileText className="mx-auto size-10 text-[#65676b]" />
              <p className="mt-2 text-[17px] font-semibold text-[#050505]">No results for "{query}"</p>
              <p className="text-[15px] text-[#65676b]">Check the spelling or try a different subject.</p>
            </section>
          ) : null}
        </div>
      </div>
    </GroupsLayout>
  );
}
