import { readFileSync } from "node:fs";
import path from "node:path";

export type FilmCite = { house: string; title: string; href: string };

export type FilmBrief = {
  subject: string;
  note: string[];
  bars: { label: string; score: number }[];
  source: string;
  href: string;
  cites: FilmCite[];
  backed: number;
  opinion: number;
  unclear: number;
  factsChecked: number;
  factsOnRecord: number;
  truth: number;
  checkedFacts: string[];
  missedFacts: string[];
  helps: string;
  opinionLine: string;
  fact: string;
};

const cache = new Map<string, FilmBrief>();

const WIKI_AGENT = "NoctisStudy/1.0 (https://expediteconsults.com; study@expediteconsults.com)";

function onPage(bag: string, key: string) {
  if (bag.includes(key)) return true;
  if (key.endsWith("s") && key.length > 4 && bag.includes(key.slice(0, -1))) return true;
  if (!key.endsWith("s") && bag.includes(`${key}s`)) return true;
  return false;
}

function serverSecret(name: string) {
  if (process.env[name]) return process.env[name]!;
  try {
    const text = readFileSync(path.join(process.cwd(), ".env"), "utf8");
    const line = text.split("\n").find((row) => row.startsWith(`${name}=`));
    return line?.slice(name.length + 1).trim() || "";
  } catch {
    return "";
  }
}

function cleanTitle(title: string) {
  return title
    .replace(/source\s*[·•|:–-]\s*.*/i, "")
    .replace(/presented by\s+.*/i, "")
    .replace(/expedite consults.*/i, "")
    .replace(/public domain|mission film|lesson plans?|virtual tours?|open license|creative commons/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/[.?!,]+$/g, "")
    .trim();
}
function words(title: string) {
  return cleanTitle(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !/^(film|this|that|with|from|your|about|what|how|source|expedite|consults|read|kind|part|into|over|each|they|them|when|where|which|there|their|have|been|will|just|only|also|some|more|than|such)$/.test(word))
    .slice(0, 6);
}

async function wikiPage(name: string) {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/ /g, "_"))}`, {
    headers: { Accept: "application/json", "User-Agent": WIKI_AGENT },
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { title?: string; extract?: string; type?: string; content_urls?: { desktop?: { page?: string } } };
  if (!body.extract || body.type === "disambiguation") return null;
  const title = body.title || name;
  let extract = body.extract;
  try {
    const more = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=4000&redirects=1&titles=${encodeURIComponent(title)}&format=json`,
      { headers: { Accept: "application/json", "User-Agent": WIKI_AGENT }, signal: AbortSignal.timeout(7000) },
    );
    if (more.ok) {
      const data = (await more.json()) as { query?: { pages?: Record<string, { extract?: string }> } };
      const page = Object.values(data.query?.pages ?? {})[0];
      if (page?.extract && page.extract.length > extract.length) extract = page.extract;
    }
  } catch {
    /* the summary still scores */
  }
  return {
    title,
    extract,
    href: body.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
  };
}

const BIBLE = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "Samuel", "Kings", "Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah",
  "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "Thessalonians", "Timothy", "Titus", "Philemon",
  "Hebrews", "James", "Peter", "Jude", "Revelation",
];

function namedPage(text: string) {
  const bag = ` ${text.toLowerCase()} `;
  const book = BIBLE.find((name) => bag.includes(` ${name.toLowerCase()} `) || bag.includes(` ${name.toLowerCase()}s `));
  if (book === "Samuel") return "Books of Samuel";
  if (book === "Kings") return "Books of Kings";
  if (book === "Chronicles") return "Books of Chronicles";
  if (book === "Psalms") return "Psalms";
  if (book === "John" && /gospel|jesus|bible|clinic/.test(bag)) return "Gospel of John";
  if (book) return `Book of ${book}`;
  if (/\bnasa\b/i.test(text)) return "NASA";
  if (/\bnist\b/i.test(text)) return "NIST";
  if (/\bcov[e]?nant/.test(bag)) return "Covenant (biblical)";
  return "";
}

