import { FACE, type FeedPost, type Teach } from "@/lib/feed-data";

export type HallId = "all" | "trades" | "care" | "classroom" | "homes" | "builders";
export type TicketId =
  | "physician"
  | "pharmacist"
  | "teacher"
  | "faculty"
  | "developer"
  | "realtor"
  | "electrician"
  | "carpenter"
  | "biologist"
  | "designer";
export type HallLens = "union" | "saved" | "sos" | "shifts" | null;

export const HALLS: { id: HallId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "trades", label: "Trades" },
  { id: "care", label: "Care" },
  { id: "classroom", label: "Classroom" },
  { id: "homes", label: "Homes" },
  { id: "builders", label: "Builders" },
];

export const TICKETS: { id: TicketId; label: string; hall: Exclude<HallId, "all"> }[] = [
  { id: "physician", label: "Physician", hall: "care" },
  { id: "pharmacist", label: "Pharmacist", hall: "care" },
  { id: "teacher", label: "Teacher", hall: "classroom" },
  { id: "faculty", label: "Faculty", hall: "classroom" },
  { id: "developer", label: "Developer", hall: "builders" },
  { id: "realtor", label: "Realtor", hall: "homes" },
  { id: "electrician", label: "Electrician", hall: "trades" },
  { id: "carpenter", label: "Carpenter", hall: "trades" },
  { id: "biologist", label: "Biologist", hall: "classroom" },
  { id: "designer", label: "Designer", hall: "builders" },
];

export const TICKET_FACE: Record<TicketId, { minutes: string; level: string; path: string; skill: string; career: string }> = {
  physician: { minutes: "12 min", level: "Intermediate", path: "Care", skill: "Chart reading", career: "Physician" },
  pharmacist: { minutes: "11 min", level: "Intermediate", path: "Care", skill: "Medication safety", career: "Pharmacist" },
  teacher: { minutes: "10 min", level: "Beginner", path: "Classroom", skill: "Lesson design", career: "Teacher" },
  faculty: { minutes: "14 min", level: "Advanced", path: "Classroom", skill: "Course design", career: "Faculty" },
  developer: { minutes: "15 min", level: "Intermediate", path: "Engineering", skill: "Building software", career: "Developer" },
  realtor: { minutes: "9 min", level: "Beginner", path: "Homes", skill: "Reading a property", career: "Realtor" },
  electrician: { minutes: "12 min", level: "Intermediate", path: "Trades", skill: "Safe isolation", career: "Electrician" },
  carpenter: { minutes: "11 min", level: "Beginner", path: "Trades", skill: "Layout and fit", career: "Carpenter" },
  biologist: { minutes: "13 min", level: "Intermediate", path: "Science", skill: "Observation", career: "Biologist" },
  designer: { minutes: "10 min", level: "Beginner", path: "Design", skill: "Visual decisions", career: "Designer" },
};

const CAREER_RULES: { id: TicketId; test: RegExp }[] = [
  { id: "pharmacist", test: /\b(pharm|pharmacist|drug|drugs|dose|dosing|dispens|prescription|medication|medicine|medicines|interaction)\b/i },
  { id: "physician", test: /\b(physician|patient|patients|vitals|diagnosis|sepsis|ward|hospital|chart|corridor)\b/i },
  { id: "electrician", test: /\b(electrician|voltage|circuit|circuits|wire|wires|cable|cables|wi-fi|wifi|breaker|outlet|grounding|copper|ground first)\b/i },
  { id: "developer", test: /\b(developer|software|github|packet|coding|programming|algorithm|debug|kubernetes|exiftool|metadata)\b/i },
  { id: "teacher", test: /\b(teacher|classroom|asl|sign language|student|students|school signs|integral|calculus)\b/i },
  { id: "faculty", test: /\b(faculty|professor|pid|p term|gait|control system)\b/i },
  { id: "biologist", test: /\b(biologist|biology|carbon|dna|protein|organism|bonds)\b/i },
  { id: "designer", test: /\b(designer|typography|typeface|lettering|kerning)\b/i },
  { id: "realtor", test: /\b(realtor|lease|mortgage|buyer|defects|viewing)\b/i },
  { id: "carpenter", test: /\b(carpenter|chisel|lumber|framing|joinery|sharpen|spirit level|weld|tack)\b/i },
];

