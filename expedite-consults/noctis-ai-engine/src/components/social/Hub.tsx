import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Beaker,
  Check,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  FlaskConical,
  Heart,
  MessageCircle,
  Play,
  Search,
  Share2,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { Avatar, Composer, POSTS, Post } from "@/components/social/StudySocial";
import { GroupsLayout } from "@/components/social/Groups";
import { cn } from "@/lib/utils";

/* Visual mockup only: certifications, labs, reels and counts are sample data. */

const BTN_BLUE = "bg-[#1877f2] text-white hover:bg-[#166fe5]";
const BTN_GREY = "bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]";
const HOVER = "hover:bg-[#e4e6eb]";
const CARD = "rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]";

/* --------------------------------- Certifications --------------------------------- */

type Cert = {
  id: string;
  name: string;
  full: string;
  field: string;
  cover: string;
  weeks: number;
  followers: number;
  about: string;
  domains: { name: string; weight: number }[];
  labs: string[];
};

export const CERTS: Cert[] = [
  {
    id: "secplus",
    name: "CompTIA Security+",
    full: "SY0-701 · Foundational cybersecurity",
    field: "Cybersecurity",
    cover: "from-sky-400 to-indigo-700",
    weeks: 8,
    followers: 18400,
    about: "The most common first cybersecurity certification. Covers threats, architecture, operations and governance.",
    domains: [
      { name: "General security concepts", weight: 12 },
      { name: "Threats, vulnerabilities and mitigations", weight: 22 },
      { name: "Security architecture", weight: 18 },
      { name: "Security operations", weight: 28 },
      { name: "Program management and oversight", weight: 20 },
    ],
    labs: ["Packet capture and triage", "Firewall rule hardening", "Phishing simulation review"],
  },
  {
    id: "aws",
    name: "AWS Cloud Practitioner",
    full: "CLF-C02 · Cloud fundamentals",
    field: "Cloud",
    cover: "from-amber-400 to-orange-700",
    weeks: 5,
    followers: 22100,
    about: "Cloud concepts, core AWS services, security, pricing and support in a beginner-friendly exam.",
    domains: [
      { name: "Cloud concepts", weight: 24 },
      { name: "Security and compliance", weight: 30 },
      { name: "Cloud technology and services", weight: 34 },
      { name: "Billing, pricing and support", weight: 12 },
    ],
    labs: ["Launch an S3 static site", "IAM least-privilege policy"],
  },
  {
    id: "cissp",
    name: "CISSP",
    full: "ISC2 · Advanced security leadership",
    field: "Cybersecurity",
    cover: "from-slate-500 to-slate-900",
    weeks: 16,
    followers: 9600,
    about: "Eight domains of security leadership for experienced practitioners. Requires five years of experience.",
    domains: [
      { name: "Security and risk management", weight: 16 },
      { name: "Asset security", weight: 10 },
      { name: "Security architecture and engineering", weight: 13 },
      { name: "Communication and network security", weight: 13 },
      { name: "Identity and access management", weight: 13 },
      { name: "Security assessment and testing", weight: 12 },
      { name: "Security operations", weight: 13 },
      { name: "Software development security", weight: 10 },
    ],
    labs: ["Risk register workshop", "Business continuity tabletop"],
  },
  {
    id: "cka",
    name: "Certified Kubernetes Administrator",
    full: "CNCF · Hands-on cluster operations",
    field: "Cloud",
    cover: "from-blue-400 to-cyan-700",
    weeks: 10,
    followers: 7300,
    about: "A hands-on, performance-based exam: install, configure and troubleshoot real clusters.",
    domains: [
      { name: "Cluster architecture and installation", weight: 25 },
      { name: "Workloads and scheduling", weight: 15 },
      { name: "Services and networking", weight: 20 },
      { name: "Storage", weight: 10 },
      { name: "Troubleshooting", weight: 30 },
    ],
    labs: ["Bootstrap a cluster with kubeadm", "Debug a CrashLoopBackOff"],
  },
];

const FIELDS = ["All", "Cybersecurity", "Cloud"] as const;

