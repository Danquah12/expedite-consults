import type { FeedPost } from "@/lib/feed-data";
import { certsFor, filmRecord, pathFor } from "@/lib/source-catalog";

export function CatalogCard({ post }: { post: FeedPost }) {
  const path = pathFor(post);
  if (!path) return null;
  const film = filmRecord(post);
  const certs = certsFor(path);
  return (
    <section className="space-y-3 rounded-2xl bg-elevated p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
        {film.source} · {path.title}
      </p>
      <p className="text-xs leading-relaxed text-muted">{path.salary}</p>
      <p className="text-xs">Skills · {path.skills.join(" · ")}</p>
      <ol className="space-y-1">
        {path.steps.map((step) => (
          <li key={step.code}>
            <a href={step.href} target="_blank" rel="noreferrer" className="text-sm font-semibold hover:underline">
              {step.code} — {step.name}
            </a>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2 text-xs">
        <a href={path.onet} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
          O*NET
        </a>
        <a href={path.labor} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
          Labor Department
        </a>
        {certs.slice(0, 4).map((cert) => (
          <a key={cert.certificationId} href={cert.href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
            {cert.name}
          </a>
        ))}
      </div>
    </section>
  );
}