/** A film sits on a career only when its own words name that trade. */
export function careerOf(post: { title?: string; caption?: string; teach?: { stamp?: string; hook?: string; prompt?: string }; hashtags?: string[] }): TicketId | null {
  const text = `${post.title ?? ""} ${post.caption ?? ""} ${post.teach?.stamp ?? ""} ${post.teach?.hook ?? ""} ${post.teach?.prompt ?? ""} ${(post.hashtags ?? []).join(" ")}`;
  let best: TicketId | null = null;
  let score = 0;
  for (const rule of CAREER_RULES) {
    const hits = text.match(new RegExp(rule.test.source, "gi"))?.length ?? 0;
    if (hits > score) {
      score = hits;
      best = rule.id;
    }
  }
  return score > 0 ? best : null;
}

const pic = (id: string) => `/media/hall/${id}.jpg`;
const vid = (id: string) => `/media/hall/${id}.mp4`;

const teach = (hook: string, stamp: string, prompt: string, ok: string, wrong: [string, string]): Teach => ({
  hook,
  stamp,
  prompt,
  options: [
    { id: "a", label: ok, ok: true },
    { id: "b", label: wrong[0], ok: false },
    { id: "c", label: wrong[1], ok: false },
  ],
});

function clinic(
  id: string,
  name: string,
  username: string,
  avatar: string,
  caption: string,
  mediaType: FeedPost["mediaType"],
  mediaUrl: string,
  posterUrl: string | undefined,
  lesson: Teach,
): FeedPost {
  return {
    id,
    author: { name, username, avatar },
    caption,
    lane: "learn",
    mediaType,
    mediaUrl,
    posterUrl,
    views: 2400,
    likes: 180,
    comments: 12,
    shares: 9,
    isLiked: false,
    isSaved: false,
    isFollowing: true,
    hashtags: ["#ticket"],
    teach: lesson,
  };
}

export type HallCard = {
  id: string;
  hall: Exclude<HallId, "all">;
  ticket: TicketId;
  title: string;
  mentor: string;
  shift: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  posterUrl?: string;
  postId?: string;
  badge?: string;
  post: FeedPost;
};

