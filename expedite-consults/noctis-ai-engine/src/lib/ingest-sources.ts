import type { FeedPost } from "@/lib/feed-data";
import type { VibeLane } from "@/lib/noctis";
import { hymnQueries } from "@/lib/hymn-desk";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const PULLS_PER_DAY = 24;
export const PULL_MS = 60 * 60 * 1000;
/** A new clinic lead every hour. */
export const PULL_HOURS_UTC = [0] as const;
export const PULL_OFFSET_MS = 0;

export function daySlot(at = Date.now()) {
  return Math.floor(at / DAY_MS);
}

export function pullSlot(at = Date.now()) {
  return Math.floor((at - PULL_OFFSET_MS) / PULL_MS);
}

export function nextPullAt(from = Date.now()) {
  return (pullSlot(from) + 1) * PULL_MS + PULL_OFFSET_MS;
}

export function pullClockLabel() {
  return "no wait";
}

export type IngestRow = {
  postId: string;
  youtubeId: string;
  title: string;
  house: string;
  author: string;
  stamp: string;
  lane: VibeLane;
  url: string;
  desk?: string;
  tags?: string[];
  kind?: IngestKind;
  gate?: string;
};

export type IngestReport = {
  id: string;
  at: number;
  houses: string[];
  added: number;
  skipped: number;
  clips: IngestRow[];
};

export type IngestKind =
  | "video"
  | "lecture"
  | "article"
  | "book"
  | "paper"
  | "lab"
  | "quiz"
  | "cards"
  | "code"
  | "challenge"
  | "sim"
  | "talk"
  | "project"
  | "framework"
  | "credential";

export type IngestHouse = {
  id: string;
  house: string;
  stamp: string;
  lane: VibeLane;
  tags: string[];
  kind?: IngestKind;
};

export const INGEST_CHANNELS: (IngestHouse & { channel: string })[] = [
  { id: "mit", house: "MIT OpenCourseWare", channel: "UCEBb1b_L6zDS3xTUrIALZOw", stamp: "MIT clinic", lane: "learn", tags: ["#mit", "#lecture"] },
  { id: "khan", house: "Khan Academy", channel: "UC4a-Gbdw7vUAXECRSCWqBTQ", stamp: "Khan clinic", lane: "learn", tags: ["#khan", "#study"] },
  { id: "teded", house: "TED-Ed", channel: "UCsooa4yRKGN_zEE8iknghZA", stamp: "TED clinic", lane: "learn", tags: ["#ted", "#explain"] },
  { id: "cs50", house: "CS50", channel: "UCcabW7890RKJzL968QWEykA", stamp: "CS50 clinic", lane: "learn", tags: ["#cs50", "#code"] },
  { id: "fcc", house: "freeCodeCamp", channel: "UC8butISFwT-Nl7Y0xOxiLqA", stamp: "Code clinic", lane: "learn", tags: ["#code", "#training"] },
  { id: "3b1b", house: "3Blue1Brown", channel: "UCYO_jab_esuFRV4b17AKvAw", stamp: "Calc clinic", lane: "learn", tags: ["#math", "#stem"], kind: "lecture" },
  { id: "bible", house: "BibleProject", channel: "UCVfwlh9XpX2Y_tQfjeln9QA", stamp: "Luke clinic", lane: "learn", tags: ["#bible"] },
  { id: "gaither", house: "Gaither Music TV", channel: "UCUjFsO1AF9L2zTuiayc3Kvg", stamp: "Hymn hall", lane: "laugh", tags: ["#gospel", "#hymn"] },
  { id: "sinach", house: "Sinach", channel: "UC_XzWOxin4x5-PSpYSC3fdw", stamp: "Gospel hall", lane: "laugh", tags: ["#gospel", "#worship"] },
  { id: "chuck", house: "NetworkChuck", channel: "UC9x0AN7BWHpCDHSm9NiJFJQ", stamp: "Packet ghost", lane: "learn", tags: ["#cyber"] },
  { id: "fireship", house: "Fireship", channel: "UCsBjURrPoezykLs9LiOYznA", stamp: "Ship clinic", lane: "learn", tags: ["#code"] },
  { id: "ninja", house: "Ninja Nerd", channel: "UC6QYFutt9guQ2QF66sYxAUw", stamp: "Ward clinic", lane: "learn", tags: ["#medicine"] },
  { id: "crash", house: "CrashCourse", channel: "UCXgGyu1DXGXmuFPeVVpPm3Q", stamp: "Crash clinic", lane: "learn", tags: ["#course", "#stem"] },
  { id: "veritas", house: "Veritasium", channel: "UCHnyfMqiRRG1u-2MsSQLbXA", stamp: "Lab clinic", lane: "learn", tags: ["#science", "#stem"] },
  { id: "kurz", house: "Kurzgesagt", channel: "UCsXVk37bltHxD1rDPwtNM8Q", stamp: "Sky clinic", lane: "learn", tags: ["#space"] },
  { id: "nasa", house: "NASA", channel: "UCLA_DiR1FfKNvjuUpBHmylQ", stamp: "NASA clinic", lane: "learn", tags: ["#nasa"] },
  { id: "stanford", house: "Stanford", channel: "UCBa5G_ESCn8Y86_PB0dsBFg", stamp: "Stanford clinic", lane: "learn", tags: ["#research"] },
  { id: "electrician", house: "Electrician U", channel: "UCkSB5h4lYcY6ZwwI_6nktDQ", stamp: "Shop clinic", lane: "learn", tags: ["#trade"] },
  { id: "craft", house: "Essential Craftsman", channel: "UCOXs1v3jZUFa_BhwxSBfzYw", stamp: "Timber clinic", lane: "learn", tags: ["#trade"] },
  { id: "house", house: "This Old House", channel: "UCUtWNBWbFL9We-cdXkiAuJA", stamp: "Bench clinic", lane: "learn", tags: ["#trade"] },
  { id: "liveo", house: "LiveOverflow", channel: "UClcE-kVhqyiHCcjYwcpfj9w", stamp: "Exploit clinic", lane: "learn", tags: ["#cyber"] },
  { id: "ippsec", house: "IppSec", channel: "UCa6eh7gCkpPo5XXCWKWAG_w", stamp: "Box clinic", lane: "learn", tags: ["#cyber"] },
  { id: "papers", house: "Two Minute Papers", channel: "UCbfYPyITQ-7l4upoX8nvctg", stamp: "Paper clinic", lane: "learn", tags: ["#research", "#ai"], kind: "paper" },
  { id: "eng", house: "Practical Engineering", channel: "UCMOqf8ab-42UUQIdVoKwjlQ", stamp: "Civil clinic", lane: "learn", tags: ["#engineering", "#stem"], kind: "lecture" },
  { id: "amoeba", house: "Amoeba Sisters", channel: "UCZ4AMrCw6tH0FHXEM7ON-wQ", stamp: "Bio clinic", lane: "learn", tags: ["#biology", "#stem"] },
  { id: "numberphile", house: "Numberphile", channel: "UCoxcjq-8xIDTYp3uz647V5A", stamp: "Number clinic", lane: "learn", tags: ["#math", "#stem"], kind: "lecture" },
  { id: "statquest", house: "StatQuest", channel: "UCtYLUTtgS3k1Fg4y5tAhLbw", stamp: "Stats clinic", lane: "learn", tags: ["#stats", "#ml", "#stem"], kind: "lecture" },
  { id: "computerphile", house: "Computerphile", channel: "UC9-y-6csu5WGm29I7JiwpnA", stamp: "CS clinic", lane: "learn", tags: ["#code"], kind: "lecture" },
  { id: "natgeo", house: "National Geographic", channel: "UCpVm7bg6pXKo1Pr6k5kxG9A", stamp: "Wild clinic", lane: "learn", tags: ["#nature", "#animals"] },
  { id: "bbcearth", house: "BBC Earth", channel: "UCwmZiChSryoWQCZMIQezgTg", stamp: "Earth clinic", lane: "learn", tags: ["#forest", "#wildlife"] },
  { id: "nasagoddard", house: "NASA Goddard", channel: "UCAY-SMFNfynqz1bdoaR52Xg", stamp: "Sky clinic", lane: "learn", tags: ["#nasa", "#universe"] },
  { id: "vsauce", house: "Vsauce", channel: "UC6nSFpj9HTCZ5t-N3Rm3-HA", stamp: "Mind clinic", lane: "learn", tags: ["#science", "#why"] },
  { id: "scishow", house: "SciShow", channel: "UCZYTClx2T1of7BRZ86-8fow", stamp: "Sci clinic", lane: "learn", tags: ["#science", "#stem"] },
  { id: "asap", house: "AsapSCIENCE", channel: "UCC552Sd-3nyi_tk2BudLUzA", stamp: "Asap clinic", lane: "learn", tags: ["#science"] },
  { id: "smarter", house: "SmarterEveryDay", channel: "UC6107grRI4m0o2-emgoDnAA", stamp: "Slow-mo clinic", lane: "learn", tags: ["#science", "#engineering"] },
  { id: "stevemould", house: "Steve Mould", channel: "UC3KEoMzNz8eYawBP5djDt5A", stamp: "Mould clinic", lane: "learn", tags: ["#science"] },
  { id: "minutephys", house: "MinutePhysics", channel: "UCUHW94eWLnGBLT5nokvg73A", stamp: "Minute clinic", lane: "learn", tags: ["#physics", "#stem"] },
  { id: "cgpgrey", house: "CGP Grey", channel: "UC2C_jShtL725hvbm1arSV9w", stamp: "Grey clinic", lane: "learn", tags: ["#explain"] },
  { id: "realeng", house: "Real Engineering", channel: "UCR1IuLEqb6UEA_zQ81kwXFg", stamp: "Engineering clinic", lane: "learn", tags: ["#engineering", "#stem"] },
  { id: "wendover", house: "Wendover Productions", channel: "UC9RM-iSvTu1uPJb8X5yp3EQ", stamp: "Wendover clinic", lane: "learn", tags: ["#geography", "#systems"] },
  { id: "ted", house: "TED", channel: "UCAuUUnT6oDeKwE6v1NGQxug", stamp: "TED clinic", lane: "learn", tags: ["#ted", "#ideas"] },
  { id: "vox", house: "Vox", channel: "UCLXo7UDZvByw2ixzpQCufnA", stamp: "Vox clinic", lane: "learn", tags: ["#explain", "#world"] },
  { id: "reallifelore", house: "RealLifeLore", channel: "UCP5tjEmvPItGyLhlQ_RgZWQ", stamp: "Lore clinic", lane: "learn", tags: ["#geography", "#world"] },
];

function proHall(id: string, house: string, q: string, stamp: string, tags: string[]): IngestHouse & { q: string } {
  return { id: `q-pro-${id}`, house, q, stamp, lane: "learn", tags: ["#pro", ...tags], kind: "lecture" };
}

