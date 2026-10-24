import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { PostCard } from "@/components/feed/PostCard";
import { FeedPlaybackSync } from "@/components/feed/FeedPlaybackSync";
import { HydrateMedia } from "@/components/feed/HydrateMedia";
import { useFeedStore } from "@/lib/feed-store";
import { ANIMAL_LENS, ANIMAL_MENUS, CAREER_LINKS, DESK_STUDY, STUDY_DESK, STUDY_HOUSES, studyDeck, studyHouseOf, type StudyHouse } from "@/lib/study-desk";
import { GOALS } from "@/lib/learn";
import { LEARN_PATHS } from "@/lib/today-learned";
import { readDna, addHours, raiseDna } from "@/lib/hall-record";
import { askFilm } from "@/components/learn/VideoAskSheet";
import { CYBER_DRILL, CYBER_MENUS } from "@/lib/cyber-path";
import { SCIENCE_LENS, SCIENCE_MENUS } from "@/lib/science-path";
import { ENG_MENUS, ENG_STEPS } from "@/lib/engineering-path";
import { onTab } from "@/lib/tab-split";
import { AXIOM_TOOLS } from "@/lib/axiom-clinic";
import { StudyGroups } from "@/components/learn/StudyGroups";
import { StudyHome } from "@/components/learn/StudyHome";
import { NewsDesk } from "@/components/learn/NewsDesk";
import { CivicDesk } from "@/components/learn/CivicDesk";
import { CircleDesk } from "@/components/learn/CircleDesk";
import { TailorLesson } from "@/components/learn/TailorLesson";
import { FamiliesLesson } from "@/components/learn/FamiliesLesson";
import { AssessLesson } from "@/components/learn/AssessLesson";
import { RmfLesson } from "@/components/learn/RmfLesson";
import { PentestPlan } from "@/components/learn/PentestPlan";
import { PENTEST_STEPS, readPentestStep, writePentestStep, type PentestStep } from "@/lib/pentest-desk";
import { FamilyExam } from "@/components/learn/FamilyExam";
import { StudyLinks } from "@/components/learn/StudyLinks";
import { StudyMaterials } from "@/components/learn/StudyMaterials";
import { readStudyPath, selectFamily, STUDY_STEPS, writeStudyPath, type StudyPath, type StudyStep } from "@/lib/study-path";
import { holdPlay } from "@/lib/playback";
import { favoriteDesk, leadNew, shuffleWith, visitorSeed } from "@/lib/shuffle";
import { SOURCE } from "@/lib/source";
import { liftIntoView, scrollClipToTop } from "@/lib/syndicate";
import { cn } from "@/lib/utils";

const LESSON_PATHS: Record<string, string[]> = {
  linux: ["Cybersecurity", "Cloud"],
  attack: ["Cybersecurity"],
  ttp: ["Cybersecurity"],
  rmf: ["Cybersecurity"],
  nist: ["Cybersecurity"],
  pentest: ["Cybersecurity"],
  offense: ["Cybersecurity"],
  vuln: ["Cybersecurity"],
  it: ["Cybersecurity"],
  path: ["Cybersecurity"],
  cyber: ["Cybersecurity", "Cloud"],
  career: ["Careers"],
  carpentry: ["Trades"],
  auto: ["Trades"],
};

const LESSON_DNA: Record<string, string> = {
  linux: "Cybersecurity",
  attack: "Cybersecurity",
  ttp: "Cybersecurity",
  rmf: "Cybersecurity",
  nist: "Cybersecurity",
  pentest: "Cybersecurity",
  offense: "Cybersecurity",
  vuln: "Cybersecurity",
  it: "Cybersecurity",
  path: "Cybersecurity",
  cyber: "Cloud computing",
  eng: "Engineering",
};

