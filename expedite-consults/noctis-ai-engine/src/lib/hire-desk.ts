import { CYBER_LABS } from "@/lib/cyber-labs";
import { STAMPS } from "@/lib/feed-data";

export type HireSeat = {
  id: string;
  title: string;
  org: string;
  place: string;
  stamp: string;
  href: string;
  board: string;
  line: string;
};

export const HIRE_SEATS: HireSeat[] = [
  {
    id: "h-cisa",
    title: "Cyber / IT intern",
    org: "CISA",
    place: "USAJOBS · Pathways",
    stamp: "Packet ghost",
    href: "https://www.cisa.gov/careers/work-rolescyber-and-it-interns",
    board: "CISA",
    line: "The packet stamp is the ticket. Apply only when an announcement is live.",
  },
  {
    id: "h-aws",
    title: "AWS security engineer",
    org: "Amazon",
    place: "amazon.jobs",
    stamp: "AWS Cloud Security",
    href: "https://www.amazon.jobs/en/search?base_query=AWS+security",
    board: "Amazon.jobs",
    line: "Finish the S3 clinic. Then the official board.",
  },
  {
    id: "h-soc",
    title: "SOC analyst",
    org: "CISA",
    place: "cisa.gov/careers",
    stamp: "SOC Investigator",
    href: "https://www.cisa.gov/careers",
    board: "CISA",
    line: "Hunt the logs in the range. Then USAJOBS.",
  },
  {
    id: "h-path",
    title: "Cloud security engineer",
    org: "USAJOBS",
    place: "usajobs.gov",
    stamp: "Path Walker",
    href: "https://www.usajobs.gov/Search/Results?k=cloud+security",
    board: "USAJOBS",
    line: "Internet to jewel. Then the listing.",
  },
  {
    id: "h-k8s",
    title: "Platform / cloud-native security",
    org: "CNCF ecosystem",
    place: "Official vendors via CNCF",
    stamp: "Cloud-Native Defender",
    href: "https://www.cncf.io/",
    board: "CNCF",
    line: "The cluster lab is the proof. Jobs stay at the vendor.",
  },
  {
    id: "h-ctem",
    title: "ISSO / exposure manager",
    org: "NIST / federal",
    place: "nist.gov/careers",
    stamp: "CTEM Operator",
    href: "https://www.nist.gov/careers",
    board: "NIST",
    line: "Discover → remediate. Then the federal board.",
  },
  {
    id: "h-agent",
    title: "AI security engineer",
    org: "CISA / NIST",
    place: "Official boards",
    stamp: "Agent Defender",
    href: "https://www.cisa.gov/careers",
    board: "CISA",
    line: "Kill switch and MCP. Then the posting.",
  },
  {
    id: "h-api",
    title: "API security",
    org: "OWASP community + employers",
    place: "owasp.org",
    stamp: "API Defender",
    href: "https://owasp.org/www-project-api-security/",
    board: "OWASP",
    line: "BOLA first. Then the role.",
  },
  {
    id: "h-nhi",
    title: "Identity / NHI",
    org: "CISA",
    place: "cisa.gov",
    stamp: "NHI Steward",
    href: "https://www.cisa.gov/careers",
    board: "CISA",
    line: "Orphaned keys are the finding. Then IAM roles.",
  },
  {
    id: "h-az",
    title: "Azure identity",
    org: "Microsoft",
    place: "careers.microsoft.com",
    stamp: "Azure Identity Defense",
    href: "https://careers.microsoft.com/",
    board: "Microsoft",
    line: "Entra lab, then Microsoft’s board.",
  },
];

const HIRE_KEY = "connectln-hire-seats";

export function labForStamp(stamp: string) {
  return CYBER_LABS.find((lab) => lab.badge === stamp)?.id;
}

export function stampNames() {
  return [...new Set([...STAMPS.map((s) => s.name), ...CYBER_LABS.map((l) => l.badge)])];
}

export function readPostedHires(): HireSeat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HIRE_KEY);
    const parsed = raw ? (JSON.parse(raw) as HireSeat[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePostedHire(seat: HireSeat) {
  const next = [seat, ...readPostedHires()].slice(0, 20);
  window.localStorage.setItem(HIRE_KEY, JSON.stringify(next));
  return next;
}

export function rankHires(seats: HireSeat[], stamps: string[]) {
  const held = new Set(stamps);
  return [...seats].sort((a, b) => Number(held.has(b.stamp)) - Number(held.has(a.stamp)));
}
