import { MUSIC_POSTS } from "@/lib/music-feed";
import { STUDY_POSTS } from "@/lib/study-desk";
import { isAiClip } from "@/lib/ai-cut";
import { hymnSeedPosts } from "@/lib/hymn-desk";

export type CurriculumFilm = {
  id: string;
  trackId: string;
  title: string;
  house: string;
  youtubeId: string;
  href: string;
  mediaUrl?: string;
  posterUrl?: string;
};

function film(
  id: string,
  trackId: string,
  title: string,
  house: string,
  youtubeId: string,
  href: string,
): CurriculumFilm {
  return { id, trackId, title, house, youtubeId, href };
}

function mp4Film(
  id: string,
  trackId: string,
  title: string,
  house: string,
  mediaUrl: string,
  posterUrl: string,
  href: string,
): CurriculumFilm {
  return { id, trackId, title, house, youtubeId: "", href, mediaUrl, posterUrl };
}

export const CURRICULUM_FILMS: CurriculumFilm[] = [
  mp4Film("mp4-foundations", "foundations", "CS & Systems Foundations — Open Course Lab (Direct MP4)", "MIT OpenCourseWare · Archive", "/media/clips/skill_passport.mp4", "/media/images/agentic_ai_Banner.png", "https://ocw.mit.edu/"),
  mp4Film("mp4-defensive", "defensive", "SOC Telemetry & Incident Response Drill (Direct MP4)", "CISA · NIST", "/media/clips/scenario_drill.mp4", "/media/images/sec_ops.png", "https://www.cisa.gov/topics/cyber-threats-and-advisories/incident-response"),
  mp4Film("mp4-cloud", "cloud", "Cloud & Kubernetes Runtime Security Lab (Direct MP4)", "CNCF · Cloud Native", "/media/clips/k8s_ebpf.mp4", "/media/images/cloud_native.png", "https://www.cncf.io/"),
  mp4Film("mp4-offensive", "offensive", "Authorized Pentest & MITRE ATT&CK Path Walkthrough (Direct MP4)", "MITRE · OWASP", "/media/clips/mitre_attack.mp4", "/media/images/sec_ops.png", "https://attack.mitre.org/"),
  mp4Film("mp4-nhi", "nhi", "Non-Human Identities, Passkeys & Least-Privilege Lab (Direct MP4)", "FIDO · CISA", "/media/clips/skill_passport.mp4", "/media/images/agentic_ai_Banner.png", "https://fidoalliance.org/passkeys/"),
  mp4Film("mp4-ai", "ai", "AI Risk Management & Model Telemetry Briefing (Direct MP4)", "NIST AI RMF", "/media/clips/agentic_flywheel.mp4", "/media/images/agentic_ai_Banner.png", "https://www.nist.gov/itl/ai-risk-management-framework"),
  mp4Film("mp4-agents", "agents", "Autonomous Agentic Security & Tool-Call Guardrails (Direct MP4)", "OWASP GenAI · NIST", "/media/clips/agentic_flywheel.mp4", "/media/images/agentic_ai_Banner.png", "https://genai.owasp.org/"),
  mp4Film("mp4-cnapp", "cnapp", "eBPF Kernel Telemetry & Container Runtime Enforcement (Direct MP4)", "CNCF · Falco", "/media/clips/k8s_ebpf.mp4", "/media/images/cloud_native.png", "https://falco.org/"),
  mp4Film("mp4-multicloud", "multicloud", "Multi-Cloud Control Plane & Federation Lab (Direct MP4)", "Cloud Security Lab", "/media/clips/k8s_ebpf.mp4", "/media/images/cloud_native.png", "https://www.nist.gov/cyberframework"),
  mp4Film("mp4-api", "api", "API Object-Level Authorization & Secure-by-Design Lab (Direct MP4)", "OWASP API · CISA", "/media/clips/scenario_drill.mp4", "/media/images/sec_ops.png", "https://owasp.org/www-project-api-security/"),
  mp4Film("mp4-supply", "supply", "SBOM Provenance & Software Supply Chain Defense (Direct MP4)", "CISA · SLSA", "/media/clips/skill_passport.mp4", "/media/images/agentic_ai_Banner.png", "https://www.cisa.gov/sbom"),
  mp4Film("mp4-ai-supply", "ai-supply", "Model Weights, Datasets & AI Supply Chain Verification (Direct MP4)", "OWASP GenAI", "/media/clips/agentic_flywheel.mp4", "/media/images/agentic_ai_Banner.png", "https://genai.owasp.org/"),
  mp4Film("mp4-grc", "grc", "NIST CSF 2.0 & RMF Governance Walkthrough (Direct MP4)", "NIST · CSRC", "/media/clips/loc_screening.mp4", "/media/images/sec_ops.png", "https://www.nist.gov/cyberframework"),
  mp4Film("mp4-devsecops", "devsecops", "CI/CD Pipeline Hardening & Runtime Admission Control (Direct MP4)", "CNCF · OWASP", "/media/clips/k8s_ebpf.mp4", "/media/images/cloud_native.png", "https://owasp.org/www-project-top-10-ci-cd-security-risks/"),
  mp4Film("mp4-attackpath", "attackpath", "Choke Points & Lateral Movement Graph Analysis (Direct MP4)", "MITRE ATT&CK", "/media/clips/mitre_attack.mp4", "/media/images/sec_ops.png", "https://attack.mitre.org/"),
  mp4Film("mp4-ctem", "ctem", "Continuous Threat Exposure Management Drill (Direct MP4)", "NIST · CISA", "/media/clips/scenario_drill.mp4", "/media/images/sec_ops.png", "https://www.nist.gov/cyberframework"),
  mp4Film("mp4-zerotrust", "zerotrust", "NIST SP 800-207 Zero Trust Architecture Lab (Direct MP4)", "NIST", "/media/clips/k8s_ebpf.mp4", "/media/images/cloud_native.png", "https://www.nist.gov/publications/zero-trust-architecture"),
  mp4Film("mp4-dfir", "dfir", "Forensic Evidence Preservation & Timeline Reconstruction (Direct MP4)", "CISA · DFIR", "/media/clips/scenario_drill.mp4", "/media/images/sec_ops.png", "https://www.cisa.gov/"),
  mp4Film("mp4-lotc", "lotc", "Living-Off-The-Cloud API Telemetry & Detection (Direct MP4)", "MITRE · Cloud SOC", "/media/clips/mitre_attack.mp4", "/media/images/sec_ops.png", "https://attack.mitre.org/"),
  mp4Film("mp4-exposure", "exposure", "External Attack Surface & Reachability Verification (Direct MP4)", "MITRE · CISA", "/media/clips/mitre_attack.mp4", "/media/images/sec_ops.png", "https://attack.mitre.org/"),
  mp4Film("mp4-pqc", "pqc", "Post-Quantum Cryptography Migration & Lattice Standards (Direct MP4)", "NIST CSRC", "/media/clips/loc_screening.mp4", "/media/images/sec_ops.png", "https://csrc.nist.gov/projects/post-quantum-cryptography"),
  mp4Film("mp4-deepfake", "deepfake", "Synthetic Media & Identity Provenance Defense (Direct MP4)", "CISA · NIST", "/media/clips/agentic_flywheel.mp4", "/media/images/agentic_ai_Banner.png", "https://www.cisa.gov/"),
  mp4Film("mp4-specialized", "specialized", "Embedded, OT & Safety-Critical Systems Engineering (Direct MP4)", "NASA · NIST", "/media/clips/nasa_space.mp4", "/media/images/cloud_native.png", "https://ntrs.nasa.gov/"),
  mp4Film("mp4-confidential", "confidential", "Confidential Computing & Enclave Memory Protection (Direct MP4)", "NIST · CNCF", "/media/clips/k8s_ebpf.mp4", "/media/images/cloud_native.png", "https://www.nist.gov/cyberframework"),

  film("mit-py", "foundations", "MIT OCW — Introduction to Computer Science and Programming", "MIT OpenCourseWare", "k6U-i4gXkLM", "https://ocw.mit.edu/"),
  film("cs50", "foundations", "Harvard CS50 — Lecture 0", "Harvard", "IDDmrzzB14M", "https://cs50.harvard.edu/"),
  film("khan-cs", "foundations", "Khan Academy — Computing", "Khan Academy", "kpCJyQ2usJ4", "https://www.khanacademy.org/computing"),
  film("nist-csf", "foundations", "NIST Cybersecurity Framework", "NIST", "pPPiaGU12Og", "https://www.nist.gov/cyberframework"),
  film("cisa-phish", "foundations", "CISA — How attacks actually land", "CISA", "6UzRjq12VQg", "https://www.cisa.gov/"),

  film("mitre", "defensive", "MITRE ATT&CK — tactics and techniques", "MITRE", "Yxv1suJYMI8", "https://attack.mitre.org/"),
  film("guardduty", "defensive", "Amazon GuardDuty — cloud detection", "AWS", "ng14ToMXnTA", "https://aws.amazon.com/guardduty/"),
  film("cisa-ir", "defensive", "CISA — incident response", "CISA", "6UzRjq12VQg", "https://www.cisa.gov/topics/cyber-threats-and-advisories/incident-response"),

  film("aws-iam", "cloud", "AWS IAM — least privilege", "AWS", "qsF6Kauh2J4", "https://aws.amazon.com/iam/"),
  film("aws-sso", "cloud", "AWS IAM Identity Center", "AWS", "4yJp5-jGGNk", "https://aws.amazon.com/iam/identity-center/"),
  film("az-zt", "cloud", "Microsoft — Zero Trust", "Microsoft", "PitpSDmUaXE", "https://learn.microsoft.com/en-us/azure/security/fundamentals/zero-trust"),
  film("gcp-scc", "cloud", "Google Cloud Security Command Center", "Google Cloud", "oL8nB5GHbd0", "https://cloud.google.com/security-command-center"),
  film("k8s", "cloud", "CNCF — Kubernetes security", "CNCF", "xdizlpIdrYw", "https://www.cncf.io/"),

  film("owasp-web", "offensive", "NIST CSF — Identify before you test", "NIST", "pPPiaGU12Og", "https://owasp.org/www-project-web-security-testing-guide/"),
  film("cisa-scope", "offensive", "CISA — authorized defense", "CISA", "6UzRjq12VQg", "https://www.cisa.gov/"),
  film("pt-net", "offensive", "MITRE ATT&CK — network as a map", "MITRE", "Yxv1suJYMI8", "https://attack.mitre.org/"),
  film("pt-sast", "offensive", "MIT — then you read the code (SAST)", "MIT OpenCourseWare", "k6U-i4gXkLM", "https://owasp.org/www-community/Source_Code_Analysis_Tools"),
  film("pt-api", "offensive", "IAM is not API authorization", "AWS", "qsF6Kauh2J4", "https://owasp.org/www-project-api-security/"),
  film("pt-k8s", "offensive", "CNCF — cluster is in scope when the ROE says so", "CNCF", "xdizlpIdrYw", "https://www.cncf.io/"),

  film("mfa", "nhi", "CISA — phishing-resistant MFA", "CISA", "XIlF2qkav5c", "https://www.cisa.gov/MFA"),
  film("passkeys", "nhi", "FIDO Alliance — passkeys", "FIDO Alliance", "J60U2Gs83IE", "https://fidoalliance.org/passkeys/"),
  film("iam-nhi", "nhi", "AWS IAM — identities and keys", "AWS", "qsF6Kauh2J4", "https://aws.amazon.com/iam/"),

  film("ai-guard", "ai", "GuardDuty for AI workloads", "AWS", "OTIbLAzVYyQ", "https://aws.amazon.com/guardduty/"),
  film("ai-nist", "ai", "NIST CSF — govern the model", "NIST", "pPPiaGU12Og", "https://www.nist.gov/itl/ai-risk-management-framework"),

  film("agent-ai", "agents", "GuardDuty — AI stacks", "AWS", "OTIbLAzVYyQ", "https://genai.owasp.org/"),
  film("agent-csf", "agents", "NIST — Govern before you automate", "NIST", "pPPiaGU12Og", "https://www.nist.gov/cyberframework"),

  film("falco", "cnapp", "Falco — runtime security", "CNCF", "DNQdqDr7DhM", "https://falco.org/"),
  film("k8s-cnapp", "cnapp", "Kubernetes security defaults", "CNCF", "xdizlpIdrYw", "https://kubernetes.io/docs/concepts/security/"),

  film("multicloud-gcp", "multicloud", "GCP Security Command Center", "Google Cloud", "oL8nB5GHbd0", "https://cloud.google.com/security-command-center"),
  film("multicloud-az", "multicloud", "Azure Zero Trust", "Microsoft", "PitpSDmUaXE", "https://learn.microsoft.com/en-us/azure/security/fundamentals/zero-trust"),
  film("multicloud-aws", "multicloud", "AWS IAM Identity Center", "AWS", "4yJp5-jGGNk", "https://aws.amazon.com/iam/identity-center/"),

  film("api-iam", "api", "IAM is not authorization", "AWS", "qsF6Kauh2J4", "https://owasp.org/www-project-api-security/"),
  film("api-cisa", "api", "CISA Secure by Design", "CISA", "6UzRjq12VQg", "https://www.cisa.gov/securebydesign"),

  film("supply-cisa", "supply", "CISA — software supply chain", "CISA", "6UzRjq12VQg", "https://www.cisa.gov/sbom"),
  film("supply-mit", "supply", "MIT — read the code you depend on", "MIT OpenCourseWare", "k6U-i4gXkLM", "https://ocw.mit.edu/"),

  film("aisupply", "ai-supply", "AI workload detection", "AWS", "OTIbLAzVYyQ", "https://genai.owasp.org/"),

  film("grc-nist", "grc", "NIST Cybersecurity Framework", "NIST", "pPPiaGU12Og", "https://www.nist.gov/cyberframework"),
  film("grc-cisa", "grc", "CISA — federal cyber", "CISA", "6UzRjq12VQg", "https://www.cisa.gov/"),

  film("devsec-iam", "devsecops", "IAM in the pipeline", "AWS", "qsF6Kauh2J4", "https://owasp.org/www-project-top-10-ci-cd-security-risks/"),
  film("devsec-k8s", "devsecops", "Kubernetes as the deploy target", "CNCF", "xdizlpIdrYw", "https://www.cncf.io/"),

  film("path-mitre", "attackpath", "MITRE ATT&CK as a map", "MITRE", "Yxv1suJYMI8", "https://attack.mitre.org/"),
  film("ctem-nist", "ctem", "CSF — continuous, not annual", "NIST", "pPPiaGU12Og", "https://www.nist.gov/cyberframework"),
  film("zt-az", "zerotrust", "Zero Trust explained", "Microsoft", "PitpSDmUaXE", "https://www.nist.gov/publications/zero-trust-architecture"),
  film("dfir-cisa", "dfir", "Preserve, then analyze", "CISA", "6UzRjq12VQg", "https://www.cisa.gov/"),
  film("lotc-gd", "lotc", "Living in legitimate cloud APIs", "AWS", "ng14ToMXnTA", "https://aws.amazon.com/guardduty/"),
  film("exposure-mitre", "exposure", "ATT&CK — what is actually exposed", "MITRE", "Yxv1suJYMI8", "https://attack.mitre.org/"),
  film("pqc-nist", "pqc", "NIST — the next crypto", "NIST", "pPPiaGU12Og", "https://csrc.nist.gov/projects/post-quantum-cryptography"),
  film("deepfake-cisa", "deepfake", "CISA — identity fraud", "CISA", "XIlF2qkav5c", "https://www.cisa.gov/"),
  film("spec-cs50", "specialized", "How software is built — then how it breaks", "Harvard CS50", "IDDmrzzB14M", "https://cs50.harvard.edu/"),
  film("conf-nist", "confidential", "CSF — data in use", "NIST", "pPPiaGU12Og", "https://www.nist.gov/cyberframework"),
];