const SOURCE_NOTE: Record<string, string> = {
  nih: "U.S. National Institutes of Health. Biomedical research.",
  cdc: "U.S. Centers for Disease Control and Prevention.",
  space: "NASA and NOAA. Space and earth observation.",
  loc: "Library of Congress National Screening Room (https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com) and Internet Archive Moving Image Archive (https://archive.org/details/movies?utm_source=chatgpt.com).",
  nature: "Nature. A scientific journal.",
  jhu: "Johns Hopkins. Medicine and public health.",
  hhmi: "Howard Hughes Medical Institute.",
  cern: "European organization for nuclear research.",
  yale: "Yale and Oxford teaching collections.",
};

const SOURCE_KIND: Record<string, string> = {
  nih: "Government source",
  cdc: "Government source",
  space: "Government source",
  loc: "Government source",
  nature: "Journal",
  jhu: "Research institution",
  hhmi: "Research institution",
  cern: "Research institution",
  yale: "University",
};

const PATH_LESSON: Record<string, string> = {
  cyber: "Linux",
  cloud: "Cloud",
  care: "Johns Hopkins",
  trades: "Carpentry",
  career: "Career",
  math: "Science",
};

function showStudyFilm(id?: string) {
  const pin = () => {
    const el =
      (id ? document.getElementById(`post-${id}`) : null) ??
      document.querySelector<HTMLElement>("#study-stage article, #study-stage .clinic-stage, #study-stage [data-lesson-film]");
    if (el) liftIntoView(el);
    else {
      const stage = document.getElementById("study-stage");
      if (stage) liftIntoView(stage);
    }
  };
  pin();
  window.setTimeout(pin, 80);
  window.setTimeout(pin, 320);
}

export const Route = createFileRoute("/study")({
  component: StudyPage,
  validateSearch: (raw: Record<string, unknown>): {
    desk?: string;
    family?: string;
    step?: string;
    group?: string;
  } => ({
    desk: typeof raw.desk === "string" ? raw.desk : undefined,
    family: typeof raw.family === "string" ? raw.family : undefined,
    step: typeof raw.step === "string" ? raw.step : undefined,
    group: typeof raw.group === "string" && /^[0-9a-f-]{36}$/i.test(raw.group) ? raw.group : undefined,
  }),
});

