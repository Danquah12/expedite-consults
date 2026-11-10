import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, Ellipsis, FileText, Globe, Lock, Pin, Plus, Search, Users, Video } from "lucide-react";
import {
  Avatar,
  Composer,
  GROUPS,
  LeftRail,
  MobileNav,
  POSTS,
  Post,
  TopBar,
} from "@/components/social/StudySocial";
import { cn } from "@/lib/utils";

/* Visual mockup only: groups, members, files and events are sample data. */

const BLUE = "text-[#1877f2]";
const BTN_BLUE = "bg-[#1877f2] text-white hover:bg-[#166fe5]";
const BTN_GREY = "bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]";
const HOVER = "hover:bg-[#e4e6eb]";
const CARD = "rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]";

const GROUP_META: Record<
  string,
  { cover: string; about: string; privacy: "Public" | "Private"; subject: string; rules: string[] }
> = {
  orgo: {
    cover: "from-emerald-400 to-teal-700",
    about: "Mechanisms, reagents and past-paper drills for Organic Chemistry I and II. Be kind, show your working.",
    privacy: "Public",
    subject: "Chemistry",
    rules: ["Show your working when asking", "No sharing live exam content", "Tag posts: Question, Notes or Resource"],
  },
  secplus: {
    cover: "from-sky-400 to-indigo-700",
    about: "Daily Security+ SY0-701 practice, domain cheat sheets and a weekly mock exam.",
    privacy: "Public",
    subject: "Cybersecurity",
    rules: ["No brain dumps or leaked exam items", "Cite the exam objective you are asking about"],
  },
  calc2: {
    cover: "from-violet-400 to-purple-700",
    about: "Series, integration techniques and sequences. Nightly live problem rooms at 8 PM.",
    privacy: "Private",
    subject: "Mathematics",
    rules: ["Post the problem number and source", "Be patient with beginners"],
  },
  mcat: {
    cover: "from-rose-400 to-red-700",
    about: "MCAT prep community: shared Anki decks, CARS practice and full-length exam debriefs.",
    privacy: "Private",
    subject: "Medicine",
    rules: ["Spoiler-tag section scores", "Share decks with credit to the author"],
  },
};

const MEMBERS = [
  { name: "Ama Boateng", role: "Admin", initials: "AB", tone: "bg-amber-500" },
  { name: "Kofi Mensah", role: "Mentor", initials: "KM", tone: "bg-sky-600" },
  { name: "Lena Park", role: "Mentor", initials: "LP", tone: "bg-emerald-600" },
  { name: "Dev Patel", role: "Member", initials: "DP", tone: "bg-fuchsia-600" },
  { name: "Zoe Rivers", role: "Member", initials: "ZR", tone: "bg-rose-500" },
  { name: "Sam Okafor", role: "Member", initials: "SO", tone: "bg-teal-600" },
];

const FILES = [
  { name: "Week 5 cheat sheet.pdf", by: "Kofi Mensah", size: "1.2 MB" },
  { name: "Past paper 2024 solutions.pdf", by: "Lena Park", size: "3.8 MB" },
  { name: "Flashcards deck (600 cards).apkg", by: "Dev Patel", size: "9.4 MB" },
];

const EVENTS = [
  { title: "Live problem room", when: "Tonight · 8:00 PM", going: 42 },
  { title: "Weekly mock exam", when: "Sat · 10:00 AM", going: 118 },
  { title: "Office hours with mentors", when: "Mon · 6:00 PM", going: 27 },
];

/** Shared Facebook frame for the Groups pages: top bar, left rail, centered content, mobile nav. */
export function GroupsLayout({
  children,
  wide,
  current = "groups",
}: {
  children: ReactNode;
  wide?: boolean;
  current?: "home" | "groups" | "rooms" | "none";
}) {
  return (
    <div className="min-h-dvh bg-[#f0f2f5] text-[#050505]">
      <TopBar current={current} />
      <div className="mx-auto flex max-w-[1920px] justify-between">
        <LeftRail />
        <main
          className={cn(
            "mx-auto flex w-full flex-col gap-4 px-2 pb-20 pt-4 md:pb-8",
            wide ? "max-w-[1060px]" : "max-w-[900px]",
          )}
        >
          {children}
        </main>
        <div className="hidden w-[300px] shrink-0 2xl:block" />
      </div>
      <MobileNav />
    </div>
  );
}

function GroupCard({ g }: { g: (typeof GROUPS)[number] }) {
  const meta = GROUP_META[g.id];
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className={cn("h-28 bg-gradient-to-br", meta.cover)} />
      <div className="p-3">
        <Link
          to="/groups/$groupId"
          params={{ groupId: g.id }}
          className="block truncate text-[17px] font-semibold text-[#050505] hover:underline"
        >
          {g.name}
        </Link>
        <p className="mt-0.5 text-[13px] text-[#65676b]">
          {g.members.toLocaleString()} members · {meta.subject}
        </p>
        <Link
          to="/groups/$groupId"
          params={{ groupId: g.id }}
          className={cn("mt-3 block rounded-md py-2 text-center text-[15px] font-semibold", BTN_GREY)}
        >
          View group
        </Link>
      </div>
    </div>
  );
}

