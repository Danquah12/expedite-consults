import { useState } from "react";
import { clearEvents, eventsAllowed, readEvents, setEventsAllowed, topSubjects } from "@/lib/learn-events";

/** Consent, retention, and the subjects used for recommendations. Chat text is not included. */
export function SignalsCard() {
  const [on, setOn] = useState(() => eventsAllowed());
  const [subjects, setSubjects] = useState(() => topSubjects());

  function toggle() {
    const next = !on;
    setEventsAllowed(next);
    setOn(next);
    setSubjects(next ? topSubjects() : []);
  }

  function wipe() {
    clearEvents();
    setSubjects([]);
  }

  return (
    <section className="rounded-2xl bg-surface p-5 shadow-border">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Learning signals</h2>
      <p className="mt-1 text-sm text-muted">
        When this is on, Noctis remembers subjects you watch, search, and study for 14 days. It uses those counts to suggest what to open next. Private messages are never stored here.
      </p>
      <button type="button" onClick={toggle} className="mt-3 flex min-h-11 w-full items-center justify-between rounded-xl bg-elevated px-3 text-sm font-semibold">
        <span>Use my learning activity</span>
        <span className={on ? "text-primary" : "text-muted"}>{on ? "On" : "Off"}</span>
      </button>
      {on && subjects.length ? <p className="mt-2 text-xs text-muted">Most often: {subjects.join(" · ")}</p> : null}
      {on ? (
        <button type="button" onClick={wipe} className="mt-2 text-xs font-semibold text-muted">
          Delete the {readEvents().length} saved signals
        </button>
      ) : (
        <p className="mt-2 text-xs text-muted">Off by default. Nothing is collected until you turn this on.</p>
      )}
    </section>
  );
}