function relevant(text: string, query: string) {
  const keys = words(query).filter((word) => !/^(clinic|lesson|holds|watch|learn|promise)$/.test(word));
  if (!keys.length) return true;
  const bag = text.toLowerCase();
  const hits = keys.filter((key) => bag.includes(key));
  if (hits.some((key) => key.length >= 6)) return true;
  if (keys.length <= 1) return hits.length === keys.length;
  return hits.length >= 1;
}

async function wiki(title: string, story = "", author = "") {
  const direct = namedPage(`${title} ${story} ${author}`);
  if (direct) {
    const page = await wikiPage(direct);
    if (page) return page;
  }
  const clean = cleanTitle(title);
  const storyKeys = words(story).slice(0, 5).join(" ");
  const queries = [...new Set([clean, words(clean).join(" "), storyKeys, author && storyKeys ? `${author} ${storyKeys}` : "", author && words(clean).length ? `${author} ${words(clean).slice(0, 3).join(" ")}` : ""].filter((term) => words(term).length >= 2))];
  for (const term of queries) {
    const found = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srlimit=4&format=json`,
      { headers: { Accept: "application/json", "User-Agent": WIKI_AGENT }, signal: AbortSignal.timeout(7000) },
    );
    if (!found.ok) continue;
    const data = (await found.json()) as { query?: { search?: { title: string; snippet?: string }[] } };
    for (const hit of data.query?.search ?? []) {
      const snippet = (hit.snippet || "").replace(/<[^>]+>/g, " ");
      if (!relevant(`${hit.title} ${snippet}`, term)) continue;
      const page = await wikiPage(hit.title);
      if (page && relevant(`${page.title} ${page.extract}`, term)) return page;
    }
  }
  return null;
}

async function namedSubject(title: string, author: string, story: string) {
  const { modelChat } = await import("@/lib/video-mind.server");
  const result = await modelChat(
    [
      {
        role: "system",
        content: "Name the real-world subject of this film in 2 to 5 words that would find a Wikipedia page. Ignore catalog words such as public domain, lesson plan, mission film, and virtual tour. Return JSON {\"search\":\"...\"}.",
      },
      { role: "user", content: `Title: ${title}\nMaker: ${author}\nFilm words: ${story || "(none)"}` },
    ],
    { temperature: 0, maxTokens: 80, json: true },
  );
  if ("error" in result) return "";
  const parsed = JSON.parse(result.text || "{}") as { search?: string };
  return cleanTitle(String(parsed.search || ""));
}

function sentencesOf(text: string) {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 30 && !/no public source|the film title|expedite consults/i.test(line));
}

function claimTerms(title: string, story: string) {
  const stop = /^(film|this|that|with|from|your|about|what|how|source|expedite|consults|read|kind|part|into|over|each|they|them|when|where|which|there|their|have|been|will|just|only|also|some|more|than|such|clinic|lesson|holds|watch|learn|promise|video|says)$/;
  const take = (text: string, n: number) =>
    cleanTitle(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stop.test(word))
      .slice(0, n);
  return [...new Set([...take(title, 8), ...take(story, 6)])].slice(0, 12);
}

function overlapShare(title: string, story: string, pages: { title: string; extract: string }[]) {
  const keys = claimTerms(title, story);
  const bag = pages.map((page) => `${page.title} ${page.extract}`).join(" ").toLowerCase();
  if (!pages.length || !bag.trim()) {
    return { backed: 0, opinion: 0, unclear: 100, factsChecked: keys.length, factsOnRecord: 0, truth: 0, checkedFacts: [] as string[], missedFacts: keys.slice(0, 8) };
  }
  const checkedFacts = keys.filter((key) => onPage(bag, key));
  const missedFacts = keys.filter((key) => !onPage(bag, key));
  const truth = keys.length ? Math.round((checkedFacts.length / keys.length) * 100) : 0;
  return {
    backed: truth,
    opinion: 0,
    unclear: 100 - truth,
    factsChecked: keys.length,
    factsOnRecord: checkedFacts.length,
    truth,
    checkedFacts: checkedFacts.slice(0, 8),
    missedFacts: missedFacts.slice(0, 8),
  };
}

type Read = { house: string; title: string; href: string; extract: string };

async function readJson(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": WIKI_AGENT },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

async function fromWikidata(term: string): Promise<Read | null> {
  const data = (await readJson(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=en&limit=1&format=json`,
  )) as { search?: { label?: string; description?: string; concepturi?: string; id?: string }[] } | null;
  const hit = data?.search?.[0];
  if (!hit?.label || !hit.description) return null;
  return {
    house: "Wikidata",
    title: hit.label,
    href: hit.concepturi || `https://www.wikidata.org/wiki/${hit.id}`,
    extract: `${hit.label}. ${hit.description}`,
  };
}

