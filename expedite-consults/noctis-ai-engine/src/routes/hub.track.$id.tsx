import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { resolveModule, trackById } from "@/lib/cyber-tracks";
import { SOURCE } from "@/lib/source";
import { LICENSE_LABEL } from "@/lib/source-network";
import { filmsForTrack } from "@/lib/curriculum";
import { FilmStudio } from "@/components/learn/LessonFilm";
import { StudyLinks } from "@/components/learn/StudyLinks";
import { TailorLesson } from "@/components/learn/TailorLesson";
import { FamiliesLesson } from "@/components/learn/FamiliesLesson";
import { AssessLesson } from "@/components/learn/AssessLesson";
import { RmfLesson } from "@/components/learn/RmfLesson";

export const Route = createFileRoute("/hub/track/$id")({ component: TrackPage });

function TrackPage() {
  const { id } = Route.useParams();
  const track = trackById(id);

  if (!track) {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="p-5 text-sm text-muted">No such track.</p>
          <Link to="/hub/tracks" className="px-5 text-xs font-semibold text-primary">
            All tracks
          </Link>
        </ClinicFrame>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Track · {SOURCE}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{track.title}</h1>
          <p className="mt-2 text-sm text-muted">{track.blurb}</p>
          <Link to="/hub/tracks" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            All tracks
          </Link>
          {track.id === "grc" ? (
            <Link to="/hub/nist" className="ml-4 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
              NIST Academy
            </Link>
          ) : null}
        </header>

        <FilmStudio pin kicker="Watch first" title="Lectures in this path" films={filmsForTrack(track.id)} />

        <ol className="space-y-3">
          {track.modules.map((mod, i) => {
            const resolved = resolveModule(mod);
            const house = resolved.house;
            return (
              <li key={`${mod.houseId}-${i}`} className="rounded-2xl bg-surface p-5 shadow-border">
                <p className="font-mono text-[11px] text-subtle">
                  {String(i + 1).padStart(2, "0")} · {mod.level}
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold">{mod.title}</h2>
                {house ? (
                  <>
                    <p className="mt-1 text-sm text-muted">{house.blurb}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
                      {LICENSE_LABEL[house.license]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={house.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold"
                      >
                        Open at source
                      </a>
                      {mod.labId ? (
                        <Link
                          to="/hub/lab/$id"
                          params={{ id: mod.labId }}
                          className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
                        >
                          Practice lab
                        </Link>
                      ) : null}
                    </div>
                    <StudyLinks
                      title="Library"
                      links={[
                        { label: house.name, href: house.href },
                        ...(house.papers ?? []).map((p) => ({ label: p.title, href: p.href })),
                      ]}
                    />
                    {mod.houseId === "53fam" ? <div className="mt-4"><FamiliesLesson compact /></div> : null}
                    {mod.houseId === "53b" ? <div className="mt-4"><TailorLesson compact /></div> : null}
                    {mod.houseId === "53a" ? <div className="mt-4"><AssessLesson compact /></div> : null}
                    {mod.houseId === "rmf" ? <div className="mt-4"><RmfLesson /></div> : null}
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted">House is being wired.</p>
                )}
              </li>
            );
          })}
        </ol>
      </ClinicFrame>
    </AppShell>
  );
}
