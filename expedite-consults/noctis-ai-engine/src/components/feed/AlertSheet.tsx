import { useEffect, useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFeedStore } from "@/lib/feed-store";
import { WAVE_PULLS, diversityOf, lanePulls } from "@/lib/feed-audit";

function when(at: number) {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} d ago`;
}

type AlertPage = "explain" | "explore" | "versus" | "prefs" | "algo" | "weights" | "diversity" | "spread";

export function AlertSheet({ open, page }: { open: boolean; page?: AlertPage }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const alerts = useFeedStore((s) => s.alerts);
  const bells = useFeedStore((s) => s.bells);
  const posts = useFeedStore((s) => s.posts);
  const notifyReleases = useFeedStore((s) => s.notifyReleases);
  const setNotifyReleases = useFeedStore((s) => s.setNotifyReleases);
  const toggleBell = useFeedStore((s) => s.toggleBell);
  const markAlertsRead = useFeedStore((s) => s.markAlertsRead);
  const openAlert = useFeedStore((s) => s.openAlert);
  const vibeMix = useFeedStore((s) => s.vibeMix);
  const [view, setView] = useState<"home" | AlertPage>("home");

  useEffect(() => {
    if (!open) return;
    setView(page ?? "home");
    markAlertsRead();
  }, [open, page, markAlertsRead]);

  const people = bells.map((username) => {
    const post = posts.find((row) => row.author.username === username);
    return { username, name: post?.author.name || username };
  });

  const title =
    view === "explain" ? "Notification settings"
    : view === "explore" ? "Subscription management"
    : view === "versus" ? "Subscribe and follow"
    : view === "prefs" ? "Notification preferences"
    : view === "algo" ? "Feed algorithms"
    : view === "weights" ? "Ranking weights"
    : view === "diversity" ? "Feed diversity"
    : view === "spread" ? "Feed diversity"
    : "Notifications";

  const detail =
    view === "home"
      ? bells.length
        ? `Subscribed to ${bells.length}. A new video from them shows up here.`
        : "Subscribe on a video. A new release from that person shows up here."
      : view === "explain"
        ? "What each control does, and the switch that turns new-video alerts on or off."
        : view === "explore"
          ? "Who you subscribed to, and how to add or remove someone."
          : view === "versus"
            ? "Follow marks a person. Subscribe asks for a notice when they release a video."
            : view === "prefs"
              ? "Turn new-video notices on or off. The list stays either way."
              : view === "weights"
                ? "How many clips each group is allowed to place before the next group."
                : view === "diversity" || view === "spread"
                  ? "A count of the next clinic videos, not a score."
                  : "How a video is ordered. Subscribe does not change this order.";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{detail}</DialogDescription>
        </DialogHeader>

        {view === "home" ? (
          <>
            {alerts.length ? (
              <ul className="mt-3 space-y-2">
                {alerts.map((row) => (
                  <li key={row.id}>
                    <button type="button" onClick={() => openAlert(row.id)} className="w-full rounded-xl bg-elevated px-3 py-2 text-left">
                      <p className="text-sm font-semibold">{row.name} released a video</p>
                      <p className="mt-0.5 text-sm leading-snug">{row.title}</p>
                      <p className="mt-1 text-[11px] text-muted">{when(row.at)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">No new video yet. The bell stays quiet until someone you subscribed to releases one.</p>
            )}
            <div className="mt-4 space-y-1">
              <MenuRow label="Explain notification settings" onClick={() => setView("explain")} />
              <MenuRow label="Explore subscription management" onClick={() => setView("explore")} />
              <MenuRow label="Explain subscribe vs follow" onClick={() => setView("versus")} />
              <MenuRow label="Manage notification preferences" onClick={() => setView("prefs")} />
              <MenuRow label="Explore feed algorithms" onClick={() => setView("algo")} />
              <MenuRow label="Explore ranking weights" onClick={() => setView("weights")} />
              <MenuRow label="Check feed diversity" onClick={() => setView("diversity")} />
              <MenuRow label="Optimize feed diversity" onClick={() => setView("spread")} />
            </div>
          </>
        ) : null}

        {view !== "home" ? (
          <button type="button" onClick={() => setView("home")} className="mt-3 text-xs font-semibold text-primary">
            Back
          </button>
        ) : null}

        {view === "explain" ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm leading-relaxed">The bell at the top is the inbox. It lists a video only after someone you subscribed to releases a new one.</p>
            <p className="text-sm leading-relaxed">Subscribe on a video, a Reel, or a person’s page. Follow is separate. Follow does not send a release notice.</p>
            <p className="text-sm leading-relaxed">Videos that were already here before you subscribed do not notify you. Your own recording does not notify you.</p>
            <button
              type="button"
              onClick={() => setNotifyReleases(!notifyReleases)}
              className="flex min-h-11 w-full items-center justify-between rounded-xl bg-elevated px-3 text-left text-sm"
            >
              <span>New videos from people I subscribe to</span>
              <span className="text-xs font-semibold text-primary">{notifyReleases ? "On" : "Off"}</span>
            </button>
            <p className="text-xs text-muted">Off keeps the list and stays quiet. On is the only notice this bell sends.</p>
          </div>
        ) : null}

        {view === "versus" ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm leading-relaxed"><span className="font-semibold">Follow</span> marks that you follow that person. It does not put a notice in the bell when they release a video.</p>
            <p className="text-sm leading-relaxed"><span className="font-semibold">Subscribe</span> asks for that notice. The next new video from them shows on the bell. Videos already on the platform do not.</p>
            <p className="text-sm leading-relaxed">You can follow without subscribing, or subscribe without following. Removing a subscription does not unfollow them.</p>
          </div>
        ) : null}

        {view === "prefs" ? (
          <div className="mt-3 space-y-3">
            <button
              type="button"
              onClick={() => setNotifyReleases(!notifyReleases)}
              className="flex min-h-11 w-full items-center justify-between rounded-xl bg-elevated px-3 text-left text-sm"
            >
              <span>New videos from people I subscribe to</span>
              <span className="text-xs font-semibold text-primary">{notifyReleases ? "On" : "Off"}</span>
            </button>
            <p className="text-xs text-muted">This is the only preference. Off keeps every subscription and sends no notice. On sends a notice only for a new release.</p>
          </div>
        ) : null}

        {view === "algo" ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm leading-relaxed">Your own recordings stay at the front.</p>
            <p className="text-sm leading-relaxed">A video you have not played today comes before one you already played. After you play it, it moves back.</p>
            <p className="text-sm leading-relaxed">New videos are mixed ahead of older ones. They are not a fixed list.</p>
            <p className="text-sm leading-relaxed">The subject you stay with, like, or choose is shown more often. A neighboring subject comes next. A subject you have barely tried is still mixed in. Inside that subject, a video close to one you stayed with comes first.</p>
            <p className="text-sm leading-relaxed">Leaving a video in under a few seconds counts against that subject. Staying, or liking it, counts for it. The same video is shown at most twice in a day, unless it is yours or the one you just opened.</p>
            <p className="text-sm leading-relaxed">Learning clips are shown more often than play clips. Two people do not get the same order. Follow and Subscribe do not change the order. Subscribe only notifies you.</p>
          </div>
        ) : null}

        {view === "weights" ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm leading-relaxed">A higher pull means that group places more videos before the others take a turn.</p>
            <ul className="space-y-1">
              {WAVE_PULLS.map((row) => (
                <li key={row.name} className="flex items-center justify-between rounded-xl bg-elevated px-3 py-2 text-sm">
                  <span>{row.name}</span>
                  <span className="font-semibold text-primary">{row.pull}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed">Inside each group, learning, play, and local take turns from your mix.</p>
            <ul className="space-y-1">
              {lanePulls(vibeMix).map((row) => (
                <li key={row.name} className="flex items-center justify-between rounded-xl bg-elevated px-3 py-2 text-sm">
                  <span>{row.name}</span>
                  <span className="font-semibold text-primary">{row.pull}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">Then the subject you stay with still places 2, a neighbor places 1, and a less-tried subject places 1. Those two are not put back to back when another subject is waiting.</p>
          </div>
        ) : null}

        {view === "diversity" || view === "spread" ? <DiversityCheck optimized={view === "spread"} /> : null}

        {view === "explore" ? (
          <div className="mt-3">
            <p className="text-sm leading-relaxed">
              {people.length
                ? `${people.length} on the list. Remove someone and their next video will not notify you. Subscribe on a video to add someone.`
                : "The list is empty. Press Subscribe on a video, a Reel, or a person’s page to add them."}
            </p>
            {people.length ? (
              <ul className="mt-3 space-y-2">
                {people.map((person) => (
                  <li key={person.username} className="flex items-center justify-between gap-3 rounded-xl bg-elevated px-3 py-2">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{person.name}</span>
                      <span className="block text-xs text-muted">@{person.username}</span>
                    </span>
                    <button type="button" onClick={() => toggleBell(person.username)} className="text-xs font-semibold text-primary">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MenuRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm">
      <CornerDownLeft className="size-4 shrink-0 text-muted" />
      {label}
    </button>
  );
}

function DiversityCheck({ optimized = false }: { optimized?: boolean }) {
  const posts = useFeedStore((s) => s.posts);
  const vibeMix = useFeedStore((s) => s.vibeMix);
  const deckSeed = useFeedStore((s) => s.deckSeed);
  const waveIds = useFeedStore((s) => s.waveIds);
  const priorWaveIds = useFeedStore((s) => s.priorWaveIds);
  const dayWatch = useFeedStore((s) => s.dayWatch);
  const check = diversityOf(posts, vibeMix, deckSeed, dayWatch, waveIds, priorWaveIds);
  return (
    <div className="mt-3 space-y-3">
      {optimized ? (
        <p className="text-sm leading-relaxed">
          The same subject is not placed twice in a row when another subject is waiting in the next few videos. The subject you stay with still appears more often. It just does not stack.
        </p>
      ) : null}
      <p className="text-sm leading-relaxed">{check.note}</p>
      <ul className="space-y-1 text-sm">
        <li className="flex justify-between rounded-xl bg-elevated px-3 py-2"><span>Next videos checked</span><span className="font-semibold">{check.count}</span></li>
        <li className="flex justify-between rounded-xl bg-elevated px-3 py-2"><span>Subjects in that set</span><span className="font-semibold">{check.unique}</span></li>
        <li className="flex justify-between rounded-xl bg-elevated px-3 py-2"><span>Largest subject</span><span className="font-semibold">{check.top ? `${check.top} · ${check.topCount}` : "None"}</span></li>
        <li className="flex justify-between rounded-xl bg-elevated px-3 py-2"><span>Same subject back to back</span><span className="font-semibold">{check.runs}</span></li>
        <li className="flex justify-between rounded-xl bg-elevated px-3 py-2"><span>Already played today</span><span className="font-semibold">{check.played}</span></li>
      </ul>
    </div>
  );
}