async function fromCrossref(term: string): Promise<Read | null> {
  const data = (await readJson(
    `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(term)}&rows=1&select=title,abstract,URL,DOI`,
  )) as { message?: { items?: { title?: string[]; abstract?: string; URL?: string; DOI?: string }[] } } | null;
  const item = data?.message?.items?.[0];
  const name = item?.title?.[0];
  if (!name) return null;
  const abstract = String(item.abstract || "").replace(/<[^>]+>/g, " ");
  return {
    house: "Crossref",
    title: name.slice(0, 140),
    href: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : "https://www.crossref.org/"),
    extract: `${name}. ${abstract}`,
  };
}

async function fromPubMed(term: string): Promise<Read | null> {
  const data = (await readJson(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=1&term=${encodeURIComponent(term)}`,
  )) as { esearchresult?: { idlist?: string[] } } | null;
  const id = data?.esearchresult?.idlist?.[0];
  if (!id) return null;
  const res = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${id}&rettype=abstract&retmode=text`,
    { headers: { "User-Agent": WIKI_AGENT }, signal: AbortSignal.timeout(6000) },
  );
  if (!res.ok) return null;
  const extract = (await res.text()).replace(/\s+/g, " ").slice(0, 1800);
  const title = extract.split(". ").find((line) => line.length > 24) || "PubMed record";
  return { house: "PubMed", title: title.slice(0, 140), href: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, extract };
}

async function fromLibrary(term: string): Promise<Read | null> {
  const data = (await readJson(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&limit=1&fields=title,key,first_sentence`,
  )) as { docs?: { title?: string; key?: string; first_sentence?: string[] }[] } | null;
  const doc = data?.docs?.[0];
  if (!doc?.title) return null;
  return {
    house: "Open Library",
    title: doc.title.slice(0, 140),
    href: doc.key ? `https://openlibrary.org${doc.key}` : "https://openlibrary.org/",
    extract: `${doc.title}. ${(doc.first_sentence ?? []).join(" ")}`,
  };
}

async function fromArchive(term: string): Promise<Read | null> {
  const data = (await readJson(
    `https://archive.org/advancedsearch.php?q=${encodeURIComponent(term)}&fl[]=identifier,title,description&rows=1&page=1&output=json`,
  )) as { response?: { docs?: { identifier?: string; title?: string; description?: string | string[] }[] } } | null;
  const doc = data?.response?.docs?.[0];
  if (!doc?.title || !doc.identifier) return null;
  const description = Array.isArray(doc.description) ? doc.description[0] : doc.description || "";
  return {
    house: "Internet Archive",
    title: doc.title.slice(0, 140),
    href: `https://archive.org/details/${doc.identifier}`,
    extract: `${doc.title}. ${description}`.slice(0, 1800),
  };
}

async function fromNasa(term: string): Promise<Read | null> {
  if (!/nasa|space|planet|orbit|apollo|mars|moon|telescope|galaxy|star/i.test(term)) return null;
  const data = (await readJson(`https://images-api.nasa.gov/search?q=${encodeURIComponent(term)}&media_type=video&page_size=1`)) as {
    collection?: { items?: { data?: { title?: string; description?: string; nasa_id?: string }[] }[] };
  } | null;
  const item = data?.collection?.items?.[0]?.data?.[0];
  if (!item?.title || !item.description) return null;
  return {
    house: "NASA",
    title: item.title.slice(0, 140),
    href: item.nasa_id ? `https://images.nasa.gov/details/${item.nasa_id}` : "https://www.nasa.gov/",
    extract: `${item.title}. ${item.description}`,
  };
}

const OFFICIAL: Read[] = [
  { house: "NASA", title: "NASA", href: "https://www.nasa.gov/", extract: "NASA is the United States civil space agency. It studies Earth, planets, stars, and spaceflight." },
  { house: "NIST", title: "NIST", href: "https://www.nist.gov/cyberframework", extract: "NIST publishes the Cybersecurity Framework and information security standards, including risk management." },
  { house: "CDC", title: "CDC", href: "https://www.cdc.gov/", extract: "The Centers for Disease Control and Prevention studies disease, vaccines, and public health." },
  { house: "NIH", title: "National Institutes of Health", href: "https://www.nih.gov/", extract: "The National Institutes of Health funds medical research on disease, cancer, and the human body." },
  { house: "WHO", title: "World Health Organization", href: "https://www.who.int/", extract: "The World Health Organization guides global public health, disease, and medicine." },
  { house: "MIT OpenCourseWare", title: "MIT OpenCourseWare", href: "https://ocw.mit.edu/", extract: "MIT OpenCourseWare publishes university lectures in science, engineering, mathematics, and computing." },
  { house: "Khan Academy", title: "Khan Academy", href: "https://www.khanacademy.org/", extract: "Khan Academy teaches mathematics, science, computing, economics, and history." },
  { house: "Library of Congress", title: "Library of Congress", href: "https://www.loc.gov/", extract: "The Library of Congress preserves American history, law, and the written record." },
  { house: "BibleProject", title: "BibleProject", href: "https://bibleproject.com/", extract: "BibleProject explains the Bible, its books, covenants, and the story of Jesus." },
];

function pageMatchesSubject(read: Read, title: string) {
  const keys = claimTerms(title, "").filter((word) => word.length > 3);
  if (!keys.length) return false;
  const pageTitle = read.title.toLowerCase();
  const hits = keys.filter((key) => pageTitle.includes(key));
  const need = keys.length === 1 ? 1 : 2;
  if (hits.length < need) return false;
  const bag = `${read.title} ${read.extract}`.toLowerCase();
  return keys.filter((key) => bag.includes(key)).length >= need;
}

function supportingReads(title: string, _story: string, reads: Read[]) {
  const seen = new Set<string>();
  return reads.filter((read) => {
    if (!read.extract || seen.has(read.href)) return false;
    if (!pageMatchesSubject(read, title)) return false;
    seen.add(read.href);
    return true;
  });
}

function fallback(title: string, reads: Read[], story: string): FilmBrief {
  const page = reads[0] ?? null;
  const clean = cleanTitle(title) || title;
  const fromWiki = sentencesOf(page?.extract ?? "");
  const keyed = fromWiki
    .map((line) => ({ line, score: words(clean).filter((key) => line.toLowerCase().includes(key)).length }))
    .sort((a, b) => b.score - a.score);
  const best = keyed.find((row) => row.score > 0)?.line || fromWiki[0];
  const fromStory = sentencesOf(story).slice(0, 3);
  const note = best ? [best, ...fromWiki.filter((line) => line !== best)].slice(0, 2) : fromStory.length ? fromStory : [`This film is about ${clean}.`];
  const labels = words(page?.title || clean).slice(0, 4);
  const share = overlapShare(clean, story, reads);
  const cites = reads.map((read) => ({ house: read.house, title: read.title, href: read.href }));
  return {
    subject: (page?.title || clean).slice(0, 80),
    note,
    bars: (labels.length ? labels : [clean.slice(0, 24)]).map((label, index) => ({
      label: label[0]!.toUpperCase() + label.slice(1),
      score: Math.max(2, 5 - index),
    })),
    source: cites.map((cite) => cite.house).join(", "),
    href: page?.href ?? "",
    cites,
    ...share,
    helps: `You can explain ${page?.title || clean} to someone who has not seen the film.`,
    opinionLine: page ? "" : `What the film says about ${clean} is its own view until it is compared with a public page.`,
    fact: best || fromStory[0] || note[0] || `This film is about ${clean}.`,
  };
}

async function askModel(title: string, author: string, page: { title: string; extract: string } | null, story: string) {
  const { modelChat } = await import("@/lib/video-mind.server");
  const result = await modelChat(
    [
      {
        role: "system",
        content:
          "Explain this one film to a newcomer. Use the public page when it is present, and the film's own words when it is not. Never reuse a stock sentence. Never say 'No public source was found'. Return JSON with subject, note (2 short sentences about THIS subject), helps (one sentence on how this subject helps the viewer), opinionLine (empty if a public page covers the subject, otherwise one sentence naming this subject), fact (one sentence: the public page's words if present, otherwise the film's own words), backed, opinion, unclear (whole numbers adding to 100).",
      },
      {
        role: "user",
        content: `Subject: ${title}\nMaker: ${author}\nFilm words: ${story || "(none)"}\nPublic page: ${page ? `${page.title}\n${page.extract.slice(0, 700)}` : "none"}`,
      },
    ],
    { temperature: 0.2, maxTokens: 500, json: true },
  );
  if ("error" in result) return null;
  const data = { choices: [{ message: { content: result.text } }] };
  return JSON.parse(data.choices?.[0]?.message?.content || "{}") as {
    subject?: string;
    note?: string[];
    helps?: string;
    opinionLine?: string;
    fact?: string;
    backed?: number;
    opinion?: number;
    unclear?: number;
  };
}

export async function filmBrief(input: { id: string; title: string; author: string; story?: string }): Promise<FilmBrief> {
  const id = input.id.slice(0, 80);
  const title = cleanTitle(input.title.replace(/\s+/g, " ").trim()).slice(0, 180) || "This film";
  const author = input.author.slice(0, 80);
  const story = (input.story || "").replace(/\s+/g, " ").trim().slice(0, 500);
  const cacheKey = `${id}:v13`;
  const hit = cache.get(cacheKey);
  if (hit?.href) return hit;
  let wikiPage = await wiki(title, story, author).catch(() => null);
  if (!wikiPage) {
    const named = await namedSubject(title, author, story).catch(() => "");
    if (named) wikiPage = await wiki(named, story, author).catch(() => null);
  }
  const term = words(wikiPage?.title || title).slice(0, 5).join(" ") || title;
  const found = await Promise.all([
    Promise.resolve(wikiPage ? { house: "Wikipedia", title: wikiPage.title, href: wikiPage.href, extract: wikiPage.extract } : null),
    fromWikidata(term).catch(() => null),
    fromCrossref(term).catch(() => null),
    fromPubMed(term).catch(() => null),
    fromLibrary(term).catch(() => null),
    fromArchive(term).catch(() => null),
    fromNasa(`${title} ${story}`).catch(() => null),
  ]);
  const reads = supportingReads(title, story, [...found.filter((row): row is Read => Boolean(row)), ...OFFICIAL]).slice(0, 6);
  const page = reads[0] ?? null;
  const base = fallback(title, reads, story);
  try {
    const parsed = await askModel(title, author, page, story);
    const note = (parsed?.note ?? []).map((line) => String(line).trim()).filter((line) => line.length > 20 && !/no public source was found/i.test(line)).slice(0, 2);
    const share = overlapShare(title, story, reads);
    const brief: FilmBrief = {
      ...base,
      subject: String(parsed?.subject || base.subject).slice(0, 80),
      note: note.length ? note : base.note,
      ...share,
      helps: String(parsed?.helps || base.helps).replace(/expedite consults.*/i, "").slice(0, 220),
      opinionLine: page ? "" : String(parsed?.opinionLine || base.opinionLine).slice(0, 280),
      fact: page ? base.fact : String(parsed?.fact || base.fact).slice(0, 320),
      source: base.source,
      href: base.href,
      cites: base.cites,
    };
    if (brief.href) cache.set(cacheKey, brief);
    return brief;
  } catch {
    if (base.href) cache.set(cacheKey, base);
    return base;
  }
}
