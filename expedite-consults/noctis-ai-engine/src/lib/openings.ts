import type { TicketId } from "@/lib/hall";
import type { ClinicDeskId } from "@/lib/ingest-sources";

export const RESUME_CLINIC = {
  href: "https://tuhousing.vercel.app/",
  title: "Resume clinic",
  name: "Expedite CareerSuite",
  line: "AI-powered resume tailoring. Fit the stamp to the seat, then apply on the official board.",
};

export const JOB_LAUNCHPAD = {
  href: "https://expedite-consults.vercel.app/launchpad",
  title: "Training Launch pad",
  name: "Expedite Consults",
  line: "Training, then the next seat. Open the Expedite Training Launch pad.",
};

export type OpeningKind = "challenge" | "hire" | "jobs" | "certs" | "boards" | "events" | "scholar" | "rooms" | "tutor";

export const OPENING_TABS: { id: OpeningKind; label: string; hint: string }[] = [
  { id: "challenge", label: "Challenge", hint: "Fifteen minutes, then a stamp" },
  { id: "hire", label: "Hire", hint: "Stamp first. Then the seat." },
  { id: "jobs", label: "Jobs", hint: "Your ticket first. Then the official board." },
  { id: "certs", label: "Certs", hint: "Explore specific certification paths" },
  { id: "boards", label: "Boards", hint: "Check professional licensing boards" },
  { id: "events", label: "Events", hint: "Show up, then stay" },
  { id: "scholar", label: "Scholar", hint: "Money that asks you to learn" },
  { id: "rooms", label: "Rooms", hint: "A bed near the clinic" },
  { id: "tutor", label: "Tutor", hint: "Name the exam. Get a plan." },
];

export type Opening = {
  id: string;
  kind: Exclude<OpeningKind, "tutor">;
  title: string;
  place: string;
  line: string;
  tag: string;
  href?: string;
  postId?: string;
  ticket?: TicketId | "cyber" | "isso";
  board?: string;
  stamp?: string;
};

