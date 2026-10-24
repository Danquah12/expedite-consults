import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { CREWS } from "@/lib/feed-data";
import { useFeedStore } from "@/lib/feed-store";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HallSpread } from "@/components/learn/HallSpread";
import { CommunityBrief } from "@/components/learn/CommunityBrief";
import { CREW_BRIEFS } from "@/lib/community-brief";
import { LedgerLane } from "@/components/feed/LedgerLane";
import { SermonPage, PaperPage } from "@/components/learn/StudyCopilot";
import { NoctisMoves } from "@/components/noctis/NoctisMoves";
import { askFilm } from "@/components/learn/VideoAskSheet";
import { libraryCounts, listStudies, askStudy } from "@/lib/knowledge-api";
import { KNOWLEDGE_CATEGORIES } from "@/lib/knowledge-engine";
import type { StudyCard } from "@/lib/knowledge-types";

export const Route = createFileRoute("/campus")({ component: CampusPage });

const BASE_DOMAINS = [
  {
    id: "bible",
    label: "Bible",
    line: "King James verses stay on this screen. A sermon is marked as a model note, not scripture.",
    prompts: [
      { label: "Lions", q: "What does the Bible say about lions?" },
      { label: "John 1:1", q: "John 1:1" },
      { label: "Isaiah 59:5", q: "Isaiah 59:5" },
      { label: "Sermon, John 3:16", q: "Write a sermon from John 3:16" },
    ],
  },
  {
    id: "science",
    label: "Science",
    line: "Each question stays on this screen. A white paper is written from the source that comes back.",
    prompts: [
      { label: "Photosynthesis", q: "What is photosynthesis?" },
      { label: "AI + biology", q: "How can artificial intelligence be used to predict protein–protein interactions, and what are the current scientific limitations of these approaches?" },
      { label: "Climate science", q: "Can machine-learning models improve the prediction of extreme weather events compared with traditional numerical forecasting methods?" },
      { label: "Space science", q: "How could autonomous AI systems assist spacecraft in scientific decision-making when communication with Earth is delayed?" },
      { label: "Materials science", q: "Can AI accelerate the discovery of new materials for high-density energy storage?" },
      { label: "Quantum science", q: "What are the practical engineering challenges preventing large-scale fault-tolerant quantum computing?" },
      { label: "Evidence and reproducibility", q: "Can an AI research system reliably perform evidence-based scientific and cybersecurity research by autonomously retrieving information from multiple independent sources, cross-validating conflicting claims, reproducing computational experiments, and presenting conclusions with traceable evidence?" },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    line: "Engineering questions stay on this screen, apart from Science and Cyber.",
    prompts: [
      { label: "Autonomous infrastructure", q: "How can AI-based predictive maintenance reduce failures in critical infrastructure such as bridges, electrical grids, and industrial machinery?" },
      { label: "Robotics", q: "How can autonomous robots safely operate in environments that are unknown, dynamic, and partially observable?" },
      { label: "Energy", q: "How can AI optimize electrical-grid operations when large amounts of intermittent renewable energy are introduced?" },
      { label: "Digital twins", q: "How can digital-twin technology combined with AI improve the design, operation, and maintenance of complex engineering systems?" },
      { label: "Semiconductors", q: "How can AI-assisted electronic design automation improve semiconductor design while maintaining verification and reliability?" },
    ],
  },
  {
    id: "cyber",
    label: "Cyber",
    line: "A CVE lookup stays a record. A longer question can become a white paper. Exploit code is not stored.",
    prompts: [
      { label: "Look up a CVE", q: "Where do I look up a CVE?" },
      { label: "CVE-2024-3094", q: "CVE-2024-3094" },
      { label: "Threat landscape", q: "vulnerabilities currently within the threat landscape" },
      { label: "Vulnerability discovery", q: "Can large language models and automated program analysis work together to discover previously unknown software vulnerabilities, and how can their findings be reliably validated?" },
      { label: "Vulnerability management", q: "How can an AI system discover assets, identify vulnerabilities, prioritize risk, and recommend remediation while a person keeps oversight?" },
      { label: "Software supply chain", q: "How can AI detect malicious or compromised dependencies in modern software supply chains?" },
      { label: "Zero-day research", q: "Can machine-learning systems identify behavioral indicators of previously unknown vulnerabilities without relying on known vulnerability signatures?" },
      { label: "Cloud security", q: "How can AI detect anomalous behavior across large-scale cloud environments while minimizing false positives?" },
      { label: "Identity security", q: "Can behavioral analytics detect account compromise earlier than conventional authentication and intrusion-detection systems?" },
      { label: "IoT security", q: "How can AI identify previously unseen attacks against Internet-of-Things devices using network and behavioral telemetry?" },
      { label: "Critical infrastructure", q: "How could AI-assisted cyber defense protect industrial control systems while avoiding automated actions that could disrupt physical processes?" },
      { label: "Autonomous cyber defense", q: "Could an AI system discover an organization's attack surface, correlate public vulnerability records, detect unusual behavior, and recommend a defense without taking that action by itself?" },
    ],
  },
  {
    id: "technology",
    label: "Technology",
    line: "Specifications and repository search stay on this screen.",
    prompts: [
      { label: "JWT", q: "How does JWT authentication work?" },
      { label: "Research assistant", q: "How can an AI research assistant use scientific literature, vulnerability databases, GitHub, and technical documentation while separating a verified source from a guess?" },
    ],
  },
] as const;

const DOMAINS = [
  ...BASE_DOMAINS,
  ...KNOWLEDGE_CATEGORIES.filter((row) => !["bible", "science", "engineering", "cybersecurity", "technology"].includes(row.id)).map((row) => ({
    id: row.id,
    label: row.label,
    line: row.line,
    prompts: row.starters,
  })),
];

function DomainScreen({
  domain,
  onAsk,
  onPaper,
}: {
  domain: (typeof DOMAINS)[number];
  onAsk: (question: string) => void;
  onPaper?: () => void;
}) {
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-border">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{domain.label}</p>
      <h2 className="mt-1 font-display text-xl font-semibold">{domain.label} only</h2>
      <p className="mt-2 text-sm text-muted">{domain.line}</p>
      <div className="mt-3 flex flex-col gap-1.5">
        {domain.prompts.map((prompt) => (
          <button key={prompt.label} type="button" onClick={() => onAsk(prompt.q)} className="rounded-xl bg-elevated px-3 py-2 text-left text-sm font-semibold">
            {prompt.label}
          </button>
        ))}
        {domain.id !== "bible" ? (
          <button
            type="button"
            onClick={onPaper}
            disabled={!onPaper}
            className="rounded-full bg-primary px-3 py-1.5 text-left text-xs font-semibold text-primary-fg disabled:opacity-40"
          >
            Write a two-page white paper
          </button>
        ) : null}
      </div>
    </section>
  );
}

