import type { FeedPost } from "@/lib/feed-data";
import { hostEmbed } from "@/lib/hosts";
import { vimeoIdOf } from "@/lib/vimeo";
import { youtubeIdOf } from "@/lib/youtube";

export type YoutubeRecord = {
  source: "youtube";
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  embedUrl: string;
};

export type VimeoRecord = {
  source: "vimeo";
  videoId: string;
  creator: string;
  embedUrl: string;
};

export type TwitchRecord = {
  source: "twitch";
  streamId: string;
  channel: string;
  status: "live" | "vod";
};

export type TedRecord = {
  source: "ted";
  slug: string;
  title: string;
  embedUrl: string;
};

export type SpotifyRecord = {
  source: "spotify";
  episodeId: string;
  host: string;
};

export type FilmRecord = YoutubeRecord | VimeoRecord | TwitchRecord | TedRecord | SpotifyRecord | { source: "course" | "original"; title: string; href?: string };

export type CertRecord = {
  certificationId: string;
  name: string;
  vendor: string;
  category: string;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  href: string;
  careerPaths: string[];
};

export type PathStep = { code: string; name: string; href: string };

export type CareerPath = {
  id: string;
  title: string;
  keys: string[];
  skills: string[];
  tasks: string[];
  salary: string;
  onet: string;
  labor: string;
  steps: PathStep[];
  courses: { title: string; href: string; weeks?: string }[];
  certIds: string[];
};