function StudyPage() {
  const goal = useFeedStore((s) => s.goal);
  const awardXp = useFeedStore((s) => s.awardXp);
  const [query, setQuery] = useState("");
  const goalLabel = GOALS.find((item) => item.id === goal)?.label ?? "Set a goal";
  const currentPath = LEARN_PATHS.find((item) => item.id === (typeof localStorage === "undefined" ? "" : localStorage.getItem("vibetok-path-current") || ""));
  const recommend = currentPath ? PATH_LESSON[currentPath.id] : "";
  const posts = useFeedStore((s) => s.posts);
  const passed = useFeedStore((s) => s.drillPassed);
  const waveIds = useFeedStore((s) => s.waveIds);
  const priorWaveIds = useFeedStore((s) => s.priorWaveIds);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const search = Route.useSearch();
  const navigate = useNavigate();
  const materials = search.desk === "materials";
  const house = !materials && STUDY_HOUSES.some((h) => h.id === search.desk) ? (search.desk as StudyHouse | "all") : "all";
  const [seed, setSeed] = useState(() => (visitorSeed("study") ^ Date.now()) >>> 0);
  const [spin, setSpin] = useState<string[] | null>(null);
  const [path, setPath] = useState<StudyPath>(() => readStudyPath());
  const [pentestStep, setPentestStep] = useState<PentestStep>(() => readPentestStep());
  const [fold, setFold] = useState<"" | "track" | "source" | "materials">("");
  const tracks = STUDY_HOUSES.filter((item) => item.row === "track");
  const sources = STUDY_HOUSES.filter((item) => item.row === "source");
  const lessonProgress = useMemo(() => {
    const out: Record<string, { done: number; total: number; pct: number }> = {};
    for (const item of tracks) {
      if (item.id === "all") continue;
      const rows = posts.filter((post) => studyHouseOf(post) === item.id);
      if (!rows.length) continue;
      const finished = rows.filter((post) => passed[post.id]).length;
      out[item.id] = { done: finished, total: rows.length, pct: Math.round((finished / rows.length) * 100) };
    }
    return out;
  }, [posts, passed, tracks]);
  const selected = search.desk && search.desk !== "materials" ? search.desk : "";
  const locked = useRef("");
  const dealt = useMemo(() => {
    const base = studyDeck(posts, house, seed, waveIds, priorWaveIds);
    if (house !== "all") {
      const mp4s = base.filter((post) => !post.youtubeId);
      const rest = base.filter((post) => Boolean(post.youtubeId));
      return [...mp4s, ...shuffleWith(rest, seed ^ 0x9e3779b9)];
    }
    const seen = new Set(base.map((post) => post.youtubeId || post.id));
    const extra = onTab(posts, "study").filter((post) => {
      const key = post.youtubeId || post.id;
      if (seen.has(key) || post.mediaType !== "video") return false;
      seen.add(key);
      return true;
    });
    return leadNew(shuffleWith([...base, ...extra], seed ^ 0x9e3779b9), waveIds, priorWaveIds);
  }, [posts, house, seed, waveIds, priorWaveIds]);
  const deck = useMemo(() => {
    if (!spin) return dealt;
    const byId = new Map(dealt.map((post) => [post.id, post]));
    const ranked = spin.map((id) => byId.get(id)).filter((post) => post != null);
    const rest = dealt.filter((post) => !spin.includes(post.id));
    return [...ranked, ...rest];
  }, [dealt, spin]);
  const open = deck.filter((p) => !passed[p.id]);
  const done = deck.filter((p) => passed[p.id]);
  const firstId = (open[0] ?? done[0])?.id;
  const now = open[0] ?? done[0] ?? null;
  const feedHouse = house !== "nist" && house !== "pentest" && house !== "career" && house !== "tools" && house !== "fauna" && house !== "news";
  const restOpen = now ? open.filter((p) => p.id !== now.id) : open;
  const restDone = now ? done.filter((p) => p.id !== now.id) : done;

  useEffect(() => {
    if (search.family) {
      const next = selectFamily(search.family);
      setPath(next);
    }
    if (search.desk === "pentest" && search.step && PENTEST_STEPS.some((s) => s.id === search.step)) {
      writePentestStep(search.step as PentestStep);
      setPentestStep(search.step as PentestStep);
      return;
    }
    if (search.step && STUDY_STEPS.some((s) => s.id === search.step)) {
      const next = { ...readStudyPath(), step: search.step as StudyStep, familyId: search.family ? search.family.toUpperCase() : readStudyPath().familyId };
      writeStudyPath(next);
      setPath(next);
    }
  }, [search.desk, search.family, search.step]);

  useEffect(() => {
    locked.current = "";
    setSpin(null);
  }, [house, seed]);

  useEffect(() => {
    const onPermute = (ev: Event) => {
      const detail = (ev as CustomEvent<{ fromId: string; next: string }>).detail;
      if (!detail?.next || detail.next === detail.fromId) return;
      setSpin((prev) => {
        const ids = (prev ?? dealt.map((post) => post.id)).filter((id) => id !== detail.fromId && id !== detail.next);
        const mixed = shuffleWith(ids, (Date.now() ^ seed) >>> 0);
        return [detail.next, ...mixed, detail.fromId];
      });
      holdPlay(1800);
      setPlayingId(detail.next);
      window.setTimeout(() => scrollClipToTop(detail.next), 80);
    };
    window.addEventListener("clip:permute", onPermute);
    return () => window.removeEventListener("clip:permute", onPermute);
  }, [dealt, seed, setPlayingId]);

  useEffect(() => {
    if (!search.desk || search.desk === "materials") {
      setPlayingId(null);
      return;
    }
    if (house === "career" || house === "tools" || house === "news" || house === "circle") {
      setPlayingId(null);
      return;
    }
    if (house === "fauna" || house === "path" || house === "sci" || house === "eng") {
      return;
    }
    if (house === "nist" || house === "pentest") {
      if (house === "nist" && path.step !== "watch") {
        setPlayingId(null);
        return;
      }
      if (house === "pentest" && pentestStep !== "watch") {
        setPlayingId(null);
        return;
      }
      holdPlay(1600);
      window.scrollTo({ top: 0 });
      return;
    }
    if (firstId) {
      if (locked.current === house) return;
      locked.current = house;
      holdPlay(1600);
      setPlayingId(firstId);
      const pin = () => scrollClipToTop(firstId);
      pin();
      const t = window.setTimeout(pin, 120);
      const t2 = window.setTimeout(pin, 400);
      return () => {
        window.clearTimeout(t);
        window.clearTimeout(t2);
      };
    }
    window.scrollTo({ top: 0 });
  }, [firstId, house, path.step, pentestStep, search.desk, setPlayingId]);

  const openedTaste = useRef(false);

  useEffect(() => {
    if (openedTaste.current || search.desk) return;
    openedTaste.current = true;
    const fav = favoriteDesk(useFeedStore.getState().dayWatch);
    const next = fav ? DESK_STUDY[fav] : undefined;
    if (!next) return;
    document.querySelector(`[data-taste="${next}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [search.desk]);

  function pickHouse(id: StudyHouse | "all") {
    setSeed((visitorSeed("study") ^ Date.now()) >>> 0);
    setSpin(null);
    if (id === "nist") {
      const next: StudyPath = { ...readStudyPath(), step: "watch" };
      writeStudyPath(next);
      setPath(next);
    }
    if (id === "pentest") {
      writePentestStep("watch");
      setPentestStep("watch");
    }
    if (id !== "all") {
      const desk = STUDY_DESK[id];
      if (desk) useFeedStore.getState().setClinicDesk(desk);
    }
    if (id !== "all" && selected !== id) noteSubject(id, awardXp);
    navigate({ to: "/study", search: { desk: selected === id ? undefined : id, family: undefined, step: selected !== id && id === "nist" ? "watch" : undefined } });
  }

  function go(step: StudyStep) {
    const next = { ...path, step };
    writeStudyPath(next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pickFamily(id: string) {
    const next = selectFamily(id);
    setPath(next);
    navigate({ to: "/study", search: { desk: "nist", family: id, step: "examine" } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeFold(which: "track" | "source" | "materials") {
    const holding =
      which === "materials"
        ? materials
        : which === "track"
          ? tracks.some((item) => item.id === selected)
          : sources.some((item) => item.id === selected);
    const openNow = which === "materials" ? materials || fold === "materials" : fold === which || holding;
    if (openNow) {
      setFold("");
      if (holding || (which === "materials" && materials)) {
        navigate({ to: "/study", search: { desk: undefined, family: undefined, step: undefined, group: search.group } });
      }
      return;
    }
    setFold(which);
    if (which === "materials") {
      navigate({ to: "/study", search: { desk: "materials", family: undefined, step: undefined, group: search.group } });
    }
  }

  const deskPanel = selected ? (
    <>
      {feedHouse && now ? <PostCard post={now} /> : null}
      {selected === "all" ? (
        <StudyHome
          onDesk={(id) => pickHouse(id)}
          onNistStep={(step) => {
            const next = { ...readStudyPath(), step };
            writeStudyPath(next);
            setPath(next);
            navigate({ to: "/study", search: { desk: "nist", family: undefined, step } });
          }}
          onPentestStep={(step) => {
            writePentestStep(step);
            setPentestStep(step);
            navigate({ to: "/study", search: { desk: "pentest", family: undefined, step } });
          }}
          onFamily={pickFamily}
        />
      ) : null}
      {house === "nist" ? <NistDesk path={path} posts={posts} onStep={go} onPickFamily={pickFamily} /> : null}
      {house === "pentest" ? (
        <PentestPlan
          step={pentestStep}
          posts={posts}
          onStep={(s) => {
            writePentestStep(s);
            setPentestStep(s);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : null}
      {house === "fauna" ? <AnimalDesk posts={posts} /> : null}
      {house === "path" ? <CyberPath posts={posts} /> : null}
      {house === "sci" ? <SciencePath posts={posts} /> : null}
      {house === "eng" ? <EngineeringPath posts={posts} /> : null}
      {house === "news" ? <NewsDesk /> : null}
      {house === "civic" ? <CivicDesk /> : null}
      {house === "circle" ? <CircleDesk /> : null}
      {house === "career" ? (
        <ul className="space-y-2">
          {CAREER_LINKS.map((c) => (
            <li key={c.href} className="rounded-2xl bg-surface p-4 shadow-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{c.house} · {SOURCE}</p>
              <a href={c.href} target="_blank" rel="noreferrer" className="mt-1 block font-display text-lg font-semibold text-fg">
                {c.label}
              </a>
              <p className="mt-1 text-xs text-muted">{c.note}</p>
            </li>
          ))}
        </ul>
      ) : house === "tools" ? (
        <ul className="space-y-2">
          {AXIOM_TOOLS.map((tool) => (
            <li key={tool.id} className="rounded-2xl bg-surface p-4 shadow-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{tool.family} · {SOURCE}</p>
              <Link to="/hub/tool/$id" params={{ id: tool.id }} className="mt-1 block font-display text-lg font-semibold">
                {tool.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{tool.note[0]}</p>
              <StudyLinks
                title="Study then launch"
                links={[
                  { label: "Watch the film", href: `https://www.youtube.com/watch?v=${tool.watch.youtubeId}` },
                  ...tool.library,
                  { label: "Launch AXIOM", href: tool.href },
                ]}
              />
            </li>
          ))}
        </ul>
      ) : house !== "nist" && house !== "pentest" && house !== "news" && house !== "civic" && house !== "circle" && house !== "path" && house !== "sci" && house !== "eng" ? (
        <>
          {(feedHouse ? restOpen : open).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {(feedHouse ? restDone : done).length ? <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Stamped</p> : null}
          {(feedHouse ? restDone : done).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {deck.length === 0 ? <p className="rounded-2xl bg-surface p-5 text-sm text-muted shadow-border">No lessons on this desk yet.</p> : null}
        </>
      ) : null}
    </>
  ) : null;

  return (
    <AppShell>
      <ClinicFrame>
        <HydrateMedia />
        <FeedPlaybackSync />
        <header className="overflow-hidden rounded-2xl bg-surface px-4 py-3 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Lessons</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">The curriculum engine</h1>
          <p className="mt-1 text-sm text-muted">Subjects. Sources. Materials.</p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Current goal</dt>
              <dd className="mt-0.5 break-words font-semibold">{goalLabel}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Current path</dt>
              <dd className="mt-0.5 break-words font-semibold">{currentPath?.title ?? "Start a path"}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Recommended by Vibe</dt>
              <dd className="mt-0.5 break-words font-semibold">{recommend || "Pick a path first."}</dd>
            </div>
          </dl>
          <ul className="mt-3 space-y-1 text-sm">
            <li className="break-words text-muted">Source. {currentPath?.id === "care" ? "Johns Hopkins." : "None stored for this path."}</li>
            <li className="break-words text-muted">Material. {currentPath?.id === "cyber" || currentPath?.id === "cloud" ? "NIST 800-53 study pack." : currentPath?.id === "career" ? "CareerSuite resume clinic." : "None stored for this path."}</li>
            <li className="break-words text-muted">Study group. {recommend ? `Open the group for ${recommend}.` : "Pick a path first."}</li>
          </ul>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subjects and sources"
            className="mt-3 min-h-11 w-full rounded-full bg-elevated px-4 text-sm"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link to="/hall" className="inline-flex min-h-9 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Hall</Link>
            <Link to="/paths" className="inline-flex min-h-9 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Paths</Link>
            <button
              type="button"
              className="inline-flex min-h-9 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
              onClick={() => askFilm({ title: recommend || currentPath?.title || "This lesson", caption: `Lessons. Goal: ${goalLabel}. Path: ${currentPath?.title ?? "none"}.` })}
            >
              Ask Noctis about this
            </button>
          </div>
        </header>
        <StudyGroups house={house} invite={search.group} />
        <DeskFold
          title="Lessons"
          open={fold === "track" || tracks.some((item) => item.id === selected)}
          onToggle={() => closeFold("track")}
        >
          {tracks.some((item) => item.id === selected) ? <div id="study-stage" className="space-y-3">{deskPanel}</div> : null}
          {tracks.filter((item) => !query.trim() || item.label.toLowerCase().includes(query.trim().toLowerCase())).map((item) => {
            const row = item.id === "all" ? null : lessonProgress[item.id];
            const paths = LESSON_PATHS[item.id];
            const strand = LESSON_DNA[item.id];
            const status = !row ? "" : row.pct >= 100 ? "Completed" : row.pct > 0 ? "In progress" : "Not started";
            const note = [
              status,
              row ? `${row.pct}%` : "",
              paths ? paths.join(" · ") : "",
              strand ? `${strand} ${readDna()[strand] ?? 0}` : "",
            ].filter(Boolean).join(" · ");
            return <DeskRow key={item.id} label={item.label} note={note} open={selected === item.id} onToggle={() => pickHouse(item.id)} />;
          })}
        </DeskFold>
        <DeskFold
          title="Sources"
          open={fold === "source" || sources.some((item) => item.id === selected)}
          onToggle={() => closeFold("source")}
        >
          {sources.some((item) => item.id === selected) ? <div id="study-stage" className="space-y-3">{deskPanel}</div> : null}
          {sources.filter((item) => !query.trim() || item.label.toLowerCase().includes(query.trim().toLowerCase())).map((item) => (
            <DeskRow key={item.id} label={item.label} note={[SOURCE_KIND[item.id], SOURCE_NOTE[item.id]].filter(Boolean).join(" · ")} open={selected === item.id} onToggle={() => pickHouse(item.id)} />
          ))}
        </DeskFold>
        <DeskFold title="Materials" open={materials || fold === "materials"} onToggle={() => closeFold("materials")}>
          {materials ? <StudyMaterials /> : null}
        </DeskFold>
      </ClinicFrame>
    </AppShell>
  );
}

