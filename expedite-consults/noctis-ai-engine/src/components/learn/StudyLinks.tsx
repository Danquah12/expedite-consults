export function StudyLinks({
  title = "Study at source",
  links,
}: {
  title?: string;
  links: { label: string; href: string }[];
}) {
  if (!links.length) return null;
  return (
    <div className="mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-elevated px-3 text-xs font-semibold"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
