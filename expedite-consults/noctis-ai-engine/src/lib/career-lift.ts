import type { FeedPost } from "@/lib/feed-data";

export type CareerLift = {
  summary: string;
  skills: string[];
  certs: { title: string; href: string }[];
  courses: { title: string; href: string }[];
  jobs: { title: string; href: string }[];
};

type Lane = Omit<CareerLift, "summary"> & { keys: string[] };

const LANES: Lane[] = [
  {
    keys: ["cyber", "security", "nist", "iam", "phish", "hack", "soc", "cloud", "zero trust"],
    skills: ["Networking", "Identity", "Logging", "Risk"],
    certs: [
      { title: "CompTIA Security+", href: "https://www.comptia.org/certifications/security" },
      { title: "CISSP outline", href: "https://www.isc2.org/certifications/cissp" },
    ],
    courses: [
      { title: "Microsoft Learn — Security", href: "https://learn.microsoft.com/en-us/training/browse/?products=m365-core-security&resource_type=learning%20path" },
      { title: "AWS Skill Builder", href: "https://skillbuilder.aws/" },
    ],
    jobs: [{ title: "Cyber roles on USAJOBS", href: "https://www.usajobs.gov/Search/Results?k=cybersecurity" }],
  },
  {
    keys: ["nurse", "medic", "clinic", "health", "anatomy", "disease", "diabetes", "cancer"],
    skills: ["Anatomy", "Patient safety", "Documentation"],
    certs: [{ title: "MedlinePlus", href: "https://medlineplus.gov/" }],
    courses: [
      { title: "Khan Academy — Health", href: "https://www.khanacademy.org/science/health-and-medicine" },
      { title: "CDC learning", href: "https://www.cdc.gov/" },
    ],
    jobs: [{ title: "Health roles on USAJOBS", href: "https://www.usajobs.gov/Search/Results?k=health" }],
  },
  {
    keys: ["bible", "gospel", "scripture", "jesus", "sermon", "hymn"],
    skills: ["Context", "Cross references", "History"],
    certs: [],
    courses: [{ title: "BibleProject", href: "https://bibleproject.com/" }],
    jobs: [],
  },
  {
    keys: ["engineer", "circuit", "bridge", "robot", "mechanical", "voltage"],
    skills: ["Forces", "Measurement", "Design"],
    certs: [{ title: "NCCER crafts", href: "https://www.nccer.org/programs-crafts/" }],
    courses: [{ title: "MIT OpenCourseWare", href: "https://ocw.mit.edu/" }],
    jobs: [{ title: "Engineering roles on USAJOBS", href: "https://www.usajobs.gov/Search/Results?k=engineer" }],
  },
  {
    keys: ["code", "python", "program", "software", "computer"],
    skills: ["Reading code", "Debugging", "Systems"],
    certs: [{ title: "Google Career Certificates", href: "https://grow.google/certificates/" }],
    courses: [
      { title: "Harvard CS50", href: "https://cs50.harvard.edu/" },
      { title: "freeCodeCamp", href: "https://www.freecodecamp.org/" },
    ],
    jobs: [{ title: "Tech roles on USAJOBS", href: "https://www.usajobs.gov/Search/Results?k=information%20technology" }],
  },
  {
    keys: ["space", "nasa", "planet", "physics", "chemistry", "biology", "science"],
    skills: ["Observation", "Models", "Evidence"],
    certs: [],
    courses: [
      { title: "NASA", href: "https://www.nasa.gov/" },
      { title: "Khan Academy", href: "https://www.khanacademy.org/" },
    ],
    jobs: [{ title: "Science roles on USAJOBS", href: "https://www.usajobs.gov/Search/Results?k=science" }],
  },
];

export function careerLift(post: FeedPost): CareerLift | null {
  const blob = `${post.caption} ${post.teach.hook} ${post.teach.stamp} ${post.hashtags.join(" ")}`.toLowerCase();
  const lane = LANES.find((row) => row.keys.some((key) => blob.includes(key)));
  if (!lane) return null;
  return {
    summary: post.teach.hook,
    skills: lane.skills,
    certs: lane.certs,
    courses: lane.courses,
    jobs: lane.jobs,
  };
}
