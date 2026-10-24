import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudyThisPanel } from "@/components/learn/StudyThisPanel";
import { useFeedStore } from "@/lib/feed-store";

export function LessonSheet({ open, postId }: { open: boolean; postId: string }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const openModal = useFeedStore((s) => s.openModal);
  const posts = useFeedStore((s) => s.posts);
  const post = posts.find((p) => p.id === postId);
  if (!open || !post) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post.teach.hook || "This film"}</DialogTitle>
          <DialogDescription>{[post.teach.stamp, post.author.name].filter(Boolean).join(" · ")}</DialogDescription>
        </DialogHeader>
        <StudyThisPanel post={post} onNext={(id) => openModal({ type: "lesson", postId: id })} />
      </DialogContent>
    </Dialog>
  );
}
