import type { Ref } from "react";
import { Link } from "@tanstack/react-router";
import { CREWS } from "@/lib/feed-data";
import { PEOPLE } from "@/lib/directory";
import { cn } from "@/lib/utils";

type Hit = { kind: "person" | "crew"; id: string; label: string; hint: string; avatar?: string };

function hitsFor(query: string): Hit[] {
  const sigil = query[0];
  const q = query.slice(1).toLowerCase();
  const people = PEOPLE.filter(
    (p) => !q || p.username.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
  ).map((p) => ({ kind: "person" as const, id: p.username, label: `@${p.username}`, hint: p.name, avatar: p.avatar }));
  const crews = CREWS.filter(
    (c) => !q || c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
  ).map((c) => ({ kind: "crew" as const, id: c.id, label: `#${c.id}`, hint: c.name }));
  if (sigil === "@") return people.slice(0, 6);
  if (sigil === "#") return crews.slice(0, 6);
  return [...people.slice(0, 4), ...crews.slice(0, 3)];
}

function activeQuery(text: string) {
  const m = text.match(/(^|\s)([@#][\w.-]*)$/);
  return m ? m[2] : null;
}

export function EchoText({ text }: { text: string }) {
  const bits = text.split(/([@#][\w.-]+)/g);
  return (
    <>
      {bits.map((bit, i) => {
        if (bit.startsWith("@")) {
          const user = bit.slice(1);
          return (
            <Link key={`${bit}-${i}`} to="/u/$username" params={{ username: user }} className="font-semibold text-primary">
              {bit}
            </Link>
          );
        }
        if (bit.startsWith("#")) {
          return (
            <Link key={`${bit}-${i}`} to="/campus" className="font-semibold text-primary">
              {bit}
            </Link>
          );
        }
        return <span key={i}>{bit}</span>;
      })}
    </>
  );
}

export function EchoField({
  value,
  onChange,
  onSubmit,
  inputRef,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const q = activeQuery(value);
  const hits = q && q.length >= 1 ? hitsFor(q) : [];

  function pick(hit: Hit) {
    onChange(value.replace(/[@#][\w.-]*$/, `${hit.label} `));
  }

  return (
    <div className="relative min-w-0 flex-1">
      {hits.length ? (
        <ul className="absolute inset-x-0 bottom-full z-20 mb-1 overflow-hidden rounded-2xl bg-elevated shadow-float">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`}>
              <button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(hit)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-surface"
              >
                {hit.avatar ? (
                  <img src={hit.avatar} alt="" className="size-6 rounded-full object-cover" />
                ) : (
                  <span className="grid size-6 place-items-center rounded-full bg-surface text-[10px] font-semibold">#</span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{hit.label}</span>
                  <span className="block truncate text-[11px] text-muted">{hit.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Echo · @name or #crew"
        className={cn("w-full rounded-full bg-elevated px-3 py-2 text-xs outline-none")}
      />
    </div>
  );
}
