import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useRouter, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { PATHS } from "@/lib/paths";
import { TREES, treeProgress } from "@/lib/learn";
import { labForStamp } from "@/lib/hire-desk";
import { useFeedStore } from "@/lib/feed-store";
import { scrollToFeed } from "@/lib/syndicate";
import { cn } from "@/lib/utils";
import { HallSpread } from "@/components/learn/HallSpread";
import { TREE_HALL, hallsOn } from "@/lib/hall-surfaces";
import { LEARN_PATHS, PATH_LEVELS } from "@/lib/today-learned";
import { CLINIC_DESKS, type ClinicDeskId } from "@/lib/ingest-sources";
import { GOALS } from "@/lib/learn";
import { addHours, raiseDna, readDna } from "@/lib/hall-record";
import { CERT_TRACKS } from "@/lib/cert-academy";
import { CAREERS } from "@/lib/career-nav";
import { NoctisMoves } from "@/components/noctis/NoctisMoves";

const STEPS = "vibetok-path-steps";
const STARTED = "vibetok-path-started";
const CURRENT = "vibetok-path-current";
const STAMPS = "vibetok-path-stamps";

const PATH_KIND: Record<string, "knowledge" | "professional"> = {
  cyber: "knowledge",
  cloud: "knowledge",
  data: "knowledge",
  math: "knowledge",
  language: "knowledge",
  code: "knowledge",
  care: "knowledge",
  trades: "professional",
  career: "professional",
  business: "professional",
};

const PATH_CERTS: Record<string, string[]> = {
  cyber: ["secplus", "cissp"],
  cloud: ["aws", "azure", "cka"],
  care: ["nclex"],
};

const PATH_CAREERS: Record<string, string[]> = {
  cyber: ["cyber-analyst", "network-engineer", "cyber-architect"],
  care: ["physician", "pharmacist"],
  trades: ["electrician", "carpenter", "mechanic"],
  code: ["software-engineer"],
};

const PATH_DNA: Record<string, string> = {
  cyber: "Cybersecurity",
  math: "Mathematics",
  calc: "Mathematics",
  cloud: "Cloud computing",
  robotics: "Control",
  music: "Listen",
  lens: "Photography",
  campus: "Campus literacy",
};

