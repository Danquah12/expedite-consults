import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { studyClearRing, studyRings } from "@/lib/study-group-api";

type Ring = { id: number; groupId: string; from: string; title: string; interest: string };

/** Incoming study call, on every tab, not only Study. */
export function StudyRingBar() {
  const { user } = useCurrentUserState();
  const navigate = useNavigate();
  const [ring, setRing] = useState<Ring | null>(null);
  const heard = useRef(0);

  useEffect(() => {
    if (!user) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission().catch(() => undefined);
    }
    let stop = false;
    async function look() {
      try {
        const rows = await studyRings();
        const next = rows[0] ?? null;
        if (!stop) setRing(next);
        if (next && next.id !== heard.current && typeof Notification !== "undefined" && Notification.permission === "granted") {
          heard.current = next.id;
          new Notification(`${next.from} is calling`, { body: next.title });
        }
      } catch {
        if (!stop) setRing(null);
      }
    }
    void look();
    const timer = window.setInterval(() => void look(), 4000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [user]);

  if (!ring) return null;

  return (
    <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-2 border-b border-border bg-primary px-3 py-2 text-primary-fg">
      <p className="min-w-0 text-sm">
        <span className="font-semibold">{ring.from}</span> is calling you into {ring.title}.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-11 rounded-full bg-bg px-3 text-xs font-semibold text-fg"
          onClick={() => {
            const next = ring;
            setRing(null);
            void studyClearRing({ data: { id: next.id } });
            void navigate({
              to: "/study",
              search: { desk: next.interest, group: next.groupId, family: undefined, step: undefined },
            });
          }}
        >
          Join the call
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-primary-fg/15 px-3 text-xs font-semibold"
          onClick={() => {
            void studyClearRing({ data: { id: ring.id } });
            setRing(null);
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