export const HALL_CARDS: HallCard[] = [
  {
    id: "c-physician",
    hall: "care",
    ticket: "physician",
    title: "Read the chart before you touch the patient.",
    mentor: "Abena Owusu",
    shift: "Tonight 19:30",
    mediaType: "video",
    mediaUrl: vid("physician"),
    posterUrl: pic("physician"),
    post: clinic(
      "ticket-physician",
      "Abena Owusu",
      "abena.md",
      FACE.zainab,
      "Vitals first. The story in the chart is the lesson, not the hallway gossip.",
      "video",
      vid("physician"),
      pic("physician"),
      teach("Chart before hands", "Chart clinic", "What do you read before you examine?", "The chart and vitals", ["The last WhatsApp from the family", "Whatever the ward is saying"]),
    ),
  },
  {
    id: "c-pharmacist",
    hall: "care",
    ticket: "pharmacist",
    title: "Two drugs that do not share a shelf.",
    mentor: "Kojo Ampofo",
    shift: "Tonight 18:00",
    mediaType: "image",
    mediaUrl: pic("pharmacist"),
    post: clinic(
      "ticket-pharmacist",
      "Kojo Ampofo",
      "kojo.rx",
      FACE.kofi,
      "If you cannot name the interaction, you do not dispense.",
      "image",
      pic("pharmacist"),
      pic("pharmacist"),
      teach("Name the mix", "Dispense clinic", "What do you check before you hand the bag over?", "The interaction, then the dose", ["The brand colour", "Whoever is next in line"]),
    ),
  },
  {
    id: "c-teacher",
    hall: "classroom",
    ticket: "teacher",
    title: "Write u and dv before the board.",
    mentor: "Ama Boateng",
    shift: "Tonight 20:00",
    mediaType: "video",
    mediaUrl: "/media/clips/calc.mp4?v=3",
    posterUrl: "/media/posts/calc.jpg",
    postId: "p1",
    post: clinic(
      "p1",
      "Ama Boateng",
      "ama.codes",
      FACE.ama,
      "Write u and dv before you touch the board.",
      "video",
      "/media/clips/calc.mp4?v=3",
      "/media/posts/calc.jpg",
      teach("u and dv first", "Calc clinic", "What do you write before the integral?", "u and dv", ["The answer from comments", "The board heading"]),
    ),
  },
  {
    id: "c-faculty",
    hall: "classroom",
    ticket: "faculty",
    title: "The lecture is the Spark. The drill is after.",
    mentor: "Kwame Asante",
    shift: "Tonight 21:00",
    mediaType: "image",
    mediaUrl: pic("faculty"),
    postId: "p8",
    post: clinic(
      "p8",
      "Kwame Asante",
      "kwame.lab",
      FACE.kwame,
      "PID dressed as a miracle until you name the P term.",
      "image",
      pic("faculty"),
      pic("faculty"),
      teach("Name the P", "It walked", "What do you tune first so the gait holds?", "The P term", ["The colour of the LED", "A bigger battery"]),
    ),
  },
  {
    id: "c-developer",
    hall: "builders",
    ticket: "developer",
    title: "The flag is never in the PDF body.",
    mentor: "Nia Okonkwo",
    shift: "Tonight 22:00",
    mediaType: "video",
    mediaUrl: vid("developer"),
    posterUrl: pic("developer"),
    postId: "p3",
    post: clinic(
      "p3",
      "Nia Okonkwo",
      "nia.sec",
      FACE.nia,
      "exiftool first. The PDF is a container.",
      "video",
      vid("developer"),
      pic("developer"),
      teach("Container first", "Packet ghost", "Where do you look before you read the PDF body?", "Metadata / exiftool", ["The last paragraph", "The file name"]),
    ),
  },
  {
    id: "c-trades",
    hall: "trades",
    ticket: "carpenter",
    title: "Measure twice. The spark is the lesson.",
    mentor: "Yaw Darko",
    shift: "Tomorrow 06:30",
    mediaType: "image",
    mediaUrl: pic("trades"),
    post: clinic(
      "ticket-trades",
      "Yaw Darko",
      "yaw.lens",
      FACE.yaw,
      "A trade is a drill you can fail with your hands.",
      "image",
      pic("trades"),
      pic("trades"),
      teach("Measure twice", "Shop clinic", "What do you do before you strike the weld?", "Measure and tack", ["Turn the gas up", "Guess the gap"]),
    ),
  },
  {
    id: "c-realtor",
    hall: "homes",
    ticket: "realtor",
    title: "Read the lease in one pass.",
    mentor: "Akosua Mensah",
    shift: "Sat 10:00",
    mediaType: "video",
    mediaUrl: vid("realtor"),
    posterUrl: pic("realtor"),
    post: clinic(
      "ticket-realtor",
      "Akosua Mensah",
      "akosua.home",
      FACE.adwoa,
      "The view is the Spark. The lease is the Echo.",
      "video",
      vid("realtor"),
      pic("realtor"),
      teach("Lease first", "Keys clinic", "What do you read before you hand over the keys?", "The lease and the defects list", ["The Instagram of the kitchen", "Whoever offered first"]),
    ),
  },
  {
    id: "c-builders",
    hall: "builders",
    ticket: "carpenter",
    title: "Level the wall before you brag about the skyline.",
    mentor: "Tunde Adebayo",
    shift: "Tomorrow 07:00",
    mediaType: "image",
    mediaUrl: pic("builders"),
    post: clinic(
      "ticket-builders",
      "Tunde Adebayo",
      "tunde.kick",
      FACE.tunde,
      "A building is a drill with gravity.",
      "image",
      pic("builders"),
      pic("builders"),
      teach("Level first", "Site clinic", "What do you check before the next course of blocks?", "The spirit level", ["The neighbour's wall", "The paint colour"]),
    ),
  },
  {
    id: "c-care",
    hall: "care",
    ticket: "physician",
    title: "The corridor is not the clinic. The chart is.",
    mentor: "Abena Owusu",
    shift: "Open",
    mediaType: "image",
    mediaUrl: pic("care"),
    post: clinic(
      "ticket-care",
      "Abena Owusu",
      "abena.md",
      FACE.zainab,
      "Walk the ward with a question, not a rumour.",
      "image",
      pic("care"),
      pic("care"),
      teach("Walk with a question", "Ward clinic", "What do you carry down the corridor?", "The chart", ["A story from the last shift", "Your phone"]),
    ),
  },
  {
    id: "c-homes",
    hall: "homes",
    ticket: "realtor",
    title: "Light tells the truth about a room.",
    mentor: "Akosua Mensah",
    shift: "Sat 10:00",
    mediaType: "image",
    mediaUrl: pic("homes"),
    post: clinic(
      "ticket-homes",
      "Akosua Mensah",
      "akosua.home",
      FACE.adwoa,
      "Stand where the buyer will stand. Then read the defects.",
      "image",
      pic("homes"),
      pic("homes"),
      teach("Stand where they stand", "Viewing clinic", "What do you do before you sell the light?", "Stand in the buyer's spot and list defects", ["Turn every lamp on", "Crop the photo"]),
    ),
  },
  {
    id: "c-classroom",
    hall: "classroom",
    ticket: "teacher",
    title: "The board is a 60-second clinic.",
    mentor: "Ama Boateng",
    shift: "Tonight 20:00",
    mediaType: "image",
    mediaUrl: pic("teacher"),
    postId: "p1",
    post: clinic(
      "p1",
      "Ama Boateng",
      "ama.codes",
      FACE.ama,
      "One move on the board. Then the drill.",
      "image",
      pic("teacher"),
      pic("teacher"),
      teach("u and dv first", "Calc clinic", "What do you write before the integral?", "u and dv", ["The answer from comments", "The board heading"]),
    ),
  },
  {
    id: "c-electrician",
    hall: "trades",
    ticket: "electrician",
    title: "Ground first. Then the hot.",
    mentor: "Kofi Mensah",
    shift: "Open",
    mediaType: "image",
    mediaUrl: "https://i.ytimg.com/vi/PL2QF4OK1to/hqdefault.jpg",
    postId: "yt22",
    post: clinic(
      "yt22",
      "Kofi Mensah",
      "kofibeats",
      FACE.kofi,
      "Ground first. Then the hot. A switch is a drill with live copper.",
      "video",
      "https://www.youtube.com/watch?v=PL2QF4OK1to",
      "https://i.ytimg.com/vi/PL2QF4OK1to/hqdefault.jpg",
      teach("Ground first", "Switch clinic", "What do you land first in the box?", "The ground", ["The hot", "Whatever is shortest"]),
    ),
  },
  {
    id: "c-carpenter",
    hall: "trades",
    ticket: "carpenter",
    title: "Sharp first. Then the cut.",
    mentor: "Yaw Darko",
    shift: "Open",
    mediaType: "image",
    mediaUrl: "https://i.ytimg.com/vi/SyBk6rvCQ3E/hqdefault.jpg",
    postId: "yt21",
    post: clinic(
      "yt21",
      "Yaw Darko",
      "yaw.lens",
      FACE.yaw,
      "A dull chisel is a guess. Sharpen, then pare.",
      "video",
      "https://www.youtube.com/watch?v=SyBk6rvCQ3E",
      "https://i.ytimg.com/vi/SyBk6rvCQ3E/hqdefault.jpg",
      teach("Sharp first", "Chisel clinic", "What do you do before you cut?", "Sharpen the chisel", ["Hit harder", "Guess the grain"]),
    ),
  },
  {
    id: "c-biologist",
    hall: "classroom",
    ticket: "biologist",
    title: "Carbon holds four. That is life.",
    mentor: "Kwame Asante",
    shift: "Open",
    mediaType: "image",
    mediaUrl: "https://i.ytimg.com/vi/QnQe0xW_JY4/hqdefault.jpg",
    postId: "yt19",
    post: clinic(
      "yt19",
      "Kwame Asante",
      "kwame.lab",
      FACE.kwame,
      "Four bonds. That is why carbon writes the living world.",
      "video",
      "https://www.youtube.com/watch?v=QnQe0xW_JY4",
      "https://i.ytimg.com/vi/QnQe0xW_JY4/hqdefault.jpg",
      teach("Carbon holds four", "Carbon clinic", "Why can carbon build life?", "It forms four bonds", ["It is the heaviest atom", "It glows"]),
    ),
  },
  {
    id: "c-designer",
    hall: "builders",
    ticket: "designer",
    title: "Type is a tool, not a costume.",
    mentor: "Efua Sarpong",
    shift: "Open",
    mediaType: "image",
    mediaUrl: "https://i.ytimg.com/vi/QrNi9FmdlxY/hqdefault.jpg",
    postId: "yt20",
    post: clinic(
      "yt20",
      "Efua Sarpong",
      "efua.moves",
      FACE.efua,
      "Ten rules. Then you can break one on purpose.",
      "video",
      "https://www.youtube.com/watch?v=QrNi9FmdlxY",
      "https://i.ytimg.com/vi/QrNi9FmdlxY/hqdefault.jpg",
      teach("Learn the rules, then break one", "Type clinic", "What do you learn before you decorate type?", "The rules of type", ["The trend colour", "A new font pack"]),
    ),
  },
];

