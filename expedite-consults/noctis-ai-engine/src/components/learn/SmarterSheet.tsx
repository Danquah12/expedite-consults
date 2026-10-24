import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KnowledgeDna } from "@/components/learn/KnowledgeDna";
import { GOALS } from "@/lib/learn";
import { smarterReport } from "@/lib/insight";
import { houseIntel } from "@/lib/house-intel";
import { learningProfile } from "@/lib/learning-profile";
import { LearningProfile } from "@/components/learn/LearningProfile";
import { LearningBoard } from "@/components/learn/LearningBoard";
import { CreatorMarket } from "@/components/learn/CreatorMarket";
import { MyPath } from "@/components/learn/MyPath";
import { PassportCard } from "@/components/learn/PassportCard";
import { KnowledgePath } from "@/components/learn/KnowledgePath";
import { useFeedStore } from "@/lib/feed-store";
import { scrollToFeed } from "@/lib/syndicate";
import { cn } from "@/lib/utils";

export function SmarterSheet({ open }: { open: boolean }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const passed = useFeedStore((s) => s.drillPassed);
  const posts = useFeedStore((s) => s.posts);
  const goal = useFeedStore((s) => s.goal);
  const setGoal = useFeedStore((s) => s.setGoal);
  const toggleFlip = useFeedStore((s) => s.toggleFlip);
  const report = smarterReport(passed, posts);
  const watch = useFeedStore((s) => s.dayWatch);
  const intel = houseIntel(posts, watch, passed);
  const missed = useFeedStore((s) => s.drillMissed);
  const tree = learningProfile(posts, watch, passed, missed);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make me smarter</DialogTitle>
          <DialogDescription>The map stays private. Diet follows the goal.</DialogDescription>
        </DialogHeader>
        <p className="mt-3 text-sm leading-relaxed">{intel.line}</p>
        {intel.links.length ? (
          <ul className="mt-2 space-y-1">
            {intel.links.map((link) => (
              <li key={`${link.from}-${link.to}`} className="text-xs text-muted">
                {link.from} → {link.to}. {link.because}
              </li>
            ))}
          </ul>
        ) : null}
        <LearningBoard />
        <div className="mt-4">
          <CreatorMarket />
        </div>
        <LearningProfile tree={tree} />
        <MyPath />
        <PassportCard posts={posts} watch={watch} passed={passed} />
        {intel.open ? (
          <div className="mt-4">
            <KnowledgePath post={intel.open} />
          </div>
        ) : null}
        <KnowledgeDna />
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Why you are here</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  goal === g.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        {report.next ? (
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-elevated px-3 py-3 text-left"
            onClick={() => {
              toggleFlip(report.next!.id);
              closeModal();
              scrollToFeed(report.next!.id);
            }}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary">Next drill</span>
            <span className="mt-1 block text-sm font-semibold">{report.next.teach.stamp}</span>
            <span className="block text-xs text-muted">{report.next.teach.hook}</span>
          </button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