export const OPENINGS: Opening[] = [
  {
    id: "ch1",
    kind: "challenge",
    title: "Python in 15 minutes",
    place: "Today",
    line: "One loop, one list, one drill. Then the stamp.",
    tag: "Daily",
    postId: "yt2",
  },
  {
    id: "ch2",
    kind: "challenge",
    title: "Name the threat",
    place: "Cyber clinic",
    line: "A packet, a PDF, a control. Fifteen minutes.",
    tag: "Security",
    postId: "pz1",
  },
  {
    id: "ch3",
    kind: "challenge",
    title: "One phrase of Chopin",
    place: "Listen",
    line: "Hear it as a student, not a judge.",
    tag: "Music",
    postId: "mu-zander",
  },
  {
    id: "j-launchpad",
    kind: "jobs",
    title: JOB_LAUNCHPAD.title,
    place: "Expedite Consults · training",
    line: JOB_LAUNCHPAD.line,
    tag: "Jobs",
    href: JOB_LAUNCHPAD.href,
    board: "Expedite Launchpad",
  },
  {
    id: "j-resume",
    kind: "jobs",
    title: "Resume clinic",
    place: "Expedite CareerSuite",
    line: "Tailor the CV to the seat. Then the official board. We do not host applications.",
    tag: "Career",
    href: "https://tuhousing.vercel.app/",
    ticket: "developer",
    board: "CareerSuite",
  },
  {
    id: "j-cisa",
    kind: "jobs",
    title: "CISA cyber / IT intern",
    place: "USAJOBS · paid Pathways",
    line: "Official CISA internships. Apply only when an announcement is live on USAJOBS.",
    tag: "Cyber",
    href: "https://www.cisa.gov/careers/work-rolescyber-and-it-interns",
    ticket: "developer",
    board: "CISA",
    stamp: "Packet ghost",
  },
  {
    id: "j-aws",
    kind: "jobs",
    title: "AWS security roles",
    place: "amazon.jobs · official",
    line: "The AWS clinic stamp is the ticket. Search security on Amazon’s own board.",
    tag: "Cyber",
    href: "https://www.amazon.jobs/en/search?base_query=AWS+security",
    ticket: "developer",
    board: "Amazon.jobs",
    stamp: "AWS Cloud Security",
  },
  {
    id: "j-cisa-jobs",
    kind: "jobs",
    title: "CISA careers",
    place: "USAJOBS via CISA",
    line: "SOC, IR, cloud. Open at CISA, then USAJOBS. We do not copy listings.",
    tag: "Cyber",
    href: "https://www.cisa.gov/careers",
    ticket: "developer",
    board: "CISA",
    stamp: "SOC Investigator",
  },
  {
    id: "j-nist",
    kind: "jobs",
    title: "NIST careers — RMF / research",
    place: "nist.gov/careers",
    line: "Controls, PQC, AI RMF. Official NIST board.",
    tag: "Research",
    href: "https://www.nist.gov/careers",
    ticket: "isso",
    board: "NIST",
    stamp: "CTEM Operator",
  },
  {
    id: "j-ug",
    kind: "jobs",
    title: "USAJOBS — faculty and education",
    place: "usajobs.gov",
    line: "Teaching, training, and federal education seats. Official USAJOBS.",
    tag: "Campus",
    href: "https://www.usajobs.gov/Search/Results?k=education",
    ticket: "faculty",
    board: "USAJOBS",
  },
  {
    id: "j-kbth",
    kind: "jobs",
    title: "Mayo Clinic careers",
    place: "jobs.mayoclinic.org",
    line: "Pharmacy, nursing, and allied health. Official Mayo Clinic board.",
    tag: "Care",
    href: "https://jobs.mayoclinic.org/",
    ticket: "pharmacist",
    board: "Mayo Clinic",
  },
  {
    id: "j-ghs",
    kind: "jobs",
    title: "U.S. Department of Health and Human Services",
    place: "hhs.gov/careers",
    line: "Physicians, nurses, and public health. Official HHS.",
    tag: "Care",
    href: "https://www.hhs.gov/careers/index.html",
    ticket: "physician",
    board: "HHS",
  },
  {
    id: "j-nih",
    kind: "jobs",
    title: "NIH jobs",
    place: "jobs.nih.gov",
    line: "Biologists, clinicians, research. Official NIH.",
    tag: "Research",
    href: "https://www.jobs.nih.gov/",
    ticket: "biologist",
    board: "NIH",
  },
  {
    id: "j-nccer",
    kind: "jobs",
    title: "NCCER craft careers",
    place: "nccer.org",
    line: "Electrician, carpenter, HVAC. Training first, then the board.",
    tag: "Trades",
    href: "https://www.nccer.org/",
    ticket: "electrician",
    board: "NCCER",
  },
  {
    id: "j-ibew",
    kind: "jobs",
    title: "IBEW — become an electrician",
    place: "ibew.org/join",
    line: "Apprenticeship is the door. Official IBEW.",
    tag: "Trades",
    href: "https://www.ibew.org/join",
    ticket: "electrician",
    board: "IBEW",
  },
  {
    id: "j-hvac",
    kind: "jobs",
    title: "HVAC Excellence careers",
    place: "hvacexcellence.org",
    line: "The clinic taught the ticket. This is the trade board.",
    tag: "Trades",
    href: "https://www.hvacexcellence.org/",
    ticket: "carpenter",
    board: "HVAC Excellence",
  },
  {
    id: "j-teacher",
    kind: "jobs",
    title: "USAJOBS — teachers",
    place: "usajobs.gov",
    line: "Teaching seats on the federal board. Official USAJOBS, not a social-media advert.",
    tag: "Classroom",
    href: "https://www.usajobs.gov/Search/Results?k=teacher",
    ticket: "teacher",
    board: "USAJOBS",
  },
  {
    id: "j-usajobs-dev",
    kind: "jobs",
    title: "USAJOBS — software / cyber",
    place: "usajobs.gov",
    line: "Federal developer and cyber roles. Official USAJOBS search.",
    tag: "Builders",
    href: "https://www.usajobs.gov/Search/Results?k=cybersecurity",
    ticket: "developer",
    board: "USAJOBS",
  },
  {
    id: "c-secplus",
    kind: "certs",
    title: "CompTIA Security+",
    place: "comptia.org",
    line: "Core cyber cert. Open at CompTIA. We do not sell vouchers.",
    tag: "Cyber",
    href: "https://www.comptia.org/certifications/security",
    ticket: "developer",
    board: "CompTIA",
    stamp: "Packet ghost",
  },
  {
    id: "c-cysa",
    kind: "certs",
    title: "CompTIA CySA+",
    place: "comptia.org",
    line: "SOC analyst path after Security+.",
    tag: "Cyber",
    href: "https://www.comptia.org/certifications/cybersecurity-analyst",
    ticket: "developer",
    board: "CompTIA",
    stamp: "SOC Investigator",
  },
  {
    id: "c-aws-sec",
    kind: "certs",
    title: "AWS Certified Security — Specialty",
    place: "aws.amazon.com/certification",
    line: "After the AWS clinic. Official AWS cert.",
    tag: "Cyber",
    href: "https://aws.amazon.com/certification/certified-security-specialty/",
    ticket: "developer",
    board: "AWS",
    stamp: "AWS Cloud Security",
  },
  {
    id: "c-cisa",
    kind: "certs",
    title: "ISACA CISA requirements",
    place: "isaca.org",
    line: "Auditor cert — not CISA.gov. Five years, 150 items, five domains.",
    tag: "Cyber",
    href: "/hub/cert/cisa",
    ticket: "developer",
    board: "ISACA",
    stamp: "SOC Investigator",
  },
  {
    id: "c-cissp",
    kind: "certs",
    title: "CISSP exam details",
    place: "isc2.org",
    line: "Eight domains, CAT, experience rule. We map the outline. Exam items stay at ISC2.",
    tag: "Cyber",
    href: "/hub/cert/cissp",
    ticket: "developer",
    board: "(ISC)²",
  },
  {
    id: "c-ccsp",
    kind: "certs",
    title: "CCSP — cloud security",
    place: "isc2.org",
    line: "Cloud security professional. Official (ISC)².",
    tag: "Cyber",
    href: "https://www.isc2.org/certifications/ccsp",
    ticket: "developer",
    board: "(ISC)²",
    stamp: "Path Walker",
  },
  {
    id: "c-cmmc",
    kind: "certs",
    title: "CMMC assessor path",
    place: "dodcio.defense.gov",
    line: "DoD contractor cybersecurity. Open at the official CMMC page.",
    tag: "GRC",
    href: "https://www.acq.osd.mil/cmmc/",
    ticket: "isso",
    board: "DoD CMMC",
  },
  {
    id: "c-nclex",
    kind: "certs",
    title: "NCLEX",
    place: "ncsbn.org",
    line: "Nursing licensure exam. Official NCSBN.",
    tag: "Care",
    href: "https://www.ncsbn.org/nclex.htm",
    ticket: "physician",
    board: "NCSBN",
  },
  {
    id: "c-ptcb",
    kind: "certs",
    title: "Pharmacy Technician Certification",
    place: "ptcb.org",
    line: "PTCB. Then the national pharmacy council for the license.",
    tag: "Care",
    href: "https://www.ptcb.org/",
    ticket: "pharmacist",
    board: "PTCB",
  },
  {
    id: "c-nccer",
    kind: "certs",
    title: "NCCER certification paths",
    place: "nccer.org",
    line: "Electrician, carpenter, HVAC — levels 1–4. Open the craft map here, then NCCER.",
    tag: "Trades",
    href: "/hub/cert/nccer",
    ticket: "electrician",
    board: "NCCER",
  },
  {
    id: "c-ase",
    kind: "certs",
    title: "ASE auto certification",
    place: "ase.com",
    line: "Automotive service. Official ASE.",
    tag: "Trades",
    href: "https://www.ase.com/",
    ticket: "carpenter",
    board: "ASE",
  },
  {
    id: "b-pcg",
    kind: "boards",
    title: "NABP — U.S. boards of pharmacy",
    place: "nabp.pharmacy",
    line: "Pharmacist license. Find your state board. Official NABP.",
    tag: "Care",
    href: "https://nabp.pharmacy/",
    ticket: "pharmacist",
    board: "NABP",
  },
  {
    id: "b-mdc",
    kind: "boards",
    title: "FSMB — U.S. medical boards",
    place: "fsmb.org",
    line: "Physician license. Official Federation of State Medical Boards.",
    tag: "Care",
    href: "https://www.fsmb.org/",
    ticket: "physician",
    board: "FSMB",
  },
  {
    id: "b-nmc",
    kind: "boards",
    title: "State boards of nursing",
    place: "ncsbn.org",
    line: "Nurse and midwife license. Pick your state. Official NCSBN.",
    tag: "Care",
    href: "https://www.ncsbn.org/membership/board-profiles.page",
    ticket: "physician",
    board: "State board of nursing",
  },
  {
    id: "b-ncsbn",
    kind: "boards",
    title: "NCSBN — U.S. nursing boards",
    place: "ncsbn.org",
    line: "Find your state board. Official NCSBN.",
    tag: "Care",
    href: "https://www.ncsbn.org/",
    ticket: "physician",
    board: "NCSBN",
  },
  {
    id: "b-energy",
    kind: "boards",
    title: "U.S. Department of Labor — electrician apprenticeship",
    place: "apprenticeship.gov",
    line: "The apprenticeship, then the state electrical license. Official Apprenticeship.gov.",
    tag: "Trades",
    href: "https://www.apprenticeship.gov/career-seekers",
    ticket: "electrician",
    board: "U.S. DOL",
  },
  {
    id: "b-nccer-lic",
    kind: "boards",
    title: "NCCER — trade credentials",
    place: "nccer.org",
    line: "Carpenter and construction credentials recognized by many boards.",
    tag: "Trades",
    href: "https://www.nccer.org/",
    ticket: "carpenter",
    board: "NCCER",
  },
  {
    id: "b-ges",
    kind: "boards",
    title: "NASDTEC — U.S. teacher licensure",
    place: "nasdtec.net",
    line: "Teacher certification. Find your state. Official NASDTEC.",
    tag: "Classroom",
    href: "https://www.nasdtec.net/",
    ticket: "teacher",
    board: "NASDTEC",
  },
  {
    id: "b-isaca",
    kind: "boards",
    title: "ISACA",
    place: "isaca.org",
    line: "CISA, CISM, CRISC. Official ISACA — not the U.S. cyber agency.",
    tag: "Cyber",
    href: "https://www.isaca.org/",
    ticket: "developer",
    board: "ISACA",
  },
  {
    id: "b-isc2",
    kind: "boards",
    title: "(ISC)²",
    place: "isc2.org",
    line: "CISSP and CCSP maintaining body.",
    tag: "Cyber",
    href: "https://www.isc2.org/",
    ticket: "developer",
    board: "(ISC)²",
  },
  {
    id: "e1",
    kind: "events",
    title: "KubeCon + CloudNativeCon",
    place: "CNCF · recorded + upcoming",
    line: "Official CNCF events. We do not scrape talks.",
    tag: "Clinic",
    href: "https://www.cncf.io/kubecon-cloudnativecon-events/",
  },
  {
    id: "e2",
    kind: "events",
    title: "RSA Conference",
    place: "rsaconference.com",
    line: "Security keynotes. Open at RSA.",
    tag: "Jobs",
    href: "https://www.rsaconference.com/",
  },
  {
    id: "e3",
    kind: "events",
    title: "Highlife + history night",
    place: "Night Market",
    line: "Listen first. Then the Ghana story.",
    tag: "Listen",
    postId: "mu-hiplife",
  },
  {
    id: "e4",
    kind: "events",
    title: "Black Hat",
    place: "blackhat.com",
    line: "Briefings the conference publishes. Open at Black Hat.",
    tag: "Research",
    href: "https://www.blackhat.com/",
  },
  {
    id: "s1",
    kind: "scholar",
    title: "Federal Student Aid",
    place: "studentaid.gov",
    line: "Pell Grants and federal student loans. Official U.S. Department of Education. No agents.",
    tag: "Grant",
    href: "https://studentaid.gov/",
  },
  {
    id: "s2",
    kind: "scholar",
    title: "NSF Graduate Research Fellowship",
    place: "nsfgrfp.org",
    line: "Official NSF. Research first, then the lab.",
    tag: "Fellow",
    href: "https://www.nsfgrfp.org/",
  },
  {
    id: "s3",
    kind: "scholar",
    title: "Fulbright U.S. Student Program",
    place: "us.fulbrightonline.org",
    line: "Official Fulbright. The process is free. No intermediaries.",
    tag: "Grant",
    href: "https://us.fulbrightonline.org/",
  },
  {
    id: "r1",
    kind: "rooms",
    title: "HUD — housing help",
    place: "hud.gov",
    line: "Official U.S. housing programs. We do not list private rooms.",
    tag: "Housing",
    href: "https://www.hud.gov/",
  },
];

