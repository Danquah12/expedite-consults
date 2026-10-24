import { BookOpen, ImagePlus, Video, Youtube } from "lucide-react";
import { ME } from "@/lib/current-user";
import { useFeedStore } from "@/lib/feed-store";
import { inspectLocalFile, stashInbound } from "@/lib/local-media";
import { MediaFileField } from "@/components/feed/MediaFileField";

export function ComposerBar() {
  const openModal = useFeedStore((s) => s.openModal);

  async function drop(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const inspected = await inspectLocalFile(file);
    if (!inspected) return;
    stashInbound(file);
    openModal({ type: "composer", pick: true });
  }

  return (
    <div
      className="rounded-2xl bg-surface p-3 shadow-border"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void drop(e.dataTransfer.files);
      }}
    >
      <button
        type="button"
        onClick={() => openModal({ type: "composer" })}
        className="flex min-h-12 w-full items-center gap-3 rounded-xl bg-elevated px-3 py-3 text-left"
      >
        <img src={ME.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
        <span className="truncate text-sm text-muted">A Spark, a drill, a stamp.</span>
      </button>
      <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
        <label htmlFor="clinic-file" className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-muted hover:bg-elevated hover:text-fg">
          <ImagePlus className="size-4" />
          Photo / video
        </label>
        <button
          type="button"
          onClick={() => openModal({ type: "recorder" })}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-muted hover:bg-elevated hover:text-fg"
        >
          <Video className="size-4" />
          Record / on air
        </button>
        <button
          type="button"
          onClick={() => openModal({ type: "composer" })}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-muted hover:bg-elevated hover:text-fg"
        >
          <Youtube className="size-4" />
          ConnectLn
        </button>
        <button
          type="button"
          onClick={() => openModal({ type: "lesson-song" })}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-muted hover:bg-elevated hover:text-fg"
        >
          <BookOpen className="size-4" />
          Lesson video
        </button>
      </div>
      <MediaFileField
        onPicked={() => openModal({ type: "composer", pick: true })}
      />
    </div>
  );
}
