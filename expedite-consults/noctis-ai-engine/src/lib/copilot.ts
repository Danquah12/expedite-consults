export type CopilotHit = {
  ref: string;
  text: string;
  source: string;
  href: string;
};

export type CopilotAnswer = {
  kind: "library" | "empty";
  note: string;
  hits: CopilotHit[];
  links: { label: string; href: string }[];
};

type BibleBook = { name: string; chapters: string[][] };

const ENGLISH = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
  "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

const ALIAS: Record<string, string> = {
  revelation: "Revelation",
  apocalypse: "Revelation",
  psalm: "Psalms",
  canticles: "Song of Solomon",
};

const STOP = new Set(["the", "and", "for", "what", "who", "how", "why", "does", "did", "about", "from", "with", "that", "this", "tell", "please", "show", "bible"]);

const DESKS: { keys: string[]; hit: CopilotHit }[] = [
  {
    keys: ["nist", "csf", "cybersecurity framework"],
    hit: {
      ref: "NIST Cybersecurity Framework",
      text: "CSF organizes work as Govern, Identify, Protect, Detect, Respond, and Recover. The official text is at NIST. This library does not rewrite the publication.",
      source: "NIST",
      href: "https://www.nist.gov/cyberframework",
    },
  },
  {
    keys: ["800-53", "80053", "control"],
    hit: {
      ref: "NIST SP 800-53",
      text: "SP 800-53 is the control catalog. SP 800-53B sets the baselines. SP 800-53A is how you assess a control. Read the PDFs at NIST rather than a summary that adds claims.",
      source: "NIST",
      href: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
    },
  },
  {
    keys: ["exploitdb", "exploit-db", "exploit db", "searchsploit"],
    hit: {
      ref: "ExploitDB and searchsploit",
      text: "ExploitDB is a public index of known vulnerability reports. searchsploit searches that index on a machine you control. This library does not store exploit code. Use the official search, then read the CVE on NVD.",
      source: "ExploitDB",
      href: "https://www.exploit-db.com/",
    },
  },
  {
    keys: ["github", "repository", "source code"],
    hit: {
      ref: "GitHub code search",
      text: "GitHub search finds public repositories and code. Open the result and read the file. This library does not invent a repository that is not in the search.",
      source: "GitHub",
      href: "https://github.com/search",
    },
  },
  {
    keys: ["nvd", "cve"],
    hit: {
      ref: "National Vulnerability Database",
      text: "NVD records CVEs with severity and references. Quote the CVE page. Do not invent a score.",
      source: "NVD",
      href: "https://nvd.nist.gov/",
    },
  },
];

let books: BibleBook[] | null = null;
let loading: Promise<BibleBook[]> | null = null;

export function loadBible() {
  if (books) return Promise.resolve(books);
  if (!loading) {
    loading = fetch("/library/kjv.json")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{ name: string; chapters: string[][] }[]>;
      })
      .then((rows) => {
        books = rows.map((row, i) => ({ name: ENGLISH[i] ?? row.name, chapters: row.chapters }));
        return books;
      });
  }
  return loading;
}

function tokens(q: string) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function linksFor(q: string) {
  const query = encodeURIComponent(q.trim().slice(0, 180));
  return [
    { label: "Google", href: `https://www.google.com/search?q=${query}` },
    { label: "GitHub", href: `https://github.com/search?q=${query}&type=repositories` },
    { label: "ExploitDB", href: `https://www.exploit-db.com/search?q=${query}` },
    { label: "NVD", href: `https://nvd.nist.gov/vuln/search/results?query=${query}` },
  ];
}

function bookWanted(q: string) {
  const n = q.toLowerCase();
  const bible = /\b(bible|scripture|verse|kjv|testament|gospel|epistle|psalm)\b/i.test(q) || /\bbook of\b/i.test(q);
  const common = new Set(["numbers", "job", "mark", "acts", "kings", "judges"]);
  const ranked = [...ENGLISH].sort((a, b) => b.length - a.length);
  const named = ranked.find((name) => {
    const word = name.toLowerCase();
    if (!new RegExp(`\\b${word}\\b`, "i").test(n)) return false;
    if (!common.has(word)) return true;
    if (bible) return true;
    return new RegExp(`\\b${word}\\s+(?:chapter\\s+)?\\d{1,3}\\b`, "i").test(q);
  });
  if (named) return named;
  const aliases = Object.entries(ALIAS).sort((a, b) => b[0].length - a[0].length);
  return aliases.find(([alias]) => n.includes(alias))?.[1] ?? null;
}

export async function askCopilot(question: string): Promise<CopilotAnswer> {
  const q = question.trim();
  const links = linksFor(q || "study");
  if (q.length < 2) {
    return { kind: "empty", note: "Ask a question. If it is not in the library, nothing is invented.", hits: [], links };
  }
  const library = await loadBible();
  const words = tokens(q);
  const wanted = bookWanted(q);
  const chapterMatch = q.match(/\b(\d{1,3})\s*:\s*(\d{1,3})\b/);
  const looseChapter = !chapterMatch && wanted ? q.match(/\b(\d{1,3})\b/) : null;
  const onlyChapter = q.match(/chapter\s+(\d{1,3})/i);
  const chapter = chapterMatch ? Number(chapterMatch[1]) : onlyChapter ? Number(onlyChapter[1]) : looseChapter ? Number(looseChapter[1]) : null;
  const verseOnly = chapterMatch ? Number(chapterMatch[2]) : null;
  const hits: { score: number; hit: CopilotHit }[] = [];
  const pool = wanted ? library.filter((b) => b.name === wanted) : library;

  for (const book of pool) {
    book.chapters.forEach((verses, ci) => {
      if (chapter && chapter !== ci + 1) return;
      verses.forEach((text, vi) => {
        if (verseOnly && verseOnly !== vi + 1) return;
        const hay = text.toLowerCase();
        let score = 0;
        for (const word of words) if (hay.includes(word)) score += 1;
        if (wanted && !words.length) score = vi < 2 ? 1 : 0;
        if (score <= 0) return;
        hits.push({
          score: score + (wanted ? 2 : 0),
          hit: {
            ref: `${book.name} ${ci + 1}:${vi + 1}`,
            text,
            source: "King James Version · public domain",
            href: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(`${book.name} ${ci + 1}:${vi + 1}`)}&version=KJV`,
          },
        });
      });
    });
  }

  hits.sort((a, b) => b.score - a.score);
  const verses = hits.filter((row, i, all) => all.findIndex((x) => x.hit.ref === row.hit.ref) === i).slice(0, 4).map((row) => row.hit);
  const low = q.toLowerCase();
  const desks = DESKS.filter((row) => row.keys.some((key) => low.includes(key))).map((row) => row.hit);
  const shown = [...desks, ...verses].slice(0, 5);
  if (!shown.length) {
    return {
      kind: "empty",
      note: "Not in the library. No answer was guessed. Open one of the indexes and read the page itself.",
      hits: [],
      links,
    };
  }
  return {
    kind: "library",
    note: "Shown only from the stored library. Nothing was added.",
    hits: shown,
    links,
  };
}
