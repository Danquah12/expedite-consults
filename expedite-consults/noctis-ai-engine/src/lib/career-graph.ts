import type { FeedPost } from "@/lib/feed-data";

export type SkillNode = {
  id: string;
  name: string;
  keys: string[];
  careers: { title: string; href: string }[];
  certs: { title: string; href: string }[];
  salary: string;
  salaryHref: string;
  course: { title: string; href: string };
  job: { title: string; href: string };
};

const JOBS = "https://www.usajobs.gov/Search/Results?k=";

export const SKILL_GRAPH: SkillNode[] = [
  {
    id: "splunk",
    name: "Splunk",
    keys: ["splunk", "siem", "log"],
    careers: [
      { title: "SOC Analyst", href: "https://www.onetonline.org/link/summary/15-1212.00" },
      { title: "Security Engineer", href: "https://www.onetonline.org/link/summary/15-1212.00" },
      { title: "Detection Engineer", href: "https://www.onetonline.org/link/summary/15-1212.00" },
    ],
    certs: [
      { title: "Security+", href: "https://www.comptia.org/certifications/security" },
      { title: "CySA+", href: "https://www.comptia.org/certifications/cybersecurity-analyst" },
      { title: "Splunk Core User", href: "https://www.splunk.com/en_us/training/certification-track/splunk-core-certified-user.html" },
    ],
    salary: "BLS range for information security analysts, May 2024: $69,660 to $186,420. Median $124,910.",
    salaryHref: "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm",
    course: { title: "Splunk training", href: "https://www.splunk.com/en_us/training.html" },
    job: { title: "SOC jobs on USAJOBS", href: `${JOBS}SOC%20analyst` },
  },
  {
    id: "iam",
    name: "Identity",
    keys: ["iam", "entra", "active directory", "mfa", "zero trust"],
    careers: [
      { title: "Identity engineer", href: "https://www.onetonline.org/link/summary/15-1212.00" },
      { title: "Cloud administrator", href: "https://www.onetonline.org/link/summary/15-1244.00" },
    ],
    certs: [
      { title: "AZ-104", href: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/" },
      { title: "Security+", href: "https://www.comptia.org/certifications/security" },
    ],
    salary: "See the Labor Department page for the matching computer occupation. We do not invent a band.",
    salaryHref: "https://www.bls.gov/ooh/computer-and-information-technology/home.htm",
    course: { title: "Microsoft Learn — identity", href: "https://learn.microsoft.com/en-us/training/browse/?terms=identity" },
    job: { title: "Identity jobs on USAJOBS", href: `${JOBS}identity%20access` },
  },
  {
    id: "cloud",
    name: "Cloud",
    keys: ["aws", "azure", "cloud", "kubernetes"],
    careers: [
      { title: "Cloud engineer", href: "https://www.onetonline.org/link/summary/15-1299.08" },
      { title: "Solutions architect", href: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
    ],
    certs: [
      { title: "Cloud Practitioner", href: "https://aws.amazon.com/certification/certified-cloud-practitioner/" },
      { title: "Solutions Architect Associate", href: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
    ],
    salary: "See the Labor Department computer-occupations page. Pay depends on the title.",
    salaryHref: "https://www.bls.gov/ooh/computer-and-information-technology/home.htm",
    course: { title: "AWS Skill Builder", href: "https://skillbuilder.aws/" },
    job: { title: "Cloud jobs on USAJOBS", href: `${JOBS}cloud` },
  },
];

export type GraphStep = { label: string; detail: string; href?: string };

export function careerGraph(post: FeedPost, library: FeedPost[]) {
  const blob = `${post.caption} ${post.teach.hook} ${post.teach.stamp} ${post.hashtags.join(" ")}`.toLowerCase();
  const skill = SKILL_GRAPH.find((node) => node.keys.some((key) => blob.includes(key)));
  if (!skill) return null;
  const tags = new Set(post.hashtags.map((tag) => tag.toLowerCase()));
  const next = library.find((row) => row.id !== post.id && row.hashtags.some((tag) => tags.has(tag.toLowerCase())));
  const steps: GraphStep[] = [
    next
      ? { label: "Next video", detail: next.teach.stamp, href: `#post-${next.id}` }
      : { label: "Next video", detail: "Stay on this subject in Clinic." },
    { label: "Next course", detail: skill.course.title, href: skill.course.href },
    { label: "Certification", detail: skill.certs.map((cert) => cert.title).join(" → "), href: skill.certs[0]?.href },
    { label: "Job", detail: skill.job.title, href: skill.job.href },
  ];
  return { skill, steps };
}