export const CAMPUS_FILMS: CurriculumFilm[] = [
  mp4Film("campus-mp4-loc", "campus", "Library of Congress — National Screening Room (Direct MP4)", "Library of Congress", "/media/clips/loc_screening.mp4", "/media/images/sec_ops.png", "https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com"),
  mp4Film("campus-mp4-nasa", "campus", "NASA & Internet Archive — Orbital Telemetry & Flight Reel (Direct MP4)", "NASA · Internet Archive", "/media/clips/nasa_space.mp4", "/media/images/cloud_native.png", "https://archive.org/details/movies?utm_source=chatgpt.com"),
  mp4Film("campus-mp4-jhu", "campus", "Clinical & Biomedical Laboratory Walkthrough (Direct MP4)", "Johns Hopkins · NIH", "/media/clips/clinical_lab.mp4", "/media/images/clinical_ Pearl.png", "https://www.hopkinsmedicine.org/"),
  mp4Film("campus-mp4-mitre", "campus", "MITRE ATT&CK & Cyber Defense Briefing (Direct MP4)", "MITRE · NIST", "/media/clips/mitre_attack.mp4", "/media/images/sec_ops.png", "https://attack.mitre.org/"),
  film("campus-mit", "campus", "MIT OpenCourseWare", "MIT", "k6U-i4gXkLM", "https://ocw.mit.edu/"),
  film("campus-harvard", "campus", "Harvard CS50", "Harvard", "IDDmrzzB14M", "https://cs50.harvard.edu/"),
  film("campus-yale", "campus", "Yale Open Courses", "Yale", "P3FKHH2RzjI", "https://oyc.yale.edu/"),
  film("campus-oxford", "campus", "University of Oxford", "Oxford", "AufmV0P6mA0", "https://www.ox.ac.uk/"),
  film("campus-jhu", "campus", "Johns Hopkins Medicine", "Johns Hopkins", "ewHZm8ylly0", "https://www.hopkinsmedicine.org/"),
  film("campus-nih", "campus", "NIH research", "NIH", "ID-udHCLOKU", "https://www.nih.gov/"),
  film("campus-cern", "campus", "CERN — open science", "CERN", "UDoIzvKumGI", "https://home.cern/"),
  film("campus-nasa", "campus", "NASA missions", "NASA", "1C_zuHf6lP4", "https://www.nasa.gov/"),
  film("campus-nist", "campus", "NIST Cybersecurity Framework", "NIST", "pPPiaGU12Og", "https://www.nist.gov/cyberframework"),
  film("campus-cisa", "campus", "CISA — public cyber", "CISA", "6UzRjq12VQg", "https://www.cisa.gov/"),
];

