import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CONTENT_SOURCES, type SourceLane } from "@/lib/content-sources";
import { SourcePipes } from "@/components/learn/RecommendDesks";
import { CAREER_PATHS, CERTS } from "@/lib/source-catalog";

const LANES: { id: SourceLane; label: string }[] = [
  { id: "video", label: "Video" },
  { id: "learn", label: "Courses" },
  { id: "audio", label: "Audio" },
];

export function SourcesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Where films come from</DialogTitle>
          <DialogDescription>One engine. Three desks. Films stay on the site that hosts them.</DialogDescription>
        </DialogHeader>
        <div className="mt-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Learning · Career · Community</p>
          <SourcePipes />
          <p className="text-xs leading-relaxed text-muted">
            A film is only the start. The graph also holds a lesson, a lab, a quiz, a certification, a course, a podcast, and a job.
          </p>
        </div>
        <div className="mt-4 space-y-5">
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Careers</p>
            <ul className="mt-2 space-y-2">
              {CAREER_PATHS.map((path) => (
                <li key={path.id} className="rounded-2xl bg-elevated px-3 py-2.5">
                  <p className="text-sm font-semibold">{path.title}</p>
                  <p className="mt-1 text-xs text-muted">{path.steps.map((step) => step.code).join(" → ")}</p>
                  <p className="mt-1 text-xs text-muted">{path.salary}</p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">
              Certifications on file: {CERTS.map((cert) => cert.name).join(", ")}. MCSE is retired at Microsoft, so Azure Administrator is the path we keep.
            </p>
          </section>
          {LANES.map((lane) => (
            <section key={lane.id}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{lane.label}</p>
              <ul className="mt-2 space-y-2">
                {CONTENT_SOURCES.filter((row) => row.lane === lane.id).map((row) => (
                  <li key={row.id} className="rounded-2xl bg-elevated px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <a href={row.href} target="_blank" rel="noreferrer" className="text-sm font-semibold hover:underline">
                        {row.name}
                      </a>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{row.how}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{row.line}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