export const TUTOR_HINTS = [
  "Organic chemistry exam tomorrow",
  "Zero trust in one sitting",
  "Python loops before the lab",
  "Luke 1–9, the mission first",
  "The pentatonic, then jazz",
];

export function scoreOpening(row: Opening, ticket: TicketId, stamps: string[]) {
  let n = 0;
  if (row.ticket === ticket) n += 8;
  if (row.stamp && stamps.includes(row.stamp)) n += 12;
  if (ticket === "pharmacist" && row.ticket === "pharmacist") n += 4;
  if (ticket === "electrician" && (row.ticket === "electrician" || row.ticket === "carpenter")) n += 3;
  if (ticket === "developer" && row.tag === "Cyber") n += 2;
  return n;
}

export function openingsFor(kind: Exclude<OpeningKind, "tutor">, ticket: TicketId, stamps: string[]) {
  const rows = OPENINGS.filter((o) => o.kind === kind);
  if (kind !== "jobs" && kind !== "certs" && kind !== "boards") return rows;
  const ranked = [...rows].sort((a, b) => scoreOpening(b, ticket, stamps) - scoreOpening(a, ticket, stamps));
  if (kind !== "jobs") return ranked;
  const pin = ranked.filter((row) => row.id === "j-launchpad");
  return [...pin, ...ranked.filter((row) => row.id !== "j-launchpad")];
}