const OWNED_ELSEWHERE = new Set(
  [...STUDY_POSTS, ...MUSIC_POSTS, ...hymnSeedPosts()].map((post) => post.youtubeId).filter((id): id is string => Boolean(id)),
);

const FIRST_TRACK = new Map<string, string>();
for (const film of CURRICULUM_FILMS) {
  if (!film.youtubeId) continue;
  if (OWNED_ELSEWHERE.has(film.youtubeId) || FIRST_TRACK.has(film.youtubeId)) continue;
  FIRST_TRACK.set(film.youtubeId, film.trackId);
}

export function filmsForTrack(trackId: string) {
  return CURRICULUM_FILMS.filter(
    (film) =>
      film.trackId === trackId &&
      (Boolean(film.mediaUrl) || FIRST_TRACK.get(film.youtubeId) === trackId) &&
      !isAiClip({ id: film.id, caption: `${film.title} ${film.house}`, teach: { stamp: film.trackId, hook: film.title } }),
  );
}

export function campusFilms() {
  const seen = new Set<string>();
  return CAMPUS_FILMS.filter((film) => {
    if (film.mediaUrl) {
      if (seen.has(film.id)) return false;
      seen.add(film.id);
      return true;
    }
    if (OWNED_ELSEWHERE.has(film.youtubeId) || FIRST_TRACK.has(film.youtubeId) || seen.has(film.youtubeId)) return false;
    seen.add(film.youtubeId);
    return true;
  });
}

export function filmById(id: string) {
  const film = [...CURRICULUM_FILMS, ...CAMPUS_FILMS].find((f) => f.id === id);
  if (!film || isAiClip({ id: film.id, caption: `${film.title} ${film.house}`, teach: { stamp: film.trackId, hook: film.title } })) return undefined;
  return film;
}