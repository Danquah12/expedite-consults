import type { FeedPost } from "@/lib/feed-data";
import { careerGraph } from "@/lib/career-graph";
import { scrollToFeed } from "@/lib/syndicate";

export function CareerGraphCard({ post, library }: { post: FeedPost; library: FeedPost[] }) {
  const graph = careerGraph(post, library);
  if (!graph) return null;
  const { skill, steps } = graph;

  function open(href?: string) {
    if (!href) return;
    if (href.startsWith("#post-")) {
      scrollToFeed(href.slice(6));
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="space-y-3 rounded-2xl bg-elevated p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Career graph</p>
      <p className="text-sm font-semibold">Current skill · {skill.name}</p>
      <p className="text-xs leading-relaxed">Careers · {skill.careers.map((row) => row.title).join(" · ")}</p>
      <p className="text-xs leading-relaxed text-muted">{skill.salary}</p>
      <ol className="space-y-1.5">
        {steps.map((step, i) => (
          <li key={step.label}>
            <button type="button" onClick={() => open(step.href)} className="text-left text-sm hover:underline">
              <span className="text-muted">{i + 1}. {step.label} → </span>
              {step.detail}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
