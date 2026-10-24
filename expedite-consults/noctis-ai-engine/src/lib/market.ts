import { SOURCE, SOURCE_HREF } from "@/lib/source";

export type MarketShelf = "study" | "software" | "training";

export type MarketItem = {
  id: string;
  shelf: MarketShelf;
  title: string;
  line: string;
  price: number;
  unit: string;
  href?: string;
};

export const MARKET_SHELVES: { id: MarketShelf | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "software", label: "Software" },
  { id: "training", label: "Training" },
];

export const MARKET_ITEMS: MarketItem[] = [
  {
    id: "nist-pack",
    shelf: "study",
    title: "NIST 800-53 study pack",
    line: "The catalog, 53B tailoring, 53A methods, and the artifact each control family expects.",
    price: 89,
    unit: "seat",
  },
  {
    id: "rmf-book",
    shelf: "study",
    title: "RMF stage workbook",
    line: "Prepare through monitor. One page per stage, with the FIPS and SPs that apply.",
    price: 69,
    unit: "seat",
  },
  {
    id: "pentest-notes",
    shelf: "study",
    title: "Pentest field notes",
    line: "Scope, recon, SearchSploit, GHDB, then the report a client can read.",
    price: 79,
    unit: "seat",
  },
  {
    id: "resume",
    shelf: "study",
    title: "CareerSuite resume clinic",
    line: "Tailor the resume to the stamp and the seat you are applying for.",
    price: 49,
    unit: "pass",
    href: "https://tuhousing.vercel.app/",
  },
  {
    id: "grc",
    shelf: "software",
    title: "GRC desk",
    line: "Controls, POA&M, and the ATO package on one desk. A seat, not a download of someone else's course.",
    price: 240,
    unit: "seat / year",
    href: "https://18-unified-integration-layer.vercel.app/",
  },
  {
    id: "sast",
    shelf: "software",
    title: "AXIOM NG-SAST",
    line: "Static analysis and a written fix. Practice on the range repo only.",
    price: 180,
    unit: "seat / year",
    href: "https://05-sast-platform.vercel.app/",
  },
  {
    id: "dast",
    shelf: "software",
    title: "AXIOM DAST",
    line: "Run the app, then name what the scanner actually proved.",
    price: 180,
    unit: "seat / year",
    href: "https://11-dast-security-platform.vercel.app/",
  },
  {
    id: "suite",
    shelf: "software",
    title: "AXIOM suite",
    line: "SAST, DAST, SCA, secrets, cloud, and the GRC desk. One bill for the lab.",
    price: 960,
    unit: "lab / year",
  },
  {
    id: "launchpad",
    shelf: "training",
    title: "Digital Ecosystem Launchpad",
    line: "The live desk: mission control, the cyber platforms, Strike, TruePlace, Sphera, and ConnectIn.",
    price: 320,
    unit: "cohort seat",
    href: "https://expedite-consults.vercel.app/launchpad",
  },
  {
    id: "range-week",
    shelf: "training",
    title: "Range week",
    line: "Five days on the cyber range. Evidence in, score out, feedback on the finding.",
    price: 450,
    unit: "week",
  },
  {
    id: "nist-cohort",
    shelf: "training",
    title: "NIST academy cohort",
    line: "CSF, RMF, and 800-53 taught as one path. A small room, not a recording.",
    price: 540,
    unit: "cohort seat",
  },
];

export const SELLER = SOURCE;
export const SELLER_HREF = SOURCE_HREF;

export function marketMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export const LAUNCHPAD_HREF = "https://ecosystem-launchpad.vercel.app";

export type LaunchProduct = { title: string; href: string; line: string };

export const VERIFIED_LIVE: LaunchProduct[] = [
  {
    title: "Gospel Music",
    href: "https://portal.expediteconsults.com/feed?tab=GOSPEL&sub=music",
    line: "The gospel sub-menu on the portal feed.",
  },
  {
    title: "Mirror Gospel Music",
    href: "https://expedite-consults.vercel.app/feed?tab=GOSPEL&sub=music",
    line: "The same gospel room on the Expedite mirror.",
  },
  {
    title: "Gospel Hub",
    href: "https://portal.expediteconsults.com/feed",
    line: "The portal feed, with the gospel hub on it.",
  },
  {
    title: "Spaces and live audio",
    href: "https://expedite-consults.vercel.app/spaces",
    line: "Rooms and live audio.",
  },
  {
    title: "Direct messages",
    href: "https://expedite-consults.vercel.app/messages",
    line: "A conversation, not a comment thread.",
  },
  {
    title: "Ecosystem Launchpad",
    href: LAUNCHPAD_HREF,
    line: "The door to the rest of the desks.",
  },
];

export const TRUEPLACE_HREF = "https://expedite-consults.vercel.app/trueplace";