function readList(key: string) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function readSteps() {
  try {
    const raw = JSON.parse(localStorage.getItem(STEPS) || "{}") as Record<string, string[]>;
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function band(pct: number) {
  if (pct >= 100) return "Professional";
  if (pct >= 67) return "Advanced";
  if (pct >= 34) return "Intermediate";
  if (pct > 0) return "Beginner";
  return "Not started";
}

function verb(pct: number, started: boolean) {
  if (pct >= 100) return "Review path";
  if (pct > 0 || started) return "Continue path";
  return "Start path";
}

export const Route = createFileRoute("/paths")({ component: PathsPage });

const MAPS = TREES.map((tree) => {
  const path = PATHS.find((p) => p.id === tree.id);
  return {
    id: tree.id,
    subject: path?.subject ?? tree.name,
    stamp: path?.stamp ?? tree.nodes[0]?.label ?? tree.name,
    cover: path?.cover ?? "/media/posts/calc.jpg",
    nodes: tree.nodes,
  };
});

function PathsPage() {
  const passed = useFeedStore((s) => s.drillPassed);
  const stamps = useFeedStore((s) => s.earnedStamps);
  const posts = useFeedStore((s) => s.posts);
  const clinicDesk = useFeedStore((s) => s.clinicDesk);
  const goal = useFeedStore((s) => s.goal);
  const awardXp = useFeedStore((s) => s.awardXp);
  const [steps, setSteps] = useState<Record<string, string[]>>(readSteps);
  const [started, setStarted] = useState<string[]>(() => readList(STARTED));
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [lane, setLane] = useState<"all" | "knowledge" | "professional" | "lifestyle">("all");
  const [currentId, setCurrentId] = useState(() => (typeof localStorage === "undefined" ? "" : localStorage.getItem(CURRENT) || ""));
  const [marks, setMarks] = useState<string[]>(() => readList(STAMPS));
  const goalLabel = GOALS.find((item) => item.id === goal)?.label ?? "";
  const hash = useRouterState({ select: (s) => s.location.hash.replace("#", "") });
  const mapHalls = hallsOn("map");
  const deskFromHash = mapHalls.some((h) => h.id === hash || h.map === hash) ? mapHalls.find((h) => h.id === hash || h.map === hash)!.id : null;
  const start = MAPS.some((m) => m.id === hash) ? hash : deskFromHash ?? (clinicDesk !== "all" && mapHalls.some((h) => h.id === clinicDesk) ? clinicDesk : "all");
  const [tab, setTab] = useState(start);
  const router = useRouter();

  useEffect(() => {
    const mapHalls = hallsOn("map");
    if (hash === "all" || MAPS.some((m) => m.id === hash)) setTab(hash || "all");
    else if (mapHalls.some((h) => h.id === hash || h.map === hash)) {
      const hall = mapHalls.find((h) => h.id === hash || h.map === hash)!;
      setTab(hall.map && MAPS.some((m) => m.id === hall.map) ? hall.map : hall.id);
    }
  }, [hash]);

  const desk: ClinicDeskId | "all" =
    tab === "all"
      ? "all"
      : mapHalls.some((h) => h.id === tab)
        ? (tab as ClinicDeskId)
        : (TREE_HALL[tab] ?? "all");

  const shown = useMemo(() => {
    if (tab === "all") return MAPS;
    if (MAPS.some((m) => m.id === tab)) return MAPS.filter((m) => m.id === tab);
    return MAPS.filter((m) => TREE_HALL[m.id] === desk);
  }, [tab, desk]);

  const paths = LEARN_PATHS.filter((p) => (desk === "all" || p.hall === desk) && (lane === "all" || PATH_KIND[p.id] === lane));
  const current = LEARN_PATHS.find((p) => p.id === currentId) ?? null;
  const currentStages = current ? PATH_LEVELS.flatMap((level) => current.levels[level].map((label) => ({ level, label, key: `${level}:${label}` }))) : [];
  const currentHeld = current ? steps[current.id] ?? [] : [];
  const currentCount = currentStages.filter((row) => currentHeld.includes(row.key)).length;
  const currentPct = currentStages.length ? Math.round((currentCount / currentStages.length) * 100) : 0;
  const nextStage = currentStages.find((row) => !currentHeld.includes(row.key));

  function openPost(postId: string) {
    void router.navigate({ to: "/", hash: "feed" });
    window.setTimeout(() => scrollToFeed(postId), 160);
  }

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Paths</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Structured learning and growth</h1>
          <p className="mt-2 text-sm text-muted">A path is the order. Hall is the library. A stage counts only after you complete it.</p>
        </header>
        <section className="rounded-2xl bg-surface p-4 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">My Journey</p>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Current goal</dt>
              <dd className="mt-0.5 font-semibold">{goalLabel || "Set a goal"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Current path</dt>
              <dd className="mt-0.5 font-semibold">{current?.title ?? "Start a path"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Progress</dt>
              <dd className="mt-0.5 font-semibold">{current ? `${currentPct}%` : "Not started"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Recommended by Vibe</dt>
              <dd className="mt-0.5 font-semibold">{nextStage ? nextStage.label : current ? "Review the finished path" : "Pick a path"}</dd>
            </div>
          </dl>
        </section>
        <div className="flex flex-wrap gap-2">
          {(["all", "knowledge", "professional", "lifestyle"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setLane(id)}
              className={cn("inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold capitalize", lane === id ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
            >
              {id === "all" ? "All" : `${id} paths`}
            </button>
          ))}
        </div>
        {lane === "lifestyle" ? <p className="text-sm text-muted">No lifestyle path is stored yet.</p> : null}
        <HallSpread
          tab="map"
          active={desk === "all" ? undefined : desk}
          onPick={(id) => {
            const row = mapHalls.find((h) => h.id === id);
            const next = row?.map && MAPS.some((m) => m.id === row.map) ? row.map : id;
            setTab(next);
            void router.navigate({ to: "/paths", hash: next, replace: true });
          }}
        />

        <div className="flex flex-wrap gap-2">
          <Link
            to="/paths"
            hash="all"
            className={cn(
              "inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold",
              tab === "all" ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            All
          </Link>
          {MAPS.map((m) => (
            <Link
              key={m.id}
              to="/paths"
              hash={m.id}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold",
                tab === m.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              {m.subject}
            </Link>
          ))}
        </div>

        {paths.map((p) => {
          const stages = PATH_LEVELS.flatMap((level) => p.levels[level].map((label) => ({ level, label, key: `${level}:${label}` })));
          const held = steps[p.id] ?? [];
          const count = stages.filter((row) => held.includes(row.key)).length;
          const pct = stages.length ? Math.round((count / stages.length) * 100) : 0;
          const dnaName = PATH_DNA[p.id];
          const dna = dnaName ? readDna()[dnaName] ?? 0 : 0;
          const certs = (PATH_CERTS[p.id] ?? []).map((id) => CERT_TRACKS.find((row) => row.id === id)).filter((row) => row != null);
          const careers = (PATH_CAREERS[p.id] ?? []).map((id) => CAREERS.find((row) => row.id === id)).filter((row) => row != null);
          const open = openPath === p.id;
          const ask = `Path: ${p.title}. Stages: ${stages.map((row) => row.label).slice(0, 8).join(", ")}. Progress: ${count} of ${stages.length}. Use only these stages. What should I do next?`;
          return (
            <article key={p.id} className="rounded-2xl bg-surface p-4 shadow-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                {CLINIC_DESKS.find((d) => d.id === p.hall)?.label ?? p.hall} · path
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold">{p.title}</h2>
              <p className="mt-1 text-xs text-muted">{PATH_LEVELS.join(" → ")}</p>
              <p className="mt-1 text-sm text-muted">{p.capstone}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-muted">
                <span>Progress</span>
                <span>{count} of {stages.length} stages · {pct}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-elevated">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">Current level: {band(pct)}. Readiness: {pct}%.</p>
              <p className="mt-1 text-xs text-muted">Weak area: {stages.find((row) => !held.includes(row.key))?.label ?? "None. This path is finished."}</p>
              <p className="mt-1 text-xs text-muted">Key areas: {p.levels.Beginner.slice(0, 5).join(" · ")}</p>
              <p className="mt-1 text-xs text-muted">{dnaName ? `Knowledge DNA: ${dnaName} ${dna}. Each finished stage adds 1.` : "No DNA strand is stored for this path."}</p>
              <p className="mt-1 text-xs text-muted">
                {goalLabel && (p.hall === "cyber" || p.hall === "math" || p.hall === "care") && goal === "exam"
                  ? `Recommended by Vibe. Matches your goal: ${goalLabel}.`
                  : dna > 0
                    ? "Recommended by Vibe. Matches your Knowledge DNA."
                    : "Not matched to a stored goal yet."}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-subtle">Careers</p>
              <p className="mt-1 text-sm">{careers.length ? careers.map((row) => row.name).join(" · ") : "No career card is stored for this path."}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-subtle">Certifications</p>
              <p className="mt-1 text-sm">
                {certs.length ? certs.map((row) => (
                  <a key={row.id} href={row.href} target="_blank" rel="noreferrer" className="mr-2 font-semibold text-primary">{row.label}</a>
                )) : "No certification is stored for this path."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStarted((cur) => {
                      if (cur.includes(p.id)) return cur;
                      const next = [p.id, ...cur];
                      localStorage.setItem(STARTED, JSON.stringify(next));
                      localStorage.setItem(CURRENT, p.id);
                      setCurrentId(p.id);
                      addHours(0.1);
                      awardXp(5);
                      return next;
                    });
                    if (started.includes(p.id)) {
                      localStorage.setItem(CURRENT, p.id);
                      setCurrentId(p.id);
                    }
                    setOpenPath(p.id);
                  }}
                  className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
                >
                  {verb(pct, started.includes(p.id))}
                </button>
                <Link to="/hall" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Hall lessons</Link>
                {careers[0] ? (
                  <Link to="/openings" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Career</Link>
                ) : null}
              </div>
              {open ? (
                <div className="mt-3 space-y-2">
                  <ol className="space-y-1">
                    {stages.map((row, index) => {
                      const finished = held.includes(row.key);
                      const current = !finished && stages.findIndex((item) => !held.includes(item.key)) === index;
                      return (
                        <li key={row.key}>
                          <button
                            type="button"
                            disabled={!finished && !current}
                            onClick={() => {
                              if (!finished && !current) return;
                              const nextHeld = finished ? held.filter((key) => key !== row.key) : [...held, row.key];
                              const book = { ...steps, [p.id]: nextHeld };
                              localStorage.setItem(STEPS, JSON.stringify(book));
                              setSteps(book);
                              if (!finished) {
                                if (dnaName) raiseDna([dnaName], 1);
                                addHours(0.05);
                                awardXp(5);
                                const levelDone = stages.filter((item) => item.level === row.level).every((item) => nextHeld.includes(item.key));
                                if (levelDone) {
                                  const mark = `${p.title} · ${row.level}`;
                                  setMarks((cur) => {
                                    if (cur.includes(mark)) return cur;
                                    const next = [mark, ...cur];
                                    localStorage.setItem(STAMPS, JSON.stringify(next));
                                    return next;
                                  });
                                }
                              }
                            }}
                            className="flex min-h-11 w-full items-center justify-between rounded-xl bg-elevated px-3 text-left text-sm disabled:opacity-60"
                          >
                            <span>{row.level} · {row.label}</span>
                            <span className="text-xs text-muted">{finished ? "Completed" : current ? "Current" : "Locked"}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  <NoctisMoves items={[
                    { label: "Explain path", ask },
                    { label: "Next step", ask: `${ask} The next stage is ${stages.find((row) => !held.includes(row.key))?.label ?? "review"}.` },
                    { label: "Hall lessons", ask: `${ask} Which stored stage should I open in Hall?` },
                    { label: "Resources", ask: `${ask} The resources on the page are Hall, labs, and courses. Do not invent a book.` },
                    { label: "Careers", ask: `${ask} Careers stored for this path: ${careers.map((row) => row.name).join(", ") || "none"}.` },
                  ]} />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Resources</p>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/hall" className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold">Hall</Link>
                    <Link to="/hub" className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold">Labs</Link>
                    <Link to="/study" search={{ desk: undefined, family: undefined, step: undefined }} className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold">Courses</Link>
                    {["cyber", "cloud", "code", "data"].includes(p.id) ? (
                      <Link to="/hub/fleet" className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold">Study this properly</Link>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted">No book is stored for this path. Practice is the stage list above.</p>
                  <p className="text-xs text-muted">Skill stamps: {marks.filter((mark) => mark.startsWith(p.title)).join(" · ") || "None yet. A level stamp appears when every stage in that level is done."}</p>
                </div>
              ) : null}
            </article>
          );
        })}

        {(lane === "all" || lane === "knowledge") ? shown.map((path) => {
          const pct = treeProgress(path.id, passed);
          const held = stamps.includes(path.stamp);
          const labId = labForStamp(path.stamp);
          return (
            <article key={path.id} className="overflow-hidden rounded-2xl bg-surface shadow-border">
              <img src={path.cover} alt="" className="h-28 w-full object-cover" />
              <div className="p-4">
                <h2 className="font-display text-lg font-semibold">{path.subject}</h2>
                <p className="text-xs text-muted">
                  Stamp {path.stamp}
                  {held ? " · held" : ""}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated">
                  <span className="dna-fill block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {path.nodes.filter((n) => passed[n.postId]).length} of {path.nodes.length} clips · Readiness: {band(pct)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {PATH_DNA[path.id] ? `Knowledge DNA: ${PATH_DNA[path.id]} ${readDna()[PATH_DNA[path.id]] ?? 0}` : "No DNA strand is stored for this path."}
                </p>
                <ul className="mt-3 space-y-1">
                  {path.nodes.map((n) => {
                    const post = posts.find((p) => p.id === n.postId);
                    const done = Boolean(passed[n.postId]);
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => (post ? openPost(post.id) : undefined)}
                          className="flex min-h-11 w-full items-center justify-between rounded-xl px-2 text-left text-sm font-semibold"
                        >
                          <span>{n.label}</span>
                          <span className="text-xs text-muted">{done ? "stamped" : "open clip"}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {path.nodes[0] ? (
                    <button
                      type="button"
                      onClick={() => openPost(path.nodes[0]!.postId)}
                      className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
                    >
                      Open in Academy
                    </button>
                  ) : null}
                  {path.id === "cyber" ? (
                    <Link to="/hub/fleet" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">
                      Study this properly
                    </Link>
                  ) : null}
                  {labId ? (
                    <Link
                      to="/hub/lab/$id"
                      params={{ id: labId }}
                      className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold"
                    >
                      Range lab
                    </Link>
                  ) : (
                    <Link to="/openings" hash="hire" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">
                      Skill stamp
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        }) : null}
      </ClinicFrame>
    </AppShell>
  );
}
