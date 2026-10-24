import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { axiomById, AXIOM_LOOP } from "@/lib/axiom-clinic";
import { TailorLesson } from "@/components/learn/TailorLesson";
import { FamiliesLesson } from "@/components/learn/FamiliesLesson";
import { SOURCE } from "@/lib/source";
import { useFeedStore } from "@/lib/feed-store";
import { useState } from "react";
import { offerFurtherStudy } from "@/lib/further-study";

export const Route = createFileRoute("/hub/tool/$id")({ component: ToolNotePage });

function ToolNotePage() {
  const { id } = Route.useParams();
  const tool = axiomById(id);
  const isMuted = useFeedStore((s) => s.isMuted);
  const [play, setPlay] = useState(true);
  if (!tool) {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="rounded-2xl bg-surface p-5 text-sm">No clinic note on this desk.</p>
        </ClinicFrame>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <ClinicFrame>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {tool.family} · {SOURCE}
        </p>
        <h1 className="font-display text-2xl font-semibold">{tool.title}</h1>
        <p className="text-sm text-muted">{tool.blurb}</p>
        <p className="text-[11px] font-semibold text-primary">{AXIOM_LOOP.join(" → ")}</p>

        <article className="overflow-hidden rounded-2xl bg-surface shadow-border">
          <p className="px-5 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Watch first</p>
          <div className="p-3">
            <YoutubeFrame
              postId={`axiom-${tool.id}`}
              youtubeId={tool.watch.youtubeId}
              playing={play}
              muted={isMuted}
              onToggle={() => setPlay(true)}
              onEnded={() => offerFurtherStudy(tool.watch.title)}
            />
          </div>
          <p className="px-5 pb-4 text-xs text-muted">{tool.watch.title}</p>
        </article>

        <article className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Library</p>
          <ul className="mt-3 space-y-2">
            {tool.library.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Clinic note</p>
          <ul className="mt-3 space-y-2">
            {tool.note.map((line) => (
              <li key={line} className="text-sm leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">When: {tool.when}</p>
        </article>

        <article className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Procedure — before you launch</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {tool.procedure.map((step) => (
              <li key={step} className="text-sm leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </article>

        {tool.id === "grc" ? (
          <>
            <FamiliesLesson compact />
            <TailorLesson compact />
          </>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <a
            href={tool.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-fg"
          >
            Launch AXIOM (range only)
          </a>
          <Link
            to="/hub/lab/$id"
            params={{ id: tool.labId }}
            className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold"
          >
            Then the range lab
          </Link>
          <Link
            to="/hub/track/$id"
            params={{ id: tool.trackId }}
            className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold"
          >
            Open track
          </Link>
          <Link to="/hub/tools" className="inline-flex min-h-11 items-center rounded-full bg-elevated px-4 text-xs font-semibold">
            All tools
          </Link>
        </div>
        <p className="text-xs text-subtle">Authorized range tenant only. Do not point a scanner at a system you do not own.</p>
      </ClinicFrame>
    </AppShell>
  );
}