export const TRUEPLACE: LaunchProduct[] = [
  { title: "Explore Homes", href: `${TRUEPLACE_HREF}?tab=search`, line: "Verified listings, not a rumor on a flyer." },
  { title: "TrueValue™", href: `${TRUEPLACE_HREF}?tab=valuation`, line: "A TreeSHAP valuation you can open, not a single guess." },
  { title: "Housing Passport™", href: `${TRUEPLACE_HREF}?tab=passport`, line: "The credit and readiness file for the household." },
  { title: "HomeOS™", href: `${TRUEPLACE_HREF}?tab=homeos`, line: "Appliances and the life left in the house." },
  { title: "TrueCost™", href: `${TRUEPLACE_HREF}?tab=truecost`, line: "The monthly cost, not only the advertised mortgage." },
  { title: "HomeTruth™ audit", href: `${TRUEPLACE_HREF}?tab=hometruth`, line: "Deeds, permits, and the chain of title." },
  { title: "AI Inspector", href: `${TRUEPLACE_HREF}?tab=inspector`, line: "What to look at before the offer." },
  { title: "AI Copilot", href: `${TRUEPLACE_HREF}?tab=copilot`, line: "Ask the house a question, then check the source." },
  { title: "What-If", href: `${TRUEPLACE_HREF}?tab=whatif`, line: "Change one fact and see the payment move." },
  { title: "SHAP explainability", href: `${TRUEPLACE_HREF}?tab=explainability`, line: "Which facts moved the number." },
  { title: "Map and risk", href: `${TRUEPLACE_HREF}?tab=map`, line: "The lot, the commute, and the risk on a map." },
  { title: "Truth reports", href: `${TRUEPLACE_HREF}?tab=reports`, line: "A report you can hand to a lender or a buyer." },
  { title: "Community", href: `${TRUEPLACE_HREF}?tab=community`, line: "The neighborhood around the address." },
];