function AnswerCard({ card, onPaper }: { card: StudyCard; onPaper?: () => void }) {
  const sermon = /sermon was written|sermon is at least two pages/i.test(card.note);
  const paper = /white paper is two pages/i.test(card.note);
  return (
    <article className="rounded-2xl bg-surface p-4 shadow-border">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        {paper ? "White paper" : sermon ? "Sermon" : card.confidence}
      </p>
      {sermon || paper ? null : <h3 className="mt-2 font-display text-xl font-semibold leading-snug">{card.sentence}</h3>}
      {paper ? (
        <PaperPage steps={card.steps} lede={card.sentence} source={card.evidence[0]?.source || ""} />
      ) : sermon ? (
        <SermonPage steps={card.steps} verse={card.sentence} />
      ) : (
        <ol className="mt-3 space-y-1 text-sm text-muted">
          {card.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      <div className="mt-3 space-y-2">
        {card.evidence.map((row) => (
          <a key={`${row.source}-${row.href}`} href={row.href} target="_blank" rel="noreferrer" className="block rounded-2xl bg-wash-ember p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{row.source}</p>
            <p className="mt-1 text-xs text-muted">{row.type} · {row.relevance}</p>
            {row.passage ? <p className="mt-2 text-sm leading-snug">{row.passage}</p> : null}
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-subtle">{card.note}</p>
      {onPaper && !paper ? (
        <button type="button" onClick={onPaper} className="mt-3 min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg">
          Write a two-page white paper
        </button>
      ) : null}
    </article>
  );
}

function CampusPage() {
  const joined = useFeedStore((s) => s.joinedCrews);
  const toggleCrew = useFeedStore((s) => s.toggleCrew);
  const [counts, setCounts] = useState({ verses: 0, books: 0, studies: 0 });
  const [saved, setSaved] = useState<{ id: string; question: string; confidence: string; domain: string }[]>([]);
  const [domainId, setDomainId] = useState<(typeof DOMAINS)[number]["id"] | null>(null);
  const [card, setCard] = useState<StudyCard | null>(null);
  const [busy, setBusy] = useState(false);
  const domain = DOMAINS.find((item) => item.id === domainId) ?? null;

  const [asking, setAsking] = useState("");

  useEffect(() => {
    void libraryCounts().then(setCounts).catch(() => undefined);
    void listStudies().then(setSaved).catch(() => undefined);
    try {
      const pending = sessionStorage.getItem("vibetok-copilot-ask");
      if (pending) {
        sessionStorage.removeItem("vibetok-copilot-ask");
        void ask(pending);
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function ask(question: string) {
    setAsking(question);
    setBusy(true);
    try {
      const next = await askStudy({ data: { question } });
      setCard(next);
      setSaved((rows) => {
        const entry = { id: `local-${Date.now()}`, question, confidence: next.confidence, domain: domain?.id ?? next.domain };
        return [entry, ...rows.filter((row) => row.question !== question)].slice(0, 12);
      });
      requestAnimationFrame(() => document.getElementById("study-answer")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } finally {
      setBusy(false);
      setAsking("");
    }
  }

  return (
    <AppShell>
      <ClinicFrame>
        <header className="rounded-2xl bg-surface p-5 shadow-border">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Knowledge</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Reference, not another course</h1>
          <p className="mt-2 text-sm text-muted">
            Articles, facts, concepts, and sources. {counts.books || "66"} books · {counts.verses ? counts.verses.toLocaleString() : "loading"} verses stored. Vibe can simplify, expand, or turn a question into a study guide. It does not guess.
          </p>
          <div className="mt-3">
            <NoctisMoves
              items={[
                { label: "Simplify", ask: "Explain the idea I am studying in plain language, and cite the source." },
                { label: "Expand", ask: "Expand the idea I am studying, and cite the source." },
                { label: "Create study guide", ask: "Turn what I am studying into a short study guide, and cite the source." },
              ]}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {DOMAINS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setDomainId(item.id);
                  setCard(null);
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  domainId === item.id ? "bg-primary text-primary-fg" : "bg-elevated",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>
        {domain ? (
          <>
            <DomainScreen
              domain={domain}
              onAsk={(question) => void ask(question)}
              onPaper={() => {
                const raw = card?.question ?? domain.prompts[0]?.q ?? domain.label;
                const subject = raw
                  .replace(/^research this as a [^.]+\.\s*/i, "")
                  .replace(/^.*?white paper(?:\s+on|\s+about|\s+from)?\s*/i, "")
                  .trim() || raw;
                void ask(`Write a two-page white paper on ${subject}`);
              }}
            />
            {busy ? (
              <p id="study-answer" className="rounded-2xl bg-surface px-4 py-6 text-sm text-muted shadow-border">
                {/white paper/i.test(asking) ? "Writing the two-page white paper. It will open here." : `Opening ${domain.label}…`}
              </p>
            ) : card ? (
              <div id="study-answer">
                <AnswerCard
                  card={card}
                  onPaper={
                    domain.id !== "bible"
                      ? () => {
                          const subject = card.question.replace(/^.*?white paper(?:\s+on|\s+about|\s+from)?\s*/i, "").trim() || card.question;
                          void ask(`Write a two-page white paper on ${subject}`);
                        }
                      : undefined
                  }
                />
                <button
                  type="button"
                  className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
                  onClick={() => askFilm({ title: card.question, caption: card.sentence || card.question })}
                >
                  Ask Noctis about this
                </button>
              </div>
            ) : null}
            {saved.filter((row) => row.domain === domain.id && !(/white paper/i.test(row.question) && row.confidence === "insufficient")).length ? (
              <ul className="space-y-1 px-1">
                {saved
                  .filter((row) => row.domain === domain.id && !(/white paper/i.test(row.question) && row.confidence === "insufficient"))
                  .slice(0, 6)
                  .map((row) => {
                    const paper = /white paper/i.test(row.question);
                    const subject = row.question.replace(/^.*?white paper(?:\s+on|\s+about|\s+from)?\s*/i, "").trim();
                    const title = (paper ? subject : row.question).replace(/\s+/g, " ");
                    const short = title.length > 72 ? `${title.slice(0, 70)}…` : title;
                    return (
                      <li key={row.id}>
                        <button type="button" onClick={() => void ask(row.question)} className="text-left text-xs text-muted">
                          {paper ? "White paper · " : "Study · "}
                          {short}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="rounded-2xl bg-surface p-4 text-sm text-muted shadow-border">
            Choose Bible, Cyber, Technology, or Science. Each one keeps its own screen.
          </p>
        )}
        {domain ? null : (
          <>
        <HallSpread tab="crews" />
        <LedgerLane tab="crews" />
        {CREWS.map((crew) => {
          const on = joined.includes(crew.id);
          return (
            <article key={crew.id} data-crew={crew.id} className="overflow-hidden rounded-2xl bg-surface shadow-border">
              <img src={crew.cover} alt="" className="h-28 w-full object-cover" />
              <div className="p-4">
                <h2 className="font-display text-lg font-semibold">{crew.name}</h2>
                <p className="mt-1 text-sm text-muted">{crew.blurb}</p>
                <p className="mt-2 text-xs text-subtle">
                  {formatCount(crew.members)} · stamp {crew.stamp}
                </p>
                <button
                  type="button"
                  onClick={() => toggleCrew(crew.id)}
                  className={cn(
                    "mt-3 rounded-full px-3 py-1.5 text-xs font-semibold",
                    on ? "bg-elevated text-fg" : "bg-primary text-primary-fg",
                  )}
                >
                  {on ? "Joined" : "Join"}
                </button>
                {CREW_BRIEFS[crew.id] ? <CommunityBrief crewId={crew.id} /> : null}
              </div>
            </article>
          );
        })}
          </>
        )}
      </ClinicFrame>
    </AppShell>
  );
}
