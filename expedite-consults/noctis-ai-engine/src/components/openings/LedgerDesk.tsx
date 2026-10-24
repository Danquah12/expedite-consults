import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SOURCE } from "@/lib/source";
import { pullClinic } from "@/lib/ingest-api";
import { CLINIC_DESKS, CARE_ACADEMIES, LEARN_LOOP, RANGE_EVIDENCE, PULLS_PER_DAY, nextPullAt, pullClockLabel, pullSlot, weekdayLean, objectOf, type ClinicDeskId, type IngestRow } from "@/lib/ingest-sources";
import { tabOf, type AppTab } from "@/lib/tab-split";
import { visitorSeed } from "@/lib/shuffle";
import { useFeedStore } from "@/lib/feed-store";
import { formatWhen } from "@/lib/format";
import { HallSpread } from "@/components/learn/HallSpread";
import { MoneyLabs } from "@/components/learn/MoneyLabs";
import { LanguagePractice, SpeakCoach } from "@/components/learn/LanguagePractice";
import { ResearchLab } from "@/components/learn/ResearchLab";
import { CloudLab, DataLab } from "@/components/learn/CloudDataLabs";
import { ArgumentLab } from "@/components/learn/ArgumentLab";
import { MockInterview, CertAcademy } from "@/components/learn/CareerLabs";
import { GovAcademy, NewsLearn } from "@/components/learn/GovNewsLabs";
import { TodayLearned, LearnPaths } from "@/components/learn/TodayPaths";
import { LearningEngine } from "@/components/learn/LearningEngine";

function byDesk(clips: IngestRow[], desk: ClinicDeskId | "all") {
  const groups: { id: string; label: string; clips: IngestRow[] }[] = CLINIC_DESKS.map((d) => ({
    id: d.id,
    label: d.label,
    clips: clips.filter((c) => (c.desk ?? "campus") === d.id),
  })).filter((g) => g.clips.length && (desk === "all" || g.id === desk));
  if (desk !== "all") return groups;
  const known = new Set(CLINIC_DESKS.map((d) => d.id));
  const other = clips.filter((c) => !known.has((c.desk ?? "campus") as (typeof CLINIC_DESKS)[number]["id"]));
  if (other.length) groups.push({ id: "other", label: "Academy", clips: other });
  return groups.length ? groups : [{ id: "all", label: "This pull", clips }];
}

function tabCounts(clips: IngestRow[]) {
  const order: AppTab[] = ["clinic", "reels", "study", "hub", "market", "music", "tickets", "career", "crews"];
  const label: Record<AppTab, string> = {
    clinic: "Clinic",
    reels: "Reels",
    study: "Study",
    hub: "Hub",
    market: "Market",
    music: "Music",
    tickets: "Tickets",
    career: "Career",
    crews: "Crews",
  };
  const n = new Map<AppTab, number>();
  for (const clip of clips) {
    const tab = tabOf({ id: clip.postId, youtubeId: clip.youtubeId, hashtags: clip.tags });
    n.set(tab, (n.get(tab) ?? 0) + 1);
  }
  return order.map((tab) => ({ tab, label: label[tab], n: n.get(tab) ?? 0 }));
}

function HallLab({ desk }: { desk: ClinicDeskId | "all" }) {
  if (desk === "all") {
    return (
      <>
        <LearningEngine />
        <TodayLearned />
        <LearnPaths />
      </>
    );
  }
  if (desk === "business") return <MoneyLabs />;
  if (desk === "language") {
    return (
      <>
        <LanguagePractice />
        <SpeakCoach />
      </>
    );
  }
  if (desk === "research") return <ResearchLab />;
  if (desk === "cloud") return <CloudLab />;
  if (desk === "data") return <DataLab />;
  if (desk === "arts") return <ArgumentLab />;
  if (desk === "faith") {
    return (
      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Hymn hall</p>
        <p className="mt-1 text-sm text-muted">Classic hymns, Gaither, African gospel — official embeds, not copies. {PULLS_PER_DAY} pulls a day · {pullClockLabel()}.</p>
        <Link to="/music" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">
          Open Music
        </Link>
      </section>
    );
  }
  if (desk === "career") {
    return (
      <>
        <MockInterview />
        <CertAcademy />
      </>
    );
  }
  if (desk === "civic") return <GovAcademy />;
  if (desk === "news") return <NewsLearn />;
  if (desk === "cyber") {
    return (
      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Cyber range</p>
        <p className="mt-1 text-sm text-muted">{RANGE_EVIDENCE.join(" → ")}</p>
        <Link to="/hub/range" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg">
          Open range
        </Link>
      </section>
    );
  }
  if (desk === "care" || desk === "mind") {
    return (
      <section className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Care academies</p>
        <p className="mt-1 text-sm text-muted">Tracks inside Health and Mind — not extra tabs on the hall.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CARE_ACADEMIES.map((a) => (
            <span key={a.id} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">
              {a.label}
            </span>
          ))}
        </div>
        <Link to="/study" search={{ desk: "jhu", family: undefined, step: undefined }} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">
          Open study
        </Link>
      </section>
    );
  }
  return <LearnPaths />;
}