/** /groups: Facebook "Groups" home. Your groups, subjects to browse, discover grid. */
export function GroupsDiscover() {
  const [q, setQ] = useState("");
  const list = GROUPS.filter((g) => g.name.toLowerCase().includes(q.toLowerCase()));
  const subjects = ["All", "Chemistry", "Cybersecurity", "Mathematics", "Medicine", "Languages", "Law", "Business"];
  const [subject, setSubject] = useState("All");
  const shown = list.filter((g) => subject === "All" || GROUP_META[g.id].subject === subject);
  return (
    <GroupsLayout>
      <section className={cn(CARD, "p-4")}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[#050505]">Study groups</h1>
          <button className={cn("flex items-center gap-1.5 rounded-md px-3 py-2 text-[15px] font-semibold", BTN_BLUE)}>
            <Plus className="size-4" /> Create group
          </button>
        </div>
        <label className="mt-3 flex h-10 items-center gap-2 rounded-full bg-[#f0f2f5] px-3 text-[#65676b]">
          <Search className="size-4 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search study groups"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#050505] outline-none placeholder:text-[#65676b]"
          />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[14px] font-semibold",
                subject === s ? "bg-[#e7f3ff] text-[#1877f2]" : BTN_GREY,
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </section>
      <h2 className="px-1 text-[17px] font-semibold text-[#65676b]">Groups you've joined</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((g) => (
          <GroupCard key={g.id} g={g} />
        ))}
        {shown.length === 0 ? <p className="p-4 text-[15px] text-[#65676b]">No groups match your search.</p> : null}
      </div>
    </GroupsLayout>
  );
}

const TABS = ["Discussion", "About", "Members", "Files", "Events", "Rooms"] as const;
type Tab = (typeof TABS)[number];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(CARD, "p-4")}>
      <h2 className="mb-3 text-[20px] font-bold text-[#050505]">{title}</h2>
      {children}
    </section>
  );
}