export const TICKET_WORDS: Record<TicketId, string[]> = {
  electrician: ["electrician", "electrical", "wiring", "shop clinic", "switch clinic", "electrician u"],
  carpenter: ["carpenter", "carpentry", "joinery", "woodworking", "timber clinic", "bench clinic", "craftsman", "this old house", "chisel"],
  physician: ["physician", "doctor", "chart clinic", "oncology", "cancer", "stroke", "parkinson", "alzheimer", "diabetes", "ninja nerd", "ward clinic", "neuro clinic", "sugar clinic"],
  pharmacist: ["pharmacist", "pharmacy", "pharmacology", "#pharm", "dispense"],
  teacher: ["teacher", "calc clinic", "khan", "classroom", "crash course", "ted-ed", "ted ed"],
  faculty: ["faculty", "mit ", "stanford", "opencourseware", "lecture"],
  developer: ["developer", "python", "cs50", "fireship", "freecodecamp", "cyber", "packet ghost", "programming", "#code", "nist", "aws"],
  realtor: ["realtor", "lease", "homes", "keys union"],
  biologist: ["biologist", "biology", "amoeba", "forest clinic", "wildlife", "#animals", "carbon", "ecology", "photosynthesis", "wolves", "mycelium"],
  designer: ["designer", "type clinic", "typography", "figma"],
};

