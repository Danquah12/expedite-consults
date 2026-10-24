export const ECOSYSTEM = [
  "Video",
  "Course",
  "Lab",
  "Tutor",
  "Range",
  "Assessment",
  "Project",
  "Portfolio",
  "Badge",
  "Job",
  "Freelance",
] as const;

export const RANGE_LOOP = ["Learn", "Practice", "Investigate", "Fix", "Test", "Credential"] as const;

export type CareerLevel = {
  n: 1 | 2 | 3;
  title: string;
  houseIds: string[];
  labIds: string[];
};

export type CareerPath = {
  id: string;
  title: string;
  blurb: string;
  credential: string;
  job: string;
  levels: CareerLevel[];
};

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "soc",
    title: "SOC Analyst",
    blurb: "Detect, hunt, then the eight IR moves.",
    credential: "SOC Investigator",
    job: "SOC analyst",
    levels: [
      { n: 1, title: "Networking, Linux, Windows, SIEM", houseIds: ["net-fund", "linux-fund", "win-fund", "siem"], labIds: [] },
      { n: 2, title: "Hunt, detection, IR", houseIds: ["hunt", "detect-eng", "ir-tabletop"], labIds: ["soc"] },
      { n: 3, title: "Malware, cloud SOC", houseIds: ["malware-fund", "lotc", "aws-guardduty"], labIds: ["lotc"] },
    ],
  },
  {
    id: "cloud",
    title: "Cloud Security Engineer",
    blurb: "AWS, Azure, GCP, then CNAPP and paths.",
    credential: "Path Walker",
    job: "Cloud security engineer",
    levels: [
      { n: 1, title: "Cloud + IAM", houseIds: ["aws-iam", "az-zerotrust", "gcp-scc", "iam-fund"], labIds: ["s3"] },
      { n: 2, title: "CSPM, Kubernetes, IaC, DevSecOps", houseIds: ["cspm", "k8s-sec", "tf-sec", "cicd"], labIds: ["k8s"] },
      { n: 3, title: "CNAPP, attack paths, cloud IR", houseIds: ["cnapp", "attack-path", "lotc"], labIds: ["path"] },
    ],
  },
  {
    id: "ai",
    title: "AI Security Engineer",
    blurb: "LLMs, then agents, supply chain, governance.",
    credential: "Agent Defender",
    job: "AI security engineer",
    levels: [
      { n: 1, title: "AI fundamentals, LLMs, Python", houseIds: ["owasp-llm", "py-fund"], labIds: [] },
      { n: 2, title: "RAG, injection, red team", houseIds: ["owasp-llm", "model-poison"], labIds: ["aisupply"] },
      { n: 3, title: "Agents, AI supply chain, governance, runtime", houseIds: ["agentic", "aibom", "nist-ai-rmf", "agent-runtime"], labIds: ["agent"] },
    ],
  },
  {
    id: "rmf",
    title: "RMF / ISSO / ISSE",
    blurb: "Controls, then the ATO package, then FedRAMP.",
    credential: "CTEM Operator",
    job: "ISSO",
    levels: [
      { n: 1, title: "NIST, RMF, controls", houseIds: ["nist", "80037", "80053"], labIds: [] },
      { n: 2, title: "SSP, POA&M, SAR, ATO", houseIds: ["ato", "ssp"], labIds: ["ctem"] },
      { n: 3, title: "Continuous monitoring, cloud RMF, FedRAMP, eMASS", houseIds: ["fedramp", "emass", "cdm"], labIds: ["path"] },
    ],
  },
];

export type RangeRoom = {
  id: string;
  title: string;
  env: string;
  labId: string;
  credential: string;
};

export const RANGE_ROOMS: RangeRoom[] = [
  { id: "k8s", title: "Kubernetes clinic", env: "Isolated cluster (hypothetical)", labId: "k8s", credential: "Cloud-Native Defender" },
  { id: "s3", title: "Misconfigured bucket", env: "Isolated AWS account (hypothetical)", labId: "s3", credential: "AWS Cloud Security" },
  { id: "azure", title: "Entra compromise", env: "Isolated tenant (hypothetical)", labId: "azure", credential: "Azure Identity Defense" },
  { id: "soc", title: "SOC investigation", env: "Isolated SIEM (hypothetical)", labId: "soc", credential: "SOC Investigator" },
  { id: "agent", title: "Agent hijack", env: "Isolated agent runtime (hypothetical)", labId: "agent", credential: "Agent Defender" },
  { id: "path", title: "Internet to jewel", env: "Isolated multi-cloud (hypothetical)", labId: "path", credential: "Path Walker" },
];

export function careerById(id: string) {
  return CAREER_PATHS.find((p) => p.id === id);
}
