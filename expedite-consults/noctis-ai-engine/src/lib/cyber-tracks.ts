import { houseById, type Level } from "@/lib/cyber-week";
import type { NetworkHouse } from "@/lib/source-network";

export type TrackModule = {
  title: string;
  houseId: string;
  labId?: string;
  level: Level;
};

export type CyberTrack = {
  id: string;
  title: string;
  blurb: string;
  modules: TrackModule[];
};

export const CYBER_TRACKS: CyberTrack[] = [
  {
    id: "foundations",
    title: "Foundations",
    blurb: "Packets, shells, Windows, Python, then risk. Do this first.",
    modules: [
      { title: "Networking", houseId: "net-fund", level: "Beginner" },
      { title: "Linux", houseId: "linux-fund", level: "Beginner" },
      { title: "Windows", houseId: "win-fund", level: "Beginner" },
      { title: "Python", houseId: "py-fund", level: "Beginner" },
      { title: "Security fundamentals", houseId: "sec-fund", level: "Beginner" },
    ],
  },
  {
    id: "offensive",
    title: "Offensive security",
    blurb: "Authorized scope only. Web, API, cloud. Then report.",
    modules: [
      { title: "Pentesting", houseId: "web-pentest", level: "Intermediate" },
      { title: "Red team", houseId: "recon", level: "Advanced" },
      { title: "Web security", houseId: "owasp-top10", level: "Intermediate" },
      { title: "API security", houseId: "owasp-api", level: "Intermediate" },
      { title: "Cloud pentesting", houseId: "aws-iam", labId: "s3", level: "Advanced" },
    ],
  },
  {
    id: "defensive",
    title: "Defensive security",
    blurb: "SOC, hunt, detect, then the eight IR moves.",
    modules: [
      { title: "SOC", houseId: "soc", labId: "soc", level: "Intermediate" },
      { title: "SIEM", houseId: "siem", level: "Intermediate" },
      { title: "Threat hunting", houseId: "hunt", level: "Advanced" },
      { title: "Detection engineering", houseId: "detect-eng", level: "Advanced" },
      { title: "Incident response", houseId: "ir-tabletop", labId: "soc", level: "Professional" },
    ],
  },
  {
    id: "cloud",
    title: "Cloud security",
    blurb: "AWS, Azure, GCP, Kubernetes, IAM. 2026 core.",
    modules: [
      { title: "AWS", houseId: "aws-iam", labId: "s3", level: "Intermediate" },
      { title: "Azure", houseId: "az-zerotrust", labId: "azure", level: "Intermediate" },
      { title: "GCP", houseId: "gcp-scc", level: "Intermediate" },
      { title: "Kubernetes", houseId: "k8s-sec", labId: "k8s", level: "Advanced" },
      { title: "Containers", houseId: "trivy", level: "Intermediate" },
      { title: "Cloud IAM", houseId: "iam-fund", level: "Beginner" },
    ],
  },
  {
    id: "ai",
    title: "AI security",
    blurb: "LLMs, agents, RAG, governance. Agentic oversight is the 2026 problem.",
    modules: [
      { title: "LLM security", houseId: "owasp-llm", level: "Intermediate" },
      { title: "AI red teaming", houseId: "owasp-llm", level: "Advanced" },
      { title: "AI governance", houseId: "nist-ai-rmf", level: "Professional" },
      { title: "Agentic AI", houseId: "agentic", level: "Advanced" },
      { title: "RAG security", houseId: "owasp-llm", level: "Advanced" },
    ],
  },
  {
    id: "agents",
    title: "AI agent security",
    blurb: "Not generic AI. Architecture, identity, MCP, hijack, kill switch. Gartner 2026.",
    modules: [
      { title: "Agent architecture", houseId: "agent-arch", level: "Intermediate" },
      { title: "Agent identity & authz", houseId: "agent-id", labId: "agent", level: "Advanced" },
      { title: "Injection & hijack", houseId: "agent-inject", labId: "agent", level: "Advanced" },
      { title: "MCP security", houseId: "mcp-sec", level: "Advanced" },
      { title: "Runtime & observability", houseId: "agent-runtime", level: "Professional" },
    ],
  },
  {
    id: "nhi",
    title: "Non-human identity",
    blurb: "Human → machine → workload → agent. CSA: inadequate IAM, including NHI, is the top cloud concern.",
    modules: [
      { title: "NHI fundamentals", houseId: "nhi", level: "Beginner" },
      { title: "Workload identity", houseId: "workload-id", level: "Intermediate" },
      { title: "Managed identities", houseId: "managed-id", labId: "nhi", level: "Intermediate" },
      { title: "Secrets & short-lived creds", houseId: "secrets-rot", labId: "nhi", level: "Intermediate" },
      { title: "M2M authentication", houseId: "m2m", level: "Advanced" },
      { title: "Identity governance", houseId: "id-gov", level: "Professional" },
    ],
  },
  {
    id: "supply",
    title: "Software supply chain",
    blurb: "SBOM, AIBOM, poisoned packages, SLSA, Sigstore. Gartner 2026–27 critical threat.",
    modules: [
      { title: "SBOM", houseId: "sbom", level: "Beginner" },
      { title: "AIBOM", houseId: "aibom", level: "Intermediate" },
      { title: "Dependency attacks", houseId: "dep-attack", labId: "supply", level: "Intermediate" },
      { title: "CI/CD attacks", houseId: "cicd", level: "Advanced" },
      { title: "Signing & provenance", houseId: "sigstore", level: "Advanced" },
      { title: "SLSA", houseId: "slsa", level: "Professional" },
      { title: "Third-party risk", houseId: "third-party", level: "Professional" },
    ],
  },
  {
    id: "ai-supply",
    title: "AI supply chain",
    blurb: "Where did this model come from? Weights, data, APIs, plugins.",
    modules: [
      { title: "Model provenance", houseId: "model-prov", level: "Intermediate" },
      { title: "Poisoned models & data", houseId: "model-poison", labId: "aisupply", level: "Advanced" },
      { title: "Model signing & AIBOM", houseId: "model-sign", level: "Advanced" },
      { title: "Plugins & tools", houseId: "ai-plugins", labId: "agent", level: "Advanced" },
    ],
  },
  {
    id: "api",
    title: "API security academy",
    blurb: "REST, GraphQL, gRPC. CSA: insecure APIs are a 2026 cloud threat.",
    modules: [
      { title: "REST & gateways", houseId: "api-rest", level: "Beginner" },
      { title: "GraphQL & gRPC", houseId: "api-gql", level: "Intermediate" },
      { title: "Authn / authz / BOLA", houseId: "api-auth", labId: "api", level: "Intermediate" },
      { title: "Abuse, fuzz, pentest", houseId: "api-abuse", labId: "api", level: "Advanced" },
      { title: "OWASP API Top 10", houseId: "owasp-api", level: "Beginner" },
    ],
  },
  {
    id: "multicloud",
    title: "Multi-cloud & hybrid",
    blurb: "AWS + Azure + GCP. CSA: hybrid policy is the hard part.",
    modules: [
      { title: "Cross-cloud IAM", houseId: "xcloud-iam", labId: "path", level: "Advanced" },
      { title: "Networking & sovereignty", houseId: "xcloud-net", level: "Advanced" },
      { title: "CSPM / governance", houseId: "cspm", level: "Intermediate" },
      { title: "GCP posture", houseId: "gcp-scc", level: "Intermediate" },
      { title: "Azure Defender", houseId: "az-defender", level: "Intermediate" },
    ],
  },
  {
    id: "cnapp",
    title: "CNAPP",
    blurb: "CSPM, CWPP, CIEM, containers, K8s, IaC, runtime — one posture.",
    modules: [
      { title: "CNAPP map", houseId: "cnapp", level: "Beginner" },
      { title: "CIEM", houseId: "ciem", level: "Intermediate" },
      { title: "CWPP / runtime", houseId: "cwpp", level: "Intermediate" },
      { title: "Kubernetes", houseId: "k8s-sec", labId: "k8s", level: "Advanced" },
      { title: "Products (at vendor)", houseId: "cnapp-vendors", level: "Professional" },
    ],
  },
  {
    id: "attackpath",
    title: "Attack-path management",
    blurb: "Not a CVE list. Walk internet → identity → crown jewel.",
    modules: [
      { title: "Attack graphs", houseId: "attack-path", labId: "path", level: "Advanced" },
      { title: "Toxic combinations", houseId: "attack-path", labId: "path", level: "Advanced" },
      { title: "Exposure / CAASM", houseId: "attack-path", level: "Professional" },
    ],
  },
  {
    id: "exposure",
    title: "Exposure management",
    blurb: "Not a vuln scan. EASM, CAASM, business context, exploitability.",
    modules: [
      { title: "EASM", houseId: "easm", labId: "path", level: "Intermediate" },
      { title: "CAASM", houseId: "caasm", level: "Intermediate" },
      { title: "Attack paths", houseId: "attack-path", labId: "path", level: "Advanced" },
    ],
  },
  {
    id: "ctem",
    title: "CTEM",
    blurb: "Discover → Assess → Prioritize → Validate → Remediate → Monitor.",
    modules: [
      { title: "The CTEM loop", houseId: "ctem", labId: "ctem", level: "Professional" },
    ],
  },
  {
    id: "zerotrust",
    title: "Zero Trust",
    blurb: "800-207 as architecture: identity, device, workload, app, then ZTNA.",
    modules: [
      { title: "Architecture (800-207)", houseId: "zt-arch", level: "Beginner" },
      { title: "ZTNA / SASE / SSE", houseId: "ztna", level: "Intermediate" },
      { title: "Microsegmentation", houseId: "microseg", labId: "micro", level: "Advanced" },
      { title: "SP 800-207 film", houseId: "zta", level: "Beginner" },
    ],
  },
  {
    id: "confidential",
    title: "Confidential computing",
    blurb: "Data-in-use. Enclaves, attestation, confidential AI. Gartner 2026.",
    modules: [
      { title: "TEEs & attestation", houseId: "confidential", level: "Advanced" },
    ],
  },
  {
    id: "pqc",
    title: "Post-quantum cybersecurity",
    blurb: "Harvest now, decrypt later. ML-KEM, inventory, migrate PKI/TLS.",
    modules: [
      { title: "Quantum threat", houseId: "shor", level: "Intermediate" },
      { title: "NIST PQC algorithms", houseId: "pq-algs", level: "Advanced" },
      { title: "PQC program", houseId: "pqc", level: "Professional" },
    ],
  },
  {
    id: "deepfake",
    title: "Deepfake & identity fraud",
    blurb: "Voice, video, synthetic ID, executive impersonation. Gartner 2026–27.",
    modules: [
      { title: "Deepfake attacks", houseId: "deepfake", labId: "bec", level: "Intermediate" },
      { title: "BEC", houseId: "bec", labId: "bec", level: "Beginner" },
    ],
  },
  {
    id: "lotc",
    title: "Living off the cloud",
    blurb: "No malware. Stolen tokens, SaaS admin, K8s, legitimate APIs. Google 2026.",
    modules: [
      { title: "Cloud-native abuse", houseId: "lotc", labId: "lotc", level: "Advanced" },
      { title: "SaaS / SSPM", houseId: "saas-sec", level: "Intermediate" },
    ],
  },
  {
    id: "dfir",
    title: "Digital forensics academy",
    blurb: "Preserve, image, timeline. Windows, Linux, memory, cloud, mobile.",
    modules: [
      { title: "Windows / Linux", houseId: "win-dfir", level: "Intermediate" },
      { title: "Cloud / mobile / net", houseId: "cloud-dfir", level: "Advanced" },
      { title: "DFIR fundamentals", houseId: "forensics", level: "Beginner" },
    ],
  },
  {
    id: "devsecops",
    title: "DevSecOps",
    blurb: "Pipeline as attack surface. Scan, provenance, IaC.",
    modules: [
      { title: "CI/CD", houseId: "cicd", level: "Intermediate" },
      { title: "SAST", houseId: "sast-dast", level: "Intermediate" },
      { title: "DAST", houseId: "sast-dast", level: "Intermediate" },
      { title: "SCA", houseId: "sbom", level: "Intermediate" },
      { title: "IaC", houseId: "tf-sec", level: "Advanced" },
      { title: "Supply chain", houseId: "slsa", level: "Advanced" },
    ],
  },
  {
    id: "grc",
    title: "GRC",
    blurb: "How enterprises actually authorize systems.",
    modules: [
      { title: "NIST", houseId: "nist", level: "Beginner" },
      { title: "800-53 control families", houseId: "53fam", level: "Beginner" },
      { title: "800-53B tailoring rationale", houseId: "53b", labId: "ctem", level: "Intermediate" },
      { title: "800-53A assessment methods", houseId: "53a", labId: "ctem", level: "Intermediate" },
      { title: "RMF cycle — other NIST SPs", houseId: "rmf", labId: "ctem", level: "Professional" },
      { title: "RMF", houseId: "80037", labId: "soc", level: "Professional" },
      { title: "FISMA", houseId: "fisma", level: "Professional" },
      { title: "FedRAMP", houseId: "fedramp", level: "Professional" },
      { title: "ISO 27001", houseId: "iso27001", level: "Professional" },
      { title: "CMMC", houseId: "cmmc", level: "Professional" },
    ],
  },
  {
    id: "specialized",
    title: "Specialized",
    blurb: "Malware, DFIR, mobile, IoT, OT, crypto.",
    modules: [
      { title: "Malware", houseId: "malware-fund", level: "Advanced" },
      { title: "Digital forensics", houseId: "forensics", level: "Advanced" },
      { title: "Mobile", houseId: "masvs", level: "Intermediate" },
      { title: "IoT", houseId: "iot", level: "Intermediate" },
      { title: "OT / ICS", houseId: "ics", level: "Professional" },
      { title: "Cryptography", houseId: "crypto-fund", level: "Intermediate" },
    ],
  },
];

export function trackById(id: string) {
  return CYBER_TRACKS.find((t) => t.id === id);
}

export function resolveModule(mod: TrackModule): { house: NetworkHouse | undefined; labId?: string; title: string; level: Level } {
  return { house: houseById(mod.houseId), labId: mod.labId, title: mod.title, level: mod.level };
}