export const LAUNCHPAD: { id: string; label: string; products: LaunchProduct[] }[] = [
  {
    id: "live",
    label: "Live",
    products: [
      { title: "Notifications", href: "https://expedite-consults.vercel.app/notifications", line: "What changed while you were in a lesson." },
      { title: "Search", href: "https://expedite-consults.vercel.app/search", line: "Find a person, a desk, or a product." },
      { title: "Profile", href: "https://expedite-consults.vercel.app/profile", line: "The public card for the account." },
    ],
  },
  {
    id: "mission",
    label: "Mission",
    products: [
      { title: "Local Mission Control Launchpad", href: "https://ecosystem-launchpad.vercel.app", line: "Fleet gateway, threat ticker, and the switcher for the desks." },
    ],
  },
  {
    id: "studios",
    label: "Studios",
    products: [
      { title: "Mesh health", href: "https://18-unified-integration-layer.vercel.app/mesh-health", line: "Live health across the connected systems." },
      { title: "Boardroom reporting", href: "https://18-unified-integration-layer.vercel.app/unified-reporting", line: "One briefing a board can read." },
      { title: "API gateway studio", href: "https://18-unified-integration-layer.vercel.app/api-gateway", line: "The route directory for GraphQL and REST." },
      { title: "Security data lake", href: "https://18-unified-integration-layer.vercel.app/data-lake", line: "Telemetry and the indicator index." },
      { title: "Zero-trust identity", href: "https://18-unified-integration-layer.vercel.app/unified-identity", line: "Tenants and scoped tokens." },
      { title: "SIEM and EDR connectors", href: "https://18-unified-integration-layer.vercel.app/webhooks-connectors", line: "Splunk, Sentinel, CrowdStrike, Jira." },
      { title: "STIX threat hub", href: "https://18-unified-integration-layer.vercel.app/shared-threat-intel", line: "Shared indicators, not a private spreadsheet." },
      { title: "SOAR playbooks", href: "https://18-unified-integration-layer.vercel.app/cross-platform-playbooks", line: "Containment you can rehearse." },
    ],
  },
  {
    id: "strike",
    label: "Strike",
    products: [
      { title: "External attack surface", href: "https://aegis-strike.vercel.app", line: "The perimeter, then the proof." },
      { title: "Strike console", href: "https://14-exploitability-platform.vercel.app/exploit", line: "Scanners that run together, then stop." },
    ],
  },
  {
    id: "sphera",
    label: "Sphera",
    products: [
      { title: "Enterprise portal", href: "https://portal.expediteconsults.com", line: "The client room." },
      { title: "SpheraNet", href: "https://portal.expediteconsults.com/mission-control", line: "Sovereign social network and the campus graph." },
      { title: "Social hub", href: "https://sphera-social.vercel.app", line: "The professional network." },
      { title: "Studio", href: "https://sphera-studio.vercel.app", line: "Worlds and the vault." },
      { title: "Frontend suite", href: "https://sphera-frontend.vercel.app", line: "The modular client." },
      { title: "IRGF node", href: "https://sphera-frontend-irgf.vercel.app", line: "The compliance face of Sphera." },
      { title: "Backend", href: "https://sphera-backend-alpha.vercel.app", line: "The API the rooms call." },
      { title: "Umbrella", href: "https://sphera-platform.vercel.app", line: "One door for the ecosystem." },
      { title: "SPHERA Universe", href: "https://sphera.expediteconsults.com", line: "The flagship connection and collaboration room." },
    ],
  },
  {
    id: "security",
    label: "Security",
    products: [
      { title: "SAST", href: "https://05-sast-platform.vercel.app", line: "Static testing and the tainted-data path." },
      { title: "SCA", href: "https://06-sca-platform.vercel.app", line: "Dependencies, the SBOM, and a bad package." },
      { title: "Secrets", href: "https://07-secrets-platform.vercel.app", line: "Keys in the repo, and a canary if one leaks." },
      { title: "Containers", href: "https://08-container-security-platform.vercel.app", line: "The image, before it ships." },
      { title: "Kubernetes", href: "https://09-k8s-security-platform.vercel.app", line: "The cluster, the role, and the open door." },
      { title: "Infrastructure as code", href: "https://10-iac-security-platform.vercel.app", line: "The plan, reviewed before apply." },
      { title: "DAST", href: "https://11-dast-security-platform.vercel.app", line: "The running app, against the OWASP list." },
      { title: "API security", href: "https://12-api-security-platform.vercel.app", line: "BOLA, BFLA, and the schema you published." },
      { title: "Mobile", href: "https://13-mobile-security-platform.vercel.app", line: "The app on the phone, not only the server." },
      { title: "Threat modeling", href: "https://15-threat-modeling-platform.vercel.app", line: "What can go wrong, written down." },
      { title: "Malware and DFIR", href: "https://16-malware-analysis-platform.vercel.app", line: "The binary, the memory, and the rule." },
      { title: "Ransomware recovery", href: "https://17-ransomware-recovery-platform.vercel.app", line: "The path back after the lock." },
      { title: "Cloud security", href: "https://19-cloud-security-platform.vercel.app", line: "The account, the role, and the privilege." },
      { title: "Aegis SOC", href: "https://backend-theta-pink-81.vercel.app", line: "The unified operations room." },
      { title: "Aegis RMF", href: "https://aegis-rmf.vercel.app", line: "Risk, the control, and the package." },
    ],
  },
  {
    id: "career",
    label: "Career",
    products: [
      { title: "CareerOrbit", href: "https://careerorbit-mu.vercel.app", line: "The resume, the path, and the market." },
      { title: "SkillHands", href: "https://skillhands-client.vercel.app", line: "A specialist matched to the job." },
      { title: "ConnectLn", href: "https://connectln.vercel.app", line: "The trades network, with proof of the work." },
      { title: "Noctis", href: "https://noctis.social", line: "Learn, meet, and the clinic." },
    ],
  },
  {
    id: "field",
    label: "Field",
    products: [
      { title: "CSRTA", href: "https://csrtainitiative.org", line: "The initiative, in public." },
      { title: "E-waste survey", href: "https://e-waste-csrta.vercel.app", line: "Field notes on what gets thrown away." },
      { title: "Accra–Helsinki", href: "https://accra-helsinki-org.vercel.app", line: "The Ghana and Finland bridge." },
      { title: "Accra–Helsinki hub", href: "https://accra-helsinki.vercel.app", line: "The projects under that bridge." },
    ],
  },
  {
    id: "connect",
    label: "ConnectIn",
    products: [
      { title: "Professional super app", href: "https://expedite-consults.vercel.app/connectin", line: "The operating system for the desk." },
      { title: "IAM and security center", href: "https://expedite-consults.vercel.app/connectin-login", line: "Sign-in, roles, and a second pair of eyes." },
      { title: "AI assistant", href: "https://expedite-consults.vercel.app/connectin", line: "Ask the desk, then check the source." },
    ],
  },
  {
    id: "campus",
    label: "Campus",
    products: [
      { title: "CampusSync", href: "https://expedite-consults.vercel.app/campus", line: "The campus platform and the live map." },
      { title: "TowsonSync", href: "https://expedite-consults.vercel.app/campus", line: "Towson, on the same campus desk." },
      { title: "SeaGullSync", href: "https://expedite-consults.vercel.app/salisbury", line: "Salisbury." },
      { title: "TerpSync", href: "https://expedite-consults.vercel.app/umd", line: "Maryland." },
      { title: "RetrieverSync", href: "https://expedite-consults.vercel.app/umbc", line: "UMBC." },
      { title: "HopkinsSync", href: "https://expedite-consults.vercel.app/hopkins", line: "Johns Hopkins." },
      { title: "Student verification", href: "https://expedite-consults.vercel.app/campus/login", line: "Onboarding that knows who is enrolled." },
      { title: "CareerOrbit", href: "https://careerorbit-standalone.vercel.app", line: "The career desk on its own." },
      { title: "BAZAAR", href: "https://bazaar-standalone.vercel.app", line: "Verified commerce." },
      { title: "TU Housing", href: "https://tuhousing.vercel.app/", line: "Off-campus housing and the resume clinic." },
    ],
  },
];