/** /certs: Hub certification discovery (Facebook Pages discovery layout). */
export function CertsHome() {
  const [q, setQ] = useState("");
  const [field, setField] = useState<(typeof FIELDS)[number]>("All");
  const list = CERTS.filter((c) => (field === "All" || c.field === field) && (c.name + c.full).toLowerCase().includes(q.toLowerCase()));
  return (
    <GroupsLayout>
      <section className={cn(CARD, "p-4")}>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#050505]">
          <Award className="size-6 text-[#1877f2]" /> Certifications
        </h1>
        <p className="text-[15px] text-[#65676b]">Follow a certification to get a study plan, labs and a community.</p>
        <label className="mt-3 flex h-10 items-center gap-2 rounded-full bg-[#f0f2f5] px-3 text-[#65676b]">
          <Search className="size-4" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search certifications"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#050505] outline-none placeholder:text-[#65676b]"
          />
        </label>
        <div className="mt-3 flex gap-2">
          {FIELDS.map((f) => (
            <button
              key={f}
              onClick={() => setField(f)}
              className={cn("rounded-full px-3 py-1.5 text-[15px] font-semibold", field === f ? "bg-[#e7f3ff] text-[#1877f2]" : BTN_GREY)}
            >
              {f}
            </button>
          ))}
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <Link key={c.id} to="/certs/$certId" params={{ certId: c.id }} className={cn(CARD, "overflow-hidden hover:shadow-md")}>
            <div className={cn("grid h-28 place-items-center bg-gradient-to-br text-white", c.cover)}>
              <ShieldCheck className="size-12 opacity-90" />
            </div>
            <div className="p-3">
              <p className="text-[17px] font-semibold leading-tight text-[#050505]">{c.name}</p>
              <p className="text-[13px] text-[#65676b]">{c.full}</p>
              <p className="mt-1 text-[13px] text-[#65676b]">
                {c.followers.toLocaleString()} following · ~{c.weeks} weeks
              </p>
            </div>
          </Link>
        ))}
        {list.length === 0 ? <p className="p-4 text-[15px] text-[#65676b]">No certifications match.</p> : null}
      </div>
    </GroupsLayout>
  );
}

const CERT_TABS = ["Overview", "Study plan", "Labs", "Community"] as const;
type CertTab = (typeof CERT_TABS)[number];

