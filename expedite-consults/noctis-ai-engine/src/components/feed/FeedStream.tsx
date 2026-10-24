import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FeedPost } from "@/lib/feed-data";
import { PostCard } from "@/components/feed/PostCard";
import { estimateHeight, FOCUS_POST, prefixHeights, setFeedOrder, visibleRange } from "@/lib/feed-virtual";

export function FeedStream({ posts }: { posts: FeedPost[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const measured = useRef<Record<string, number>>({});
  const [tick, setTick] = useState(0);
  const [span, setSpan] = useState({ start: 0, end: Math.min(3, posts.length) });
  const pin = useRef<number | null>(null);

  const offsets = useMemo(() => prefixHeights(posts, measured.current), [posts, tick]);
  const total = offsets[posts.length] ?? 0;

  useEffect(() => {
    setFeedOrder(posts.map((p) => p.id));
    return () => setFeedOrder([]);
  }, [posts]);

  const recut = useCallback(() => {
    const root = wrap.current;
    if (!root || posts.length === 0) return;
    const top = root.getBoundingClientRect().top + window.scrollY;
    const viewStart = Math.max(0, window.scrollY - top);
    const viewEnd = viewStart + window.innerHeight;
    let next = visibleRange(offsets, viewStart, viewEnd);
    if (pin.current != null) {
      next = {
        start: Math.min(next.start, Math.max(0, pin.current - 2)),
        end: Math.max(next.end, Math.min(posts.length, pin.current + 3)),
      };
    }
    setSpan((cur) => (cur.start === next.start && cur.end === next.end ? cur : next));
  }, [offsets, posts.length]);

  useEffect(() => {
    recut();
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        recut();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [recut]);

  useEffect(() => {
    const onFocus = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const i = posts.findIndex((p) => p.id === id);
      if (i < 0) return;
      pin.current = i;
      const y = wrap.current ? wrap.current.getBoundingClientRect().top + window.scrollY + (offsets[i] ?? 0) : 0;
      window.scrollTo({ top: Math.max(0, y - window.innerHeight * 0.2), behavior: "smooth" });
      setSpan({ start: Math.max(0, i - 2), end: Math.min(posts.length, i + 4) });
      window.setTimeout(() => {
        pin.current = null;
        recut();
      }, 900);
    };
    window.addEventListener(FOCUS_POST, onFocus);
    return () => window.removeEventListener(FOCUS_POST, onFocus);
  }, [posts, offsets, recut]);

  const noteSize = useCallback(
    (id: string, height: number) => {
      if (height < 80) return;
      const prev = measured.current[id];
      if (prev && Math.abs(prev - height) < 8) return;
      const index = posts.findIndex((p) => p.id === id);
      const start = index >= 0 ? offsets[index] ?? 0 : 0;
      const root = wrap.current;
      const wrapTop = root ? root.getBoundingClientRect().top + window.scrollY : 0;
      const above = prev && wrapTop + start + prev < window.scrollY;
      measured.current[id] = height;
      setTick((n) => n + 1);
      if (above && prev) window.scrollBy(0, height - prev);
    },
    [posts, offsets],
  );

  const slice = posts.slice(span.start, span.end);
  const top = offsets[span.start] ?? 0;
  const bottom = total - (offsets[span.end] ?? total);

  return (
    <div ref={wrap} data-feed-stream>
      <div style={{ height: top }} aria-hidden />
      {slice.map((post) => (
        <Measured
          key={post.id}
          id={post.id}
          fallback={measured.current[post.id] ?? estimateHeight(post)}
          known={Boolean(measured.current[post.id])}
          onSize={noteSize}
        >
          <PostCard post={post} />
        </Measured>
      ))}
      <div style={{ height: Math.max(0, bottom) }} aria-hidden />
    </div>
  );
}

function Measured({
  id,
  fallback,
  known,
  onSize,
  children,
}: {
  id: string;
  fallback: number;
  known: boolean;
  onSize: (id: string, height: number) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => onSize(id, el.getBoundingClientRect().height);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [id, onSize]);

  return (
    <div ref={ref} className="pb-3 md:pb-4 xl:pb-5" style={known ? undefined : { minHeight: fallback }}>
      {children}
    </div>
  );
}