function noteSubject(id: string, awardXp: (n: number) => void) {
  const strand = LESSON_DNA[id];
  if (!strand || typeof localStorage === "undefined") return;
  let seen: string[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem("vibetok-lesson-seen") || "[]") as string[];
    seen = Array.isArray(raw) ? raw : [];
  } catch {
    seen = [];
  }
  if (seen.includes(id)) return;
  localStorage.setItem("vibetok-lesson-seen", JSON.stringify([id, ...seen].slice(0, 40)));
  raiseDna([strand], 1);
  addHours(0.1);
  awardXp(5);
}

function DeskFold({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface shadow-border">
      <button type="button" onClick={onToggle} className="flex min-h-14 w-full items-center justify-between px-4 text-left">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs font-semibold text-muted">{open ? "Close" : "Open"}</span>
      </button>
      {open ? <div className="space-y-2 px-3 pb-3">{children}</div> : null}
    </section>
  );
}

function DeskRow({ label, note, open, onToggle }: { label: string; note?: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className={cn("flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-xl px-3 text-left", open ? "bg-primary text-primary-fg" : "bg-elevated")}>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {note ? <span className={cn("block break-words text-[11px]", open ? "text-primary-fg/80" : "text-muted")}>{note}</span> : null}
      </span>
      <span className={cn("shrink-0 text-xs font-semibold", open ? "text-primary-fg/80" : "text-muted")}>{open ? "Close" : "Open"}</span>
    </button>
  );
}