/** /groups/$groupId: Facebook group page. Cover, header, tab bar, tab contents. */
export function GroupPage({ groupId }: { groupId: string }) {
  const g = GROUPS.find((x) => x.id === groupId);
  const [tab, setTab] = useState<Tab>("Discussion");
  const [joined, setJoined] = useState(true);
  if (!g) {
    return (
      <GroupsLayout>
        <section className={cn(CARD, "p-6 text-center")}>
          <h1 className="text-xl font-bold">This group isn't available</h1>
          <p className="mt-1 text-[15px] text-[#65676b]">It may have been removed or the link is wrong.</p>
          <Link to="/groups" className={cn("mt-4 inline-block rounded-md px-4 py-2 text-[15px] font-semibold", BTN_BLUE)}>
            Back to groups
          </Link>
        </section>
      </GroupsLayout>
    );
  }
  const meta = GROUP_META[g.id];
  const PrivacyIcon = meta.privacy === "Public" ? Globe : Lock;
  const posts = POSTS.map((p) => ({ ...p, group: g.name }));
  return (
    <GroupsLayout wide>
      <section className={cn(CARD, "overflow-hidden")}>
        <div className={cn("h-40 bg-gradient-to-br sm:h-64", meta.cover)} />
        <div className="px-4 pt-3">
          <h1 className="text-[28px] font-bold leading-tight text-[#050505]">{g.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-[15px] text-[#65676b]">
            <PrivacyIcon className="size-4" /> {meta.privacy} group · {(g.members + (joined ? 0 : 0)).toLocaleString()} members
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex -space-x-2">
              {MEMBERS.slice(0, 6).map((m) => (
                <Avatar key={m.name} initials={m.initials} tone={m.tone} size="size-8 ring-2 ring-white" />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setJoined((v) => !v)}
                className={cn("rounded-md px-4 py-2 text-[15px] font-semibold", joined ? BTN_GREY : BTN_BLUE)}
              >
                {joined ? "Joined ✓" : "Join group"}
              </button>
              <button className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-[15px] font-semibold", BTN_BLUE)}>
                <Video className="size-4" /> Start study room
              </button>
              <button className={cn("grid size-10 place-items-center rounded-md", BTN_GREY)} title="More">
                <Ellipsis className="size-5" />
              </button>
            </div>
          </div>
        </div>
        <nav className="mx-4 mt-3 flex gap-1 overflow-x-auto border-t border-[#ced0d4]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative shrink-0 px-4 py-3.5 text-[15px] font-semibold",
                tab === t ? BLUE : cn("text-[#65676b]", HOVER, "rounded-md my-1 py-2.5"),
              )}
            >
              {t}
              {tab === t ? <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-t bg-[#1877f2]" /> : null}
            </button>
          ))}
        </nav>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          {tab === "Discussion" ? (
            <>
              <Composer />
              <section className={cn(CARD, "flex items-center gap-2 p-3 text-[15px] text-[#65676b]")}>
                <Pin className="size-4" /> Pinned: read the group rules before posting.
              </section>
              {posts.map((p) => (
                <Post key={p.id} post={p} />
              ))}
            </>
          ) : null}
          {tab === "About" ? (
            <>
              <Section title="About this group">
                <p className="text-[15px] leading-snug text-[#050505]">{meta.about}</p>
                <p className="mt-3 flex items-center gap-2 text-[15px] text-[#050505]">
                  <PrivacyIcon className="size-5 text-[#65676b]" />
                  {meta.privacy}: {meta.privacy === "Public" ? "anyone can see who's in the group and what they post." : "only members can see posts."}
                </p>
              </Section>
              <Section title="Group rules">
                <ol className="space-y-2">
                  {meta.rules.map((r, i) => (
                    <li key={r} className="flex gap-3 text-[15px] text-[#050505]">
                      <span className="font-bold">{i + 1}.</span> {r}
                    </li>
                  ))}
                </ol>
              </Section>
            </>
          ) : null}
          {tab === "Members" ? (
            <Section title={`Members · ${g.members.toLocaleString()}`}>
              <div className="grid gap-2 sm:grid-cols-2">
                {MEMBERS.map((m) => (
                  <div key={m.name} className="flex items-center gap-3 rounded-lg border border-[#ced0d4] p-3">
                    <Avatar initials={m.initials} tone={m.tone} size="size-12" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-[#050505]">{m.name}</p>
                      <p className="text-[13px] text-[#65676b]">{m.role}</p>
                    </div>
                    <button className={cn("rounded-md px-3 py-1.5 text-[14px] font-semibold", BTN_GREY)}>Message</button>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}
          {tab === "Files" ? (
            <Section title="Files">
              {FILES.map((f) => (
                <div key={f.name} className={cn("flex items-center gap-3 rounded-lg p-2", HOVER)}>
                  <span className="grid size-11 place-items-center rounded-lg bg-[#e7f3ff] text-[#1877f2]">
                    <FileText className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-[#050505]">{f.name}</p>
                    <p className="text-[13px] text-[#65676b]">
                      {f.by} · {f.size}
                    </p>
                  </div>
                </div>
              ))}
            </Section>
          ) : null}
          {tab === "Events" ? (
            <Section title="Upcoming events">
              {EVENTS.map((e) => (
                <div key={e.title} className="flex items-center gap-3 border-b border-[#e4e6eb] py-3 last:border-0">
                  <span className="grid size-14 place-items-center rounded-lg bg-[#fff4d6] text-[#f7b928]">
                    <Calendar className="size-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold uppercase text-[#e41e3f]">{e.when}</p>
                    <p className="truncate text-[17px] font-semibold text-[#050505]">{e.title}</p>
                    <p className="text-[13px] text-[#65676b]">{e.going} going</p>
                  </div>
                  <button className={cn("rounded-md px-4 py-2 text-[15px] font-semibold", BTN_GREY)}>Interested</button>
                </div>
              ))}
            </Section>
          ) : null}
          {tab === "Rooms" ? (
            <Section title="Study rooms">
              {[
                { t: "Live problem room", live: true, n: 14 },
                { t: "Silent focus (25/5)", live: true, n: 31 },
                { t: "Mentor office hours", live: false, n: 0 },
              ].map((r) => (
                <div key={r.t} className="flex items-center gap-3 border-b border-[#e4e6eb] py-3 last:border-0">
                  <span className="grid size-12 place-items-center rounded-full bg-[#fde8ec] text-[#f3425f]">
                    <Video className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-[#050505]">{r.t}</p>
                    <p className="text-[13px] text-[#65676b]">{r.live ? `Live now · ${r.n} studying` : "Starts Monday 6 PM"}</p>
                  </div>
                  <button className={cn("rounded-md px-4 py-2 text-[15px] font-semibold", r.live ? BTN_BLUE : BTN_GREY)}>
                    {r.live ? "Join" : "Remind me"}
                  </button>
                </div>
              ))}
            </Section>
          ) : null}
        </div>

        <aside className="hidden flex-col gap-4 lg:flex">
          <Section title="About">
            <p className="text-[15px] leading-snug text-[#050505]">{meta.about}</p>
            <p className="mt-3 flex items-center gap-2 text-[15px]">
              <Users className="size-5 text-[#65676b]" /> {g.members.toLocaleString()} members
            </p>
          </Section>
          <Section title="Upcoming">
            {EVENTS.slice(0, 2).map((e) => (
              <p key={e.title} className="py-1 text-[15px] text-[#050505]">
                <span className="font-semibold">{e.title}</span>
                <span className="block text-[13px] text-[#65676b]">{e.when}</span>
              </p>
            ))}
          </Section>
        </aside>
      </div>
    </GroupsLayout>
  );
}
