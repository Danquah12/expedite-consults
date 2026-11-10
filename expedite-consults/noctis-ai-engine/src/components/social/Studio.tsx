import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Check,
  FileText,
  Flag,
  Home,
  Inbox,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { NoctisMark } from "@/components/brand/NoctisMark";
import { Avatar } from "@/components/social/StudySocial";
import { cn } from "@/lib/utils";

/* Visual mockup only: numbers, content, reports and members are sample data. Real staff tools live at /desk. */

const BTN_BLUE = "bg-[#1877f2] text-white hover:bg-[#166fe5]";
const BTN_GREY = "bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]";
const HOVER = "hover:bg-[#e4e6eb]";
const CARD = "rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]";

const NAV = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "content", label: "Content", icon: FileText },
  { id: "moderation", label: "Moderation", icon: ShieldCheck },
  { id: "members", label: "Members", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
] as const;
type NavId = (typeof NAV)[number]["id"];

const STATS = [
  { label: "Active learners (7d)", value: "12,480", delta: "+8.2%", up: true },
  { label: "Study hours logged", value: "86,310", delta: "+12.4%", up: true },
  { label: "Posts and answers", value: "4,902", delta: "+3.1%", up: true },
  { label: "Open reports", value: "17", delta: "-5", up: false },
];

const WEEK = [38, 52, 47, 66, 71, 58, 83];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CONTENT = [
  { title: "Security+ Domain 3 cheat sheet", type: "Notes", status: "Published", views: 18200 },
  { title: "SN1 vs SN2 in 60 seconds", type: "Reel", status: "Published", views: 41300 },
  { title: "Integration by parts: live room recap", type: "Post", status: "Scheduled", views: 0 },
  { title: "MCAT flashcard deck v2", type: "Resource", status: "Draft", views: 0 },
];

const REPORTS = [
  { id: 1, what: "Post in Calculus II Survivors", why: "Spam or promotion", who: "Reported by 3 members" },
  { id: 2, what: "Comment on Security+ crash course", why: "Shares leaked exam content", who: "Reported by 1 member" },
  { id: 3, what: "Marketplace listing: TI-84", why: "Possible scam", who: "Reported by 2 members" },
];

const MEMBERS = [
  { name: "Ama Boateng", role: "Admin", initials: "AB", tone: "bg-amber-500", joined: "Jan 2026" },
  { name: "Kofi Mensah", role: "Mentor", initials: "KM", tone: "bg-sky-600", joined: "Feb 2026" },
  { name: "Lena Park", role: "Mentor", initials: "LP", tone: "bg-emerald-600", joined: "Feb 2026" },
  { name: "Dev Patel", role: "Member", initials: "DP", tone: "bg-fuchsia-600", joined: "Mar 2026" },
];

function Overview() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className={cn(CARD, "p-4")}>
            <p className="text-[13px] text-[#65676b]">{s.label}</p>
            <p className="mt-1 text-[28px] font-bold leading-none text-[#050505]">{s.value}</p>
            <p className={cn("mt-1 text-[13px] font-semibold", s.up ? "text-[#31a24c]" : "text-[#1877f2]")}>{s.delta} vs last week</p>
          </div>
        ))}
      </div>
      <Chart />
    </>
  );
}

