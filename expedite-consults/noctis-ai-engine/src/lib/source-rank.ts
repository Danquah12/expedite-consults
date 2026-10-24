export type SourceRank = "primary" | "secondary" | "weak" | "unsupported";

const AUTHORITIES = [
  { domain: "Science", test: /\b(physics|chemist|biology|gravity|molecule|astronomy)\b/i, sources: "scientific literature and an institution such as NIST or NASA" },
  { domain: "Cybersecurity", test: /\b(cve|vulnerab|malware|sql injection|owasp|phish)\b/i, sources: "NIST, CISA, OWASP, the vendor advisory, or a published security record" },
  { domain: "Engineering", test: /\b(engineering standard|ieee|asme|iso\s*\d|structural code)\b/i, sources: "the named engineering standard or the technical literature" },
  { domain: "Bible", test: /\b(bible|verse|scripture|ephesians|psalm|gospel)\b/i, sources: "the stored biblical text. A commentary is labeled as commentary, not as the verse" },
  { domain: "Government", test: /\b(census|statute|regulation|white house|official government)\b/i, sources: "the official government page" },
];

export function authorityLine(question: string) {
  const hit = AUTHORITIES.find((row) => row.test.test(question));
  if (!hit) return "";
  return `Source of truth for ${hit.domain}: ${hit.sources}. If two opened sources disagree, say they disagree. Do not pick one in silence. Prefer primary authoritative evidence, then strong secondary evidence, then weak secondary evidence. An unsupported claim is not a source.`;
}

export function rankSource(url: string): { rank: SourceRank; score: number; why: string } {
  const host = url.toLowerCase();
  if (/nvd\.nist\.gov|csrc\.nist\.gov|cisa\.gov|owasp\.org|nasa\.gov|biblegateway\.com|\.gov\b/.test(host)) {
    return { rank: "primary", score: 90, why: "Authoritative or official host." };
  }
  if (/wikipedia\.org|arxiv\.org|nature\.com|science\.org|ieee\.org/.test(host)) {
    return { rank: "secondary", score: 60, why: "Strong secondary or scholarly host." };
  }
  if (/news\.|reuters\.com|apnews\.com|bbc\.|nytimes\.com/.test(host)) {
    return { rank: "weak", score: 35, why: "A report, not the primary record." };
  }
  return { rank: "unsupported", score: 15, why: "No authority rule matched this host." };
}

export function rankOpened(text: string) {
  const urls = [...text.matchAll(/https?:\/\/[^\s)"']+/g)].map((hit) => hit[0]).slice(0, 6);
  if (!urls.length) return "";
  const lines = urls.map((url) => {
    let host = url;
    try {
      host = new URL(url).host;
    } catch {
      /* keep the raw url */
    }
    const row = rankSource(url);
    return `${host}: ${row.rank}, ${row.score}. ${row.why}`;
  });
  return `Source rank. Prefer the higher score. A lower score does not become a fact.\n${lines.join("\n")}`;
}
