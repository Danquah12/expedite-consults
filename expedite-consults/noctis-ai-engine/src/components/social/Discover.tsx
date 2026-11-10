import { useEffect, useState } from "react";
import {
  Bookmark,
  Briefcase,
  Clock,
  MapPin,
  MessageCircle,
  Music,
  Newspaper,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Store,
  Tag,
} from "lucide-react";
import { Avatar } from "@/components/social/StudySocial";
import { GroupsLayout } from "@/components/social/Groups";
import { cn } from "@/lib/utils";

/* Visual mockup only: jobs, listings, playlists and articles are sample data. */

const BTN_BLUE = "bg-[#1877f2] text-white hover:bg-[#166fe5]";
const BTN_GREY = "bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]";
const HOVER = "hover:bg-[#e4e6eb]";
const CARD = "rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]";

function Chips<T extends string>({ items, value, onChange }: { items: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={cn("shrink-0 rounded-full px-3 py-1.5 text-[15px] font-semibold", value === f ? "bg-[#e7f3ff] text-[#1877f2]" : BTN_GREY)}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="mt-3 flex h-10 items-center gap-2 rounded-full bg-[#f0f2f5] px-3 text-[#65676b]">
      <Search className="size-4 shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-[#050505] outline-none placeholder:text-[#65676b]"
      />
    </label>
  );
}

/* ----------------------------------- Jobs ----------------------------------- */

const JOBS = [
  { id: 1, title: "Junior SOC Analyst", org: "Northbridge Security", where: "Remote", kind: "Entry-level", pay: "\$62k–\$74k", posted: "2d", about: "Monitor alerts, triage incidents and escalate. Security+ preferred. Mentorship included.", tone: "bg-sky-600" },
  { id: 2, title: "Chemistry Lab Assistant (Part-time)", org: "Riverside University", where: "Boston, MA", kind: "Part-time", pay: "\$21/hr", posted: "4d", about: "Prepare reagents, maintain equipment and support undergraduate teaching labs.", tone: "bg-emerald-600" },
  { id: 3, title: "Math Tutor, Calculus I–II", org: "Noctis Tutors", where: "Remote", kind: "Remote", pay: "\$30/hr", posted: "1w", about: "Run small-group sessions and 1:1 tutoring. Flexible evening hours.", tone: "bg-violet-600" },
  { id: 4, title: "Cybersecurity Intern, Summer", org: "Helix Health", where: "Chicago, IL", kind: "Internship", pay: "\$28/hr", posted: "1w", about: "Vulnerability scans, policy documentation and phishing simulations.", tone: "bg-rose-500" },
] as const;

const JOB_FILTERS = ["All", "Remote", "Internship", "Entry-level", "Part-time"] as const;

