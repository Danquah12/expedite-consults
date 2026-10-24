import { Link } from "@tanstack/react-router";
import { Map, Swords } from "lucide-react";
import { AXIOM_TOOLS } from "@/lib/axiom-clinic";
import { filmsForTrack } from "@/lib/curriculum";
import { CONTROL_FAMILIES, NIST_PUBS, RMF_STAGES, SELECT_STEPS } from "@/lib/nist-desk";
import { PENTEST_SOURCES, PENTEST_STEPS } from "@/lib/pentest-desk";
import { STUDY_STEPS, type StudyStep } from "@/lib/study-path";
import type { PentestStep } from "@/lib/pentest-desk";
import { SOURCE } from "@/lib/source";
import { DAY_CHALLENGE } from "@/lib/engineering-path";
import type { StudyHouse } from "@/lib/study-desk";
import { HallSpread } from "@/components/learn/HallSpread";
import { GapLessons } from "@/components/learn/GapLessons";
import { hallsOn } from "@/lib/hall-surfaces";
import { useFeedStore } from "@/lib/feed-store";

const TRACKS = [
  { id: "foundations", label: "Foundations" },
  { id: "cloud", label: "Cloud" },
  { id: "defensive", label: "SOC / Blue" },
  { id: "offensive", label: "Offensive" },
  { id: "grc", label: "GRC / RMF" },
  { id: "ai", label: "AI security" },
  { id: "nhi", label: "Identity" },
  { id: "zerotrust", label: "Zero Trust" },
] as const;

export function StudyHome({
  onDesk,
  onNistStep,
  onPentestStep,
  onFamily,
}: {
  onDesk: (id: StudyHouse) => void;
  onNistStep: (step: StudyStep) => void;
  onPentestStep: (step: PentestStep) => void;
  onFamily: (id: string) => void;
}) {
  const tracks = TRACKS.filter((t) => filmsForTrack(t.id).length > 0);
  const clinicDesk = useFeedStore((s) => s.clinicDesk);
  const today = DAY_CHALLENGE[Math.floor(Date.now() / 86_400_000) % DAY_CHALLENGE.length]!;

  return (
    <div className="space-y-6">
      <GapLessons />
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Today · {SOURCE}</p>
        <p className="mt-1 font-display text-xl font-semibold">{today.title}</p>
        <p className="mt-1 text-sm text-muted">{today.line}</p>
        <button type="button" onClick={() => onDesk(today.desk)} className="mt-3 min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg">
          Open the lesson
        </button>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(
            [
              ["path", "Cyber"],
              ["sci", "Science"],
              ["eng", "Engineering"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => onDesk(id)} className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold">
              {label}
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <HallSpread
          tab="study"
          onPick={(id) => {
            const row = hallsOn("study").find((h) => h.id === id);
            if (row?.study && row.study !== "all") onDesk(row.study);
          }}
        />
      </section>
      <section className="grid grid-cols-2 gap-2">
        <Link to="/battle" className="rounded-2xl bg-surface p-4 shadow-border">
          <Swords className="size-4 text-primary" />
          <p className="mt-2 font-display text-lg font-semibold">Battle</p>
          <p className="mt-1 text-xs text-muted">One question per hall.</p>
        </Link>
        <Link to="/paths" className="rounded-2xl bg-surface p-4 shadow-border">
          <Map className="size-4 text-primary" />
          <p className="mt-2 font-display text-lg font-semibold">Your map</p>
          <p className="mt-1 text-xs text-muted">The path in this hall.</p>
        </Link>
      </section>
      <section className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => onDesk("nist")} className="rounded-2xl bg-surface p-5 text-left shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Spine</p>
          <p className="mt-1 font-display text-xl font-semibold">NIST SP 800-53</p>
          <p className="mt-1 text-sm text-muted">53 catalog · 53B baseline / tailor · 53A examine / interview / test. Then RMF pubs and the GRC range.</p>
        </button>
        <button type="button" onClick={() => onDesk("pentest")} className="rounded-2xl bg-surface p-5 text-left shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Spine</p>
          <p className="mt-1 font-display text-xl font-semibold">Pentest</p>
          <p className="mt-1 text-sm text-muted">Scope → recon (SearchSploit / GHDB) → web / API / cloud → report → launch AXIOM on the range.</p>
        </button>
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">800-53 path</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STUDY_STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onNistStep(s.id)}
              className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold"
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Watch first. Families. Examine a family. Tailor (53B). Assess (53A). RMF pubs. Range.</p>
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Control families</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CONTROL_FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFamily(f.id)}
              className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold"
            >
              {f.id} {f.name}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">RMF + FIPS + related SPs</p>
        <ul className="mt-3 space-y-3">
          {RMF_STAGES.map((stage) => (
            <li key={stage.id}>
              <button type="button" onClick={() => onNistStep("rmf")} className="text-left">
                <span className="font-semibold">{stage.n}. {stage.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{stage.line}</span>
              </button>
            </li>
          ))}
        </ul>
        <ul className="mt-4 space-y-2">
          {NIST_PUBS.slice(0, 8).map((p) => (
            <li key={p.id}>
              <a href={p.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                {p.code} — {p.title}
              </a>
              <p className="text-xs text-muted">{p.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">800-53B select</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
          {SELECT_STEPS.map((s) => (
            <li key={s.n}>
              <button type="button" onClick={() => onNistStep("tailor")} className="text-left font-semibold text-fg">
                {s.title}
              </button>
              <span className="mt-0.5 block">{s.body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Pentest path</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PENTEST_STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPentestStep(s.id)}
              className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold"
            >
              {s.label}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {PENTEST_SOURCES.slice(0, 10).map((s) => (
            <li key={s.id}>
              <a href={s.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                {s.title}
              </a>
              <p className="text-xs text-muted">{s.when}</p>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => onDesk("pentest")} className="mt-3 min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
          Open pentest desk
        </button>
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">AXIOM labs · {SOURCE}</p>
        <p className="mt-2 text-sm text-muted">Study the procedure. Launch the app. See results on the range.</p>
        <ul className="mt-3 space-y-3">
          {AXIOM_TOOLS.map((tool) => (
            <li key={tool.id} className="rounded-xl bg-elevated p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{tool.family}</p>
              <Link to="/hub/tool/$id" params={{ id: tool.id }} className="font-display text-base font-semibold">
                {tool.title}
              </Link>
              <p className="mt-1 text-xs text-muted">{tool.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={tool.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg">
                  Launch app
                </a>
                <Link to="/hub/lab/$id" params={{ id: tool.labId }} className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-xs font-semibold">
                  Range
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Cyber tracks</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tracks.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onDesk("cyber")}
              className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold"
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}