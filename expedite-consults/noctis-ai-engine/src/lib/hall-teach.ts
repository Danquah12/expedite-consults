import { HALL_CARDS, TICKET_FACE } from "@/lib/hall";

export type HallClip = { title: string; href: string; youtubeId: string };
export type HallLink = { name: string; href: string; note: string };
export type HallShot = { src: string; title: string };
export type HallStep = { label: string; body: string; clips?: HallClip[]; links?: HallLink[]; shots?: HallShot[] };

const SOURCES: { test: RegExp; rows: HallLink[] }[] = [
  {
    test: /weld|carpenter|shop|trade|measure|layout|fit|chisel|tack/i,
    rows: [
      { name: "OSHA — Welding, Cutting, and Brazing", href: "https://www.osha.gov/welding-cutting-brazing", note: "Fire, fumes, and eye protection before you strike an arc." },
      { name: "OSHA 1910.252", href: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.252", note: "The welding rule. Read it with the film, not instead of measuring the joint." },
    ],
  },
  {
    test: /pharm|drug|dispens|medic/i,
    rows: [{ name: "FDA — Drugs", href: "https://www.fda.gov/drugs", note: "Look up the drug before you treat two medicines as safe together." }],
  },
  {
    test: /electric|voltage|ground|wire/i,
    rows: [{ name: "OSHA — Electrical", href: "https://www.osha.gov/electrical", note: "Lockout and shock hazards before you touch a live box." }],
  },
  {
    test: /cyber|security|phish|malware/i,
    rows: [{ name: "CISA", href: "https://www.cisa.gov/", note: "Public cybersecurity guidance." }],
  },
  {
    test: /carbon|bio|dna|science/i,
    rows: [{ name: "NIH", href: "https://www.nih.gov/", note: "Public health and science institutes." }],
  },
];

function youtubeId(href: string) {
  return href.match(/[?&]v=([\w-]{6,})/)?.[1] || href.match(/youtu\.be\/([\w-]{6,})/)?.[1] || "";
}

function isPicture(src: string) {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(src) || src.includes("i.ytimg.com") || src.startsWith("/media/");
}

function addShot(shots: HallShot[], src: string | undefined, title: string) {
  if (!src || !isPicture(src) || shots.some((shot) => shot.src === src)) return;
  shots.push({ src, title });
}

export function hallPictures(text: string): HallShot[] {
  const named = text.replace(/^Teach this Hall film:\s*/i, "").split("\n")[0]?.replace(/^This Hall film is "/, "").replace(/".*$/, "").trim() || text;
  const cards = HALL_CARDS.filter((row) => text.includes(row.title) || named === row.title || (named.length > 8 && (named.includes(row.title) || row.title.includes(named))));
  const shots: HallShot[] = [];
  for (const card of cards) {
    addShot(shots, card.posterUrl, card.title);
    addShot(shots, card.mediaUrl, card.title);
    addShot(shots, card.post.posterUrl, card.title);
    addShot(shots, card.post.mediaUrl, card.title);
    const id = youtubeId(card.post.mediaUrl || card.mediaUrl || "");
    if (id) addShot(shots, `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, card.title);
  }
  return shots.slice(0, 4);
}

function found(title: string) {
  const card = HALL_CARDS.find((row) => row.title === title || title.includes(row.title) || row.title.includes(title));
  const face = card ? TICKET_FACE[card.ticket] : undefined;
  const right = card?.post.teach.options.find((option) => option.ok)?.label || "";
  const wrong = card?.post.teach.options.filter((option) => !option.ok).map((option) => option.label) ?? [];
  const skill = face?.skill || "";
  const career = face?.career || "";
  const check = card?.post.teach.prompt || "";
  const mentor = card?.mentor || "";
  const bag = `${title} ${skill} ${career} ${card?.post.teach.stamp || ""} ${card?.post.caption || ""}`;
  const sources = SOURCES.find((row) => row.test.test(bag))?.rows ?? [];
  const own = card?.post.mediaUrl || card?.mediaUrl || "";
  const clips: HallClip[] = [];
  const push = (name: string, href: string) => {
    const id = youtubeId(href);
    if (!id || clips.some((clip) => clip.youtubeId === id)) return;
    clips.push({ title: name, href: href.startsWith("http") ? href : `https://www.youtube.com/watch?v=${id}`, youtubeId: id });
  };
  if (own) push(title, own);
  const query = encodeURIComponent(title);
  const search: HallLink = {
    name: "YouTube search for this film",
    href: `https://www.youtube.com/results?search_query=${query}`,
    note: "More films on this subject. A search result is not a source we stored.",
  };
  return { card, right, wrong, skill, career, check, mentor, sources, clips, search, shots: hallPictures(title) };
}

export function hallWalk(title: string, extra?: { careers?: string[]; certs?: string[] }): HallStep[] {
  const { right, wrong, skill, career, check, mentor, sources, clips, search, shots } = found(title);
  const move = right || skill || title;
  const careers = extra?.careers?.length ? extra.careers : career ? [career] : [];
  const certs = extra?.certs ?? [];
  return [
    {
      label: "Pictures",
      body: shots.length ? "These are the pictures stored for the Hall film you opened." : "No picture is stored for this film.",
      shots,
    },
    {
      label: "Explain",
      body: [
        `Subject: ${title}.`,
        check ? `This film asks: ${check}` : "",
        right ? `On this subject, do this: ${right}.` : "",
        wrong.length ? `On this subject, do not: ${wrong.join(", ")}.` : "",
        skill ? `The skill in this film is ${skill}.` : "",
      ].filter(Boolean).join("\n\n"),
      shots,
    },
    {
      label: "Study this",
      body: [
        `Study only this: ${title}.`,
        check ? `1. ${check}` : "1. Name what this film is about.",
        right ? `2. Do ${right}.` : "2. Do the move in the film.",
        "3. Say it back without looking at another subject.",
      ].join("\n"),
    },
    {
      label: "Quiz",
      body: [check || `What is the first move in ${title}?`, right ? `Answer: ${right}.` : "", wrong.length ? `Not the answer: ${wrong.join(". ")}.` : ""].filter(Boolean).join("\n\n"),
    },
    {
      label: "Notes",
      body: [`Notes for ${title}.`, `• ${move}`, skill ? `• Skill: ${skill}` : "", check ? `• ${check}` : "", mentor ? `• ${mentor}` : ""].filter(Boolean).join("\n"),
    },
    {
      label: "Careers",
      body: careers.length ? `${title} is for ${careers.join(", ")}.` : `No career is stored for ${title}.`,
    },
    {
      label: "Certifications",
      body: certs.length ? `For ${title}: ${certs.join(", ")}. A target, not a credential you hold.` : `No certification is stored for ${title}.`,
    },
    {
      label: "Videos",
      body: clips.length ? "Watch these with the pictures above." : "This film has no stored video. The picture is above. Use the search for more films.",
      clips,
      links: [search],
    },
    {
      label: "Research",
      body: sources.length ? "Read these with the picture and the film." : "No outside research page is stored for this film yet.",
      links: sources,
    },
  ];
}

export function hallAnswer(title: string, ask: string, extra?: { careers?: string[]; certs?: string[] }) {
  const { right, wrong, skill, career, check, mentor, sources, clips, search, shots } = found(title);
  const name = title.replace(/\.+$/g, "").trim();
  const careers = extra?.careers?.length ? extra.careers : career ? [career] : [];
  const certs = extra?.certs ?? [];
  const kind = ask.toLowerCase();
  const once = [
    `${name}.`,
    check,
    right ? `${right}.` : "",
    wrong.length ? `Not first: ${wrong.join(". ")}.` : "",
    skill ? `Skill: ${skill}.` : "",
    careers.length ? `Career: ${careers.join(", ")}.` : "",
    mentor ? `On the film: ${mentor}.` : "",
    certs.length ? `Certification target: ${certs.join(", ")}.` : "No certification is stored.",
  ].filter(Boolean);
  if (/study/.test(kind)) {
    return { text: [check, right ? `Do ${right}.` : ""].filter(Boolean).join("\n"), shots: [] as typeof shots, links: [] as typeof sources, clips: [] as typeof clips };
  }
  if (/quiz/.test(kind)) {
    return { text: [check || name, right ? `Answer: ${right}.` : "", wrong.length ? `Not the answer: ${wrong.join(". ")}.` : ""].filter(Boolean).join("\n"), shots: [], links: [], clips: [] };
  }
  if (/note/.test(kind)) {
    return { text: [right, skill ? `Skill: ${skill}` : "", mentor].filter(Boolean).join("\n"), shots: [], links: [], clips: [] };
  }
  if (/career/.test(kind)) {
    return { text: careers.length ? careers.join(", ") : "No career is stored.", shots: [], links: [], clips: [] };
  }
  if (/cert/.test(kind)) {
    return { text: certs.length ? certs.join(", ") : "No certification is stored.", shots: [], links: [], clips: [] };
  }
  if (/journey/.test(kind)) {
    return { text: `${name} is on your journey.`, shots: [], links: [], clips: [] };
  }
  if (/resource|video|research/.test(kind)) {
    const lines = [
      ...clips.map((row) => row.href),
      ...sources.map((row) => `${row.name}\n${row.href}`),
      search.href,
    ];
    return { text: lines.join("\n\n") || "Nothing else is stored for this film.", shots, links: sources, clips };
  }
  if (/explain/.test(kind)) {
    return { text: once.filter((line) => line !== "No certification is stored.").join("\n"), shots, links: [], clips: [] };
  }
  const research = sources.map((row) => `${row.name} — ${row.href}`);
  const film = clips.map((row) => `${row.title} — ${row.href}`);
  return {
    text: [...once, film.length ? film.join("\n") : "", research.length ? research.join("\n") : ""].filter(Boolean).join("\n"),
    shots,
    links: sources,
    clips,
  };
}

export function hallTeachText(question: string) {
  const title = question.replace(/^Teach this Hall film:\s*/i, "").split("\n")[0]?.trim() || question.trim();
  const ask = (question.match(/^Ask:\s*(.+)$/im)?.[1] || "Ask Noctis").trim();
  return hallAnswer(title, ask).text;
}

export const HALL_ASKS = ["Explain", "Study this", "Create quiz", "Create notes", "Ask Noctis", "Show careers", "Show certifications", "Show resources", "Add to journey"] as const;
