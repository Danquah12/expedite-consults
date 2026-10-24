export type NewsLesson = {
  id: string;
  label: string;
  line: string;
  steps: string[];
  links: { label: string; href: string }[];
};

/** Live studio that scores attached news broadcasts and claims. */
export const VERITAS_LENS_HREF = "https://expedite-consults.vercel.app/veritaslens";

export type VeritasClip = {
  id: string;
  desk: string;
  title: string;
  speaker: string;
  truth: number;
  note: string;
};

/** Broadcasts currently attached on VeritasLens. Scores are the studio read, not an independent audit. */
export const VERITAS_CLIPS: VeritasClip[] = [
  {
    id: "homan",
    desk: "Left blindspot",
    title: "Tom Homan on NYC sanctuary policies",
    speaker: "Tom Homan",
    truth: 48,
    note: "Article VI / 8 U.S.C. § 1357 holds. Personal harboring charges and a 500% removal claim do not.",
  },
  {
    id: "scotus",
    desk: "SCOTUS docket",
    title: "Emergency order on mail-in ballot security",
    speaker: "Supreme Court legal analyst",
    truth: 35,
    note: "Cable briefing scored against the live SCOTUS docket.",
  },
  {
    id: "trade",
    desk: "Trade policy",
    title: "National address on tariffs and manufacturing jobs",
    speaker: "Executive trade briefing",
    truth: 18,
    note: "Lowest studio read on the attached set.",
  },
  {
    id: "dhs",
    desk: "Right blindspot",
    title: "Oversight hearing on DHS interior detention",
    speaker: "DHS sub-committee",
    truth: 52,
    note: "Hearing claims checked against detention capacity and EOIR backlog.",
  },
  {
    id: "ukraine",
    desk: "Foreign affairs",
    title: "Senate debate on Ukraine energy grid and loan package",
    speaker: "Senate Foreign Relations",
    truth: 68,
    note: "Highest studio read on the attached set.",
  },
];

/** Study the story. The clip itself stays on Clinic · Now → learn. */
export const NEWS_LESSONS: NewsLesson[] = [
  {
    id: "veritas",
    label: "VeritasLens",
    line: "Score the attached news media: claim, evasion, hedging, and the docket it cites.",
    steps: [
      "Open the studio. It syncs breaking claims against statutory dockets every 30 minutes.",
      "Pick an attached broadcast. The speedometer is a studio read, not a court finding.",
      "Read the sentence that failed. A high opening line can sit next to a claim that does not hold.",
      "Export the dossier before you share the clip.",
    ],
    links: [
      { label: "Open VeritasLens", href: VERITAS_LENS_HREF },
      { label: "SCOTUS docket", href: "https://www.supremecourt.gov/docket/docket.aspx" },
    ],
  },
  {
    id: "bias",
    label: "Media bias analysis",
    line: "Name the desk, the owner, the missing fact, and how another desk tells the same event.",
    steps: [
      "Who published it, and who pays them?",
      "What words push a side: loaded verbs, unnamed sources, a missing number.",
      "Read the same event from a desk on the other side. What survived both versions?",
      "Separate the event, the evidence, and the opinion.",
    ],
    links: [
      { label: "News Literacy Project", href: "https://newslit.org/" },
      { label: "AllSides ratings", href: "https://www.allsides.com/media-bias/media-bias-ratings" },
      { label: "Ad Fontes chart", href: "https://adfontesmedia.com/interactive-media-bias-chart/" },
    ],
  },
  {
    id: "facts",
    label: "Fact-checking tools",
    line: "SIFT: Stop. Investigate the source. Find better coverage. Trace the original.",
    steps: [
      "Stop before you share. A headline is not the claim.",
      "Open the source in a new tab. Is it a newsroom, a campaign, or an anonymous page?",
      "Search the claim plus “fact check”. Prefer IFCN signatories.",
      "Trace the quote, chart, or clip back to the original document.",
    ],
    links: [
      { label: "SIFT method", href: "https://hapgood.us/2019/06/19/sift-the-four-moves/" },
      { label: "FactCheck.org", href: "https://www.factcheck.org/" },
      { label: "PolitiFact", href: "https://www.politifact.com/" },
      { label: "Reuters Fact Check", href: "https://www.reuters.com/fact-check/" },
      { label: "AP Fact Check", href: "https://apnews.com/hub/ap-fact-check" },
      { label: "IFCN", href: "https://www.poynter.org/ifcn/" },
    ],
  },
];