export function ticketOfPost(post: {
  id: string;
  caption: string;
  hashtags: string[];
  musicTitle?: string;
  author: { name: string };
  teach: { stamp: string; hook: string };
}): TicketId | null {
  const hay = `${post.id} ${post.caption} ${post.teach.stamp} ${post.teach.hook} ${post.hashtags.join(" ")} ${post.musicTitle ?? ""} ${post.author.name}`.toLowerCase();
  let best: TicketId | null = null;
  let score = 0;
  for (const t of TICKETS) {
    let n = 0;
    for (const word of TICKET_WORDS[t.id]) {
      if (hay.includes(word)) n += word.length >= 8 ? 2 : 1;
    }
    if (n > score) {
      score = n;
      best = t.id;
    }
  }
  return score > 0 ? best : null;
}

export function hallOfTicket(ticket: TicketId): Exclude<HallId, "all"> {
  return TICKETS.find((t) => t.id === ticket)?.hall ?? "trades";
}

export const TICKET_DEFAULT: Record<Exclude<HallId, "all">, TicketId> = {
  trades: "electrician",
  care: "physician",
  classroom: "teacher",
  homes: "realtor",
  builders: "developer",
};

export const HALL_UNIONS: Record<Exclude<HallId, "all">, { name: string; members: string; blurb: string }> = {
  trades: { name: "Shop floor union", members: "1.2K", blurb: "Hands, tools, and a drill you can fail." },
  care: { name: "Ward union", members: "3.4K", blurb: "Chart, dose, then hands." },
  classroom: { name: "Faculty union", members: "2.8K", blurb: "The lecture is a Spark. The quiz is the stamp." },
  homes: { name: "Keys union", members: "890", blurb: "Lease first. Light second." },
  builders: { name: "Site union", members: "1.6K", blurb: "Level, then skyline." },
};

export const HALL_SHIFTS: { when: string; title: string; ticket: TicketId }[] = [
  { when: "19:30", title: "Chart clinic", ticket: "physician" },
  { when: "20:00", title: "Calc clinic", ticket: "teacher" },
  { when: "21:00", title: "PID walk", ticket: "faculty" },
  { when: "22:00", title: "Packet ghost", ticket: "developer" },
  { when: "Sat 10:00", title: "Lease in one pass", ticket: "realtor" },
  { when: "18:00", title: "Dispense clinic", ticket: "pharmacist" },
  { when: "06:30", title: "Switch clinic", ticket: "electrician" },
  { when: "07:00", title: "Chisel clinic", ticket: "carpenter" },
  { when: "16:00", title: "Type clinic", ticket: "designer" },
  { when: "15:00", title: "Carbon clinic", ticket: "biologist" },
];

export function visibleCards(hall: HallId, ticket: TicketId): HallCard[] {
  const ticketHall = TICKETS.find((t) => t.id === ticket)?.hall;
  const primary = HALL_CARDS.filter((c) => c.ticket === ticket);
  const extras =
    hall === "all"
      ? HALL_CARDS.filter((c) => c.hall === ticketHall && c.ticket !== ticket)
      : HALL_CARDS.filter((c) => c.hall === hall && c.ticket !== ticket);
  const seen = new Set<string>();
  const out: HallCard[] = [];
  for (const c of [...primary, ...extras]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out.length ? out : HALL_CARDS;
}