/** Professional halls. The ledger pulls these, then they lead the clinic. */
export const PRO_HALLS: (IngestHouse & { q: string })[] = [
  proHall("advisor", "Financial Advisor", "what a financial advisor does explained", "Money hall", ["#money", "#business"]),
  proHall("accountant", "Accountant", "what an accountant does explained", "Money hall", ["#money", "#business"]),
  proHall("cpa", "CPA", "CPA accounting career explained", "Money hall", ["#money", "#business"]),
  proHall("tax", "Tax Specialist", "how income tax works explained", "Money hall", ["#money", "#business"]),
  proHall("auditor", "Auditor", "what an auditor does explained", "Money hall", ["#money", "#business"]),
  proHall("economist", "Economist", "what an economist does explained", "Money hall", ["#money", "#business"]),
  proHall("invest", "Investment Analyst", "what an investment analyst does explained", "Money hall", ["#money", "#invest", "#business"]),
  proHall("attorney", "Attorney", "what a lawyer does explained", "Law hall", ["#civic"]),
  proHall("paralegal", "Paralegal", "what a paralegal does explained", "Law hall", ["#civic"]),
  proHall("mediator", "Mediator", "what a mediator does explained", "Law hall", ["#civic"]),
  proHall("compliance", "Compliance Specialist", "what a compliance officer does explained", "Law hall", ["#civic"]),
  proHall("doctor", "Doctor", "what a physician does day in the life explained", "Health hall", ["#care"]),
  proHall("nurse", "Nurse", "what a registered nurse does explained", "Health hall", ["#care"]),
  proHall("dentist", "Dentist", "what a dentist does explained", "Health hall", ["#care"]),
  proHall("pharmacist", "Pharmacist", "what a pharmacist does explained", "Health hall", ["#care"]),
  proHall("therapist", "Therapist", "what a therapist does explained", "Health hall", ["#mind"]),
  proHall("nutrition", "Nutritionist", "what a nutritionist does explained", "Health hall", ["#care"]),
  proHall("pt", "Physical Therapist", "what a physical therapist does explained", "Health hall", ["#care"]),
  proHall("cyber", "Cybersecurity Analyst", "what a cybersecurity analyst does explained", "Cyber hall", ["#cyber"]),
  proHall("hacker", "Ethical Hacker", "what an ethical hacker does explained", "Cyber hall", ["#cyber"]),
  proHall("seceng", "Security Engineer", "what a security engineer does explained", "Cyber hall", ["#cyber"]),
  proHall("cloud", "Cloud Engineer", "what a cloud engineer does explained", "Cloud hall", ["#infra"]),
  proHall("devops", "DevOps Engineer", "what a DevOps engineer does explained", "Cloud hall", ["#infra"]),
  proHall("data", "Data Scientist", "what a data scientist does explained", "Data hall", ["#data"]),
  proHall("bio", "Biologist", "what a biologist does explained", "Science hall", ["#stem"]),
  proHall("chem", "Chemist", "what a chemist does explained", "Science hall", ["#chem", "#stem"]),
  proHall("phys", "Physicist", "what a physicist does explained", "Science hall", ["#physics", "#stem"]),
  proHall("envsci", "Environmental Scientist", "what an environmental scientist does explained", "Earth hall", ["#earth"]),
  proHall("geo", "Geologist", "what a geologist does explained", "Earth hall", ["#earth", "#geology"]),
  proHall("civil", "Civil Engineer", "what a civil engineer does explained", "Engineering hall", ["#maker", "#engineering"]),
  proHall("mech", "Mechanical Engineer", "what a mechanical engineer does explained", "Engineering hall", ["#maker", "#me"]),
  proHall("elec", "Electrical Engineer", "what an electrical engineer does explained", "Engineering hall", ["#maker", "#ee"]),
  proHall("soft", "Software Engineer", "what a software engineer does explained", "Code hall", ["#code"]),
  proHall("chemeng", "Chemical Engineer", "what a chemical engineer does explained", "Engineering hall", ["#maker"]),
  proHall("aero", "Aerospace Engineer", "what an aerospace engineer does explained", "Space hall", ["#space", "#aero"]),
  proHall("teacher", "Teacher", "what a teacher does explained", "Education hall", ["#teach", "#classroom"]),
  proHall("professor", "Professor", "what a university professor does explained", "Education hall", ["#teach"]),
  proHall("tutor", "Tutor", "what a tutor does explained", "Education hall", ["#teach"]),
  proHall("realtor", "Realtor", "what a realtor does explained", "Property hall", ["#career"]),
  proHall("architect", "Architect", "what an architect does explained", "Property hall", ["#maker"]),
  proHall("contractor", "Contractor", "what a general contractor does explained", "Property hall", ["#trade", "#build"]),
  proHall("surveyor", "Surveyor", "what a land surveyor does explained", "Property hall", ["#maker"]),
  proHall("consultant", "Business Consultant", "what a business consultant does explained", "Business hall", ["#business"]),
  proHall("founder", "Entrepreneur", "what an entrepreneur does explained", "Business hall", ["#business", "#startup"]),
  proHall("pm", "Project Manager", "what a project manager does explained", "Business hall", ["#business"]),
  proHall("designer", "Graphic Designer", "what a graphic designer does explained", "Creative hall", ["#arts"]),
  proHall("photo", "Photographer", "what a photographer does explained", "Creative hall", ["#arts"]),
  proHall("video", "Videographer", "what a videographer does explained", "Creative hall", ["#arts"]),
  proHall("ux", "UX Designer", "what a UX designer does explained", "Creative hall", ["#code"]),
  proHall("journalist", "Journalist", "what a journalist does explained", "Media hall", ["#career"]),
  proHall("editor", "Editor", "what an editor does explained", "Media hall", ["#career"]),
  proHall("pr", "Public Relations", "what a public relations specialist does explained", "Media hall", ["#career"]),
  proHall("electrician", "Electrician", "what an electrician does explained trade", "Trades hall", ["#trade"]),
  proHall("plumber", "Plumber", "what a plumber does explained trade", "Trades hall", ["#trade", "#plumb"]),
  proHall("hvac", "HVAC Technician", "what an HVAC technician does explained", "Trades hall", ["#trade", "#hvac"]),
  proHall("welder", "Welder", "what a welder does explained trade", "Trades hall", ["#trade", "#weld"]),
  proHall("carpenter", "Carpenter", "what a carpenter does explained trade", "Trades hall", ["#trade"]),
  proHall("auto", "Automotive Technician", "what an automotive technician does explained", "Trades hall", ["#trade", "#auto"]),
  proHall("farmer", "Farmer", "what a farmer does explained", "Agriculture hall", ["#ag", "#farm"]),
  proHall("agro", "Agronomist", "what an agronomist does explained", "Agriculture hall", ["#ag"]),
  proHall("conserve", "Conservationist", "what a conservationist does explained", "Earth hall", ["#earth"]),
  proHall("policy", "Policy Analyst", "what a policy analyst does explained", "Civic hall", ["#civic"]),
  proHall("planner", "Urban Planner", "what an urban planner does explained", "Civic hall", ["#civic"]),
  proHall("pilot", "Pilot", "what an airline pilot does explained", "Transport hall", ["#career"]),
  proHall("logistics", "Logistics Specialist", "what a logistics specialist does explained", "Transport hall", ["#business"]),
  proHall("researcher", "Researcher", "what a research scientist does explained", "Research hall", ["#research"]),
  proHall("lab", "Lab Technician", "what a laboratory technician does explained", "Research hall", ["#research"]),
  proHall("airesearch", "AI Researcher", "what an AI researcher does explained", "Research hall", ["#ai", "#research"]),
  proHall("pastor", "Pastor", "what a pastor does explained", "Faith hall", ["#faith", "#pulpit"]),
  proHall("bible", "Bible Teacher", "what a Bible teacher does explained", "Faith hall", ["#faith", "#bible"]),
  proHall("chaplain", "Chaplain", "what a chaplain does explained", "Faith hall", ["#faith"]),
  proHall("vet", "Veterinarian", "what a veterinarian does explained", "Animal hall", ["#care"]),
  proHall("zoo", "Zoologist", "what a zoologist does explained", "Animal hall", ["#earth"]),
  proHall("wild", "Wildlife Biologist", "what a wildlife biologist does explained", "Animal hall", ["#earth"]),
  proHall("chef", "Chef", "what a chef does explained", "Food hall", ["#ag", "#food"]),
  proHall("fire", "Firefighter", "what a firefighter does explained", "Safety hall", ["#career"]),
  proHall("emt", "EMT", "what an EMT does explained", "Safety hall", ["#care"]),
  proHall("safety", "Safety Engineer", "what a safety engineer does explained", "Safety hall", ["#maker"]),
];