/** /jobs: Facebook Jobs layout. Filterable list on the left, selected job detail on the right. */
export function JobsPage() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof JOB_FILTERS)[number]>("All");
  const [sel, setSel] = useState<number>(JOBS[0].id);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [applied, setApplied] = useState<Set<number>>(new Set());
  const list = JOBS.filter((j) => (f === "All" || j.kind === f) && (j.title + j.org).toLowerCase().includes(q.toLowerCase()));
  const job = JOBS.find((j) => j.id === sel) ?? list[0];
  const toggle = (set: Set<number>, id: number) => {
    const n = new Set(set);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  };
  return (
    <GroupsLayout wide current="none">
      <section className={cn(CARD, "p-4")}>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#050505]">
          <Briefcase className="size-6 text-[#1877f2]" /> Jobs
        </h1>
        <SearchBox value={q} onChange={setQ} placeholder="Search jobs and employers" />
        <div className="mt-3">
          <Chips items={JOB_FILTERS} value={f} onChange={setF} />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-[380px_1fr]">
        <div className="flex flex-col gap-2">
          {list.map((j) => (
            <button
              key={j.id}
              onClick={() => setSel(j.id)}
              className={cn(CARD, "flex items-start gap-3 p-3 text-left", j.id === job?.id && "ring-2 ring-[#1877f2]")}
            >
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-lg text-lg font-bold text-white", j.tone)}>{j.org[0]}</span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-tight text-[#050505]">{j.title}</span>
                <span className="block text-[13px] text-[#65676b]">
                  {j.org} · {j.where}
                </span>
                <span className="block text-[13px] text-[#65676b]">
                  {j.pay} · {j.posted} ago
                </span>
              </span>
            </button>
          ))}
          {list.length === 0 ? <p className="p-3 text-[15px] text-[#65676b]">No jobs match your filters.</p> : null}
        </div>
        {job ? (
          <article className={cn(CARD, "h-fit p-5")}>
            <h2 className="text-[24px] font-bold leading-tight text-[#050505]">{job.title}</h2>
            <p className="mt-1 text-[15px] text-[#65676b]">{job.org}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-[#050505]">
              <span className="flex items-center gap-1"><MapPin className="size-4 text-[#65676b]" /> {job.where}</span>
              <span className="flex items-center gap-1"><Tag className="size-4 text-[#65676b]" /> {job.kind}</span>
              <span className="flex items-center gap-1"><Clock className="size-4 text-[#65676b]" /> Posted {job.posted} ago</span>
            </p>
            <p className="mt-1 text-[17px] font-semibold text-[#050505]">{job.pay}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setApplied((s) => toggle(s, job.id))}
                className={cn("rounded-md px-5 py-2 text-[15px] font-semibold", applied.has(job.id) ? BTN_GREY : BTN_BLUE)}
              >
                {applied.has(job.id) ? "Applied ✓" : "Apply now"}
              </button>
              <button
                onClick={() => setSaved((s) => toggle(s, job.id))}
                className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-[15px] font-semibold", BTN_GREY)}
              >
                <Bookmark className={cn("size-4", saved.has(job.id) && "fill-current text-[#1877f2]")} /> {saved.has(job.id) ? "Saved" : "Save"}
              </button>
            </div>
            <hr className="my-4 border-[#ced0d4]" />
            <h3 className="text-[17px] font-bold text-[#050505]">About the role</h3>
            <p className="mt-1 text-[15px] leading-snug text-[#050505]">{job.about}</p>
          </article>
        ) : null}
      </div>
    </GroupsLayout>
  );
}

/* -------------------------------- Marketplace -------------------------------- */

const LISTINGS = [
  { id: 1, title: "Organic Chemistry textbook, 9th ed.", price: "\$35", cat: "Textbooks", by: "Ama B.", tone: "from-emerald-400 to-teal-600" },
  { id: 2, title: "Security+ SY0-701 complete notes (PDF)", price: "\$8", cat: "Notes", by: "Kofi M.", tone: "from-sky-400 to-indigo-600" },
  { id: 3, title: "1:1 Calculus tutoring, 1 hour", price: "\$25", cat: "Tutoring", by: "Lena P.", tone: "from-violet-400 to-purple-600" },
  { id: 4, title: "TI-84 Plus graphing calculator", price: "\$60", cat: "Gear", by: "Zoe R.", tone: "from-amber-400 to-orange-600" },
  { id: 5, title: "MCAT flashcards (printed, 600 cards)", price: "\$20", cat: "Notes", by: "Dev P.", tone: "from-rose-400 to-red-600" },
  { id: 6, title: "Desk lamp + monitor stand bundle", price: "\$30", cat: "Gear", by: "Sam O.", tone: "from-teal-400 to-cyan-600" },
] as const;
const MARKET_CATS = ["All", "Textbooks", "Notes", "Tutoring", "Gear"] as const;

