import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { CYBER_SOURCE_TIERS, tierHouses } from "@/lib/cyber-sources";
import { LICENSE_LABEL } from "@/lib/source-network";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/sources")({ component: SourcesPage });

function SourcesPage() {
  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Cyber sources · {SOURCE}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Where the films come from</h1>
          <p className="mt-2 text-sm text-muted">
            Official first. Universities second. Conferences third. We embed or send you there. We do not scrape random YouTube.
          </p>
          <Link to="/hub/tracks" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary">
            Tracks
          </Link>
        </header>

        {CYBER_SOURCE_TIERS.map((tier, i) => (
          <section key={tier.id} className="rounded-2xl bg-surface p-5 shadow-border">
            <p className="font-mono text-[11px] text-subtle">Tier {i + 1}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">{tier.title}</h2>
            <p className="mt-1 text-sm text-muted">{tier.blurb}</p>
            <ul className="mt-4 space-y-2">
              {tierHouses(tier).map((house) => (
                <li key={house.id}>
                  <a
                    href={house.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 items-start justify-between gap-3 rounded-xl px-2 py-2 hover:bg-elevated"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{house.name}</span>
                      <span className="mt-0.5 block text-[11px] text-muted">{house.blurb}</span>
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-subtle">
                      {LICENSE_LABEL[house.license]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </ClinicFrame>
    </AppShell>
  );
}
