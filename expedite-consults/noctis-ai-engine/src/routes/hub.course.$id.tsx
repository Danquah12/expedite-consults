import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { YoutubeFrame } from "@/components/feed/YoutubeFrame";
import { courseById } from "@/lib/edu-courses";
import { offerFurtherStudy } from "@/lib/further-study";
import { youtubePoster } from "@/lib/youtube";
import { useFeedStore } from "@/lib/feed-store";
import { useClipFocus } from "@/lib/playback";
import { XP } from "@/lib/learn";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hub/course/$id")({ component: CoursePage });

function CoursePage() {
  const { id } = Route.useParams();
  const course = courseById(id);
  const isMuted = useFeedStore((s) => s.isMuted);
  const unlockSound = useFeedStore((s) => s.unlockSound);
  const toggleMute = useFeedStore((s) => s.toggleMute);
  const awardXp = useFeedStore((s) => s.awardXp);
  const [watch, setWatch] = useState<string | null>(course?.modules.flatMap((m) => m.items).find((i) => i.kind === "video")?.id ?? null);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const focus = useClipFocus("[data-hub-film]", "data-hub-film", course?.id ?? "");

  useEffect(() => {
    if (focus) setWatch(focus);
  }, [focus]);

  if (!course) {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="text-sm text-muted">That course is not in the hall.</p>
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
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{course.code}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{course.title}</h1>
          <p className="mt-2 text-sm text-muted">{course.blurb}</p>
          <p className="mt-2 text-[11px] text-subtle">{course.school} · modules, then the Echo</p>
        </header>
        {course.modules.map((mod) => (
          <section key={mod.id} className="rounded-2xl bg-surface p-4 shadow-border">
            <h2 className="font-display text-lg font-semibold">{mod.title}</h2>
            <ul className="mt-3 space-y-3">
              {mod.items.map((item) => {
                if (item.kind === "video") {
                  const on = watch === item.id;
                  return (
                    <li key={item.id} data-hub-film={item.id}>
                      <p className="text-left text-sm font-semibold">Video · {item.title}</p>
                      <div className="mt-2 overflow-hidden rounded-xl">
                        <YoutubeFrame
                          postId={item.id}
                          youtubeId={item.youtubeId}
                          posterUrl={youtubePoster(item.youtubeId)}
                          playing={on}
                          muted={isMuted}
                          onToggle={() => {
                            unlockSound();
                            setWatch(item.id);
                          }}
                          onEnded={() => offerFurtherStudy(item.title)}
                        />
                      </div>
                    </li>
                  );
                }
                if (item.kind === "read") {
                  return (
                    <li key={item.id}>
                      <a href={item.href} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                        Reading · {item.title}
                      </a>
                    </li>
                  );
                }
                const choice = picked[item.id];
                const ok = item.ok;
                return (
                  <li key={item.id} className="rounded-xl bg-elevated p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">{item.title}</p>
                    <p className="mt-1 text-sm">{item.prompt}</p>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {[ok, ...item.wrong].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          disabled={Boolean(choice)}
                          onClick={() => {
                            setPicked((p) => ({ ...p, [item.id]: opt }));
                            if (opt === ok) awardXp(XP.drill);
                          }}
                          className={cn(
                            "rounded-lg px-3 py-2 text-left text-xs font-semibold",
                            !choice ? "bg-surface" : opt === ok ? "bg-primary text-primary-fg" : opt === choice ? "bg-bg text-muted" : "bg-surface text-subtle",
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <Link to="/hub" className="text-xs font-semibold text-primary">
          Back to hub
        </Link>
      </ClinicFrame>
    </AppShell>
  );
}