export const INGEST_QUERIES: (IngestHouse & { q: string })[] = [
  { id: "q-hook-why", house: "Why clinic", q: "why is this true science explained", stamp: "Why clinic", lane: "learn", tags: ["#why", "#science"] },
  { id: "q-hook-how", house: "How clinic", q: "how does it actually work explained", stamp: "How clinic", lane: "learn", tags: ["#how", "#explain"] },
  { id: "q-blackhole", house: "Black holes", q: "kurzgesagt black holes explained", stamp: "Sky clinic", lane: "learn", tags: ["#space", "#kurz"] },
  { id: "q-immune", house: "Immune system", q: "kurzgesagt immune system explained", stamp: "Care clinic", lane: "learn", tags: ["#health", "#kurz"] },
  { id: "q-brain", house: "The brain", q: "how the brain works ted-ed animation", stamp: "Mind clinic", lane: "learn", tags: ["#brain", "#ted"] },
  { id: "q-sleep", house: "Sleep science", q: "why we sleep science explained", stamp: "Sleep clinic", lane: "learn", tags: ["#sleep", "#science"] },
  { id: "q-time", house: "Time", q: "what is time actually explained physics", stamp: "Time clinic", lane: "learn", tags: ["#physics"] },
  { id: "q-electric", house: "Electricity", q: "veritasium electricity misconception explained", stamp: "Lab clinic", lane: "learn", tags: ["#physics"] },
  { id: "q-dna-hook", house: "DNA", q: "how dna works ted-ed animation", stamp: "DNA clinic", lane: "learn", tags: ["#biology"] },
  { id: "q-money-hook", house: "Money", q: "how money works explained economics", stamp: "Money clinic", lane: "learn", tags: ["#money"] },
  { id: "q-planes", house: "Flight", q: "how do planes fly explained science", stamp: "Flight clinic", lane: "learn", tags: ["#engineering"] },
  { id: "q-ocean", house: "Oceans", q: "bbc earth ocean unexplained science", stamp: "Ocean clinic", lane: "learn", tags: ["#ocean"] },
  { id: "q-animals-hook", house: "Animals", q: "nat geo animal intelligence surprising", stamp: "Wild clinic", lane: "learn", tags: ["#animals"] },
  { id: "q-history-hook", house: "History hooks", q: "world history lecture documentary", stamp: "History clinic", lane: "learn", tags: ["#history"] },
  { id: "q-code-hook", house: "Code hooks", q: "fireship 100 seconds explained", stamp: "Ship clinic", lane: "learn", tags: ["#code"] },
  { id: "q-cyber-hook", house: "Cyber hooks", q: "how hackers actually break in explained", stamp: "Cyber clinic", lane: "learn", tags: ["#cyber"] },
  { id: "q-ai-hook", house: "AI hooks", q: "how chatgpt actually works explained", stamp: "AI clinic", lane: "learn", tags: ["#ai"] },
  { id: "q-faith-hook", house: "Gospel hooks", q: "amazing grace story behind the hymn", stamp: "Hymn hall", lane: "laugh", tags: ["#hymn", "#gospel"] },
  { id: "q-cancer", house: "Cancer research", q: "cancer research lecture university", stamp: "Oncology clinic", lane: "learn", tags: ["#cancer"] },
  { id: "q-park", house: "Parkinson clinic", q: "parkinson disease explained lecture", stamp: "Neuro clinic", lane: "learn", tags: ["#parkinson"] },
  { id: "q-diab", house: "Diabetes clinic", q: "diabetes education lecture endocrinology", stamp: "Sugar clinic", lane: "learn", tags: ["#diabetes"] },
  { id: "q-alz", house: "Alzheimer clinic", q: "alzheimer disease lecture neurology", stamp: "Memory clinic", lane: "learn", tags: ["#alzheimer"] },
  { id: "q-cyber", house: "Cyber training", q: "cybersecurity training lecture nist", stamp: "Cyber clinic", lane: "learn", tags: ["#cyber"] },
  { id: "q-py", house: "Python lab", q: "python tutorial beginners lecture", stamp: "Python clinic", lane: "learn", tags: ["#python"] },
  { id: "q-ml", house: "ML lab", q: "machine learning lecture university", stamp: "ML clinic", lane: "learn", tags: ["#ai"] },
  { id: "q-org", house: "Chem lab", q: "organic chemistry lecture", stamp: "Chem clinic", lane: "learn", tags: ["#chem"] },
  { id: "q-nurse", house: "Nursing ward", q: "nursing skills demonstration training", stamp: "Ward clinic", lane: "learn", tags: ["#nursing"] },
  { id: "q-pharm", house: "Pharmacy", q: "pharmacist lecture pharmacology", stamp: "Pharmacy clinic", lane: "learn", tags: ["#pharm"] },
  { id: "q-elec", house: "Electrical shop", q: "electrician training tutorial", stamp: "Shop clinic", lane: "learn", tags: ["#trade"] },
  { id: "q-wood", house: "Carpentry", q: "carpenter joinery tutorial training", stamp: "Timber clinic", lane: "learn", tags: ["#trade"] },
  { id: "q-aws", house: "Cloud security", q: "aws security fundamentals lecture", stamp: "Cloud clinic", lane: "learn", tags: ["#aws"] },
  { id: "q-nasa", house: "Planets", q: "nasa planetary science lecture", stamp: "Sky clinic", lane: "learn", tags: ["#space"] },
  { id: "q-bible", house: "Scripture", q: "bible project gospel explained", stamp: "Luke clinic", lane: "learn", tags: ["#bible"] },
  { id: "q-jazz", house: "Jazz history", q: "jazz history lecture documentary", stamp: "Jazz clinic", lane: "laugh", tags: ["#jazz"] },
  { id: "q-gospel", house: "Gospel roots", q: "gospel music history documentary hymn jesus", stamp: "Gospel clinic", lane: "laugh", tags: ["#gospel", "#hymn"] },
  { id: "q-hymn-grace", house: "Amazing Grace", q: "amazing grace hymn history jesus christ", stamp: "Hymn hall", lane: "laugh", tags: ["#hymn", "#gospel"] },
  { id: "q-hymn-great", house: "How Great Thou Art", q: "how great thou art hymn worship official", stamp: "Hymn hall", lane: "laugh", tags: ["#hymn", "#worship"] },
  { id: "q-hymn-well", house: "It Is Well", q: "it is well with my soul hymn story jesus", stamp: "Hymn hall", lane: "laugh", tags: ["#hymn", "#gospel"] },
  { id: "q-hymn-vision", house: "Be Thou My Vision", q: "be thou my vision hymn worship lyrics", stamp: "Hymn hall", lane: "laugh", tags: ["#hymn", "#worship"] },
  { id: "q-spirituals", house: "Spirituals", q: "african american spirituals history jesus lecture", stamp: "Spiritual hall", lane: "learn", tags: ["#gospel", "#hymn"] },
  { id: "q-africa-gospel", house: "African gospel", q: "african gospel worship hymn jesus christ", stamp: "Africa hall", lane: "laugh", tags: ["#gospel", "#worship"] },
  { id: "q-ghana-gospel", house: "Ghana gospel", q: "ghana gospel hymn worship jesus", stamp: "Ghana hall", lane: "laugh", tags: ["#gospel", "#hymn"] },
  { id: "q-korea-hymn", house: "Korean hymns", q: "korean hymn worship jesus christ choir", stamp: "Korea hall", lane: "laugh", tags: ["#hymn", "#worship"] },
  { id: "q-latin-gospel", house: "Latin gospel", q: "latin american gospel hymn worship jesus", stamp: "Latin hall", lane: "laugh", tags: ["#gospel", "#hymn"] },
  { id: "q-choir", house: "Mass choir", q: "mass choir gospel hymn jesus christ official", stamp: "Choir hall", lane: "laugh", tags: ["#choir", "#gospel"] },
  { id: "q-tabernacle", house: "Tabernacle Choir", q: "The Tabernacle Choir at Temple Square hymn official", stamp: "Choir hall", lane: "laugh", tags: ["#choir", "#hymn", "#gospel"] },
  { id: "q-abide", house: "Abide with Me", q: "Abide with Me Tabernacle Choir hymn official", stamp: "Hymn hall", lane: "laugh", tags: ["#hymn", "#gospel", "#choir"] },
  { id: "q-forest", house: "Forest ecology", q: "forest ecology trophic cascade lecture", stamp: "Forest clinic", lane: "learn", tags: ["#forest"] },
  { id: "q-wildlife", house: "Wildlife", q: "animal behavior wildlife biology lecture", stamp: "Wild clinic", lane: "learn", tags: ["#animals"] },
  { id: "q-cosmos", house: "Cosmology", q: "big bang cosmology lecture universe history", stamp: "Sky clinic", lane: "learn", tags: ["#universe"] },
  { id: "q-jwst", house: "Webb telescope", q: "james webb telescope nasa lecture", stamp: "Webb clinic", lane: "learn", tags: ["#nasa"] },
  { id: "q-cern", house: "CERN", q: "CERN large hadron collider lecture official", stamp: "CERN clinic", lane: "learn", tags: ["#cern"] },
  { id: "q-yale", house: "Yale Open Courses", q: "yale open courses lecture psychology bloom", stamp: "Yale clinic", lane: "learn", tags: ["#yale"] },
  { id: "q-nist", house: "NIST", q: "NIST cybersecurity framework official", stamp: "NIST clinic", lane: "learn", tags: ["#nist"] },
  { id: "q-oxford", house: "Oxford", q: "university of oxford quantum mechanics lecture", stamp: "Oxford clinic", lane: "learn", tags: ["#oxford"] },
  { id: "q-aws-iam", house: "AWS IAM", q: "AWS IAM policy language official", stamp: "IAM clinic", lane: "learn", tags: ["#aws", "#iam"] },
  { id: "q-guardduty", house: "GuardDuty", q: "Amazon GuardDuty official AWS", stamp: "Detect clinic", lane: "learn", tags: ["#aws", "#detect"] },
  { id: "q-zerotrust", house: "Zero Trust", q: "Microsoft Zero Trust explained official", stamp: "Zero Trust clinic", lane: "learn", tags: ["#azure", "#zerotrust"] },
  { id: "q-scc", house: "Security Command Center", q: "Google Cloud Security Command Center official", stamp: "SCC clinic", lane: "learn", tags: ["#gcp"] },
  { id: "q-k8s", house: "Kubernetes security", q: "CNCF Kubernetes security official", stamp: "K8s clinic", lane: "learn", tags: ["#kubernetes"] },
  { id: "q-llm", house: "OWASP LLM", q: "OWASP Top 10 LLM applications", stamp: "LLM clinic", lane: "learn", tags: ["#ai", "#owasp"] },
  { id: "q-mfa", house: "CISA MFA", q: "CISA multifactor authentication official", stamp: "MFA clinic", lane: "learn", tags: ["#mfa", "#identity"] },
  { id: "q-passkeys", house: "FIDO passkeys", q: "FIDO Alliance passkeys explainer official", stamp: "Passkey clinic", lane: "learn", tags: ["#fido2", "#passkeys"] },
  { id: "q-mitre", house: "MITRE ATT&CK", q: "MITRE ATT&CK framework official", stamp: "ATT&CK clinic", lane: "learn", tags: ["#mitre", "#soc"] },
  { id: "q-owasp10", house: "OWASP Top 10", q: "OWASP Top 10 official", stamp: "AppSec clinic", lane: "learn", tags: ["#owasp", "#web"] },
  { id: "q-ssdf", house: "NIST SSDF", q: "NIST secure software development framework", stamp: "DevSecOps clinic", lane: "learn", tags: ["#ssdf", "#devsecops"] },
  { id: "q-sbom", house: "CISA SBOM", q: "CISA software bill of materials", stamp: "SBOM clinic", lane: "learn", tags: ["#sbom", "#supplychain"] },
  { id: "q-rmf", house: "NIST RMF", q: "NIST risk management framework 800-37 official", stamp: "RMF clinic", lane: "learn", tags: ["#rmf", "#nist"] },
  { id: "q-fisma", house: "FISMA", q: "FISMA NIST RMF federal cybersecurity", stamp: "Federal clinic", lane: "learn", tags: ["#fisma", "#ato"] },
  { id: "q-kev", house: "CISA KEV", q: "CISA known exploited vulnerabilities catalog", stamp: "KEV clinic", lane: "learn", tags: ["#cve", "#kev"] },
  { id: "q-pqc", house: "NIST PQC", q: "NIST post-quantum cryptography official", stamp: "PQC clinic", lane: "learn", tags: ["#pqc", "#crypto"] },
  { id: "q-ics", house: "CISA ICS", q: "CISA industrial control systems security", stamp: "OT clinic", lane: "learn", tags: ["#ics", "#ot"] },
  { id: "q-ransom", house: "StopRansomware", q: "CISA stop ransomware playbook official", stamp: "IR clinic", lane: "learn", tags: ["#ransomware", "#ir"] },
  { id: "q-genesis", house: "Genesis", q: "bible project genesis overview", stamp: "Genesis clinic", lane: "learn", tags: ["#bible"] },
  { id: "q-psalms", house: "Psalms", q: "bible project psalms overview", stamp: "Psalms clinic", lane: "learn", tags: ["#bible"] },
  { id: "q-ted", house: "TED education", q: "TED talk education science official", stamp: "TED clinic", lane: "learn", tags: ["#ted"] },
  { id: "q-stanford", house: "Stanford lecture", q: "stanford university lecture computer science official", stamp: "Stanford clinic", lane: "learn", tags: ["#stanford"] },
  { id: "q-jhu", house: "Hopkins grand rounds", q: "johns hopkins medicine grand rounds lecture", stamp: "Hopkins clinic", lane: "learn", tags: ["#jhu"] },
  { id: "q-agent", house: "Agent security", q: "AI agent security prompt injection official", stamp: "Agent clinic", lane: "learn", tags: ["#ai", "#agents"] },
  { id: "q-trade-e", house: "Electrical shop", q: "electrician apprenticeship training NEC", stamp: "Shop clinic", lane: "learn", tags: ["#trade"] },
  { id: "q-pharm-ward", house: "Pharmacy ward", q: "clinical pharmacy lecture hospital", stamp: "Pharmacy clinic", lane: "learn", tags: ["#pharm"] },
  { id: "q-cdc", house: "CDC", q: "CDC public health education official", stamp: "CDC clinic", lane: "learn", tags: ["#cdc", "#health"] },
  { id: "q-who", house: "WHO", q: "World Health Organization health education official", stamp: "WHO clinic", lane: "learn", tags: ["#who"] },
  { id: "q-mayo", house: "Mayo Clinic", q: "Mayo Clinic patient education lecture official", stamp: "Mayo clinic", lane: "learn", tags: ["#mayo"] },
  { id: "q-noaa", house: "NOAA", q: "NOAA climate science education official", stamp: "Climate clinic", lane: "learn", tags: ["#noaa", "#climate"] },
  { id: "q-csa", house: "Cloud Security Alliance", q: "Cloud Security Alliance cloud threats official", stamp: "CSA clinic", lane: "learn", tags: ["#csa", "#cloud"] },
  { id: "q-cncf", house: "CNCF", q: "CNCF kubernetes security official", stamp: "CNCF clinic", lane: "learn", tags: ["#cncf", "#k8s"] },
  { id: "q-isaca", house: "ISACA", q: "ISACA CISA certification overview official", stamp: "ISACA clinic", lane: "learn", tags: ["#isaca", "#grc"] },
  { id: "q-teach", house: "Classroom", q: "teacher education pedagogy lecture university", stamp: "Classroom clinic", lane: "learn", tags: ["#teach"] },
  { id: "q-joinery", house: "Carpentry shop", q: "carpentry apprenticeship training joinery", stamp: "Timber clinic", lane: "learn", tags: ["#trade", "#carpenter"] },
  { id: "q-alg", house: "Algebra", q: "khan academy algebra lecture", stamp: "Algebra clinic", lane: "learn", tags: ["#math", "#stem"], kind: "lecture" },
  { id: "q-geom", house: "Geometry", q: "euclidean geometry lecture university", stamp: "Geometry clinic", lane: "learn", tags: ["#math", "#stem"], kind: "lecture" },
  { id: "q-calc", house: "Calculus", q: "MIT 18.01 calculus lecture OpenCourseWare", stamp: "Calc clinic", lane: "learn", tags: ["#math", "#stem", "#mit"], kind: "lecture" },
  { id: "q-linalg", house: "Linear algebra", q: "MIT 18.06 Gilbert Strang linear algebra lecture", stamp: "LinAlg clinic", lane: "learn", tags: ["#math", "#stem", "#mit"], kind: "lecture" },
  { id: "q-stats", house: "Statistics", q: "statistics probability lecture university khan", stamp: "Stats clinic", lane: "learn", tags: ["#stats", "#stem"], kind: "lecture" },
  { id: "q-phys", house: "Physics", q: "MIT 8.01 classical mechanics lecture Walter Lewin", stamp: "Physics clinic", lane: "learn", tags: ["#physics", "#stem"], kind: "lecture" },
  { id: "q-chem", house: "Chemistry", q: "MIT organic chemistry lecture OpenCourseWare", stamp: "Chem clinic", lane: "learn", tags: ["#chem", "#stem"], kind: "lecture" },
  { id: "q-biochem", house: "Biochemistry", q: "biochemistry lecture university metabolism", stamp: "Biochem clinic", lane: "learn", tags: ["#biochem", "#stem"], kind: "lecture" },
  { id: "q-earthsci", house: "Earth science", q: "earth science geology lecture university", stamp: "Earth clinic", lane: "learn", tags: ["#earth", "#stem"], kind: "lecture" },
  { id: "q-ee", house: "Electrical engineering", q: "MIT circuits electrical engineering lecture OCW", stamp: "EE clinic", lane: "learn", tags: ["#ee", "#stem"], kind: "lecture" },
  { id: "q-me", house: "Mechanical engineering", q: "mechanical engineering lecture university dynamics", stamp: "ME clinic", lane: "learn", tags: ["#me", "#stem"], kind: "lecture" },
  { id: "q-bme", house: "Biomedical engineering", q: "biomedical engineering lecture university", stamp: "BME clinic", lane: "learn", tags: ["#bme", "#stem"], kind: "lecture" },
  { id: "q-matsci", house: "Materials science", q: "materials science lecture university MIT", stamp: "Materials clinic", lane: "learn", tags: ["#materials", "#stem"], kind: "lecture" },
  { id: "q-robot", house: "Robotics", q: "robotics lecture university MIT Stanford", stamp: "Robot clinic", lane: "learn", tags: ["#robotics", "#stem"], kind: "lecture" },
  { id: "q-stem-lab", house: "STEM lab", q: "physics chemistry lab demonstration university", stamp: "STEM lab", lane: "learn", tags: ["#stem", "#lab"], kind: "lab" },
  { id: "q-cs229", house: "Stanford ML", q: "Stanford CS229 machine learning lecture Andrew Ng", stamp: "ML clinic", lane: "learn", tags: ["#ai", "#ml"], kind: "lecture" },
  { id: "q-cs231", house: "Computer vision", q: "Stanford CS231n convolutional neural networks lecture", stamp: "Vision clinic", lane: "learn", tags: ["#ai", "#vision"], kind: "lecture" },
  { id: "q-cs224", house: "NLP", q: "Stanford CS224n natural language processing lecture", stamp: "NLP clinic", lane: "learn", tags: ["#ai", "#nlp"], kind: "lecture" },
  { id: "q-s191", house: "MIT deep learning", q: "MIT 6.S191 introduction to deep learning lecture", stamp: "DL clinic", lane: "learn", tags: ["#ai", "#deeplearn"], kind: "lecture" },
  { id: "q-llm-lec", house: "LLMs", q: "large language model lecture university transformer", stamp: "LLM clinic", lane: "learn", tags: ["#ai", "#llm"], kind: "lecture" },
  { id: "q-rag", house: "RAG", q: "retrieval augmented generation lecture university", stamp: "RAG clinic", lane: "learn", tags: ["#ai", "#rag"], kind: "lecture" },
  { id: "q-rl", house: "Reinforcement learning", q: "reinforcement learning lecture university David Silver", stamp: "RL clinic", lane: "learn", tags: ["#ai", "#rl"], kind: "lecture" },
  { id: "q-mlops", house: "MLOps", q: "MLOps model deployment lecture official", stamp: "MLOps clinic", lane: "learn", tags: ["#ai", "#mlops"], kind: "lecture" },
  { id: "q-airmf", house: "AI RMF", q: "NIST AI risk management framework official", stamp: "AI RMF clinic", lane: "learn", tags: ["#ai", "#nist"], kind: "framework" },
  { id: "q-align", house: "AI alignment", q: "AI alignment lecture university responsible AI", stamp: "Align clinic", lane: "learn", tags: ["#ai", "#align"], kind: "lecture" },
  { id: "q-eval", house: "AI evaluation", q: "LLM evaluation lecture university", stamp: "Eval clinic", lane: "learn", tags: ["#ai", "#eval"], kind: "lecture" },
  { id: "q-vector", house: "Vector databases", q: "vector database embeddings lecture", stamp: "Vector clinic", lane: "learn", tags: ["#ai", "#vectors"], kind: "lecture" },
  { id: "q-ai-lab", house: "AI lab", q: "machine learning lab assignment pytorch lecture", stamp: "AI lab", lane: "learn", tags: ["#ai", "#lab"], kind: "lab" },
  { id: "q-netsec", house: "Network security", q: "network security lecture university firewall segmentation", stamp: "Net clinic", lane: "learn", tags: ["#cyber", "#network"], kind: "lecture" },
  { id: "q-cloudsec", house: "Cloud security", q: "cloud security architecture lecture AWS Azure official", stamp: "Cloud clinic", lane: "learn", tags: ["#cyber", "#cloud"], kind: "lecture" },
  { id: "q-appsec", house: "Application security", q: "application security lecture OWASP university", stamp: "AppSec clinic", lane: "learn", tags: ["#cyber", "#appsec"], kind: "lecture" },
  { id: "q-pentest-lec", house: "Penetration testing", q: "penetration testing lecture methodology university", stamp: "Pentest clinic", lane: "learn", tags: ["#cyber", "#pentest"], kind: "lecture" },
  { id: "q-vuln", house: "Vulnerability management", q: "vulnerability management lecture CVE CVSS official", stamp: "Vuln clinic", lane: "learn", tags: ["#cyber", "#vuln"], kind: "lecture" },
  { id: "q-soc", house: "SOC", q: "security operations center SOC analyst lecture", stamp: "SOC clinic", lane: "learn", tags: ["#cyber", "#soc"], kind: "lecture" },
  { id: "q-siem", house: "SIEM", q: "SIEM lecture Splunk Microsoft Sentinel official", stamp: "SIEM clinic", lane: "learn", tags: ["#cyber", "#siem"], kind: "lecture" },
  { id: "q-dfir", house: "Digital forensics", q: "digital forensics lecture university DFIR", stamp: "Forensics clinic", lane: "learn", tags: ["#cyber", "#dfir"], kind: "lecture" },
  { id: "q-ir", house: "Incident response", q: "NIST incident response 800-61 official", stamp: "IR clinic", lane: "learn", tags: ["#cyber", "#ir"], kind: "framework" },
  { id: "q-intel", house: "Threat intelligence", q: "cyber threat intelligence lecture MITRE ATT&CK", stamp: "Intel clinic", lane: "learn", tags: ["#cyber", "#intel"], kind: "lecture" },
  { id: "q-malware", house: "Malware analysis", q: "malware analysis lecture university reverse engineering", stamp: "Malware clinic", lane: "learn", tags: ["#cyber", "#malware"], kind: "lecture" },
  { id: "q-iam", house: "IAM", q: "identity and access management lecture Zero Trust official", stamp: "IAM clinic", lane: "learn", tags: ["#cyber", "#iam"], kind: "lecture" },
  { id: "q-container", house: "Container security", q: "container security docker lecture CNCF official", stamp: "Container clinic", lane: "learn", tags: ["#cyber", "#container"], kind: "lecture" },
  { id: "q-iot", house: "IoT security", q: "IoT security lecture CISA official", stamp: "IoT clinic", lane: "learn", tags: ["#cyber", "#iot"], kind: "lecture" },
  { id: "q-mobsec", house: "Mobile security", q: "mobile application security OWASP MASVS lecture", stamp: "Mobile clinic", lane: "learn", tags: ["#cyber", "#mobile"], kind: "lecture" },
  { id: "q-arch", house: "Security architecture", q: "enterprise security architecture lecture SABSA", stamp: "Architecture clinic", lane: "learn", tags: ["#cyber", "#architecture"], kind: "lecture" },
  { id: "q-fedramp", house: "FedRAMP", q: "FedRAMP authorization official GSA", stamp: "FedRAMP clinic", lane: "learn", tags: ["#cyber", "#fedramp"], kind: "framework" },
  { id: "q-stig", house: "DISA STIG", q: "DISA STIG security technical implementation guide official", stamp: "STIG clinic", lane: "learn", tags: ["#cyber", "#stig"], kind: "framework" },
  { id: "q-privacy", house: "Privacy engineering", q: "privacy engineering lecture NIST privacy framework official", stamp: "Privacy clinic", lane: "learn", tags: ["#cyber", "#privacy"], kind: "lecture" },
  { id: "q-cyber-lab", house: "Cyber range", q: "cyber range lab walkthrough SOC investigation official", stamp: "Range lab", lane: "learn", tags: ["#cyber", "#range"], kind: "lab" },
  { id: "q-acct", house: "Accounting", q: "financial accounting lecture university", stamp: "Accounting clinic", lane: "learn", tags: ["#business", "#accounting"], kind: "lecture" },
  { id: "q-fin", house: "Finance", q: "corporate finance lecture university", stamp: "Finance clinic", lane: "learn", tags: ["#business", "#finance"], kind: "lecture" },
  { id: "q-econ", house: "Economics", q: "microeconomics lecture university MIT OCW", stamp: "Econ clinic", lane: "learn", tags: ["#business", "#econ"], kind: "lecture" },
  { id: "q-mkt", house: "Marketing", q: "marketing strategy lecture university", stamp: "Marketing clinic", lane: "learn", tags: ["#business", "#marketing"], kind: "lecture" },
  { id: "q-founder", house: "Entrepreneurship", q: "Y Combinator how to start a startup lecture", stamp: "Founder clinic", lane: "learn", tags: ["#business", "#startup"], kind: "lecture" },
  { id: "q-lead", house: "Leadership", q: "leadership management lecture business school", stamp: "Lead clinic", lane: "learn", tags: ["#business", "#lead"], kind: "lecture" },
  { id: "q-ops", house: "Operations", q: "operations management lecture university", stamp: "Ops clinic", lane: "learn", tags: ["#business", "#ops"], kind: "lecture" },
  { id: "q-scm", house: "Supply chain", q: "supply chain management lecture university", stamp: "Supply clinic", lane: "learn", tags: ["#business", "#scm"], kind: "lecture" },
  { id: "q-hr", house: "Human resources", q: "human resources management lecture university", stamp: "HR clinic", lane: "learn", tags: ["#business", "#hr"], kind: "lecture" },
  { id: "q-pmp", house: "Project management", q: "project management lecture PMI university", stamp: "PM clinic", lane: "learn", tags: ["#business", "#pm"], kind: "lecture" },
  { id: "q-product", house: "Product management", q: "product management lecture startup", stamp: "Product clinic", lane: "learn", tags: ["#business", "#product"], kind: "lecture" },
  { id: "q-bizan", house: "Business analytics", q: "business analytics lecture university", stamp: "Analytics clinic", lane: "learn", tags: ["#business", "#analytics"], kind: "lecture" },
  { id: "q-sales", house: "Sales", q: "sales negotiation lecture business school", stamp: "Sales clinic", lane: "learn", tags: ["#business", "#sales"], kind: "lecture" },
  { id: "q-bizlaw", house: "Business law", q: "business law lecture university contracts", stamp: "Law clinic", lane: "learn", tags: ["#business", "#law"], kind: "lecture" },
  { id: "q-strategy", house: "Corporate strategy", q: "corporate strategy lecture MBA university", stamp: "Strategy clinic", lane: "learn", tags: ["#business", "#strategy"], kind: "lecture" },
  { id: "q-vc", house: "Venture capital", q: "venture capital lecture how venture capital works", stamp: "VC clinic", lane: "learn", tags: ["#business", "#vc"], kind: "lecture" },
  { id: "q-sba", house: "Small business", q: "SBA how to start a small business official", stamp: "SBA clinic", lane: "learn", tags: ["#business", "#sba"], kind: "lecture" },
  { id: "q-llc", house: "Form an LLC", q: "how to form an LLC SBA official", stamp: "LLC clinic", lane: "learn", tags: ["#business", "#llc"], kind: "lecture" },
  { id: "q-plan", house: "Business plan", q: "how to write a business plan SBA official", stamp: "Plan clinic", lane: "learn", tags: ["#business", "#plan"], kind: "lecture" },
  { id: "q-price", house: "Pricing", q: "how to price a product lecture startup", stamp: "Price clinic", lane: "learn", tags: ["#business", "#price"], kind: "lecture" },
  { id: "q-pitch", house: "Pitch deck", q: "how to create a pitch deck Y Combinator", stamp: "Pitch clinic", lane: "learn", tags: ["#business", "#pitch"], kind: "lecture" },
  { id: "q-govcon", house: "Government contracting", q: "how to bid on government contracts SAM.gov SBA official", stamp: "GovCon clinic", lane: "learn", tags: ["#business", "#govcon"], kind: "lecture" },
  { id: "q-pf", house: "Personal finance", q: "personal finance literacy lecture university", stamp: "Money clinic", lane: "learn", tags: ["#money", "#literacy"], kind: "lecture" },
  { id: "q-budget", house: "Budgeting", q: "how to budget 50 30 20 lecture", stamp: "Budget clinic", lane: "learn", tags: ["#money", "#budget"], kind: "lecture" },
  { id: "q-credit", house: "Credit", q: "credit score explained lecture CFPB official", stamp: "Credit clinic", lane: "learn", tags: ["#money", "#credit"], kind: "lecture" },
  { id: "q-bank", house: "Banking", q: "how banks work lecture federal reserve education", stamp: "Bank clinic", lane: "learn", tags: ["#money", "#bank"], kind: "lecture" },
  { id: "q-invest", house: "Investing", q: "investing basics lecture index funds university", stamp: "Invest clinic", lane: "learn", tags: ["#money", "#invest"], kind: "lecture" },
  { id: "q-retire", house: "Retirement", q: "retirement planning lecture compound interest", stamp: "Retire clinic", lane: "learn", tags: ["#money", "#retire"], kind: "lecture" },
  { id: "q-tax", house: "Taxes", q: "how taxes work IRS education official", stamp: "Tax clinic", lane: "learn", tags: ["#money", "#tax"], kind: "lecture" },
  { id: "q-re", house: "Real estate", q: "real estate investing lecture university", stamp: "Realty clinic", lane: "learn", tags: ["#money", "#realty"], kind: "lecture" },
  { id: "q-mortgage", house: "Mortgages", q: "how mortgages work CFPB official", stamp: "Mortgage clinic", lane: "learn", tags: ["#money", "#mortgage"], kind: "lecture" },
  { id: "q-insure", house: "Insurance", q: "how insurance works lecture university", stamp: "Cover clinic", lane: "learn", tags: ["#money", "#insurance"], kind: "lecture" },
  { id: "q-finstmt", house: "Financial statements", q: "how to read financial statements lecture", stamp: "Statements clinic", lane: "learn", tags: ["#money", "#statements"], kind: "lecture" },
  { id: "q-markets", house: "Financial markets", q: "how stock markets work lecture university", stamp: "Markets clinic", lane: "learn", tags: ["#money", "#markets"], kind: "lecture" },
  { id: "q-anatomy", house: "Anatomy", q: "human anatomy lecture university khan academy", stamp: "Anatomy clinic", lane: "learn", tags: ["#care", "#anatomy"], kind: "lecture" },
  { id: "q-physio", house: "Physiology", q: "human physiology lecture university", stamp: "Physio clinic", lane: "learn", tags: ["#care", "#physio"], kind: "lecture" },
  { id: "q-patho", house: "Pathophysiology", q: "pathophysiology lecture nursing university", stamp: "Patho clinic", lane: "learn", tags: ["#care", "#patho"], kind: "lecture" },
  { id: "q-psychiatry", house: "Psychiatry", q: "psychiatry lecture university NIMH", stamp: "Psychiatry clinic", lane: "learn", tags: ["#care", "#psychiatry"], kind: "lecture" },
  { id: "q-ph-pub", house: "Public health", q: "public health lecture CDC university epidemiology", stamp: "Public health clinic", lane: "learn", tags: ["#care", "#publichealth"], kind: "lecture" },
  { id: "q-nutri", house: "Nutrition", q: "nutrition science lecture university", stamp: "Nutrition clinic", lane: "learn", tags: ["#care", "#nutrition"], kind: "lecture" },
  { id: "q-epi", house: "Epidemiology", q: "epidemiology lecture university CDC", stamp: "Epi clinic", lane: "learn", tags: ["#care", "#epi"], kind: "lecture" },
  { id: "q-geri", house: "Geriatrics", q: "geriatrics lecture university", stamp: "Geriatrics clinic", lane: "learn", tags: ["#care", "#geri"], kind: "lecture" },
  { id: "q-pedi", house: "Pediatrics", q: "pediatrics lecture university", stamp: "Peds clinic", lane: "learn", tags: ["#care", "#peds"], kind: "lecture" },
  { id: "q-em", house: "Emergency medicine", q: "emergency medicine lecture university", stamp: "EM clinic", lane: "learn", tags: ["#care", "#em"], kind: "lecture" },
  { id: "q-surg", house: "Surgery", q: "surgery lecture university Johns Hopkins", stamp: "Surgery clinic", lane: "learn", tags: ["#care", "#surgery"], kind: "lecture" },
  { id: "q-medtech", house: "Medical technology", q: "medical technology lecture university", stamp: "MedTech clinic", lane: "learn", tags: ["#care", "#medtech"], kind: "lecture" },
  { id: "q-hcadmin", house: "Healthcare administration", q: "healthcare administration lecture university", stamp: "Admin clinic", lane: "learn", tags: ["#care", "#admin"], kind: "lecture" },
  { id: "q-cog", house: "Cognitive psychology", q: "cognitive psychology lecture university", stamp: "Cognitive clinic", lane: "learn", tags: ["#mind", "#cognitive"], kind: "lecture" },
  { id: "q-behav", house: "Behavioral psychology", q: "behavioral psychology lecture university", stamp: "Behavior clinic", lane: "learn", tags: ["#mind", "#behavior"], kind: "lecture" },
  { id: "q-socialp", house: "Social psychology", q: "social psychology lecture university", stamp: "Social clinic", lane: "learn", tags: ["#mind", "#social"], kind: "lecture" },
  { id: "q-devp", house: "Developmental psychology", q: "developmental psychology lecture university", stamp: "Develop clinic", lane: "learn", tags: ["#mind", "#develop"], kind: "lecture" },
  { id: "q-neuro", house: "Neuroscience", q: "neuroscience lecture university MIT", stamp: "Neuro clinic", lane: "learn", tags: ["#mind", "#neuro"], kind: "lecture" },
  { id: "q-memory", house: "Memory", q: "memory science lecture university", stamp: "Memory clinic", lane: "learn", tags: ["#mind", "#memory"], kind: "lecture" },
  { id: "q-learn-sci", house: "Learning science", q: "how learning works lecture cognitive science", stamp: "Learn clinic", lane: "learn", tags: ["#mind", "#learning"], kind: "lecture" },
  { id: "q-decide", house: "Decision-making", q: "decision making psychology lecture Kahneman", stamp: "Decide clinic", lane: "learn", tags: ["#mind", "#decide"], kind: "lecture" },
  { id: "q-motive", house: "Motivation", q: "motivation psychology lecture university", stamp: "Motive clinic", lane: "learn", tags: ["#mind", "#motive"], kind: "lecture" },
  { id: "q-sleep", house: "Sleep science", q: "sleep science lecture university Matthew Walker", stamp: "Sleep clinic", lane: "learn", tags: ["#mind", "#sleep"], kind: "lecture" },
  { id: "q-hci", house: "Human-computer interaction", q: "human computer interaction lecture university", stamp: "HCI clinic", lane: "learn", tags: ["#mind", "#hci"], kind: "lecture" },
  { id: "q-usgov", house: "U.S. government", q: "US government civics lecture constitution official", stamp: "Civics clinic", lane: "learn", tags: ["#civic", "#gov"], kind: "lecture" },
  { id: "q-const", house: "Constitution", q: "US constitution lecture National Archives official", stamp: "Constitution clinic", lane: "learn", tags: ["#civic", "#constitution"], kind: "lecture" },
  { id: "q-fed", house: "Federalism", q: "federalism lecture university US government", stamp: "Federal clinic", lane: "learn", tags: ["#civic", "#federal"], kind: "lecture" },
  { id: "q-state", house: "State government", q: "state government lecture civics official", stamp: "State clinic", lane: "learn", tags: ["#civic", "#state"], kind: "lecture" },
  { id: "q-local", house: "Local government", q: "local government city council lecture civics", stamp: "Local clinic", lane: "learn", tags: ["#civic", "#local"], kind: "lecture" },
  { id: "q-courts", house: "Courts", q: "how US courts work lecture official", stamp: "Courts clinic", lane: "learn", tags: ["#civic", "#courts"], kind: "lecture" },
  { id: "q-scotus", house: "Supreme Court", q: "Supreme Court lecture Oyez official", stamp: "SCOTUS clinic", lane: "learn", tags: ["#civic", "#scotus"], kind: "lecture" },
  { id: "q-adminlaw", house: "Administrative law", q: "administrative law lecture university", stamp: "Admin law clinic", lane: "learn", tags: ["#civic", "#adminlaw"], kind: "lecture" },
  { id: "q-intl-law", house: "International law", q: "international law lecture university", stamp: "Intl law clinic", lane: "learn", tags: ["#civic", "#intl"], kind: "lecture" },
  { id: "q-hrlaw", house: "Human rights", q: "human rights law lecture university UN", stamp: "Rights clinic", lane: "learn", tags: ["#civic", "#rights"], kind: "lecture" },
  { id: "q-policy", house: "Public policy", q: "public policy lecture university", stamp: "Policy clinic", lane: "learn", tags: ["#civic", "#policy"], kind: "lecture" },
  { id: "q-padmin", house: "Public administration", q: "public administration lecture university", stamp: "Public admin clinic", lane: "learn", tags: ["#civic", "#padmin"], kind: "lecture" },
  { id: "q-iplaw", house: "Intellectual property", q: "intellectual property law lecture USPTO official", stamp: "IP clinic", lane: "learn", tags: ["#civic", "#ip"], kind: "lecture" },
  { id: "q-privlaw", house: "Privacy law", q: "privacy law lecture university", stamp: "Privacy law clinic", lane: "learn", tags: ["#civic", "#privlaw"], kind: "lecture" },
  { id: "q-infolaw", house: "Information law", q: "cyber law lecture university computer crime", stamp: "Info law clinic", lane: "learn", tags: ["#civic", "#infolaw"], kind: "lecture" },
  { id: "q-ancient", house: "Ancient civilizations", q: "ancient civilizations lecture university", stamp: "Ancient clinic", lane: "learn", tags: ["#history", "#ancient"], kind: "lecture" },
  { id: "q-afhist", house: "African history", q: "African history lecture university", stamp: "Africa clinic", lane: "learn", tags: ["#history", "#africa"], kind: "lecture" },
  { id: "q-aahist", house: "African-American history", q: "African American history lecture university", stamp: "AA history clinic", lane: "learn", tags: ["#history", "#aa"], kind: "lecture" },
  { id: "q-euhist", house: "European history", q: "European history lecture university", stamp: "Europe clinic", lane: "learn", tags: ["#history", "#europe"], kind: "lecture" },
  { id: "q-asiahist", house: "Asian history", q: "Asian history lecture university", stamp: "Asia clinic", lane: "learn", tags: ["#history", "#asia"], kind: "lecture" },
  { id: "q-mehist", house: "Middle Eastern history", q: "Middle East history lecture university", stamp: "MENA clinic", lane: "learn", tags: ["#history", "#mena"], kind: "lecture" },
  { id: "q-lahist", house: "Latin American history", q: "Latin American history lecture university", stamp: "LatAm clinic", lane: "learn", tags: ["#history", "#latam"], kind: "lecture" },
  { id: "q-ushist", house: "U.S. history", q: "US history lecture university Library of Congress", stamp: "US history clinic", lane: "learn", tags: ["#history", "#us"], kind: "lecture" },
  { id: "q-milhist", house: "Military history", q: "military history lecture university", stamp: "Military clinic", lane: "learn", tags: ["#history", "#military"], kind: "lecture" },
  { id: "q-econhist", house: "Economic history", q: "economic history lecture university", stamp: "Econ history clinic", lane: "learn", tags: ["#history", "#econhist"], kind: "lecture" },
  { id: "q-scihist", house: "History of science", q: "history of science lecture university", stamp: "Science history clinic", lane: "learn", tags: ["#history", "#scihist"], kind: "lecture" },
  { id: "q-techhist", house: "History of technology", q: "history of technology lecture university", stamp: "Tech history clinic", lane: "learn", tags: ["#history", "#techhist"], kind: "lecture" },
  { id: "q-relhist", house: "Religious history", q: "history of religion lecture university", stamp: "Faith history clinic", lane: "learn", tags: ["#history", "#relhist"], kind: "lecture" },
  { id: "q-archaeo", house: "Archaeology", q: "archaeology lecture university", stamp: "Dig clinic", lane: "learn", tags: ["#history", "#archaeology"], kind: "lecture" },
  { id: "q-anthro", house: "Anthropology", q: "anthropology lecture university", stamp: "Anthro clinic", lane: "learn", tags: ["#history", "#anthro"], kind: "lecture" },
  { id: "q-en", house: "English", q: "English language lesson university ESL", stamp: "English clinic", lane: "learn", tags: ["#lang", "#en"], kind: "lecture" },
  { id: "q-es", house: "Spanish", q: "Spanish language lesson university", stamp: "Spanish clinic", lane: "learn", tags: ["#lang", "#es"], kind: "lecture" },
  { id: "q-fr", house: "French", q: "French language lesson university", stamp: "French clinic", lane: "learn", tags: ["#lang", "#fr"], kind: "lecture" },
  { id: "q-de", house: "German", q: "German language lesson university", stamp: "German clinic", lane: "learn", tags: ["#lang", "#de"], kind: "lecture" },
  { id: "q-pt", house: "Portuguese", q: "Portuguese language lesson university", stamp: "Portuguese clinic", lane: "learn", tags: ["#lang", "#pt"], kind: "lecture" },
  { id: "q-ar", house: "Arabic", q: "Arabic language lesson university", stamp: "Arabic clinic", lane: "learn", tags: ["#lang", "#ar"], kind: "lecture" },
  { id: "q-zh", house: "Chinese", q: "Mandarin Chinese language lesson university", stamp: "Chinese clinic", lane: "learn", tags: ["#lang", "#zh"], kind: "lecture" },
  { id: "q-ja", house: "Japanese", q: "Japanese language lesson university", stamp: "Japanese clinic", lane: "learn", tags: ["#lang", "#ja"], kind: "lecture" },
  { id: "q-ko", house: "Korean", q: "Korean language lesson university", stamp: "Korean clinic", lane: "learn", tags: ["#lang", "#ko"], kind: "lecture" },
  { id: "q-it", house: "Italian", q: "Italian language lesson university", stamp: "Italian clinic", lane: "learn", tags: ["#lang", "#it"], kind: "lecture" },
  { id: "q-ru", house: "Russian", q: "Russian language lesson university", stamp: "Russian clinic", lane: "learn", tags: ["#lang", "#ru"], kind: "lecture" },
  { id: "q-twi", house: "Twi", q: "Twi language lesson Akan Ghana", stamp: "Twi clinic", lane: "learn", tags: ["#lang", "#twi"], kind: "lecture" },
  { id: "q-akan", house: "Akan", q: "Akan language lesson Ghana", stamp: "Akan clinic", lane: "learn", tags: ["#lang", "#akan"], kind: "lecture" },
  { id: "q-asl", house: "ASL", q: "American Sign Language lesson university", stamp: "ASL clinic", lane: "learn", tags: ["#lang", "#asl"], kind: "lecture" },
  { id: "q-speak", house: "Public speaking", q: "public speaking lecture university", stamp: "Speak clinic", lane: "learn", tags: ["#speak", "#present"], kind: "lecture" },
  { id: "q-acwrite", house: "Academic writing", q: "academic writing lecture university", stamp: "Write clinic", lane: "learn", tags: ["#speak", "#academic"], kind: "lecture" },
  { id: "q-bizwrite", house: "Business writing", q: "business writing lecture university", stamp: "Biz write clinic", lane: "learn", tags: ["#speak", "#bizwrite"], kind: "lecture" },
  { id: "q-techwrite", house: "Technical writing", q: "technical writing lecture university", stamp: "Tech write clinic", lane: "learn", tags: ["#speak", "#techwrite"], kind: "lecture" },
  { id: "q-present", house: "Presentation skills", q: "presentation skills lecture university", stamp: "Present clinic", lane: "learn", tags: ["#speak", "#slides"], kind: "lecture" },
  { id: "q-interview", house: "Interviewing", q: "interview skills lecture university", stamp: "Interview clinic", lane: "learn", tags: ["#speak", "#interview"], kind: "lecture" },
  { id: "q-debate", house: "Debate", q: "debate lecture university argumentation", stamp: "Debate clinic", lane: "learn", tags: ["#speak", "#debate"], kind: "lecture" },
  { id: "q-story", house: "Storytelling", q: "storytelling lecture university", stamp: "Story clinic", lane: "learn", tags: ["#speak", "#story"], kind: "lecture" },
  { id: "q-journal", house: "Journalism", q: "journalism lecture university media literacy", stamp: "Press clinic", lane: "learn", tags: ["#speak", "#press"], kind: "lecture" },
  { id: "q-medialit", house: "Media literacy", q: "media literacy lecture university", stamp: "Media clinic", lane: "learn", tags: ["#speak", "#media"], kind: "lecture" },
  { id: "q-rescomm", house: "Research communication", q: "how to present research lecture university", stamp: "Res comm clinic", lane: "learn", tags: ["#speak", "#rescomm"], kind: "lecture" },
  { id: "q-methods", house: "Research methods", q: "research methods lecture university", stamp: "Methods clinic", lane: "learn", tags: ["#research", "#methods"], kind: "lecture" },
  { id: "q-litrev", house: "Literature review", q: "how to write a literature review lecture", stamp: "Lit review clinic", lane: "learn", tags: ["#research", "#litreview"], kind: "lecture" },
  { id: "q-readpaper", house: "How to read a paper", q: "how to read a scientific paper lecture", stamp: "Paper clinic", lane: "learn", tags: ["#research", "#paper"], kind: "lecture" },
  { id: "q-data", house: "Datasets", q: "open research datasets lecture university", stamp: "Data clinic", lane: "learn", tags: ["#research", "#data"], kind: "lecture" },
  { id: "q-cite", house: "Citation", q: "citation research lecture university", stamp: "Cite clinic", lane: "learn", tags: ["#research", "#cite"], kind: "lecture" },
  { id: "q-qual", house: "Qualitative research", q: "qualitative research methods lecture university", stamp: "Qual clinic", lane: "learn", tags: ["#research", "#qual"], kind: "lecture" },
  { id: "q-quant", house: "Quantitative research", q: "quantitative research methods lecture university", stamp: "Quant clinic", lane: "learn", tags: ["#research", "#quant"], kind: "lecture" },
  { id: "q-sysrev", house: "Systematic reviews", q: "systematic review lecture university Cochrane", stamp: "Review clinic", lane: "learn", tags: ["#research", "#sysrev"], kind: "lecture" },
  { id: "q-meta", house: "Meta-analysis", q: "meta analysis lecture university", stamp: "Meta clinic", lane: "learn", tags: ["#research", "#meta"], kind: "lecture" },
  { id: "q-exp", house: "Experimental design", q: "experimental design lecture university", stamp: "Design clinic", lane: "learn", tags: ["#research", "#experiment"], kind: "lecture" },
  { id: "q-collect", house: "Data collection", q: "research data collection lecture university", stamp: "Collect clinic", lane: "learn", tags: ["#research", "#collect"], kind: "lecture" },
  { id: "q-analyze", house: "Data analysis", q: "research data analysis lecture university", stamp: "Analyze clinic", lane: "learn", tags: ["#research", "#analyze"], kind: "lecture" },
  { id: "q-ethics", house: "Research ethics", q: "research ethics lecture university IRB", stamp: "Ethics clinic", lane: "learn", tags: ["#research", "#ethics"], kind: "lecture" },
  { id: "q-irb", house: "IRB", q: "institutional review board lecture university", stamp: "IRB clinic", lane: "learn", tags: ["#research", "#irb"], kind: "lecture" },
  { id: "q-repro", house: "Reproducibility", q: "reproducible research lecture university", stamp: "Repro clinic", lane: "learn", tags: ["#research", "#repro"], kind: "lecture" },
  { id: "q-grant", house: "Grant writing", q: "grant writing lecture NSF NIH university", stamp: "Grant clinic", lane: "learn", tags: ["#research", "#grant"], kind: "lecture" },
  { id: "q-arduino", house: "Arduino", q: "Arduino tutorial electronics lecture", stamp: "Arduino clinic", lane: "learn", tags: ["#maker", "#arduino"], kind: "lab" },
  { id: "q-pi", house: "Raspberry Pi", q: "Raspberry Pi tutorial lecture", stamp: "Pi clinic", lane: "learn", tags: ["#maker", "#pi"], kind: "lab" },
  { id: "q-circuits", house: "Electronics", q: "electronics lecture university circuits", stamp: "Electronics clinic", lane: "learn", tags: ["#maker", "#electronics"], kind: "lecture" },
  { id: "q-cad", house: "CAD", q: "CAD mechanical design lecture university", stamp: "CAD clinic", lane: "learn", tags: ["#maker", "#cad"], kind: "lecture" },
  { id: "q-print3d", house: "3D printing", q: "3D printing lecture university additive manufacturing", stamp: "Print clinic", lane: "learn", tags: ["#maker", "#3d"], kind: "lab" },
  { id: "q-embed", house: "Embedded systems", q: "embedded systems lecture university", stamp: "Embedded clinic", lane: "learn", tags: ["#maker", "#embedded"], kind: "lecture" },
  { id: "q-drone", house: "Drones", q: "drone robotics lecture university", stamp: "Drone clinic", lane: "learn", tags: ["#maker", "#drone"], kind: "lecture" },
  { id: "q-auto", house: "Automation", q: "industrial automation lecture university PLC", stamp: "Auto clinic", lane: "learn", tags: ["#maker", "#auto"], kind: "lecture" },
  { id: "q-mfg", house: "Manufacturing", q: "manufacturing engineering lecture university", stamp: "Shop floor clinic", lane: "learn", tags: ["#maker", "#mfg"], kind: "lecture" },
  { id: "q-circ", house: "Circuit design", q: "circuit design lecture university", stamp: "Circuit clinic", lane: "learn", tags: ["#maker", "#circuit"], kind: "lecture" },
  { id: "q-maker-iot", house: "Maker IoT", q: "IoT electronics raspberry pi lecture", stamp: "Maker IoT clinic", lane: "learn", tags: ["#maker", "#iot"], kind: "lab" },
  { id: "q-aws-core", house: "AWS foundations", q: "AWS cloud practitioner official training", stamp: "AWS clinic", lane: "learn", tags: ["#infra", "#aws"], kind: "lecture" },
  { id: "q-azure-core", house: "Azure foundations", q: "Microsoft Azure fundamentals official", stamp: "Azure clinic", lane: "learn", tags: ["#infra", "#azure"], kind: "lecture" },
  { id: "q-gcp-core", house: "GCP foundations", q: "Google Cloud fundamentals official", stamp: "GCP clinic", lane: "learn", tags: ["#infra", "#gcp"], kind: "lecture" },
  { id: "q-linux", house: "Linux", q: "Linux system administration lecture university", stamp: "Linux clinic", lane: "learn", tags: ["#infra", "#linux"], kind: "lecture" },
  { id: "q-neteng", house: "Cloud networking", q: "cloud networking VPC lecture official", stamp: "Net eng clinic", lane: "learn", tags: ["#infra", "#network"], kind: "lecture" },
  { id: "q-docker", house: "Docker", q: "Docker containers lecture official", stamp: "Docker clinic", lane: "learn", tags: ["#infra", "#docker"], kind: "lecture" },
  { id: "q-k8s-ops", house: "Kubernetes ops", q: "Kubernetes administration lecture CNCF official", stamp: "K8s ops clinic", lane: "learn", tags: ["#infra", "#k8s"], kind: "lecture" },
  { id: "q-tf", house: "Terraform", q: "Terraform infrastructure as code lecture HashiCorp", stamp: "Terraform clinic", lane: "learn", tags: ["#infra", "#terraform"], kind: "lecture" },
  { id: "q-cicd", house: "CI/CD", q: "CI CD pipeline lecture GitHub Actions official", stamp: "Pipeline clinic", lane: "learn", tags: ["#infra", "#cicd"], kind: "lecture" },
  { id: "q-obs", house: "Observability", q: "observability monitoring lecture OpenTelemetry", stamp: "Observe clinic", lane: "learn", tags: ["#infra", "#observe"], kind: "lecture" },
  { id: "q-devops", house: "DevOps", q: "DevOps lecture university CI CD", stamp: "DevOps clinic", lane: "learn", tags: ["#infra", "#devops"], kind: "lecture" },
  { id: "q-devsec", house: "DevSecOps", q: "DevSecOps lecture secure pipeline official", stamp: "DevSecOps clinic", lane: "learn", tags: ["#infra", "#devsecops"], kind: "lecture" },
  { id: "q-serverless", house: "Serverless", q: "AWS Lambda serverless architecture official", stamp: "Serverless clinic", lane: "learn", tags: ["#infra", "#serverless"], kind: "lecture" },
  { id: "q-clouddb", house: "Cloud databases", q: "cloud database RDS DynamoDB lecture official", stamp: "Cloud DB clinic", lane: "learn", tags: ["#infra", "#db"], kind: "lecture" },
  { id: "q-cloudarch", house: "Cloud architecture", q: "cloud architecture well architected lecture official", stamp: "Arch clinic", lane: "learn", tags: ["#infra", "#arch"], kind: "lecture" },
  { id: "q-cloudsec", house: "Cloud security ops", q: "AWS security fundamentals official IAM S3", stamp: "Cloud sec clinic", lane: "learn", tags: ["#infra", "#cloudsec"], kind: "lecture" },
  { id: "q-py-data", house: "Python for data", q: "python pandas lecture university data analysis", stamp: "Python data clinic", lane: "learn", tags: ["#data", "#python"], kind: "lecture" },
  { id: "q-sql", house: "SQL", q: "SQL lecture university database", stamp: "SQL clinic", lane: "learn", tags: ["#data", "#sql"], kind: "lecture" },
  { id: "q-excel", house: "Excel", q: "excel data analysis lecture university", stamp: "Excel clinic", lane: "learn", tags: ["#data", "#excel"], kind: "lecture" },
  { id: "q-datastats", house: "Data statistics", q: "statistics for data science lecture university", stamp: "Data stats clinic", lane: "learn", tags: ["#data", "#stats"], kind: "lecture" },
  { id: "q-viz", house: "Data visualization", q: "data visualization lecture university", stamp: "Viz clinic", lane: "learn", tags: ["#data", "#viz"], kind: "lecture" },
  { id: "q-de", house: "Data engineering", q: "data engineering lecture university ETL", stamp: "DE clinic", lane: "learn", tags: ["#data", "#de"], kind: "lecture" },
  { id: "q-etl", house: "ETL", q: "ETL pipeline lecture university", stamp: "ETL clinic", lane: "learn", tags: ["#data", "#etl"], kind: "lecture" },
  { id: "q-big", house: "Big data", q: "big data lecture university spark", stamp: "Big data clinic", lane: "learn", tags: ["#data", "#big"], kind: "lecture" },
  { id: "q-analytics", house: "Data analytics", q: "data analytics lecture university", stamp: "Analytics clinic", lane: "learn", tags: ["#data", "#analytics"], kind: "lecture" },
  { id: "q-bi", house: "Business intelligence", q: "business intelligence lecture university", stamp: "BI clinic", lane: "learn", tags: ["#data", "#bi"], kind: "lecture" },
  { id: "q-dbmodel", house: "Data modeling", q: "data modeling lecture university star schema", stamp: "Model clinic", lane: "learn", tags: ["#data", "#model"], kind: "lecture" },
  { id: "q-art", house: "Art history", q: "art history lecture university", stamp: "Art clinic", lane: "learn", tags: ["#arts", "#art"], kind: "lecture" },
  { id: "q-photo", house: "Photography", q: "photography lecture university", stamp: "Photo clinic", lane: "learn", tags: ["#arts", "#photo"], kind: "lecture" },
  { id: "q-film", house: "Film", q: "film studies lecture university", stamp: "Film clinic", lane: "learn", tags: ["#arts", "#film"], kind: "lecture" },
  { id: "q-archit", house: "Architecture", q: "architecture lecture university", stamp: "Architecture clinic", lane: "learn", tags: ["#arts", "#architecture"], kind: "lecture" },
  { id: "q-theater", house: "Theater", q: "theater lecture university", stamp: "Theater clinic", lane: "learn", tags: ["#arts", "#theater"], kind: "lecture" },
  { id: "q-lit", house: "Literature", q: "literature lecture university", stamp: "Lit clinic", lane: "learn", tags: ["#arts", "#lit"], kind: "lecture" },
  { id: "q-poetry", house: "Poetry", q: "poetry lecture university", stamp: "Poetry clinic", lane: "learn", tags: ["#arts", "#poetry"], kind: "lecture" },
  { id: "q-creative", house: "Creative writing", q: "creative writing lecture university", stamp: "Write art clinic", lane: "learn", tags: ["#arts", "#creative"], kind: "lecture" },
  { id: "q-classical", house: "Classical music", q: "classical music history lecture university", stamp: "Classical clinic", lane: "learn", tags: ["#arts", "#classical"], kind: "lecture" },
  { id: "q-logic", house: "Logic", q: "logic lecture university critical thinking", stamp: "Logic clinic", lane: "learn", tags: ["#think", "#logic"], kind: "lecture" },
  { id: "q-ethics-ph", house: "Ethics", q: "ethics philosophy lecture university", stamp: "Ethics clinic", lane: "learn", tags: ["#think", "#ethics"], kind: "lecture" },
  { id: "q-epistem", house: "Epistemology", q: "epistemology lecture university", stamp: "Know clinic", lane: "learn", tags: ["#think", "#epistemology"], kind: "lecture" },
  { id: "q-metaphys", house: "Metaphysics", q: "metaphysics lecture university", stamp: "Metaphysics clinic", lane: "learn", tags: ["#think", "#metaphysics"], kind: "lecture" },
  { id: "q-polphil", house: "Political philosophy", q: "political philosophy lecture university", stamp: "Polphil clinic", lane: "learn", tags: ["#think", "#political"], kind: "lecture" },
  { id: "q-philsci", house: "Philosophy of science", q: "philosophy of science lecture university", stamp: "Phil sci clinic", lane: "learn", tags: ["#think", "#philsci"], kind: "lecture" },
  { id: "q-philtech", house: "Philosophy of technology", q: "philosophy of technology lecture university", stamp: "Phil tech clinic", lane: "learn", tags: ["#think", "#philtech"], kind: "lecture" },
  { id: "q-aiethics", house: "AI ethics", q: "AI ethics lecture university", stamp: "AI ethics clinic", lane: "learn", tags: ["#think", "#aiethics"], kind: "lecture" },
  { id: "q-crit", house: "Critical thinking", q: "critical thinking lecture university", stamp: "Critical clinic", lane: "learn", tags: ["#think", "#critical"], kind: "lecture" },
  { id: "q-argue", house: "Argumentation", q: "argumentation lecture university informal logic", stamp: "Argue clinic", lane: "learn", tags: ["#think", "#argue"], kind: "lecture" },
  { id: "q-meteo", house: "Meteorology", q: "meteorology lecture NOAA university", stamp: "Weather clinic", lane: "learn", tags: ["#earth", "#meteo"], kind: "lecture" },
  { id: "q-ocean", house: "Oceanography", q: "oceanography lecture NOAA university", stamp: "Ocean clinic", lane: "learn", tags: ["#earth", "#ocean"], kind: "lecture" },
  { id: "q-geo", house: "Geology", q: "geology lecture university USGS", stamp: "Geology clinic", lane: "learn", tags: ["#earth", "#geology"], kind: "lecture" },
  { id: "q-astro", house: "Astronomy", q: "astronomy lecture NASA university", stamp: "Astro clinic", lane: "learn", tags: ["#earth", "#astro"], kind: "lecture" },
  { id: "q-env", house: "Environmental science", q: "environmental science lecture university", stamp: "Env clinic", lane: "learn", tags: ["#earth", "#env"], kind: "lecture" },
  { id: "q-conserve", house: "Conservation", q: "conservation ecology lecture university", stamp: "Conserve clinic", lane: "learn", tags: ["#earth", "#conserve"], kind: "lecture" },
  { id: "q-renew", house: "Renewable energy", q: "renewable energy lecture university NREL", stamp: "Renew clinic", lane: "learn", tags: ["#earth", "#renew"], kind: "lecture" },
  { id: "q-sustain", house: "Sustainability", q: "sustainability lecture university", stamp: "Sustain clinic", lane: "learn", tags: ["#earth", "#sustain"], kind: "lecture" },
  { id: "q-water", house: "Water systems", q: "water systems hydrology lecture university", stamp: "Water clinic", lane: "learn", tags: ["#earth", "#water"], kind: "lecture" },
  { id: "q-enveng", house: "Environmental engineering", q: "environmental engineering lecture university", stamp: "Env eng clinic", lane: "learn", tags: ["#earth", "#enveng"], kind: "lecture" },
  { id: "q-astrophys", house: "Astrophysics", q: "astrophysics lecture university NASA", stamp: "Astrophysics clinic", lane: "learn", tags: ["#space", "#astro"], kind: "lecture" },
  { id: "q-planets", house: "Planetary science", q: "planetary science lecture NASA JPL", stamp: "Planet clinic", lane: "learn", tags: ["#space", "#planets"], kind: "lecture" },
  { id: "q-rockets", house: "Rockets", q: "rocket engineering lecture NASA university", stamp: "Rocket clinic", lane: "learn", tags: ["#space", "#rocket"], kind: "lecture" },
  { id: "q-sats", house: "Satellites", q: "satellite engineering lecture NASA", stamp: "Satellite clinic", lane: "learn", tags: ["#space", "#sat"], kind: "lecture" },
  { id: "q-explore", house: "Space exploration", q: "space exploration lecture NASA official", stamp: "Explore clinic", lane: "learn", tags: ["#space", "#explore"], kind: "lecture" },
  { id: "q-missions", house: "NASA missions", q: "NASA mission briefing official Artemis", stamp: "Mission clinic", lane: "learn", tags: ["#space", "#nasa"], kind: "lecture" },
  { id: "q-spacemed", house: "Space medicine", q: "space medicine lecture NASA", stamp: "Space med clinic", lane: "learn", tags: ["#space", "#spacemed"], kind: "lecture" },
  { id: "q-spacepol", house: "Space policy", q: "space policy lecture university NASA", stamp: "Space policy clinic", lane: "learn", tags: ["#space", "#policy"], kind: "lecture" },
  { id: "q-astrobio", house: "Astrobiology", q: "astrobiology lecture NASA university", stamp: "Astrobio clinic", lane: "learn", tags: ["#space", "#astrobio"], kind: "lecture" },
  { id: "q-spaceeng", house: "Space engineering", q: "aerospace engineering lecture university", stamp: "Aero clinic", lane: "learn", tags: ["#space", "#aero"], kind: "lecture" },
  { id: "q-plumb", house: "Plumbing", q: "plumbing training tutorial trade", stamp: "Pipe clinic", lane: "learn", tags: ["#trade", "#plumb"], kind: "lab" },
  { id: "q-hvac", house: "HVAC", q: "HVAC training tutorial trade", stamp: "HVAC clinic", lane: "learn", tags: ["#trade", "#hvac"], kind: "lab" },
  { id: "q-weld", house: "Welding", q: "welding training tutorial trade", stamp: "Weld clinic", lane: "learn", tags: ["#trade", "#weld"], kind: "lab" },
  { id: "q-autos", house: "Automotive", q: "automotive repair training tutorial", stamp: "Auto shop clinic", lane: "learn", tags: ["#trade", "#auto"], kind: "lab" },
  { id: "q-build", house: "Construction", q: "construction training NCCER tutorial", stamp: "Site clinic", lane: "learn", tags: ["#trade", "#build"], kind: "lab" },
  { id: "q-home", house: "Home repair", q: "home repair tutorial trade", stamp: "Home clinic", lane: "learn", tags: ["#trade", "#home"], kind: "lab" },
  { id: "q-appliance", house: "Appliance repair", q: "appliance repair training tutorial", stamp: "Appliance clinic", lane: "learn", tags: ["#trade", "#appliance"], kind: "lab" },
  { id: "q-land", house: "Landscaping", q: "landscaping training tutorial", stamp: "Land clinic", lane: "learn", tags: ["#trade", "#land"], kind: "lab" },
  { id: "q-machine", house: "Machining", q: "machining mill lathe training tutorial", stamp: "Machine clinic", lane: "learn", tags: ["#trade", "#machine"], kind: "lab" },
  { id: "q-solar", house: "Solar installation", q: "solar panel installation training tutorial", stamp: "Solar clinic", lane: "learn", tags: ["#trade", "#solar"], kind: "lab" },
  { id: "q-farm", house: "Farming", q: "farming agronomy lecture USDA university", stamp: "Farm clinic", lane: "learn", tags: ["#ag", "#farm"], kind: "lecture" },
  { id: "q-soil", house: "Soil science", q: "soil science lecture university USDA", stamp: "Soil clinic", lane: "learn", tags: ["#ag", "#soil"], kind: "lecture" },
  { id: "q-hydro", house: "Hydroponics", q: "hydroponics lecture university", stamp: "Hydro clinic", lane: "learn", tags: ["#ag", "#hydro"], kind: "lecture" },
  { id: "q-aqua", house: "Aquaponics", q: "aquaponics lecture university", stamp: "Aqua clinic", lane: "learn", tags: ["#ag", "#aqua"], kind: "lecture" },
  { id: "q-live", house: "Livestock", q: "livestock science lecture university", stamp: "Herd clinic", lane: "learn", tags: ["#ag", "#livestock"], kind: "lecture" },
  { id: "q-agtech", house: "Agricultural technology", q: "agricultural technology lecture university", stamp: "AgTech clinic", lane: "learn", tags: ["#ag", "#agtech"], kind: "lecture" },
  { id: "q-foodsci", house: "Food science", q: "food science lecture university", stamp: "Food clinic", lane: "learn", tags: ["#ag", "#food"], kind: "lecture" },
  { id: "q-foodsafe", house: "Food safety", q: "food safety lecture FDA USDA official", stamp: "Food safety clinic", lane: "learn", tags: ["#ag", "#foodsafe"], kind: "lecture" },
  { id: "q-sustainag", house: "Sustainable agriculture", q: "sustainable agriculture lecture USDA university", stamp: "Sustain ag clinic", lane: "learn", tags: ["#ag", "#sustainag"], kind: "lecture" },
  { id: "q-resume", house: "Resume", q: "resume writing lecture career university", stamp: "Resume clinic", lane: "learn", tags: ["#career", "#resume"], kind: "lecture" },
  { id: "q-interview", house: "Interview prep", q: "interview preparation lecture STAR method", stamp: "Interview clinic", lane: "learn", tags: ["#career", "#interview"], kind: "lecture" },
  { id: "q-linkedin", house: "LinkedIn", q: "LinkedIn professional profile lecture career", stamp: "LinkedIn clinic", lane: "learn", tags: ["#career", "#linkedin"], kind: "lecture" },
  { id: "q-network", house: "Networking", q: "professional networking lecture career", stamp: "Network clinic", lane: "learn", tags: ["#career", "#network"], kind: "lecture" },
  { id: "q-procomm", house: "Professional communication", q: "workplace communication lecture career", stamp: "Work talk clinic", lane: "learn", tags: ["#career", "#procomm"], kind: "lecture" },
  { id: "q-careerplan", house: "Career planning", q: "career planning lecture university", stamp: "Career plan clinic", lane: "learn", tags: ["#career", "#plan"], kind: "lecture" },
  { id: "q-work", house: "Workplace skills", q: "workplace skills lecture university", stamp: "Work clinic", lane: "learn", tags: ["#career", "#work"], kind: "lecture" },
  { id: "q-salary", house: "Salary negotiation", q: "salary negotiation lecture career", stamp: "Salary clinic", lane: "learn", tags: ["#career", "#salary"], kind: "lecture" },
  { id: "q-secplus", house: "CompTIA Security+", q: "CompTIA Security+ official exam overview", stamp: "Sec+ academy", lane: "learn", tags: ["#cert", "#comptia"], kind: "lecture" },
  { id: "q-aws-cert", house: "AWS certification", q: "AWS certified cloud practitioner official", stamp: "AWS academy", lane: "learn", tags: ["#cert", "#aws"], kind: "lecture" },
  { id: "q-az-cert", house: "Azure certification", q: "Azure fundamentals AZ-900 official", stamp: "Azure academy", lane: "learn", tags: ["#cert", "#azure"], kind: "lecture" },
  { id: "q-gcp-cert", house: "Google Cloud certification", q: "Google Cloud digital leader official", stamp: "GCP academy", lane: "learn", tags: ["#cert", "#gcp"], kind: "lecture" },
  { id: "q-cisco", house: "Cisco", q: "CCNA official certification overview", stamp: "Cisco academy", lane: "learn", tags: ["#cert", "#cisco"], kind: "lecture" },
  { id: "q-isc2", house: "ISC2", q: "CISSP official ISC2 exam overview", stamp: "ISC2 academy", lane: "learn", tags: ["#cert", "#isc2"], kind: "lecture" },
  { id: "q-isaca-c", house: "ISACA", q: "CISA ISACA certification official", stamp: "ISACA academy", lane: "learn", tags: ["#cert", "#isaca"], kind: "lecture" },
  { id: "q-pmi", house: "PMI", q: "PMP PMI certification official", stamp: "PMI academy", lane: "learn", tags: ["#cert", "#pmi"], kind: "lecture" },
  { id: "q-msft", house: "Microsoft certs", q: "Microsoft certification official overview", stamp: "Microsoft academy", lane: "learn", tags: ["#cert", "#msft"], kind: "lecture" },
  { id: "q-lpic", house: "Linux certs", q: "Linux LPIC certification official", stamp: "Linux academy", lane: "learn", tags: ["#cert", "#linux"], kind: "lecture" },
  { id: "q-cka", house: "Kubernetes certs", q: "CKA CNCF certification official", stamp: "K8s academy", lane: "learn", tags: ["#cert", "#cka"], kind: "lecture" },
  { id: "q-nclex", house: "Nursing certs", q: "NCLEX nursing exam overview official", stamp: "Nursing academy", lane: "learn", tags: ["#cert", "#nclex"], kind: "lecture" },
  { id: "q-databricks", house: "Data certs", q: "data analytics certification lecture official", stamp: "Data cert academy", lane: "learn", tags: ["#cert", "#datacert"], kind: "lecture" },
  { id: "q-gov-nist", house: "NIST Academy", q: "NIST cybersecurity framework official overview", stamp: "NIST academy", lane: "learn", tags: ["#gov", "#nist"], kind: "framework" },
  { id: "q-gov-cisa", house: "CISA", q: "CISA cybersecurity official briefing", stamp: "CISA academy", lane: "learn", tags: ["#gov", "#cisa"], kind: "lecture" },
  { id: "q-gov-nsa", house: "NSA", q: "NSA cybersecurity guidance official", stamp: "NSA academy", lane: "learn", tags: ["#gov", "#nsa"], kind: "lecture" },
  { id: "q-gov-rmf", house: "RMF path", q: "NIST 800-37 RMF official", stamp: "RMF academy", lane: "learn", tags: ["#gov", "#rmf"], kind: "framework" },
  { id: "q-gov-fisma", house: "FISMA path", q: "FISMA implementation official NIST", stamp: "FISMA academy", lane: "learn", tags: ["#gov", "#fisma"], kind: "framework" },
  { id: "q-gov-fedramp", house: "FedRAMP path", q: "FedRAMP official GSA authorization", stamp: "FedRAMP academy", lane: "learn", tags: ["#gov", "#fedramp"], kind: "framework" },
  { id: "q-gov-zt", house: "Zero Trust path", q: "CISA zero trust maturity model official", stamp: "ZT academy", lane: "learn", tags: ["#gov", "#zt"], kind: "framework" },
  { id: "q-acq", house: "Government acquisition", q: "FAR government acquisition lecture official", stamp: "Acquisition academy", lane: "learn", tags: ["#gov", "#acq"], kind: "lecture" },
  { id: "q-gov-priv", house: "Federal privacy", q: "NIST privacy framework official", stamp: "Privacy academy", lane: "learn", tags: ["#gov", "#privacy"], kind: "framework" },
  { id: "q-gov-risk", house: "Federal risk", q: "NIST 800-30 risk assessment official", stamp: "Risk academy", lane: "learn", tags: ["#gov", "#risk"], kind: "framework" },
  { id: "q-gov-comp", house: "Federal compliance", q: "federal IT compliance lecture FISMA FedRAMP", stamp: "Compliance academy", lane: "learn", tags: ["#gov", "#compliance"], kind: "lecture" },
  { id: "q-fed-it", house: "Federal IT", q: "federal IT FITARA lecture official", stamp: "Fed IT academy", lane: "learn", tags: ["#gov", "#fedit"], kind: "lecture" },
  { id: "q-news-space", house: "News · space", q: "NASA mission briefing official Artemis", stamp: "News clinic", lane: "learn", tags: ["#news", "#space"], kind: "lecture" },
  { id: "q-news-climate", house: "News · climate", q: "NOAA climate briefing official", stamp: "News clinic", lane: "learn", tags: ["#news", "#earth"], kind: "lecture" },
  { id: "q-news-cyber", house: "News · cyber", q: "CISA cybersecurity advisory official", stamp: "News clinic", lane: "learn", tags: ["#news", "#gov"], kind: "lecture" },
  { id: "q-pedagogy", house: "Pedagogy", q: "teaching methods lecture university pedagogy", stamp: "Teach clinic", lane: "learn", tags: ["#teach", "#pedagogy"], kind: "lecture" },
  { id: "q-lessonplan", house: "Lesson planning", q: "lesson planning lecture teacher education", stamp: "Plan clinic", lane: "learn", tags: ["#teach", "#curriculum"], kind: "lecture" },
  { id: "q-classmgmt", house: "Classroom management", q: "classroom management lecture teacher education", stamp: "Classroom clinic", lane: "learn", tags: ["#teach", "#classroom"], kind: "lecture" },
  { id: "q-mu-jazz", house: "Jazz hall", q: "jazz history documentary lecture Smithsonian", stamp: "Jazz clinic", lane: "laugh", tags: ["#hallmusic", "#jazz"], kind: "lecture" },
  { id: "q-mu-blues", house: "Blues hall", q: "blues history documentary delta chicago lecture", stamp: "Blues clinic", lane: "laugh", tags: ["#hallmusic", "#blues"], kind: "lecture" },
  { id: "q-mu-soul", house: "Soul hall", q: "soul music history motown stax documentary", stamp: "Soul clinic", lane: "laugh", tags: ["#hallmusic", "#soul"], kind: "lecture" },
  { id: "q-mu-country", house: "Country hall", q: "country music history documentary carter family", stamp: "Country clinic", lane: "laugh", tags: ["#hallmusic", "#country"], kind: "lecture" },
  { id: "q-mu-folk", house: "Folk hall", q: "american folk music history documentary", stamp: "Folk clinic", lane: "laugh", tags: ["#hallmusic", "#folk"], kind: "lecture" },
  { id: "q-mu-rock", house: "Rock hall", q: "history of rock and roll documentary lecture", stamp: "Rock clinic", lane: "laugh", tags: ["#hallmusic", "#rock"], kind: "lecture" },
  { id: "q-mu-latin", house: "Latin hall", q: "salsa bossa nova latin music history documentary", stamp: "Latin clinic", lane: "laugh", tags: ["#hallmusic", "#latin"], kind: "lecture" },
  { id: "q-mu-caribbean", house: "Caribbean hall", q: "reggae ska calypso history documentary", stamp: "Caribbean clinic", lane: "laugh", tags: ["#hallmusic", "#reggae", "#caribbean"], kind: "lecture" },
  { id: "q-mu-electronic", house: "Electronic hall", q: "history of electronic music techno house documentary", stamp: "Electronic clinic", lane: "laugh", tags: ["#hallmusic", "#electronic", "#lofi"], kind: "lecture" },
  { id: "q-mu-hiphop", house: "Hip-hop hall", q: "hip hop history bronx documentary lecture", stamp: "Hip-hop clinic", lane: "laugh", tags: ["#hallmusic", "#hiphop"], kind: "lecture" },
  { id: "q-mu-africa", house: "African hall", q: "highlife afrobeat history documentary fela", stamp: "African clinic", lane: "laugh", tags: ["#hallmusic", "#afrobeat", "#highlife"], kind: "lecture" },
  { id: "q-mu-classical", house: "Classical hall", q: "orchestra symphony history lecture university", stamp: "Classical clinic", lane: "learn", tags: ["#hallmusic", "#classical"], kind: "lecture" },
  { id: "q-mu-gospel", house: "Gospel hall", q: "black gospel music history documentary thomas dorsey", stamp: "Gospel clinic", lane: "laugh", tags: ["#hallmusic", "#gospel", "#hymn"], kind: "lecture" },
  { id: "q-w-mali", house: "Mali blues", q: "Ali Farka Toure Mali blues documentary", stamp: "Mali hall", lane: "laugh", tags: ["#hallmusic", "#blues", "#folk"], kind: "lecture" },
  { id: "q-w-cuba", house: "Cuban son", q: "Buena Vista Social Club Havana son documentary", stamp: "Cuba hall", lane: "laugh", tags: ["#hallmusic", "#latin", "#salsa"], kind: "lecture" },
  { id: "q-w-brazil", house: "Bossa nova", q: "bossa nova Jobim Brazil documentary lecture", stamp: "Brazil hall", lane: "laugh", tags: ["#hallmusic", "#latin", "#bossa"], kind: "lecture" },
  { id: "q-w-mexico", house: "Mariachi", q: "mariachi Mexico music history documentary", stamp: "Mexico hall", lane: "laugh", tags: ["#hallmusic", "#latin"], kind: "lecture" },
  { id: "q-w-colombia", house: "Cumbia", q: "cumbia Colombia music history documentary", stamp: "Colombia hall", lane: "laugh", tags: ["#hallmusic", "#latin"], kind: "lecture" },
  { id: "q-w-argentina", house: "Tango", q: "tango Buenos Aires history documentary", stamp: "Argentina hall", lane: "laugh", tags: ["#hallmusic", "#latin"], kind: "lecture" },
  { id: "q-w-jamaica", house: "Reggae", q: "reggae Jamaica history documentary Marley BBC", stamp: "Jamaica hall", lane: "laugh", tags: ["#hallmusic", "#reggae", "#caribbean"], kind: "lecture" },
  { id: "q-w-trinidad", house: "Calypso", q: "calypso Trinidad carnival history documentary", stamp: "Trinidad hall", lane: "laugh", tags: ["#hallmusic", "#calypso", "#caribbean"], kind: "lecture" },
  { id: "q-w-haiti", house: "Kompa", q: "kompa Haiti music documentary", stamp: "Haiti hall", lane: "laugh", tags: ["#hallmusic", "#caribbean"], kind: "lecture" },
  { id: "q-w-sa", house: "Township jazz", q: "Hugh Masekela South African jazz documentary", stamp: "South Africa hall", lane: "laugh", tags: ["#hallmusic", "#jazz"], kind: "lecture" },
  { id: "q-w-ethio", house: "Ethio-jazz", q: "Mulatu Astatke Ethio jazz documentary", stamp: "Ethiopia hall", lane: "laugh", tags: ["#hallmusic", "#jazz"], kind: "lecture" },
  { id: "q-w-senegal", house: "Mbalax", q: "Youssou NDour mbalax Senegal documentary", stamp: "Senegal hall", lane: "laugh", tags: ["#hallmusic", "#afrobeat"], kind: "lecture" },
  { id: "q-w-congo", house: "Soukous", q: "soukous Congo rumba documentary Franco", stamp: "Congo hall", lane: "laugh", tags: ["#hallmusic", "#afrobeat"], kind: "lecture" },
  { id: "q-w-india", house: "Raga", q: "Ravi Shankar raga Indian classical lecture", stamp: "India hall", lane: "learn", tags: ["#hallmusic", "#classical", "#folk"], kind: "lecture" },
  { id: "q-w-indo", house: "Gamelan", q: "Indonesian gamelan music documentary", stamp: "Indonesia hall", lane: "learn", tags: ["#hallmusic", "#classical", "#folk"], kind: "lecture" },
  { id: "q-w-japan", house: "Japan", q: "Japanese traditional music gagaku taiko documentary", stamp: "Japan hall", lane: "learn", tags: ["#hallmusic", "#folk", "#classical"], kind: "lecture" },
  { id: "q-w-korea", house: "Korea", q: "Korean traditional music pansori gugak documentary", stamp: "Korea hall", lane: "learn", tags: ["#hallmusic", "#folk"], kind: "lecture" },
  { id: "q-w-china", house: "China", q: "Chinese guqin traditional music documentary", stamp: "China hall", lane: "learn", tags: ["#hallmusic", "#classical", "#folk"], kind: "lecture" },
  { id: "q-w-ireland", house: "Celtic", q: "Irish traditional music Celtic documentary", stamp: "Ireland hall", lane: "laugh", tags: ["#hallmusic", "#folk"], kind: "lecture" },
  { id: "q-w-spain", house: "Flamenco", q: "flamenco Spain history documentary", stamp: "Spain hall", lane: "laugh", tags: ["#hallmusic", "#folk"], kind: "lecture" },
  { id: "q-w-morocco", house: "Gnawa", q: "Gnawa Morocco music documentary", stamp: "Morocco hall", lane: "laugh", tags: ["#hallmusic", "#folk"], kind: "lecture" },
  { id: "q-w-berlin", house: "Berlin techno", q: "Berlin techno history documentary", stamp: "Berlin hall", lane: "laugh", tags: ["#hallmusic", "#electronic", "#techno"], kind: "lecture" },
  { id: "q-w-amapiano", house: "Amapiano", q: "amapiano South Africa music documentary", stamp: "Amapiano hall", lane: "laugh", tags: ["#hallmusic", "#electronic", "#afrobeat"], kind: "lecture" },
  { id: "q-w-grime", house: "UK grime", q: "UK grime history documentary London", stamp: "London hall", lane: "laugh", tags: ["#hallmusic", "#hiphop"], kind: "lecture" },
  { id: "q-w-france", house: "French rap", q: "French hip hop history documentary", stamp: "France hall", lane: "laugh", tags: ["#hallmusic", "#hiphop"], kind: "lecture" },
  { id: "q-w-ghana-g", house: "Ghana gospel", q: "Ghana gospel choir hymn worship documentary", stamp: "Ghana hall", lane: "laugh", tags: ["#hallmusic", "#gospel", "#hymn", "#choir"], kind: "lecture" },
  { id: "q-w-nigeria-g", house: "Nigeria gospel", q: "Nigerian gospel worship choir documentary", stamp: "Nigeria hall", lane: "laugh", tags: ["#hallmusic", "#gospel", "#worship"], kind: "lecture" },
  { id: "q-w-korea-g", house: "Korean hymns", q: "Korean church choir hymn worship", stamp: "Korea hall", lane: "laugh", tags: ["#hallmusic", "#gospel", "#hymn", "#choir"], kind: "lecture" },
  { id: "q-w-latin-g", house: "Latin hymns", q: "Latin American gospel hymn choir worship", stamp: "Latin hall", lane: "laugh", tags: ["#hallmusic", "#gospel", "#hymn"], kind: "lecture" },
  { id: "q-w-rock", house: "Rock beyond the US", q: "British rock history documentary Beatles", stamp: "Britain hall", lane: "laugh", tags: ["#hallmusic", "#rock"], kind: "lecture" },
  { id: "q-w-afro-rock", house: "Afro-rock", q: "Osibisa Afro rock Ghana documentary", stamp: "Ghana hall", lane: "laugh", tags: ["#hallmusic", "#rock", "#afrobeat"], kind: "lecture" },
  { id: "q-w-soul", house: "Brazilian soul", q: "Jorge Ben Brazil soul samba documentary", stamp: "Brazil hall", lane: "laugh", tags: ["#hallmusic", "#soul"], kind: "lecture" },
  { id: "q-w-country", house: "Country abroad", q: "Australian country music history documentary", stamp: "Australia hall", lane: "laugh", tags: ["#hallmusic", "#country"], kind: "lecture" },
  ...hymnQueries(),
  ...PRO_HALLS,
];

