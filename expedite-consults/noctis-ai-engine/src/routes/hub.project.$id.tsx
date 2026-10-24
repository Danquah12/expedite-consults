import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { projectById } from "@/lib/edu-courses";
import { offerFurtherStudy } from "@/lib/further-study";
import { youtubePoster } from "@/lib/youtube";
import { useFeedStore } from "@/lib/feed-store";

export const Route = createFileRoute("/hub/project/$id")({ component: ProjectPage });

function ProjectPage() {
  const { id } = Route.useParams();
  const project = projectById(id);
  const isMuted = useFeedStore((s) => s.isMuted);
  const unlockSound = useFeedStore((s) => s.unlockSound);
  const toggleMute = useFeedStore((s) => s.toggleMute);
  const [play, setPlay] = useState(true);

  if (!project) {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="text-sm text-muted">That lab is not in the hall.</p>
          <Link to="/hub" className="text-xs font-semibold text-primary">
            Back to hub
          </Link>
        </ClinicFrame>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Research project</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{project.title}</h1>
          <p className="mt-2 text-sm text-muted">{project.researchers}</p>
          <p className="text-xs text-subtle">
            {project.school} · {project.department}
          </p>
        </header>
        <article className="rounded-2xl bg-surface p-4 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Abstract</p>
          <p className="mt-2 text-sm">{project.abstract}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.keywords.map((k) => (
              <span key={k} className="rounded-full bg-elevated px-2.5 py-1 text-[10px] font-semibold">
                {k}
              </span>
            ))}
          </div>
        </article>
        <article className="overflow-hidden rounded-2xl bg-surface shadow-border">
          {play ? (
            <YoutubeFrame
              postId={project.id}
              youtubeId={project.youtubeId}
              posterUrl={youtubePoster(project.youtubeId)}
              playing
              muted={isMuted}
              onToggle={() => toggleMute(project.id)}
              onEnded={() => offerFurtherStudy(project.title)}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                unlockSound();
                setPlay(true);
              }}
              className="relative block w-full"
            >
              <img src={youtubePoster(project.youtubeId)} alt="" className="h-48 w-full object-cover" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-fg">
                Watch presentation
              </span>
            </button>
          )}
        </article>
        <nav className="grid grid-cols-2 gap-2">
          <a href={project.paper} target="_blank" rel="noreferrer" className="rounded-2xl bg-surface px-4 py-3 text-xs font-semibold shadow-border">
            View paper
          </a>
          <a href={project.github} target="_blank" rel="noreferrer" className="rounded-2xl bg-surface px-4 py-3 text-xs font-semibold shadow-border">
            GitHub
          </a>
          <a href={project.dataset} target="_blank" rel="noreferrer" className="rounded-2xl bg-surface px-4 py-3 text-xs font-semibold shadow-border">
            Dataset
          </a>
          <Link to="/hub" className="rounded-2xl bg-surface px-4 py-3 text-xs font-semibold shadow-border">
            Back to hub
          </Link>
        </nav>
      </ClinicFrame>
    </AppShell>
  );
}