export function LedgerDesk() {
  const log = useFeedStore((s) => s.ingestLog);
  const ingestAt = useFeedStore((s) => s.ingestAt);
  const ingestCount = useFeedStore((s) => s.ingestCount);
  const clinicDesk = useFeedStore((s) => s.clinicDesk);
  const setClinicDesk = useFeedStore((s) => s.setClinicDesk);
  const hash = useRouterState({ select: (s) => s.location.hash.replace("#", "") });
  const next = nextPullAt();
  const lean = weekdayLean();
  const latest = log[0];
  const desk: ClinicDeskId | "all" = CLINIC_DESKS.some((d) => d.id === clinicDesk) ? clinicDesk : "all";

  useEffect(() => {
    if (CLINIC_DESKS.some((d) => d.id === hash)) setClinicDesk(hash as ClinicDeskId);
  }, [hash, setClinicDesk]);

  function copy(text: string) {
    void navigator.clipboard.writeText(text).catch(() => undefined);
  }

  function reportText() {
    const lines = [
      `ConnectLn hall ledger`,
      `Source · ${SOURCE}`,
      `Last pull · ${formatWhen(ingestAt)}`,
      `Next pull · ${formatWhen(next)}`,
      `Seated in hall · ${ingestCount}`,
      `Domain desks · ${CLINIC_DESKS.map((d) => d.label).join(" · ")}`,
      "",
    ];
    for (const report of log) {
      lines.push(`— ${formatWhen(report.at)} · ${report.added} new · ${report.skipped} already seated`);
      lines.push(`Houses: ${report.houses.join(", ") || "—"}`);
      for (const group of byDesk(report.clips, "all")) {
        lines.push(`  [${group.label}]`);
        group.clips.forEach((clip, i) => {
          lines.push(`  ${i + 1}. ${clip.title}`);
          lines.push(`     ${clip.house} · ${clip.stamp} · ${clip.author}`);
          lines.push(`     ${(clip.tags ?? []).join(" ")} · ${clip.url}`);
        });
      }
      lines.push("");
    }
    return lines.join("\n");
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl bg-surface p-5 shadow-border">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Hall ledger</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">What does this hall need to be complete?</h1>
        <p className="mt-2 text-sm text-muted">
          Not “what video can we pull.” Curriculum, practice, assessment, projects, credentials. Twenty-five halls. A new film every hour ({pullClockLabel()}). Today: {lean.label}. Source · {SOURCE}.
        </p>
        <p className="mt-2 text-xs text-muted">{LEARN_LOOP.join(" → ")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/hub/range" className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold">
            Open range
          </Link>
          <Link to="/openings" className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold">
            Business → Openings
          </Link>
        </div>
        <p className="mt-3 text-xs text-subtle">
          Last · {formatWhen(ingestAt)} · Next · {formatWhen(next)} · {ingestCount} seated
        </p>
        {latest ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tabCounts(latest.clips).map((row) => (
              <span key={row.tab} className="rounded-full bg-elevated px-2.5 py-1 text-[11px] font-semibold text-muted">
                {row.label} {row.n}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copy(reportText())}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg"
          >
            Copy report
          </button>
          <button
            type="button"
            onClick={() => {
              void pullClinic({ data: { slot: pullSlot(), salt: visitorSeed("ingest") } }).then((res) => {
                if (res.ok) useFeedStore.getState().absorbIngest(res.posts, res.rows);
              });
            }}
            className="rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold text-muted"
          >
            Pull now
          </button>
        </div>
      </header>

      <HallSpread tab="ledger" active={desk === "all" ? undefined : desk} />

      <HallLab desk={desk} />

      {!log.length ? (
        <p className="text-sm text-muted">No pull yet. Three waves a day, or tap Pull now.</p>
      ) : null}

      {latest ? (
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">This pull</p>
          <p className="mt-1 font-display text-lg font-semibold">{formatWhen(latest.at)}</p>
          <p className="mt-1 text-xs text-muted">
            {latest.added} new · {latest.skipped} already seated · {latest.houses.length} houses
          </p>
          {byDesk(latest.clips, desk).map((group) => (
            <div key={group.id} className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{group.label}</p>
              <ol className="mt-2 space-y-3">
                {group.clips.map((clip, i) => (
                  <li key={`${latest.id}-${clip.postId}`} className="border-t border-border pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">
                      {i + 1} · {clip.stamp}
                      {clip.kind ? ` · ${objectOf(clip.kind)}` : ""}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-snug">{clip.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {clip.house} · {clip.author}
                    </p>
                    {clip.tags?.length ? <p className="mt-0.5 text-[11px] text-subtle">{clip.tags.join(" ")}</p> : null}
                    <p className="mt-0.5 font-mono text-[11px] text-subtle">{clip.youtubeId}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      ) : null}

      {log.slice(1).map((report) => (
        <section key={report.id} className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{formatWhen(report.at)}</p>
          <p className="mt-1 text-sm">
            {report.added} new · {report.skipped} already seated
          </p>
          {byDesk(report.clips, desk).map((group) => (
            <p key={group.id} className="mt-2 text-xs text-subtle">
              {group.label} · {group.clips.length}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
