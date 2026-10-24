import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { IDENTITY_MODES, readIdentity, writeIdentity, type Identity } from "@/lib/identity";
import { cn } from "@/lib/utils";

/** One identity, with an explicit switch for what the copilot may read. */
export function IdentityCard({ part = "all" }: { part?: "all" | "persona" | "access" }) {
  const [identity, setIdentity] = useState<Identity>(() => readIdentity());

  function save(next: Identity) {
    setIdentity(next);
    writeIdentity(next);
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{part === "access" ? "What AI can read" : "Persona"}</h2>
      {part === "access" ? null : (
        <>
      <p className="mt-1 text-sm text-muted">One account. The persona is saved. Other modules do not read it yet.</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {IDENTITY_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => save({ ...identity, mode: mode.id })}
            className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", identity.mode === mode.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{IDENTITY_MODES.find((mode) => mode.id === identity.mode)?.line}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-primary">
        <Link to="/calls">Messages</Link>
        <Link to="/study">Study</Link>
        <Link to="/">Videos</Link>
        <Link to="/market">Business</Link>
        <Link to="/platform">Platform</Link>
      </div>
        </>
      )}
      {part === "persona" ? null : (
        <>
      <h3 className={part === "access" ? "sr-only" : "mt-4 text-xs font-semibold uppercase tracking-wider text-muted"}>What AI can read</h3>
      <ul className="mt-2 space-y-1">
        <Gate label="This conversation" on={identity.ai.chat} onToggle={() => save({ ...identity, ai: { ...identity.ai, chat: !identity.ai.chat } })} />
        <Gate label="My private conversations" on={identity.ai.privateChats} onToggle={() => save({ ...identity, ai: { ...identity.ai, privateChats: !identity.ai.privateChats } })} />
        <Gate label="My Study library" on={identity.ai.study} onToggle={() => save({ ...identity, ai: { ...identity.ai, study: !identity.ai.study } })} />
        <Gate label="Public Noctis content" on={identity.ai.publicContent} onToggle={() => save({ ...identity, ai: { ...identity.ai, publicContent: !identity.ai.publicContent } })} />
        <Gate label="My uploaded documents" on={identity.ai.files} onToggle={() => save({ ...identity, ai: { ...identity.ai, files: !identity.ai.files } })} />
      </ul>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        Private conversations stay off until you turn them on. Vibe answers from the sources you allow and marks a generated summary as generated, not verified.
      </p>
        </>
      )}
    </section>
  );
}

function Gate({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <li>
      <button type="button" onClick={onToggle} className="flex min-h-11 w-full items-center justify-between rounded-xl bg-elevated px-3 text-sm">
        <span>{label}</span>
        <span className={cn("text-xs font-semibold", on ? "text-primary" : "text-muted")}>{on ? "On" : "Off"}</span>
      </button>
    </li>
  );
}