function EngineeringPath({ posts }: { posts: ReturnType<typeof useFeedStore.getState>["posts"] }) {
  const [menu, setMenu] = useState(ENG_MENUS[0]!.id);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const current = ENG_MENUS.find((item) => item.id === menu) ?? ENG_MENUS[0]!;
  const films = current.ids.map((id) => posts.find((post) => post.id === id)).filter((post) => post != null);
  const firstId = films[0]?.id;

  useEffect(() => {
    if (!firstId) return;
    holdPlay(900);
    setPlayingId(firstId);
    const pin = () => scrollClipToTop(firstId);
    const t = window.setTimeout(pin, 80);
    return () => window.clearTimeout(t);
  }, [menu, firstId, setPlayingId]);

  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface px-4 py-3 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Engineering · {SOURCE}</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Learn it, then say how the load moves.</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ENG_MENUS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMenu(item.id);
                window.setTimeout(() => showStudyFilm(item.ids[0]), 40);
              }}
              className={cn(
                "min-h-11 rounded-full px-3 text-xs font-semibold",
                menu === item.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{current.line}</p>
        <ol className="mt-3 grid gap-1 sm:grid-cols-2">
          {ENG_STEPS.map((line) => (
            <li key={line} className="text-xs text-muted">
              {line}
            </li>
          ))}
        </ol>
      </header>
      {films.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}

function SciencePath({ posts }: { posts: ReturnType<typeof useFeedStore.getState>["posts"] }) {
  const [menu, setMenu] = useState(SCIENCE_MENUS[0]!.id);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const current = SCIENCE_MENUS.find((item) => item.id === menu) ?? SCIENCE_MENUS[0]!;
  const films = current.ids.map((id) => posts.find((post) => post.id === id)).filter((post) => post != null);
  const firstId = films[0]?.id;

  useEffect(() => {
    if (!firstId) return;
    holdPlay(900);
    setPlayingId(firstId);
    const pin = () => scrollClipToTop(firstId);
    const t = window.setTimeout(pin, 80);
    return () => window.clearTimeout(t);
  }, [menu, firstId, setPlayingId]);

  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface px-4 py-3 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Science · {SOURCE}</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Watch it, then test the claim.</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SCIENCE_MENUS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMenu(item.id);
                window.setTimeout(() => showStudyFilm(item.ids[0]), 40);
              }}
              className={cn(
                "min-h-11 rounded-full px-3 text-xs font-semibold",
                menu === item.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{current.line}</p>
        <ol className="mt-3 grid gap-1 sm:grid-cols-2">
          {SCIENCE_LENS.map((line) => (
            <li key={line} className="text-xs text-muted">
              {line}
            </li>
          ))}
        </ol>
      </header>
      {films.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}

function CyberPath({ posts }: { posts: ReturnType<typeof useFeedStore.getState>["posts"] }) {
  const [menu, setMenu] = useState(CYBER_MENUS[0]!.id);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const current = CYBER_MENUS.find((item) => item.id === menu) ?? CYBER_MENUS[0]!;
  const films = current.ids.map((id) => posts.find((post) => post.id === id)).filter((post) => post != null);
  const firstId = films[0]?.id;

  useEffect(() => {
    if (!firstId) return;
    holdPlay(900);
    setPlayingId(firstId);
    const pin = () => scrollClipToTop(firstId);
    const t = window.setTimeout(pin, 80);
    return () => window.clearTimeout(t);
  }, [menu, firstId, setPlayingId]);

  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface px-4 py-3 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Cyber path · {SOURCE}</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Beginner, then the attack, then the desk.</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CYBER_MENUS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMenu(item.id);
                window.setTimeout(() => showStudyFilm(item.ids[0]), 40);
              }}
              className={cn(
                "min-h-11 rounded-full px-3 text-xs font-semibold",
                menu === item.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{current.line}</p>
        <ol className="mt-3 grid gap-1 sm:grid-cols-2">
          {CYBER_DRILL.map((line) => (
            <li key={line} className="text-xs text-muted">
              {line}
            </li>
          ))}
        </ol>
      </header>
      {films.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}

function AnimalDesk({ posts }: { posts: ReturnType<typeof useFeedStore.getState>["posts"] }) {
  const [menu, setMenu] = useState(ANIMAL_MENUS[0]!.id);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const current = ANIMAL_MENUS.find((item) => item.id === menu) ?? ANIMAL_MENUS[0]!;
  const films = current.ids.map((id) => posts.find((post) => post.id === id)).filter((post) => post != null);
  const firstId = films[0]?.id;

  useEffect(() => {
    if (!firstId) return;
    holdPlay(900);
    setPlayingId(firstId);
    const pin = () => scrollClipToTop(firstId);
    const t = window.setTimeout(pin, 80);
    return () => window.clearTimeout(t);
  }, [menu, firstId, setPlayingId]);

  return (
    <section className="space-y-3">
      <header className="rounded-2xl bg-surface px-4 py-3 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Animal behavior</p>
        <h2 className="mt-1 font-display text-xl font-semibold">One film, one menu. No repeats.</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ANIMAL_MENUS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMenu(item.id);
                window.setTimeout(() => showStudyFilm(item.ids[0]), 40);
              }}
              className={cn(
                "min-h-11 rounded-full px-3 text-xs font-semibold",
                menu === item.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{current.line}</p>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold text-primary">Study each film the same way</summary>
          <ol className="mt-2 grid gap-1 sm:grid-cols-2">
            {ANIMAL_LENS.map((line) => (
              <li key={line} className="text-xs text-muted">
                {line}
              </li>
            ))}
          </ol>
        </details>
      </header>
      {films.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}

function NistDesk({
  path,
  posts,
  onStep,
  onPickFamily,
}: {
  path: StudyPath;
  posts: ReturnType<typeof useFeedStore.getState>["posts"];
  onStep: (step: StudyStep) => void;
  onPickFamily: (id: string) => void;
}) {
  const nistFilm = posts.find((p) => p.id === "study-mp4-nist") ?? posts.find((p) => p.id === "study-nist-csf");
  return (
    <>
      <nav className="hall-tabs flex gap-1.5">
        {STUDY_STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStep(s.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-3 text-xs font-semibold",
              path.step === s.id ? "bg-primary text-primary-fg" : "bg-surface text-muted",
            )}
          >
            {s.label}
            {s.id === "examine" && path.familyId ? ` ${path.familyId}` : ""}
          </button>
        ))}
      </nav>
      {path.step === "watch" ? (
        <>
          {nistFilm ? <PostCard post={nistFilm} /> : null}
          <article className="rounded-2xl bg-surface p-5 shadow-border">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Finish this spine first</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><span className="font-semibold text-fg">800-53</span> — the catalog (twenty families).</li>
              <li><span className="font-semibold text-fg">800-53B</span> — Low / Moderate / High baseline. Then tailor with a rationale.</li>
              <li><span className="font-semibold text-fg">800-53A</span> — Examine / Interview / Test. Then the SAR.</li>
            </ul>
            <p className="mt-3 text-xs text-subtle">After this path, we add deeper family detail. Not before.</p>
          </article>
          <button type="button" onClick={() => onStep("families")} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            Next — families
          </button>
        </>
      ) : null}
      {path.step === "families" ? (
        <>
          <FamiliesLesson compact onPick={onPickFamily} />
          <button type="button" onClick={() => onStep("examine")} className="min-h-11 rounded-full bg-elevated px-4 text-xs font-semibold">
            Next — examine
          </button>
        </>
      ) : null}
      {path.step === "examine" ? (
        <>
          {path.familyId ? <FamilyExam id={path.familyId} /> : <FamiliesLesson compact onPick={onPickFamily} intro />}
          <button type="button" onClick={() => onStep("tailor")} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            Next — 800-53B tailor
          </button>
        </>
      ) : null}
      {path.step === "tailor" ? (
        <>
          <TailorLesson />
          <button type="button" onClick={() => onStep("assess")} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            Next — 800-53A assess
          </button>
        </>
      ) : null}
      {path.step === "assess" ? (
        <>
          <AssessLesson />
          <button type="button" onClick={() => onStep("rmf")} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            Next — RMF pubs
          </button>
        </>
      ) : null}
      {path.step === "rmf" ? (
        <>
          <RmfLesson />
          <button type="button" onClick={() => onStep("lab")} className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
            Next — range
          </button>
        </>
      ) : null}
      {path.step === "lab" ? (
        <article className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Range</p>
          <h2 className="mt-1 font-display text-xl font-semibold">Prove it. Then stamp.</h2>
          <p className="mt-2 text-sm text-muted">CTEM is 800-53A Test. Hypothetical firm only.</p>
          <Link
            to="/hub/lab/$id"
            params={{ id: "ctem" }}
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
          >
            Open CTEM lab
          </Link>
        </article>
      ) : null}
    </>
  );
}