/** /certs/$certId: a certification shown as a Facebook Page (Follow, tabs, posts). */
export function CertPage({ certId }: { certId: string }) {
  const cert = CERTS.find((c) => c.id === certId);
  const [tab, setTab] = useState<CertTab>("Overview");
  const [following, setFollowing] = useState(true);
  const [done, setDone] = useState<Set<number>>(new Set([0]));
  if (!cert) {
    return (
      <GroupsLayout>
        <section className={cn(CARD, "p-6 text-center")}>
          <h1 className="text-xl font-bold">This certification isn't available</h1>
          <Link to="/certs" className={cn("mt-4 inline-block rounded-md px-4 py-2 text-[15px] font-semibold", BTN_BLUE)}>
            Back to certifications
          </Link>
        </section>
      </GroupsLayout>
    );
  }
  const weeks = Array.from({ length: cert.weeks }, (_, i) => `Week ${i + 1}: ${cert.domains[i % cert.domains.length].name}`);
  const pct = Math.round((done.size / weeks.length) * 100);
  const posts = POSTS.slice(0, 2).map((p) => ({ ...p, group: cert.name }));
  return (
    <GroupsLayout wide>
      <section className={cn(CARD, "overflow-hidden")}>
        <div className={cn("grid h-40 place-items-center bg-gradient-to-br text-white sm:h-60", cert.cover)}>
          <ShieldCheck className="size-16 opacity-90" />
        </div>
        <div className="px-4 pt-3">
          <h1 className="text-[28px] font-bold leading-tight text-[#050505]">{cert.name}</h1>
          <p className="text-[15px] text-[#65676b]">
            {cert.full} · {cert.followers.toLocaleString()} following
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setFollowing((v) => !v)}
              className={cn("rounded-md px-4 py-2 text-[15px] font-semibold", following ? BTN_GREY : BTN_BLUE)}
            >
              {following ? "Following ✓" : "Follow"}
            </button>
            <button className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-[15px] font-semibold", BTN_BLUE)}>
              <Target className="size-4" /> Take a practice exam
            </button>
          </div>
        </div>
        <nav className="mx-4 mt-3 flex gap-1 overflow-x-auto border-t border-[#ced0d4]">
          {CERT_TABS.map((t) => (
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

      {tab === "Overview" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <section className={cn(CARD, "p-4")}>
            <h2 className="mb-2 text-[20px] font-bold">About</h2>
            <p className="text-[15px] leading-snug text-[#050505]">{cert.about}</p>
          </section>
          <section className={cn(CARD, "p-4")}>
            <h2 className="mb-3 text-[20px] font-bold">Exam domains</h2>
            {cert.domains.map((d) => (
              <div key={d.name} className="mb-3">
                <div className="flex justify-between text-[14px] text-[#050505]">
                  <span>{d.name}</span>
                  <span className="font-semibold">{d.weight}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e4e6eb]">
                  <div className="h-full rounded-full bg-[#1877f2]" style={{ width: `${d.weight * 3}%` }} />
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : null}

      {tab === "Study plan" ? (
        <section className={cn(CARD, "mx-auto w-full max-w-[680px] p-4")}>
          <h2 className="text-[20px] font-bold">{cert.weeks}-week study plan</h2>
          <div className="my-3 h-2 overflow-hidden rounded-full bg-[#e4e6eb]">
            <div className="h-full rounded-full bg-[#1877f2]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mb-2 text-[13px] text-[#65676b]">{pct}% complete</p>
          {weeks.map((w, i) => (
            <button
              key={w}
              onClick={() => setDone((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
              className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", HOVER)}
            >
              <span className={cn("grid size-7 place-items-center rounded-full", done.has(i) ? "bg-[#31a24c] text-white" : "bg-[#e4e6eb] text-[#65676b]")}>
                {done.has(i) ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="text-[15px] text-[#050505]">{w}</span>
            </button>
          ))}
        </section>
      ) : null}

      {tab === "Labs" ? (
        <section className={cn(CARD, "mx-auto w-full max-w-[680px] p-4")}>
          <h2 className="mb-2 text-[20px] font-bold">Hands-on labs</h2>
          {cert.labs.map((l) => (
            <div key={l} className="flex items-center gap-3 border-t border-[#e4e6eb] py-3 first:border-0">
              <span className="grid size-12 place-items-center rounded-lg bg-[#e7f3ff] text-[#1877f2]">
                <FlaskConical className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#050505]">{l}</p>
                <p className="text-[13px] text-[#65676b]">Guided lab · about 30 minutes</p>
              </div>
              <button className={cn("rounded-md px-4 py-2 text-[15px] font-semibold", BTN_BLUE)}>Launch</button>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "Community" ? (
        <div className="mx-auto flex w-full max-w-[680px] flex-col gap-4">
          <Composer />
          {posts.map((p) => (
            <Post key={p.id} post={p} />
          ))}
        </div>
      ) : null}
    </GroupsLayout>
  );
}

/* ------------------------------------- Reels ------------------------------------- */

const REELS = [
  { id: 1, by: "Ama Boateng", initials: "AB", tone: "bg-amber-500", bg: "from-amber-400 to-orange-700", cap: "SN1 vs SN2 in 60 seconds", tag: "Chemistry", likes: 4210, comments: 188 },
  { id: 2, by: "Kofi Mensah", initials: "KM", tone: "bg-sky-600", bg: "from-sky-400 to-indigo-700", cap: "3 ports you must know for Security+", tag: "Cybersecurity", likes: 9870, comments: 412 },
  { id: 3, by: "Lena Park", initials: "LP", tone: "bg-emerald-600", bg: "from-emerald-400 to-teal-700", cap: "Ratio test, explained with one example", tag: "Mathematics", likes: 3350, comments: 97 },
  { id: 4, by: "Dev Patel", initials: "DP", tone: "bg-fuchsia-600", bg: "from-fuchsia-400 to-purple-700", cap: "How I memorise 100 flashcards a day", tag: "Study tips", likes: 12900, comments: 640 },
] as const;
const REEL_TABS = ["For you", "Following", "Drills"] as const;

/** /watch: Reels in the Facebook Watch/Reels layout. Vertical card, action rail, up/down navigation. */
export function WatchReels() {
  const [tab, setTab] = useState<(typeof REEL_TABS)[number]>("For you");
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(true);
  const reel = REELS[i];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") setI((v) => Math.min(REELS.length - 1, v + 1));
      if (e.key === "ArrowUp") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const isLiked = liked.has(reel.id);
  return (
    <GroupsLayout current="none">
      <div className="mx-auto flex w-full max-w-[680px] gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex gap-2">
            {REEL_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn("rounded-full px-3 py-1.5 text-[15px] font-semibold", tab === t ? "bg-[#e7f3ff] text-[#1877f2]" : BTN_GREY)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className={cn("relative mx-auto flex aspect-[9/16] max-h-[calc(100dvh-11rem)] w-full max-w-[380px] items-end overflow-hidden rounded-xl bg-gradient-to-b", reel.bg)}>
            <button onClick={() => setPlaying((v) => !v)} className="absolute inset-0 grid place-items-center text-white/90" title={playing ? "Pause" : "Play"}>
              {playing ? null : <Play className="size-16 fill-current" />}
            </button>
            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[12px] font-semibold text-white">{reel.tag}</span>
            <div className="pointer-events-none relative w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <div className="flex items-center gap-2">
                <Avatar initials={reel.initials} tone={reel.tone} size="size-9" />
                <span className="text-[15px] font-semibold">{reel.by}</span>
                <span className="pointer-events-auto rounded-md border border-white/70 px-2 py-0.5 text-[13px] font-semibold">Follow</span>
              </div>
              <p className="mt-2 text-[15px]">{reel.cap}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-end gap-3 pb-4">
          <button onClick={() => setI((v) => Math.max(0, v - 1))} className="grid size-10 place-items-center rounded-full bg-[#e4e6eb]" title="Previous reel">
            <ChevronUp className="size-5" />
          </button>
          <button
            onClick={() => setLiked((s) => { const n = new Set(s); if (n.has(reel.id)) n.delete(reel.id); else n.add(reel.id); return n; })}
            className="flex flex-col items-center text-[12px] text-[#65676b]"
          >
            <span className="grid size-11 place-items-center rounded-full bg-[#e4e6eb]">
              <Heart className={cn("size-6", isLiked ? "fill-[#f3425f] text-[#f3425f]" : "text-[#050505]")} />
            </span>
            {(reel.likes + (isLiked ? 1 : 0)).toLocaleString()}
          </button>
          <button className="flex flex-col items-center text-[12px] text-[#65676b]">
            <span className="grid size-11 place-items-center rounded-full bg-[#e4e6eb]"><MessageCircle className="size-6 text-[#050505]" /></span>
            {reel.comments}
          </button>
          <button className="flex flex-col items-center text-[12px] text-[#65676b]">
            <span className="grid size-11 place-items-center rounded-full bg-[#e4e6eb]"><Share2 className="size-6 text-[#050505]" /></span>
            Share
          </button>
          <button className="flex flex-col items-center text-[12px] text-[#65676b]" title="Take the 60-second drill">
            <span className="grid size-11 place-items-center rounded-full bg-[#1877f2] text-white"><Beaker className="size-6" /></span>
            Drill
          </button>
          <button onClick={() => setI((v) => Math.min(REELS.length - 1, v + 1))} className="grid size-10 place-items-center rounded-full bg-[#e4e6eb]" title="Next reel">
            <ChevronDown className="size-5" />
          </button>
        </div>
      </div>
      <p className="mx-auto flex items-center gap-1.5 text-[13px] text-[#65676b]">
        <Clapperboard className="size-4" /> Reel {i + 1} of {REELS.length} · use ↑ ↓ to navigate
        <Users className="ml-2 size-4" /> {tab}
      </p>
    </GroupsLayout>
  );
}
