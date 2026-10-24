import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { careerById } from "@/lib/cyber-careers";
import { houseById } from "@/lib/cyber-week";
import { SOURCE } from "@/lib/source";
import { useFeedStore } from "@/lib/feed-store";

export const Route = createFileRoute("/hub/career/$id")({ component: CareerPage });

function CareerPage() {
  const { id } = Route.useParams();
  const path = careerById(id);
  const stamps = useFeedStore((s) => s.earnedStamps);

  if (!path) {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="p-5 text-sm text-muted">No such path.</p>
          <Link to="/hub/careers" className="px-5 text-xs font-semibold text-primary">
            All paths
          </Link>
        </ClinicFrame>
      </AppShell>
    );
  }

  const held = stamps.includes(path.credential);

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {path.title} · {SOURCE}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{path.blurb}</h1>
          <p className="mt-2 text-sm text-muted">
            {held ? `Badge held: ${path.credential}.` : `Earn ${path.credential}, then sit ${path.job}.`}
          </p>
          <Link to="/hub/careers" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            All paths
          </Link>
        </header>

        {path.levels.map((level) => (
          <section key={level.n} className="rounded-2xl bg-surface p-5 shadow-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Level {level.n}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">{level.title}</h2>
            <ul className="mt-3 space-y-2">
              {level.houseIds.map((hid) => {
                const house = houseById(hid);
                if (!house) return null;
                return (
                  <li key={hid}>
                    <a href={house.href} target="_blank" rel="noreferrer" className="block min-h-11 text-sm">
                      {house.name}
                    </a>
                  </li>
                );
              })}
            </ul>
            {level.labIds.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {level.labIds.map((labId) => (
                  <Link
                    key={labId}
                    to="/hub/lab/$id"
                    params={{ id: labId }}
                    className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
                  >
                    Range lab
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        ))}

        <Link to="/openings" className="rounded-2xl bg-elevated p-5 text-sm font-semibold shadow-border">
          Jobs and freelance after the badge
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}