export const RESEARCH_LOOP = [
  "Question",
  "Literature",
  "Hypothesis",
  "Method",
  "Data",
  "Analysis",
  "Results",
  "Discussion",
  "Paper",
] as const;
export const CERT_LOOP = [
  "Certification",
  "Curriculum",
  "Lessons",
  "Flashcards",
  "Questions",
  "Labs",
  "Mock exam",
  "Progress",
] as const;
export const GOV_LOOP = ["Framework", "Prepare", "Categorize", "Select", "Implement", "Assess", "Authorize", "Monitor"] as const;
export const NEWS_LOOP = ["What happened", "Why it matters", "Background", "Expert", "Course", "Quiz"] as const;
export const LEARN_LOOP = ["Watch", "Read", "Lab", "Exercise", "Project", "Assess"] as const;
export const RANGE_EVIDENCE = ["Learn", "Enter lab", "Task", "Evidence", "Score", "Feedback"] as const;

export const LANG_LOOP = ["Listen", "Speak", "Read", "Write", "Quiz", "Conversation"] as const;
export const LANGS = ["English", "Spanish", "French", "Twi", "Akan", "Arabic", "Chinese", "ASL"] as const;

export const CARE_ACADEMIES = [
  { id: "nursing", label: "Nursing Academy", tag: "#nursing" },
  { id: "medicine", label: "Medical Student Academy", tag: "#medicine" },
  { id: "public", label: "Public Health Academy", tag: "#publichealth" },
  { id: "psych", label: "Psychology Academy", tag: "#mind" },
  { id: "lead", label: "Healthcare Leadership Academy", tag: "#admin" },
] as const;

