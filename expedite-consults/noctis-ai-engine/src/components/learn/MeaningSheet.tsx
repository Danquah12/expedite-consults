import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFeedStore } from "@/lib/feed-store";
import { plainMeaning } from "@/lib/plain-meaning";
import { careerLift } from "@/lib/career-lift";
import { RecommendDesks } from "@/components/learn/RecommendDesks";
import { CatalogCard } from "@/components/learn/CatalogCard";
import { CareerGraphCard } from "@/components/learn/CareerGraphCard";
import { pathFor } from "@/lib/source-catalog";
import { NoctisMoves } from "@/components/noctis/NoctisMoves";
import { musicAsset, isMusicPost } from "@/lib/music-asset";
import { applySong } from "@/lib/reel-services";

export function MeaningSheet({ open, postId }: { open: boolean; postId: string }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const openModal = useFeedStore((s) => s.openModal);
  const posts = useFeedStore((s) => s.posts);
  const post = posts.find((row) => row.id === postId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    const lane = document.querySelector("[data-feed-lane]");
    const laneTop = lane instanceof HTMLElement ? lane.scrollTop : 0;
    const putBack = () => {
      window.scrollTo(0, y);
      if (lane instanceof HTMLElement) lane.scrollTop = laneTop;
    };
    putBack();
    const frame = window.requestAnimationFrame(putBack);
    if (post && isMusicPost(post)) applySong(post);
    return () => window.cancelAnimationFrame(frame);
  }, [open, post]);

  if (!open || !post) return null;
  const song = musicAsset(post);
  if (song) {
    const ask = `The song is ${song.title}. Artist: ${song.artist || "not stored"}. Themes: ${song.meaning.themes.join("; ") || "not stored"}. History: ${song.meaning.historicalContext || "not stored"}. Culture: ${song.meaning.culturalSignificance || "not stored"}. Insight: ${song.analysis.keyInsight || "not stored"}. Answer only from those notes. If a fact is not stored, say so.`;
    const dna = Object.entries(song.dnaImpact).map(([name, step]) => `${name} +${step}`).join(" · ");
    return (
      <Dialog open={open} modal={false} onOpenChange={(next) => !next && closeModal()}>
        <DialogContent
          className="max-h-[85dvh] overflow-y-auto"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{song.title}</DialogTitle>
            <DialogDescription>{song.artist ? `${song.artist}${song.publishedDate ? `, ${song.publishedDate}` : ""}` : "Writer is not stored for this recording."}</DialogDescription>
          </DialogHeader>
          <div className="mt-3 space-y-4 text-sm leading-relaxed">
            <Block label="Theme" text={song.meaning.themes.join(" · ") || "Not stored."} />
            <Block label="Historical context" text={song.meaning.historicalContext || "Not stored."} />
            <Block label="Cultural significance" text={song.meaning.culturalSignificance || "Not stored."} />
            <Block label="Why it matters" text={song.analysis.importance || "Not stored."} />
            <Block label="Key insight" text={song.analysis.keyInsight || "Not stored."} />
            <Block label="Related lessons" text={song.learning.relatedLessons.join(" · ") || "No lesson card is stored."} />
            <Block label="Related paths" text={song.learning.relatedPaths.join(" · ") || "Not stored."} />
            <Block label="Related careers" text={song.learning.relatedCareers.join(" · ") || "This song does not name a career."} />
            <Block label="Knowledge DNA" text={dna || "No strand is stored."} />
            <Block label="Journey" text="Opening Meaning records this song once. Path: Listen. Hours +0.1." />
            {song.learning.relatedLessons.length ? (
              <div className="flex flex-wrap gap-2">
                <Link to="/study" search={{ desk: undefined, family: undefined, step: undefined }} onClick={() => closeModal()} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Academy</Link>
                <Link to="/hall" onClick={() => closeModal()} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Hall</Link>
                <Link to="/campus" onClick={() => closeModal()} className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold">Knowledge</Link>
              </div>
            ) : null}
            <NoctisMoves
              items={[
                { label: "What does this mean?", ask },
                { label: "Who wrote this?", ask: `${ask} The question is who wrote it.` },
                { label: "Why is it important?", ask: `${ask} The question is why it is important.` },
                { label: "What can I learn?", ask: `${ask} The question is what can be learned from the stored notes.` },
              ]}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  const lines = plainMeaning(post);
  const lift = careerLift(post);
  const catalog = pathFor(post);

  function discuss() {
    sessionStorage.setItem("vibetok-discuss", post!.teach.hook);
    closeModal();
    void navigate({ to: "/calls" });
  }

  return (
    <Dialog open={open} modal={false} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent
        className="max-h-[85dvh] overflow-y-auto"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>What this means</DialogTitle>
          <DialogDescription>Watch it, then ask, study, discuss, or test it without leaving Noctis.</DialogDescription>
        </DialogHeader>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="min-h-11 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg" onClick={() => openModal({ type: "think", claim: post.teach.hook })}>
            Ask about this
          </button>
          <button type="button" className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold" onClick={() => openModal({ type: "lesson", postId: post.id })}>
            Open the lesson
          </button>
          <button type="button" className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold" onClick={discuss}>
            Discuss in Chat
          </button>
          <button type="button" className="min-h-11 rounded-full bg-elevated px-3 text-xs font-semibold" onClick={() => openModal({ type: "comments", postId: post.id })}>
            Comment
          </button>
        </div>
        <div className="mt-3 space-y-4">
          {lines.map((block) => (
            <section key={block.label}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{block.label}</p>
              <p className="mt-1 text-sm leading-relaxed">{block.text}</p>
            </section>
          ))}
          <RecommendDesks post={post} library={posts} />
          <CareerGraphCard post={post} library={posts} />
          <CatalogCard post={post} />
          {lift && !catalog ? (
            <section className="space-y-3 rounded-2xl bg-elevated p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Path from this film</p>
              <p className="text-sm leading-relaxed">{lift.summary}</p>
              <p className="text-xs text-muted">Skills · {lift.skills.join(" · ")}</p>
              {lift.certs.map((row) => (
                <a key={row.href} href={row.href} target="_blank" rel="noreferrer" className="block text-sm font-semibold hover:underline">
                  {row.title}
                </a>
              ))}
              {lift.courses.map((row) => (
                <a key={row.href} href={row.href} target="_blank" rel="noreferrer" className="block text-sm hover:underline">
                  {row.title}
                </a>
              ))}
              {lift.jobs.map((row) => (
                <a key={row.href} href={row.href} target="_blank" rel="noreferrer" className="block text-sm hover:underline">
                  {row.title}
                </a>
              ))}
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <section>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{label}</p>
      <p className="mt-1">{text}</p>
    </section>
  );
}