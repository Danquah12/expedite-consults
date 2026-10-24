import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { CYBER_TRACKS } from "@/lib/cyber-tracks";
import { filmsForTrack } from "@/lib/curriculum";
import { youtubePoster } from "@/lib/youtube";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/tracks")({ component: TracksPage });

function TracksPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <header className="overflow-hidden rounded-2xl bg-surface shadow-border">
          <div className="bg-wash-cool px-5 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Curriculum · {SOURCE}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">Pick a path. Watch. Then the lab.</h1>
            <p className="mt-2 text-sm text-muted">Each track opens with official lectures. Entertainment stays on Reels. This hall is for students.</p>
            <Link to="/hub/fleet" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
              Want the long version? Open a course.
            </Link>
          </div>
        </header>
        <ul className="space-y-3">
          {CYBER_TRACKS.map((track, i) => {
            const film = filmsForTrack(track.id)[0];
            return (
              <li key={track.id}>
                <Link
                  to="/hub/track/$id"
                  params={{ id: track.id }}
                  className="block overflow-hidden rounded-2xl bg-surface shadow-border"
                >
                  {film ? (
                    <img
                      src={youtubePoster(film.youtubeId)}
                      alt=""
                      className="aspect-[16/7] w-full object-cover"
                    />
                  ) : null}
                  <div className="p-5">
                    <p className="font-mono text-[11px] text-subtle">{String(i + 1).padStart(2, "0")} · {filmsForTrack(track.id).length} films</p>
                    <h2 className="mt-1 font-display text-lg font-semibold">{track.title}</h2>
                    <p className="mt-1 text-sm text-muted">{track.blurb}</p>
                    <p className="mt-2 text-[11px] font-semibold text-primary">{track.modules.length} modules</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </ClinicFrame>
    </AppShell>
  );
}