/** /marketplace: Facebook Marketplace grid with category chips and Message seller. */
export function MarketplacePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof MARKET_CATS)[number]>("All");
  const [msg, setMsg] = useState<Set<number>>(new Set());
  const list = LISTINGS.filter((l) => (cat === "All" || l.cat === cat) && l.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <GroupsLayout wide current="none">
      <section className={cn(CARD, "p-4")}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#050505]">
            <Store className="size-6 text-[#1877f2]" /> Marketplace
          </h1>
          <button className={cn("rounded-md px-3 py-2 text-[15px] font-semibold", BTN_BLUE)}>+ Create listing</button>
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Search textbooks, notes and tutors" />
        <div className="mt-3">
          <Chips items={MARKET_CATS} value={cat} onChange={setCat} />
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {list.map((l) => (
          <article key={l.id} className={cn(CARD, "overflow-hidden")}>
            <div className={cn("grid aspect-square place-items-center bg-gradient-to-br text-white", l.tone)}>
              <Store className="size-10 opacity-80" />
            </div>
            <div className="p-3">
              <p className="text-[17px] font-bold text-[#050505]">{l.price}</p>
              <p className="line-clamp-2 text-[15px] leading-tight text-[#050505]">{l.title}</p>
              <p className="mt-1 text-[13px] text-[#65676b]">
                {l.cat} · {l.by}
              </p>
              <button
                onClick={() => setMsg((s) => new Set(s).add(l.id))}
                className={cn("mt-2 flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-[14px] font-semibold", msg.has(l.id) ? BTN_GREY : BTN_BLUE)}
              >
                <MessageCircle className="size-4" /> {msg.has(l.id) ? "Message sent" : "Message seller"}
              </button>
            </div>
          </article>
        ))}
        {list.length === 0 ? <p className="col-span-full p-4 text-[15px] text-[#65676b]">No listings match.</p> : null}
      </div>
    </GroupsLayout>
  );
}

/* ----------------------------------- Music ----------------------------------- */

const PLAYLISTS = [
  { id: "lofi", name: "Lo-fi Focus", tracks: ["Late Night Library", "Rainy Window", "Paper Lanterns", "Slow Coffee"], tone: "from-indigo-400 to-purple-700" },
  { id: "rain", name: "Rain & Thunder", tracks: ["Light Rain", "Distant Storm", "Tin Roof"], tone: "from-sky-400 to-slate-700" },
  { id: "classical", name: "Classical Concentration", tracks: ["Gymnopédie No.1", "Clair de Lune", "Prelude in C"], tone: "from-amber-400 to-rose-600" },
  { id: "brown", name: "Brown Noise", tracks: ["Brown Noise 60 min"], tone: "from-stone-400 to-stone-700" },
] as const;

/** /focus: focus playlists with a docked mini-player (simulated playback, no audio). */
export function FocusMusicPage() {
  const [pl, setPl] = useState<(typeof PLAYLISTS)[number]>(PLAYLISTS[0]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setPos((p) => (p >= 100 ? 0 : p + 1)), 600);
    return () => window.clearInterval(t);
  }, [playing]);
  const track = pl.tracks[idx % pl.tracks.length];
  const step = (d: number) => {
    setIdx((i) => (i + d + pl.tracks.length) % pl.tracks.length);
    setPos(0);
  };
  return (
    <GroupsLayout wide current="none">
      <section className={cn(CARD, "p-4")}>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#050505]">
          <Music className="size-6 text-[#1877f2]" /> Focus music
        </h1>
        <p className="text-[15px] text-[#65676b]">Pick a playlist and keep studying.</p>
      </section>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {PLAYLISTS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPl(p);
              setIdx(0);
              setPos(0);
              setPlaying(true);
            }}
            className={cn(CARD, "overflow-hidden text-left", p.id === pl.id && "ring-2 ring-[#1877f2]")}
          >
            <div className={cn("grid aspect-square place-items-center bg-gradient-to-br text-white", p.tone)}>
              <Music className="size-10 opacity-90" />
            </div>
            <div className="p-3">
              <p className="text-[15px] font-semibold text-[#050505]">{p.name}</p>
              <p className="text-[13px] text-[#65676b]">{p.tracks.length} tracks</p>
            </div>
          </button>
        ))}
      </div>
      <section className={cn(CARD, "p-2")}>
        <h2 className="px-2 py-2 text-[17px] font-bold text-[#050505]">{pl.name}</h2>
        {pl.tracks.map((t, i) => (
          <button
            key={t}
            onClick={() => {
              setIdx(i);
              setPos(0);
              setPlaying(true);
            }}
            className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", i === idx % pl.tracks.length ? "bg-[#e7f3ff]" : HOVER)}
          >
            <span className="w-5 text-center text-[13px] text-[#65676b]">{i + 1}</span>
            <span className="text-[15px] font-medium text-[#050505]">{t}</span>
          </button>
        ))}
      </section>
      <div className="fixed inset-x-2 bottom-16 z-30 mx-auto max-w-[680px] rounded-xl bg-[#18191a] p-3 text-white shadow-xl md:bottom-4">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br", pl.tone)}>
            <Music className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{track}</p>
            <p className="truncate text-[12px] text-white/60">{pl.name}</p>
          </div>
          <button onClick={() => step(-1)} className="p-1.5" title="Previous"><SkipBack className="size-5" /></button>
          <button onClick={() => setPlaying((v) => !v)} className="grid size-10 place-items-center rounded-full bg-white text-[#050505]" title={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
          </button>
          <button onClick={() => step(1)} className="p-1.5" title="Next"><SkipForward className="size-5" /></button>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
          <div className="h-full bg-[#1877f2]" style={{ width: `${pos}%` }} />
        </div>
      </div>
      <div className="h-24" />
    </GroupsLayout>
  );
}

