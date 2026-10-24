export type PathStep = { id: string; label: string; test: RegExp };

export type Ladder = { id: string; house: string; steps: PathStep[] };

export const LADDERS: Ladder[] = [
  {
    id: "cyber",
    house: "Cybersecurity",
    steps: [
      { id: "beginner", label: "Beginner Cybersecurity", test: /cyber|security|malware|phish|nist/i },
      { id: "net", label: "Networking", test: /network|packet|router|protocol/i },
      { id: "tcp", label: "TCP/IP", test: /tcp\/ip|\btcp\b|\budp\b|ip address/i },
      { id: "netsec", label: "Network Security", test: /firewall|\bids\b|\bvpn\b|zero trust|segmentation/i },
      { id: "vuln", label: "Vulnerability Management", test: /\bcve\b|\bnvd\b|vulnerabilit|patch management/i },
      { id: "detect", label: "Threat Detection", test: /threat detection|\bsiem\b|incident response|intrusion/i },
    ],
  },
  {
    id: "bible",
    house: "Bible",
    steps: [
      { id: "read", label: "How to read a text", test: /how to read|context|genre|hermeneutic/i },
      { id: "gospel", label: "Gospels", test: /gospel|jesus|matthew|mark|luke|john/i },
      { id: "letters", label: "Letters", test: /\bpaul\b|epistle|romans|corinth/i },
      { id: "wisdom", label: "Wisdom books", test: /psalm|proverb|wisdom|ecclesiastes/i },
    ],
  },
  {
    id: "bio",
    house: "Biology",
    steps: [
      { id: "cell", label: "Cells", test: /\bcell\b|membrane|organelle/i },
      { id: "gene", label: "Genetics", test: /\bdna\b|\bgene\b|hered|chromosome/i },
      { id: "system", label: "Body systems", test: /organ|circulat|photosynthesis|ecosystem/i },
    ],
  },
  {
    id: "eng",
    house: "Engineering",
    steps: [
      { id: "force", label: "Forces", test: /\bforce\b|\bload\b|bridge|structure/i },
      { id: "circuit", label: "Circuits", test: /circuit|voltage|\bohm\b|current/i },
      { id: "machine", label: "Machines", test: /engine|gear|turbine|mechanical|robot/i },
    ],
  },
];

export type PathFilm = { id: string; title: string; text: string };

export type StepMark = { id: string; label: string; state: "done" | "next" | "ahead" | "gap"; lessons: PathFilm[] };

export type PersonalPath = {
  house: string;
  because: string;
  why: string;
  steps: StepMark[];
  next: StepMark | null;
};

function matches(step: PathStep, text: string) {
  return step.test.test(text);
}

export type RecommendSignals = { goal?: string };

function filmsFor(step: PathStep, films: PathFilm[], skip: Set<string>) {
  const hits = films.filter((film) => !skip.has(film.id) && matches(step, film.text));
  const full = hits.filter((film) => film.text.trim().length > 40);
  return (full.length ? full : hits).sort((a, b) => b.text.length - a.text.length).slice(0, 3);
}

export function myLearningPath(films: PathFilm[], played: string[], passed: string[], signals: RecommendSignals = {}): PersonalPath[] {
  const seen = new Set(played);
  const done = new Set(passed);
  const out: PersonalPath[] = [];
  for (const ladder of LADDERS) {
    const practiced = ladder.steps.map((step) => films.some((film) => seen.has(film.id) && matches(step, film.text)));
    if (!practiced.some(Boolean)) continue;
    const mastered = ladder.steps.map((step) => films.some((film) => done.has(film.id) && matches(step, film.text)));
    const deepest = practiced.reduce((at, hit, index) => (hit ? index : at), -1);
    const nextAt = mastered[deepest] ? Math.min(deepest + 1, ladder.steps.length) : deepest;
    const steps: StepMark[] = ladder.steps.map((step, index) => ({
      id: step.id,
      label: step.label,
      state: nextAt >= ladder.steps.length ? "done" : index === nextAt ? "next" : index < nextAt ? (mastered[index] ? "done" : "gap") : "ahead",
      lessons: [],
    }));
    const next = nextAt >= ladder.steps.length ? null : steps[nextAt]!;
    if (next) next.lessons = filmsFor(ladder.steps[nextAt]!, films, done);
    const watched = [...played].reverse().map((id) => films.find((film) => film.id === id)).find((film) => film && ladder.steps.some((step) => matches(step, film.text)));
    const masteredStep = ladder.steps.filter((_, index) => mastered[index]).at(-1);
    const gap = ladder.steps.find((_, index) => practiced[index] && !mastered[index]);
    const nextTitle = next?.lessons[0]?.title || next?.label || "the end of this path";
    const because = !next
      ? `You watched ${watched?.title || ladder.house} and mastered ${masteredStep?.label || ladder.house}. There is no further lesson on this path.`
      : masteredStep
        ? `You watched ${watched?.title || masteredStep.label} and mastered ${masteredStep.label}. Your next recommended lesson is ${nextTitle}.`
        : `You watched ${watched?.title || ladder.house}. ${gap ? `${gap.label} is not mastered yet.` : "Nothing on this path is mastered yet."} Your next recommended lesson is ${nextTitle}.`;
    const why = [
      "Watch history",
      masteredStep ? "Quiz passed" : "Quiz not passed",
      gap ? "Knowledge gap" : "",
      `Level: ${ladder.steps[Math.max(deepest, 0)]?.label}`,
      signals.goal ? `Goal: ${signals.goal}` : "",
      "Topic order",
    ].filter(Boolean).join(" · ");
    out.push({ house: ladder.house, because, why, steps, next });
  }
  return out;
}

export function nextFromFilm(film: PathFilm, library: PathFilm[]) {
  let bestLadder: Ladder | null = null;
  let bestIndex = -1;
  for (const ladder of LADDERS) {
    for (let index = 0; index < ladder.steps.length; index += 1) {
      const step = ladder.steps[index]!;
      if (!matches(step, film.text) || index <= bestIndex) continue;
      bestLadder = ladder;
      bestIndex = index;
    }
  }
  if (!bestLadder || bestIndex < 0) return null;
  const here = bestLadder.steps[bestIndex]!;
  const then = bestLadder.steps[bestIndex + 1];
  if (!then) return { here: here.label, then: "", because: `${here.label} is the last step on this path.`, lessons: [] as PathFilm[] };
  return {
    here: here.label,
    then: then.label,
    because: `This film is ${here.label}. The next lesson on this topic path is ${then.label}. This is not based on what other people watched.`,
    lessons: filmsFor(then, library, new Set([film.id])),
  };
}