export function openingDesk(row: Opening): ClinicDeskId | null {
  const hay = `${row.tag} ${row.title} ${row.place} ${row.ticket ?? ""} ${row.stamp ?? ""}`.toLowerCase();
  if (/cyber|nist|cisa|aws|security|packet|rmf|soc/.test(hay)) return "cyber";
  if (/care|health|nurse|physician|pharmacy|kbth|ghs|nih|hopkins/.test(hay)) return "care";
  if (/campus|university|faculty|ghana/.test(hay)) return "campus";
  if (/research/.test(hay)) return "research";
  if (/career|resume|launchpad/.test(hay)) return "career";
  if (/music|chopin|jazz/.test(hay)) return "arts";
  if (/python|code|cs50/.test(hay)) return "code";
  if (/trade|electric|carpenter/.test(hay)) return "trades";
  if (/business|llc|startup/.test(hay)) return "business";
  if (/cloud|vpc|iam/.test(hay)) return "cloud";
  if (/\bdata\b|sql/.test(hay)) return "data";
  if (/teach|tutor|exam/.test(hay)) return "teach";
  return null;
}

export function openingsForHall(kind: Exclude<OpeningKind, "tutor">, ticket: TicketId, stamps: string[], desk: ClinicDeskId | "all") {
  const rows = openingsFor(kind, ticket, stamps);
  if (desk === "all") return rows;
  const hit = rows.filter((o) => openingDesk(o) === desk);
  return hit.length ? hit : rows;
}