export const CLINIC_DESKS = [
  { id: "campus", label: "Campus" },
  { id: "code", label: "Computer science" },
  { id: "ai", label: "AI" },
  { id: "cyber", label: "Cyber" },
  { id: "cloud", label: "Cloud" },
  { id: "data", label: "Data" },
  { id: "research", label: "Research" },
  { id: "care", label: "Health" },
  { id: "mind", label: "Mind" },
  { id: "math", label: "Mathematics" },
  { id: "science", label: "Science" },
  { id: "maker", label: "Engineering" },
  { id: "space", label: "Space" },
  { id: "sky", label: "Earth" },
  { id: "business", label: "Business" },
  { id: "civic", label: "Law & civics" },
  { id: "history", label: "History" },
  { id: "language", label: "Languages" },
  { id: "arts", label: "Arts" },
  { id: "faith", label: "Faith" },
  { id: "trades", label: "Trades" },
  { id: "ag", label: "Agriculture" },
  { id: "career", label: "Careers" },
  { id: "teach", label: "Teaching" },
  { id: "news", label: "Now → learn" },
] as const;

export type ClinicDeskId = (typeof CLINIC_DESKS)[number]["id"];

export function objectOf(kind?: IngestKind) {
  if (!kind || kind === "lecture") return "video";
  if (kind === "framework") return "article";
  return kind;
}

