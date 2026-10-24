import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { FilmStudio } from "@/components/learn/LessonFilm";
import { NIST_LOOP, NIST_PUBS } from "@/lib/nist-desk";
import { filmsForTrack } from "@/lib/curriculum";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/nist/")({ component: NistPage });

function NistPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <header className="overflow-hidden rounded-2xl bg-surface shadow-border">
          <div className="bg-wash-cool px-5 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">NIST Academy · {SOURCE}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">One language. Then a catalog. Then an ATO.</h1>
            <p className="mt-2 text-sm text-muted">{NIST_LOOP.join(" → ")}</p>
          </div>
        </header>

        <article className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">How they fit</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            CSF is how you describe a program. RMF (800-37) is how a federal system gets authorized. 800-53 is the control catalog you select from. 800-30 is the risk argument. Everything else — IR, CUI, Zero Trust, AI, supply chain — hangs off that spine.
          </p>
        </article>

        <FilmStudio pin kicker="Watch first" title="NIST Cybersecurity Framework" films={filmsForTrack("grc")} />

        <ul className="space-y-3">
          {NIST_PUBS.map((pub) => (
            <li key={pub.id} className="rounded-2xl bg-surface p-5 shadow-border">
              <p className="font-mono text-[11px] text-subtle">{pub.code} · {pub.role}</p>
              <h2 className="mt-1 font-display text-lg font-semibold">{pub.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{pub.line}</p>
              <p className="mt-2 text-xs text-subtle">When: {pub.when}</p>
              <a
                href={pub.href}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary"
              >
                Open at NIST
              </a>
              {pub.id === "controls" ? (
                <div className="mt-2 flex flex-col">
                  <Link to="/hub/nist/families" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">
                    800-53 control families
                  </Link>
                  <Link to="/hub/nist/select" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">
                    How selection works
                  </Link>
                  <Link to="/hub/nist/tailor" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">
                    800-53B tailoring rationale
                  </Link>
                  <Link to="/hub/nist/assess" className="inline-flex min-h-11 items-center text-xs font-semibold text-primary">
                    800-53A assessment methods
                  </Link>
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          <Link to="/study" search={{ desk: "nist", family: undefined, step: "rmf" }} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            RMF pubs on Study
          </Link>
          <Link
            to="/hub/track/$id"
            params={{ id: "grc" }}
            className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold"
          >
            GRC track
          </Link>
          <Link
            to="/hub/lab/$id"
            params={{ id: "ctem" }}
            className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold"
          >
            CTEM lab
          </Link>
          <Link to="/hub/tracks" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            All tracks
          </Link>
        </div>
      </ClinicFrame>
    </AppShell>
  );
}
