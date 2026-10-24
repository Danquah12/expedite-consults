import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { AXIOM_LOOP, AXIOM_SUITE, axiomByFamily } from "@/lib/axiom-clinic";
import { StudyLinks } from "@/components/learn/StudyLinks";
import { SOURCE } from "@/lib/source";

export const Route = createFileRoute("/hub/tools")({ component: ToolsPage });

function ToolsPage() {
  const groups = axiomByFamily();
  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{AXIOM_SUITE} · {SOURCE}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Sixteen desks. One loop.</h1>
          <p className="mt-2 text-sm text-muted">
            {AXIOM_LOOP.join(" → ")}. These are your range tools, taught as clinic notes — not a dump of launch buttons on the feed.
          </p>
        </header>
        {groups.map((g) => (
          <section key={g.family} className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{g.family}</p>
            <ul className="space-y-2">
              {g.tools.map((tool) => (
                <li key={tool.id}>
                  <Link to="/hub/tool/$id" params={{ id: tool.id }} className="block rounded-2xl bg-surface p-4 shadow-border">
                    <h2 className="font-display text-base font-semibold">{tool.title}</h2>
                    <p className="mt-1 text-sm text-muted">{tool.blurb}</p>
                    <p className="mt-2 text-[11px] font-semibold text-primary">Clinic note · then {tool.stamp}</p>
                  </Link>
                  <StudyLinks
                    title="External"
                    links={[
                      { label: "Watch", href: `https://www.youtube.com/watch?v=${tool.watch.youtubeId}` },
                      ...tool.library,
                      { label: "Launch AXIOM", href: tool.href },
                    ]}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </ClinicFrame>
    </AppShell>
  );
}