export function deskOf(house: IngestHouse): ClinicDeskId {
  const hay = `${house.id} ${house.house} ${house.stamp} ${house.tags.join(" ")} ${house.kind ?? ""}`.toLowerCase();
  if (/#teach|#pedagogy|#curriculum|#classroom/.test(hay)) return "teach";
  if (/#news/.test(hay)) return "news";
  if (/cyber|nist|cisa|aws|iam|owasp|mitre|fido|zero.?trust|sbom|rmf|fisma|pqc|ics|ransom|k8s|cncf|csa|isaca|guardduty|packet|exploit|ippsec|liveoverflow|prompt injection|#gov/.test(hay) && !/#ai/.test(hay) && !/#civic/.test(hay) && !/#infra/.test(hay) && !/#cert/.test(hay) && !/#acq/.test(hay)) {
    return "cyber";
  }
  if (/#ai|#llm|#rag|#mlops|#deeplearn|#nlp|#vision|transformer|statquest|two minute|cs229|cs231|cs224|6\.s191/.test(hay) && !/#think/.test(hay)) {
    return "ai";
  }
  if (/#maker|#arduino|#cad|#3d|#embedded|#ee|#me|engineering|robotics/.test(hay) && !/#math/.test(hay)) return "maker";
  if (/#infra|#terraform|#docker|#linux/.test(hay) && !/#cert/.test(hay)) return "cloud";
  if (/#data|#sql|#etl|#pandas/.test(hay)) return "data";
  if (/#math|algebra|calculus|geometry|linAlg|3b1b|numberphile/.test(hay)) return "math";
  if (/#physics|#chem|#stem|biochem|materials|stats clinic/.test(hay)) return "science";
  if (/#money|#budget|#credit|#mortgage|#retire|#invest|cfpb|literacy|#business|#startup|#llc|#sba|accounting|founder|pitch/.test(hay)) {
    return "business";
  }
  if (/#mind|#psych|#neuro|cognitive|sleep science|hci clinic/.test(hay)) return "mind";
  if (/#civic|#constitution|#scotus|#infolaw|#acq|#fedit/.test(hay)) return "civic";
  if (/#history|#ancient|#archaeology/.test(hay)) return "history";
  if (/#lang|#twi|#akan|#asl|#speak|#present|#debate|#press/.test(hay)) return "language";
  if (/#space|#astro|nasa|jwst|cosmology|planetary|rocket|satellite|astrobio|#universe/.test(hay)) return "space";
  if (/#career|#resume|#interview|#linkedin|#salary|#cert|#comptia|#nclex|#cka|#pmi/.test(hay)) return "career";
  if (/#ag|#farm|#soil|#foodsafe/.test(hay)) return "ag";
  if (/nurse|pharm|cancer|diabetes|parkinson|alzheimer|medicine|ward|hopkins|ninja|cdc|who|mayo|health|#care|anatomy|physiology|epidemiology/.test(hay) && !/#space/.test(hay) && !/#ag/.test(hay)) {
    return "care";
  }
  if (/trade|electric|craft|carpenter|hvac|house|shop|timber|bench|nccer/.test(hay)) return "trades";
  if (/#gospel|#hymn|#worship|#choir|gaither|sinach/.test(hay)) return "faith";
  if (/#think|#philosophy|#logic|#epistemology|#arts|#jazz|#classical|#blues|#soul|#funk|#rnb|#country|#folk|#rock|#latin|#reggae|#hiphop|#lofi|#highlife|#afrobeat|#electronic|#poetry|#theater/.test(hay)) {
    return "arts";
  }
  if (/bible|luke|genesis|psalm|#faith|#pulpit/.test(hay)) return "faith";
  if (/cern|kurz|earth|forest|wildlife|natgeo|bbc|noaa|climate|#earth|#ocean|#geology/.test(hay)) return "sky";
  if (/python|cs50|fcc|fireship|code clinic|#code|#python/.test(hay)) return "code";
  if (/paper|research|machine learning/.test(hay)) return "research";
  return "campus";
}

export function postDesk(post: FeedPost): ClinicDeskId {
  return deskOf({
    id: post.id,
    house: post.author.name,
    stamp: post.teach?.stamp ?? post.caption.slice(0, 48),
    lane: post.lane,
    tags: post.hashtags,
  });
}

export function weekdayLean(at = Date.now()): { extra: ClinicDeskId[]; extraN: number; label: string } {
  const day = new Date(at).getUTCDay();
  if (day === 1) return { extra: ["cyber", "career", "civic"], extraN: 2, label: "Monday · cyber, careers, civics" };
  if (day === 2 || day === 3) return { extra: ["math", "science", "research"], extraN: 2, label: "STEM week · math, science, research" };
  if (day === 4) return { extra: ["care", "mind", "teach"], extraN: 2, label: "Thursday · health, mind, teaching" };
  if (day === 5) return { extra: ["arts", "business", "language"], extraN: 2, label: "Friday · arts, business, languages" };
  if (day === 6) return { extra: ["cloud", "data", "maker"], extraN: 2, label: "Saturday · cloud, data, engineering" };
  return { extra: ["faith", "space", "ag"], extraN: 2, label: "Sunday · faith, space, agriculture" };
}

export function pickDomain(mix: number, at = Date.now()) {
  const pool = [...INGEST_CHANNELS, ...INGEST_QUERIES];
  const by = new Map<ClinicDeskId, typeof pool>();
  for (const house of pool) {
    const desk = deskOf(house);
    const list = by.get(desk) ?? [];
    list.push(house);
    by.set(desk, list);
  }
  const picked: typeof pool = [];
  const seen = new Set<string>();
  function take(list: typeof pool, salt: number, n: number) {
    for (const house of rotatePick(list, salt, n)) {
      if (seen.has(house.id)) continue;
      seen.add(house.id);
      picked.push(house);
    }
  }
  CLINIC_DESKS.forEach((desk, i) => {
    if (desk.id === "ai") return;
    take(by.get(desk.id) ?? [], mix + i * 3, desk.id === "faith" ? 2 : 3);
  });
  const lean = weekdayLean(at);
  lean.extra.forEach((id, i) => {
    if (id === "ai") return;
    take(by.get(id) ?? [], mix + 40 + i * 5, lean.extraN);
  });
  take(
    pool.filter((h) => VIRAL_HOUSES.has(h.id)),
    mix + 3,
    14,
  );
  take(pool.filter((h) => h.id.startsWith("q-pro-")), mix + 23, 12);
  take(pool, mix + 101, 12);
  return picked;
}

const VIRAL_HOUSES = new Set([
  "veritas",
  "kurz",
  "teded",
  "ted",
  "fireship",
  "chuck",
  "vsauce",
  "scishow",
  "smarter",
  "stevemould",
  "cgpgrey",
  "realeng",
  "vox",
  "asap",
  "minutephys",
  "wendover",
  "reallifelore",
  "3b1b",
  "natgeo",
  "bbcearth",
  "q-hook-why",
  "q-hook-how",
  "q-blackhole",
  "q-immune",
  "q-brain",
  "q-sleep",
  "q-time",
  "q-electric",
  "q-dna-hook",
  "q-money-hook",
  "q-planes",
  "q-ocean",
  "q-animals-hook",
  "q-history-hook",
  "q-code-hook",
  "q-cyber-hook",
  "q-ai-hook",
  "q-faith-hook",
]);

export function deskLabel(id?: string) {
  return CLINIC_DESKS.find((d) => d.id === id)?.label ?? "Clinic";
}

export function rotatePick<T>(items: T[], slot: number, n: number) {
  if (!items.length) return [];
  const start = Math.abs(slot >>> 0) % items.length;
  return Array.from({ length: Math.min(n, items.length) }, (_, i) => items[(start + i) % items.length]!);
}