/* ------------------------------------ News ------------------------------------ */

const ARTICLES = [
  { id: 1, cat: "Exams", title: "Security+ SY0-701: what changed and what to study first", src: "Noctis Editorial", time: "2h", tone: "from-sky-400 to-indigo-600" },
  { id: 2, cat: "Study tips", title: "Spaced repetition in 20 minutes a day: a beginner's schedule", src: "Learning Lab", time: "5h", tone: "from-emerald-400 to-teal-600" },
  { id: 3, cat: "Careers", title: "Entry-level cybersecurity hiring is up: skills employers ask for", src: "Career Desk", time: "1d", tone: "from-violet-400 to-purple-600" },
  { id: 4, cat: "Campus", title: "Library extends 24-hour access through finals week", src: "Campus Daily", time: "1d", tone: "from-amber-400 to-orange-600" },
  { id: 5, cat: "Study tips", title: "Why the 25/5 Pomodoro works (and when to change it)", src: "Learning Lab", time: "2d", tone: "from-rose-400 to-red-600" },
] as const;
const NEWS_CATS = ["All", "Exams", "Study tips", "Careers", "Campus"] as const;

/** /updates: study news feed in Facebook card style, with category chips and Save. */
export function StudyNewsPage() {
  const [cat, setCat] = useState<(typeof NEWS_CATS)[number]>("All");
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const list = ARTICLES.filter((a) => cat === "All" || a.cat === cat);
  return (
    <GroupsLayout current="none">
      <section className={cn(CARD, "mx-auto w-full max-w-[680px] p-4")}>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#050505]">
          <Newspaper className="size-6 text-[#1877f2]" /> Study news
        </h1>
        <div className="mt-3">
          <Chips items={NEWS_CATS} value={cat} onChange={setCat} />
        </div>
      </section>
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4">
        {list.map((a) => (
          <article key={a.id} className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-center gap-2 p-3">
              <Avatar initials={a.src[0]} tone="bg-[#1877f2]" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#050505]">{a.src}</p>
                <p className="text-[13px] text-[#65676b]">
                  {a.time} · {a.cat}
                </p>
              </div>
              <button
                onClick={() => setSaved((s) => { const n = new Set(s); if (n.has(a.id)) n.delete(a.id); else n.add(a.id); return n; })}
                className={cn("grid size-9 place-items-center rounded-full", HOVER)}
                title="Save"
              >
                <Bookmark className={cn("size-5", saved.has(a.id) ? "fill-[#1877f2] text-[#1877f2]" : "text-[#65676b]")} />
              </button>
            </div>
            <div className={cn("h-48 bg-gradient-to-br", a.tone)} />
            <p className="p-3 text-[17px] font-semibold leading-snug text-[#050505]">{a.title}</p>
          </article>
        ))}
      </div>
    </GroupsLayout>
  );
}
