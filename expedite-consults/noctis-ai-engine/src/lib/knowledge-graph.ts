export type NodeKind = "person" | "organization" | "topic" | "video" | "book" | "article" | "event" | "concept";

export type GraphNode = {
  id: string;
  kind: NodeKind;
  label: string;
  href?: string;
  note: string;
  aliases: string[];
  up?: string;
  link?: string;
};

export type GraphWalk = { chain: GraphNode[]; also: GraphNode[] };

const NODES: GraphNode[] = [
  { id: "cyber", kind: "topic", label: "Cybersecurity", note: "The subject this chain sits under.", aliases: ["cybersecurity"] },
  { id: "malware", kind: "concept", label: "Malware", up: "cyber", note: "Software built to do harm.", aliases: ["malware"] },
  { id: "ransom", kind: "concept", label: "Ransomware", up: "malware", note: "Malware that locks files and demands payment.", aliases: ["ransomware"] },
  {
    id: "wannacry",
    kind: "event",
    label: "WannaCry",
    up: "ransom",
    href: "https://en.wikipedia.org/wiki/WannaCry_ransomware_attack",
    note: "A May 2017 ransomware outbreak.",
    aliases: ["wannacry", "wanna cry", "wana cry"],
  },
  {
    id: "cve",
    kind: "article",
    label: "CVE-2017-0144",
    up: "wannacry",
    href: "https://nvd.nist.gov/vuln/detail/CVE-2017-0144",
    note: "The SMBv1 vulnerability WannaCry used. The record is the NVD page.",
    aliases: ["cve-2017-0144", "cve 2017-0144", "2017-0144"],
  },
  { id: "smb", kind: "concept", label: "SMB", up: "cve", note: "Windows file sharing. The exposed service was SMBv1.", aliases: ["smb", "smbv1", "smb v1"] },
  {
    id: "eternal",
    kind: "concept",
    label: "EternalBlue",
    up: "cve",
    note: "The exploit used against CVE-2017-0144.",
    aliases: ["eternalblue", "eternal blue"],
  },
  {
    id: "microsoft",
    kind: "organization",
    label: "Microsoft",
    up: "cve",
    href: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2017-0144",
    note: "Published the patch for CVE-2017-0144.",
    aliases: ["microsoft", "msrc"],
  },
  {
    id: "ms17",
    kind: "article",
    label: "MS17-010",
    up: "microsoft",
    href: "https://learn.microsoft.com/en-us/security-updates/securitybulletins/2017/ms17-010",
    note: "Microsoft's March 2017 bulletin for the SMB vulnerabilities, including CVE-2017-0144.",
    aliases: ["ms17-010", "ms17 010"],
  },
  {
    id: "nist-ir",
    kind: "book",
    label: "NIST SP 800-61",
    up: "ransom",
    href: "https://csrc.nist.gov/pubs/sp/800/61/r2/final",
    note: "Incident-handling guide. It is not a WannaCry case file.",
    aliases: ["800-61"],
  },
  {
    id: "lesson-malware",
    kind: "concept",
    label: "Malware lesson",
    up: "malware",
    href: "https://www.cisa.gov/stopransomware",
    note: "Clinic lesson. Open at CISA StopRansomware.",
    aliases: ["stopransomware"],
  },
  {
    id: "lesson-kev",
    kind: "concept",
    label: "CISA KEV lesson",
    up: "cve",
    href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
    note: "Clinic lesson. Known exploited vulnerabilities, patch these first.",
    aliases: [],
  },
  {
    id: "film-ms",
    kind: "video",
    label: "Microsoft security film",
    up: "microsoft",
    href: "https://www.youtube.com/watch?v=4yJp5-jGGNk",
    note: "A clinic film on Microsoft security. It is not a WannaCry documentary.",
    aliases: [],
  },
  { id: "einstein", kind: "person", label: "Einstein", href: "https://en.wikipedia.org/wiki/Albert_Einstein", note: "Albert Einstein. This chain is the relativity family, not a full biography.", aliases: ["einstein", "albert einstein"] },
  { id: "relativity", kind: "concept", label: "Theory of Relativity", up: "einstein", link: "proposed", href: "https://en.wikipedia.org/wiki/Theory_of_relativity", note: "The name for his account of space, time, and gravity.", aliases: ["theory of relativity", "relativity"] },
  { id: "special", kind: "concept", label: "Special Relativity", up: "relativity", link: "includes", href: "https://en.wikipedia.org/wiki/Special_relativity", note: "The 1905 theory. The speed of light is constant, and gravity is not in this part.", aliases: ["special relativity"] },
  { id: "dilation", kind: "concept", label: "Time Dilation", up: "special", link: "includes", href: "https://en.wikipedia.org/wiki/Time_dilation", note: "A moving clock ticks slower, as special relativity describes it.", aliases: ["time dilation"] },
  { id: "length", kind: "concept", label: "Length Contraction", up: "special", link: "includes", href: "https://en.wikipedia.org/wiki/Length_contraction", note: "Lengths contract along the direction of motion.", aliases: ["length contraction"] },
  { id: "emc", kind: "concept", label: "Mass-Energy", up: "special", link: "includes", href: "https://en.wikipedia.org/wiki/Mass%E2%80%93energy_equivalence", note: "E = mc². Energy and mass are related. This is not a calculator result.", aliases: ["mass-energy", "mass energy", "e=mc2", "e = mc2"] },
  { id: "general", kind: "concept", label: "General Relativity", up: "relativity", link: "later includes", href: "https://en.wikipedia.org/wiki/General_relativity", note: "The 1915 theory, which adds gravity. It is beside the special-relativity chain, not inside it.", aliases: ["general relativity"] },
  { id: "paul", kind: "person", label: "Paul", href: "https://en.wikipedia.org/wiki/Paul_the_Apostle", note: "Paul the apostle, connected here to the letter to the Ephesians. The verse text is the King James file, not this chain.", aliases: ["apostle paul", "paul the apostle"] },
  { id: "ephesians", kind: "book", label: "Ephesians", up: "paul", link: "letter", href: "https://www.biblegateway.com/passage/?search=Ephesians+1&version=KJV", note: "A New Testament letter. Ask for a chapter and verse when you want the words.", aliases: ["ephesians", "epistle to the ephesians"] },
  { id: "church", kind: "concept", label: "Church", up: "ephesians", link: "addresses", note: "Ephesians speaks to the church and calls it one body. The wording is in the letter.", aliases: ["church in ephesians"] },
  { id: "grace", kind: "concept", label: "Grace", up: "church", link: "teaches", href: "https://www.biblegateway.com/passage/?search=Ephesians+2%3A8&version=KJV", note: "Ephesians 2:8 names grace. Open that verse for the words.", aliases: ["grace in ephesians", "by grace"] },
  { id: "faith", kind: "concept", label: "Faith", up: "grace", link: "teaches", href: "https://www.biblegateway.com/passage/?search=Ephesians+2%3A8&version=KJV", note: "The same verse names faith. Do not add a verse that was not retrieved.", aliases: ["faith in ephesians", "through faith"] },
  { id: "salvation", kind: "concept", label: "Salvation", up: "faith", link: "teaches", href: "https://www.biblegateway.com/passage/?search=Ephesians+2%3A8&version=KJV", note: "The same verse names salvation. This chain points at the verse. It is not the verse.", aliases: ["salvation in ephesians"] },
  { id: "cve-kind", kind: "concept", label: "CVE", href: "https://nvd.nist.gov/", note: "A CVE is an identifier for a publicly known vulnerability. The record is the NVD page, not this chain.", aliases: ["what is a cve", "cve identifier", "cve id"] },
  { id: "vuln-kind", kind: "concept", label: "Vulnerability", up: "cve-kind", link: "names", href: "https://nvd.nist.gov/", note: "A weakness that can be used. The CVE id points at one record of it.", aliases: ["what is a vulnerability"] },
  { id: "affected", kind: "concept", label: "Affected Software", up: "vuln-kind", link: "is in", note: "The product named on that vulnerability record.", aliases: ["affected software", "affected product"] },
  { id: "technique", kind: "concept", label: "Attack Technique", up: "affected", link: "can be used by", note: "How the weakness is used. Exploit code is not stored here.", aliases: ["attack technique"] },
  { id: "mitigation", kind: "concept", label: "Mitigation", up: "technique", link: "is met by", href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", note: "The patch or control. The vendor page or the KEV listing is the record.", aliases: ["mitigation", "how is it mitigated"] },
  { id: "gravity", kind: "concept", label: "Gravity", href: "https://en.wikipedia.org/wiki/Gravity", note: "The attraction between masses. This chain is the relationship, not a calculation.", aliases: ["gravity", "gravitation"] },
  { id: "newton", kind: "person", label: "Newton", up: "gravity", link: "described by", href: "https://en.wikipedia.org/wiki/Isaac_Newton", note: "Isaac Newton. The law is not a biography.", aliases: ["isaac newton", "newton"] },
  { id: "accel", kind: "concept", label: "Acceleration", up: "newton", link: "uses", href: "https://en.wikipedia.org/wiki/Acceleration", note: "Change in velocity. Force is related to mass times acceleration.", aliases: ["acceleration"] },
  { id: "mass", kind: "concept", label: "Mass", up: "accel", link: "uses", note: "The quantity in the force relation. Not weight.", aliases: ["mass"] },
  { id: "force", kind: "concept", label: "Force", up: "mass", link: "gives", href: "https://en.wikipedia.org/wiki/Force", note: "Newton's second-law relation. Do not treat this note as a solved number.", aliases: ["force"] },
  { id: "orbit", kind: "concept", label: "Orbital mechanics", up: "force", link: "leads to", href: "https://en.wikipedia.org/wiki/Orbital_mechanics", note: "Motion under gravity. A textbook result is not stored here.", aliases: ["orbital mechanics", "orbits"] },
  { id: "gravity-einstein", kind: "person", label: "Einstein", up: "orbit", link: "later revised by", href: "https://en.wikipedia.org/wiki/Albert_Einstein", note: "Einstein's account of gravity is general relativity. This is the gravity chain, not the special-relativity chain.", aliases: ["einstein gravity"] },
  { id: "gravity-general", kind: "concept", label: "General relativity", up: "gravity-einstein", link: "proposed", href: "https://en.wikipedia.org/wiki/General_relativity", note: "Gravity as curvature. Beside Newton's force, not a replacement of a number that was not calculated.", aliases: ["general relativity gravity"] },
  { id: "black-hole", kind: "concept", label: "Black holes", up: "gravity-general", link: "includes", href: "https://en.wikipedia.org/wiki/Black_hole", note: "A result studied under general relativity. Not an observation stored here.", aliases: ["black hole", "black holes"] },
  { id: "ephesus", kind: "topic", label: "Ephesus", up: "paul", link: "wrote to", note: "The city named with the letter. This is setting, not a verse.", aliases: ["ephesus"] },
  { id: "rome-empire", kind: "topic", label: "Roman Empire", up: "ephesus", link: "was under", note: "The historical setting. It is not a verse and it is not added to the passage.", aliases: ["roman empire"] },
  { id: "warfare", kind: "concept", label: "Spiritual warfare", up: "faith", link: "later theme", href: "https://www.biblegateway.com/passage/?search=Ephesians+6&version=KJV", note: "People point to Ephesians 6. Open that chapter for the words. This line is not the verse.", aliases: ["spiritual warfare"] },
  { id: "related-passages", kind: "concept", label: "Related passages", up: "warfare", link: "points to", note: "Only a verse retrieved with the question. Do not invent a cross-reference.", aliases: ["related passages", "cross reference", "cross-reference"] },
  { id: "sqli", kind: "concept", label: "SQL injection", href: "https://owasp.org/www-community/attacks/SQL_Injection", note: "A query built from untrusted input. Exploit steps are not stored here.", aliases: ["sql injection", "sqli"] },
  { id: "input-check", kind: "concept", label: "Input validation", up: "sqli", link: "is limited by", href: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html", note: "Checking input. It is not the only control.", aliases: ["input validation"] },
  { id: "databases", kind: "concept", label: "Databases", up: "input-check", link: "reaches", note: "The system the injected query is meant to reach.", aliases: ["sql database"] },
  { id: "owasp", kind: "organization", label: "OWASP", up: "databases", link: "is listed by", href: "https://owasp.org/www-project-top-ten/", note: "OWASP publishes the weakness class. The page is the record.", aliases: ["owasp"] },
  { id: "authn", kind: "concept", label: "Authentication", up: "owasp", link: "can bypass", note: "A possible impact. Not proof that a named system is affected.", aliases: ["authentication bypass"] },
  { id: "exposure", kind: "concept", label: "Data exposure", up: "authn", link: "can cause", note: "Records the query was not meant to return.", aliases: ["data exposure", "data breach"] },
  { id: "sqli-fix", kind: "concept", label: "Mitigation", up: "exposure", link: "is met by", href: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html", note: "Parameterized queries are the usual control. A product is not fixed because this line exists.", aliases: ["sql mitigation"] },
];

const BY_ID = new Map(NODES.map((node) => [node.id, node]));

const SPINES = [
  ["cyber", "malware", "ransom", "wannacry", "cve", "smb", "eternal", "microsoft"],
  ["einstein", "relativity", "special", "dilation", "length", "emc"],
  ["paul", "ephesians", "ephesus", "rome-empire", "church", "grace", "faith", "warfare", "related-passages"],
  ["cve-kind", "vuln-kind", "affected", "technique", "mitigation"],
  ["gravity", "newton", "accel", "mass", "force", "orbit", "gravity-einstein", "gravity-general", "black-hole"],
  ["sqli", "input-check", "databases", "owasp", "authn", "exposure", "sqli-fix"],
];

function has(query: string, alias: string) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, "i").test(query);
}

function hits(query: string) {
  return NODES.filter((node) => {
    if (node.id === "microsoft" || node.id === "film-ms") return false;
    return node.aliases.some((alias) => alias.length > 2 && has(query, alias));
  });
}

export function walkGraph(query: string): GraphWalk | null {
  const matched = hits(query).filter((node) => node.id !== "cyber");
  if (!matched.length) return null;
  const generic = new Set(["accel", "mass", "force", "orbit"]);
  if (matched.every((node) => generic.has(node.id)) && !/\b(gravity|newton)\b/i.test(query)) return null;
  const spine = SPINES.find((ids) => ids.includes(matched[0].id)) ?? [matched[0].id];
  const chain = spine.map((id) => BY_ID.get(id)).filter((node): node is GraphNode => Boolean(node));
  const on = new Set(spine);
  return { chain, also: NODES.filter((node) => !on.has(node.id) && node.up && spine.includes(node.up)) };
}

export function formatMap(walk: GraphWalk) {
  const line = walk.chain
    .map((node, index) => (index === 0 ? node.label : node.link ? `— ${node.link} → ${node.label}` : `→ ${node.label}`))
    .join(" ");
  const notes = walk.chain.map((node) => `- ${node.label}: ${node.note}${node.href ? ` (${node.href})` : ""}`).join("\n");
  const more = walk.also.map((node) => `- ${node.label} (${node.link || "related"}): ${node.note}${node.href ? ` (${node.href})` : ""}`).join("\n");
  return [`Relationships: ${line}`, notes, more ? `Also connected:\n${more}` : ""].filter(Boolean).join("\n");
}

export const COMMUNITY_ROOMS = [
  { id: "general", label: "General" },
  { id: "announcements", label: "Announcements" },
  { id: "study", label: "Study" },
  { id: "videos", label: "Videos" },
  { id: "resources", label: "Resources" },
] as const;

export function filmText(post: { teach?: { hook?: string; stamp?: string }; caption?: string }) {
  return `${post.teach?.hook || ""} ${post.teach?.stamp || ""} ${post.caption || ""}`.replace(/\s+/g, " ").trim();
}

export function graphPath(text: string) {
  const walk = walkGraph(text);
  if (!walk) return [];
  return walk.chain.map((node) => ({ id: node.id, label: node.label }));
}

export function lessonOnNode<T extends { id: string; caption?: string; teach?: { hook?: string; stamp?: string } }>(
  node: { label: string },
  posts: T[],
  exceptId: string,
) {
  const needle = node.label.toLowerCase();
  if (needle.length < 4) return null;
  return posts.find((post) => post.id !== exceptId && filmText(post).toLowerCase().includes(needle)) ?? null;
}

export function knowledgeGraph(input: { title: string; people: string[]; notes: string[]; films: { id: string; title: string }[] }) {
  const walk = walkGraph(`${input.title} ${input.notes.join(" ")}`);
  const topics = walk ? walk.chain.map((node) => node.label) : input.title ? [input.title] : [];
  const words = new Set(`${input.title} ${topics.join(" ")}`.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 4));
  const videos = input.films.filter((film) => film.title.toLowerCase().split(/[^a-z0-9]+/).some((word) => word.length > 4 && words.has(word))).slice(0, 4);
  return { people: input.people.filter(Boolean), topics, videos };
}