export const CERTS: CertRecord[] = [
  { certificationId: "security-plus", name: "Security+", vendor: "CompTIA", category: "Cybersecurity", difficulty: "Foundational", href: "https://www.comptia.org/certifications/security", careerPaths: ["cyber-analyst"] },
  { certificationId: "cissp", name: "CISSP", vendor: "ISC2", category: "Cybersecurity", difficulty: "Advanced", href: "https://www.isc2.org/certifications/cissp", careerPaths: ["cyber-analyst"] },
  { certificationId: "cism", name: "CISM", vendor: "ISACA", category: "Cybersecurity", difficulty: "Advanced", href: "https://www.isaca.org/credentialing/cism", careerPaths: ["cyber-analyst"] },
  { certificationId: "casp", name: "CASP+", vendor: "CompTIA", category: "Cybersecurity", difficulty: "Advanced", href: "https://www.comptia.org/certifications/comptia-advanced-security-practitioner", careerPaths: ["cyber-analyst"] },
  { certificationId: "pmp", name: "PMP", vendor: "PMI", category: "Leadership", difficulty: "Advanced", href: "https://www.pmi.org/certifications/project-management-pmp", careerPaths: ["leader"] },
  { certificationId: "aws-saa", name: "AWS Solutions Architect Associate", vendor: "AWS", category: "Cloud", difficulty: "Intermediate", href: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", careerPaths: ["cloud-engineer"] },
  { certificationId: "aws-sap", name: "AWS Solutions Architect Professional", vendor: "AWS", category: "Cloud", difficulty: "Advanced", href: "https://aws.amazon.com/certification/certified-solutions-architect-professional/", careerPaths: ["cloud-engineer"] },
  { certificationId: "aws-cp", name: "AWS Cloud Practitioner", vendor: "AWS", category: "Cloud", difficulty: "Foundational", href: "https://aws.amazon.com/certification/certified-cloud-practitioner/", careerPaths: ["cloud-engineer"] },
  { certificationId: "az-900", name: "AZ-900", vendor: "Microsoft", category: "Cloud", difficulty: "Foundational", href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/", careerPaths: ["azure-admin"] },
  { certificationId: "az-104", name: "AZ-104 Azure Administrator", vendor: "Microsoft", category: "Cloud", difficulty: "Intermediate", href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/", careerPaths: ["azure-admin"] },
  { certificationId: "az-500", name: "AZ-500 Azure Security Engineer", vendor: "Microsoft", category: "Cloud", difficulty: "Advanced", href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/", careerPaths: ["azure-admin"] },
  { certificationId: "ccna", name: "CCNA", vendor: "Cisco", category: "Networking", difficulty: "Intermediate", href: "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html", careerPaths: ["cyber-analyst"] },
  { certificationId: "rhcsa", name: "RHCSA", vendor: "Red Hat", category: "Systems", difficulty: "Intermediate", href: "https://www.redhat.com/en/services/certification/rhcsa", careerPaths: ["cloud-engineer"] },
];

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "cyber-analyst",
    title: "Cybersecurity Analyst",
    keys: ["cyber", "security", "nist", "siem", "soc", "phish", "incident"],
    skills: ["SIEM", "Networking", "Incident response", "Identity"],
    tasks: ["Read logs", "Triage an alert", "Write what happened"],
    salary: "BLS median about $124,910 (May 2024, Information Security Analysts)",
    onet: "https://www.onetonline.org/link/summary/15-1212.00",
    labor: "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm",
    steps: [
      { code: "Security+", name: "Security+", href: "https://www.comptia.org/certifications/security" },
      { code: "CySA+", name: "Cybersecurity Analyst", href: "https://www.comptia.org/certifications/cybersecurity-analyst" },
      { code: "CISSP", name: "CISSP", href: "https://www.isc2.org/certifications/cissp" },
    ],
    courses: [
      { title: "Google Cybersecurity", href: "https://www.coursera.org/professional-certificates/google-cybersecurity", weeks: "About 6 months" },
      { title: "edX — Harvard, MIT, Stanford", href: "https://www.edx.org/school/harvardx" },
    ],
    certIds: ["security-plus", "cissp", "cism", "casp", "ccna"],
  },
  {
    id: "azure-admin",
    title: "Azure Administrator",
    keys: ["azure", "entra", "microsoft", "active directory"],
    skills: ["Identity", "Networking", "Storage", "Governance"],
    tasks: ["Join a tenant", "Set least privilege", "Read sign-in logs"],
    salary: "Cloud roles vary. Check the BLS computer occupations table.",
    onet: "https://www.onetonline.org/link/summary/15-1244.00",
    labor: "https://www.bls.gov/ooh/computer-and-information-technology/home.htm",
    steps: [
      { code: "AZ-900", name: "Azure Fundamentals", href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/" },
      { code: "AZ-104", name: "Azure Administrator", href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/" },
      { code: "AZ-500", name: "Azure Security Engineer", href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/" },
    ],
    courses: [{ title: "Microsoft Learn", href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/", weeks: "Self-paced" }],
    certIds: ["az-900", "az-104", "az-500"],
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    keys: ["aws", "cloud", "kubernetes", "terraform", "devops"],
    skills: ["IAM", "Networking", "Infrastructure as code", "Logging"],
    tasks: ["Draw the account", "Find the open bucket", "Trace the role"],
    salary: "Use the BLS page for the nearest computer occupation. Do not invent a number.",
    onet: "https://www.onetonline.org/link/summary/15-1299.08",
    labor: "https://www.bls.gov/ooh/computer-and-information-technology/home.htm",
    steps: [
      { code: "CCP", name: "Cloud Practitioner", href: "https://aws.amazon.com/certification/certified-cloud-practitioner/" },
      { code: "SAA", name: "Solutions Architect Associate", href: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
      { code: "SAP", name: "Solutions Architect Professional", href: "https://aws.amazon.com/certification/certified-solutions-architect-professional/" },
    ],
    courses: [{ title: "AWS Skill Builder", href: "https://skillbuilder.aws/", weeks: "Self-paced" }],
    certIds: ["aws-cp", "aws-saa", "aws-sap", "rhcsa"],
  },
  {
    id: "leader",
    title: "Project leader",
    keys: ["leader", "ted", "speaking", "management", "entrepreneur"],
    skills: ["Leadership", "Communication", "Critical thinking"],
    tasks: ["Name the decision", "Name who owns it", "Name the next step"],
    salary: "Project managers: see the BLS management page.",
    onet: "https://www.onetonline.org/link/summary/13-1082.00",
    labor: "https://www.bls.gov/ooh/management/home.htm",
    steps: [{ code: "PMP", name: "PMP", href: "https://www.pmi.org/certifications/project-management-pmp" }],
    courses: [
      { title: "TED Talks", href: "https://www.ted.com/talks" },
      { title: "Coursera — leadership", href: "https://www.coursera.org/browse/business/leadership-and-management" },
    ],
    certIds: ["pmp"],
  },
];

export function filmRecord(post: FeedPost): FilmRecord {
  const title = post.teach.stamp || post.caption.slice(0, 80);
  const yt = youtubeIdOf(post);
  if (yt) {
    return {
      source: "youtube",
      videoId: yt,
      title,
      channelName: post.author.name,
      thumbnail: post.posterUrl ?? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt}`,
    };
  }
  const vm = vimeoIdOf(post);
  if (vm) return { source: "vimeo", videoId: vm, creator: post.author.name, embedUrl: `https://player.vimeo.com/video/${vm}` };
  const host = hostEmbed(post.mediaUrl);
  if (host?.kind === "twitch") {
    return { source: "twitch", streamId: post.id, channel: post.author.username, status: post.mediaUrl.includes("/videos/") ? "vod" : "live" };
  }
  if (host?.kind === "ted") return { source: "ted", slug: post.id, title, embedUrl: host.src };
  if (host?.kind === "spotify") return { source: "spotify", episodeId: post.id, host: post.author.name };
  return { source: "original", title };
}

export function pathFor(post: FeedPost): CareerPath | null {
  const blob = `${post.caption} ${post.teach.hook} ${post.teach.stamp} ${post.hashtags.join(" ")}`.toLowerCase();
  return CAREER_PATHS.find((path) => path.keys.some((key) => blob.includes(key))) ?? null;
}

export function certsFor(path: CareerPath | null) {
  if (!path) return [];
  return CERTS.filter((cert) => path.certIds.includes(cert.certificationId));
}
