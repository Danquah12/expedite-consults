import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { SourceNetwork } from "@/components/learn/SourceNetwork";
import { FilmStudio } from "@/components/learn/LessonFilm";
import { campusFilms } from "@/lib/curriculum";
import { SOURCE } from "@/lib/source";
import { useFeedStore } from "@/lib/feed-store";
import { HallJump } from "@/components/learn/HallSpread";
import { onTab } from "@/lib/tab-split";
import { leadNew } from "@/lib/shuffle";

export const Route = createFileRoute("/hub/")({ component: HubPage });

const GROUPS = [
  {
    title: "Learn",
    doors: [
      { to: "/hub/tracks" as const, title: "Curriculum", line: "A path, then the films inside it." },
      { to: "/hub/nist" as const, title: "NIST Academy", line: "CSF, RMF, then 800-53." },
      { to: "/hub/fleet" as const, title: "A real course", line: "Pick one subject and stay with it." },
      { href: "https://vibetok-learning-hub.vercel.app", title: "Learning Hub", line: "85 books, 22 academies, drills, and a skill passport." },
      { href: "https://vibetok-learning-hub.vercel.app/platform/security_courses_player?course=serv-int-pentest", title: "Internal penetration test", line: "The MITRE lab, on its own page." },
    ],
  },
  {
    title: "Practice",
    doors: [
      { to: "/hub/range" as const, title: "Labs", line: "Do the work after the lecture." },
      { to: "/hub/tools" as const, title: "Tools", line: "Read the note, then open the tool." },
    ],
  },
  {
    title: "Advance",
    doors: [
      { to: "/hub/careers" as const, title: "Career paths", line: "A stamp, then the seat." },
      { to: "/openings" as const, title: "Jobs and certifications", line: "The coach, the cert, the opening." },
    ],
  },
];

function HubPage() {
  const posts = useFeedStore((s) => s.posts);
  const waveIds = useFeedStore((s) => s.waveIds);
  const priorWaveIds = useFeedStore((s) => s.priorWaveIds);
  const lectures = useMemo(() => {
    const campus = campusFilms().slice(0, 3);
    const seen = new Set(campus.map((film) => film.youtubeId));
    const ledger = leadNew(
      onTab(posts, "hub").filter((post) => post.youtubeId && !seen.has(post.youtubeId)),
      waveIds,
      priorWaveIds,
    )
      .slice(0, 4)
      .map((post) => ({
        id: post.id,
        trackId: "ledger",
        title: post.teach.hook,
        house: post.author.name,
        youtubeId: post.youtubeId ?? "",
        href: post.mediaUrl,
      }));
    return [...campus, ...ledger];
  }, [posts, waveIds, priorWaveIds]);

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface px-5 py-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Hub · {SOURCE}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Start with a door.</h1>
          <p className="mt-1 text-sm text-muted">Learn, practice, then the job. One list. No second pile.</p>
        </header>

        <div className="space-y-3">
          {GROUPS.map((group) => (
            <section key={group.title} className="overflow-hidden rounded-2xl bg-surface shadow-border">
              <h2 className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{group.title}</h2>
              <ul>
                {group.doors.map((door, i) => (
                  <li key={door.title} className="border-t border-border/70 first:border-t-0">
                    {"href" in door ? (
                      <a href={door.href} className="flex items-center gap-3 px-4 py-3">
                        <span className="w-5 font-mono text-xs text-muted">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{door.title}</span>
                          <span className="block text-xs text-muted">{door.line}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted" />
                      </a>
                    ) : (
                      <Link to={door.to} className="flex items-center gap-3 px-4 py-3">
                        <span className="w-5 font-mono text-xs text-muted">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{door.title}</span>
                          <span className="block text-xs text-muted">{door.line}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="rounded-2xl bg-surface p-4 shadow-border">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Subjects</h2>
          <p className="mt-1 mb-3 text-xs text-muted">One hall at a time.</p>
          <HallJump tab="hub" />
        </section>

        <FilmStudio kicker="Lectures" title="One film. Then the next." films={lectures} />

        <SourceNetwork />
      </ClinicFrame>
    </AppShell>
  );
}