function Chart() {
  const max = Math.max(...WEEK);
  return (
    <section className={cn(CARD, "p-4")}>
      <h2 className="text-[17px] font-bold text-[#050505]">Study sessions this week</h2>
      <div className="mt-4 flex h-44 items-end gap-3">
        {WEEK.map((v, i) => (
          <div key={DAYS[i]} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[12px] font-semibold text-[#65676b]">{v}</span>
            <div className="w-full rounded-t bg-[#1877f2]" style={{ height: `${(v / max) * 100}%` }} />
            <span className="text-[12px] text-[#65676b]">{DAYS[i]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContentTable() {
  const color: Record<string, string> = { Published: "bg-[#e6f4ea] text-[#1e7d32]", Scheduled: "bg-[#e7f3ff] text-[#1877f2]", Draft: "bg-[#e4e6eb] text-[#65676b]" };
  return (
    <section className={cn(CARD, "overflow-x-auto p-4")}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-[#050505]">Content</h2>
        <button className={cn("rounded-md px-3 py-2 text-[15px] font-semibold", BTN_BLUE)}>+ Create</button>
      </div>
      <table className="w-full min-w-[480px] text-left text-[15px]">
        <thead className="text-[13px] text-[#65676b]">
          <tr>
            <th className="py-2 font-semibold">Title</th>
            <th className="font-semibold">Type</th>
            <th className="font-semibold">Status</th>
            <th className="text-right font-semibold">Views</th>
          </tr>
        </thead>
        <tbody>
          {CONTENT.map((c) => (
            <tr key={c.title} className="border-t border-[#e4e6eb]">
              <td className="py-3 pr-2 font-medium text-[#050505]">{c.title}</td>
              <td className="text-[#65676b]">{c.type}</td>
              <td>
                <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-semibold", color[c.status])}>{c.status}</span>
              </td>
              <td className="text-right text-[#050505]">{c.views.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Moderation() {
  const [open, setOpen] = useState(REPORTS);
  const [log, setLog] = useState<string[]>([]);
  const resolve = (id: number, action: string) => {
    const r = open.find((x) => x.id === id);
    setOpen((o) => o.filter((x) => x.id !== id));
    if (r) setLog((l) => [`${action}: ${r.what}`, ...l]);
  };
  return (
    <section className={cn(CARD, "p-4")}>
      <h2 className="mb-3 flex items-center gap-2 text-[17px] font-bold text-[#050505]">
        <Flag className="size-5 text-[#e41e3f]" /> Reports queue ({open.length})
      </h2>
      {open.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-3 border-t border-[#e4e6eb] py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[#050505]">{r.what}</p>
            <p className="text-[13px] text-[#65676b]">
              {r.why} · {r.who}
            </p>
          </div>
          <button onClick={() => resolve(r.id, "Kept")} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[14px] font-semibold", BTN_GREY)}>
            <Check className="size-4" /> Keep
          </button>
          <button onClick={() => resolve(r.id, "Removed")} className="flex items-center gap-1.5 rounded-md bg-[#e41e3f] px-3 py-1.5 text-[14px] font-semibold text-white">
            <X className="size-4" /> Remove
          </button>
        </div>
      ))}
      {open.length === 0 ? <p className="py-4 text-[15px] text-[#65676b]">The queue is clear.</p> : null}
      {log.length > 0 ? (
        <div className="mt-3 border-t border-[#e4e6eb] pt-3">
          <p className="text-[13px] font-semibold text-[#65676b]">Resolved this session</p>
          {log.map((l, i) => (
            <p key={`${l}-${i}`} className="text-[14px] text-[#050505]">{l}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Members() {
  return (
    <section className={cn(CARD, "p-4")}>
      <h2 className="mb-3 text-[17px] font-bold text-[#050505]">Members and roles</h2>
      {MEMBERS.map((m) => (
        <div key={m.name} className="flex items-center gap-3 border-t border-[#e4e6eb] py-3">
          <Avatar initials={m.initials} tone={m.tone} />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[#050505]">{m.name}</p>
            <p className="text-[13px] text-[#65676b]">Joined {m.joined}</p>
          </div>
          <select defaultValue={m.role} className="rounded-md bg-[#e4e6eb] px-2 py-1.5 text-[14px] font-semibold text-[#050505]">
            <option>Admin</option>
            <option>Mentor</option>
            <option>Member</option>
          </select>
        </div>
      ))}
    </section>
  );
}

/** /studio: Creator Studio / Business Suite style admin mockup. The real staff tools remain at /desk. */
export function CreatorStudio() {
  const [nav, setNav] = useState<NavId>("overview");
  return (
    <div className="flex min-h-dvh bg-[#f0f2f5] text-[#050505]">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[#ced0d4] bg-white p-3 md:flex">
        <Link to="/social" className="mb-4 flex items-center gap-2 px-2 py-1">
          <NoctisMark className="size-9" />
          <span className="text-[15px] font-bold leading-tight">
            Creator Studio
            <span className="block text-[12px] font-normal text-[#65676b]">noctis.social</span>
          </span>
        </Link>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setNav(id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] font-semibold",
              nav === id ? "bg-[#e7f3ff] text-[#1877f2]" : cn("text-[#050505]", HOVER),
            )}
          >
            <Icon className="size-5" /> {label}
          </button>
        ))}
        <Link to="/desk" className="mt-auto rounded-lg px-3 py-2.5 text-[14px] font-semibold text-[#65676b] hover:bg-[#e4e6eb]">
          Open staff desk
        </Link>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
          <h1 className="flex-1 text-[20px] font-bold">{NAV.find((n) => n.id === nav)?.label}</h1>
          <button className="grid size-10 place-items-center rounded-full bg-[#e4e6eb]" title="Inbox"><Inbox className="size-5" /></button>
          <button className="grid size-10 place-items-center rounded-full bg-[#e4e6eb]" title="Alerts"><Bell className="size-5" /></button>
          <Avatar initials="YOU" tone="bg-[#1c1e21]" />
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-[#ced0d4] bg-white px-2 md:hidden">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setNav(id)}
              className={cn("shrink-0 px-3 py-3 text-[14px] font-semibold", nav === id ? "border-b-[3px] border-[#1877f2] text-[#1877f2]" : "text-[#65676b]")}
            >
              {label}
            </button>
          ))}
        </nav>
        <main className="mx-auto flex max-w-[1100px] flex-col gap-4 p-4">
          {nav === "overview" ? <Overview /> : null}
          {nav === "insights" ? (
            <>
              <Chart />
              <Overview />
            </>
          ) : null}
          {nav === "content" ? <ContentTable /> : null}
          {nav === "moderation" ? <Moderation /> : null}
          {nav === "members" ? <Members /> : null}
          {nav === "settings" ? (
            <section className={cn(CARD, "p-4")}>
              <h2 className="mb-2 text-[17px] font-bold">Community settings</h2>
              {["Require approval for new members", "Allow marketplace listings", "Enable live study rooms"].map((s, i) => (
                <label key={s} className="flex items-center justify-between border-t border-[#e4e6eb] py-3 text-[15px]">
                  {s}
                  <input type="checkbox" defaultChecked={i !== 0} className="size-5 accent-[#1877f2]" />
                </label>
              ))}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
