import { ME } from "@/lib/current-user";
import { CREWS, FACE, type FeedPost } from "@/lib/feed-data";
import { studyHouse } from "@/lib/study-this";

export type Person = {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  campus: string;
  verified: boolean;
  crewId: string;
};

export const PEOPLE: Person[] = [
  {
    name: ME.name,
    username: ME.username,
    avatar: ME.avatarUrl,
    bio: ME.bio,
    campus: ME.campus,
    verified: false,
    crewId: "commonwealth",
  },
  {
    name: "Ama Boateng",
    username: "ama.codes",
    avatar: FACE.ama,
    bio: "Balme after dark. Integrals, leftover waakye, and a board that finally made sense.",
    campus: "University of Ghana",
    verified: true,
    crewId: "commonwealth",
  },
  {
    name: "Kofi Mensah",
    username: "kofibeats",
    avatar: FACE.kofi,
    bio: "Two speakers and a pavement. The bounce lives on beat 3.",
    campus: "University of Ghana",
    verified: true,
    crewId: "nightmarket",
  },
  {
    name: "Nia Okonkwo",
    username: "nia.sec",
    avatar: FACE.nia,
    bio: "Flags, firmware, Friday rooms. The PDF is never just a PDF.",
    campus: "University of Ghana",
    verified: true,
    crewId: "cyber",
  },
  {
    name: "Yaw Darko",
    username: "yaw.lens",
    avatar: FACE.yaw,
    bio: "35mm, harmattan, Great Hall steps. No filter.",
    campus: "University of Ghana",
    verified: false,
    crewId: "lens",
  },
  {
    name: "Efua Sarpong",
    username: "efua.moves",
    avatar: FACE.efua,
    bio: "Eight counts. Last turn is a spot, not a spin.",
    campus: "University of Ghana",
    verified: true,
    crewId: "nightmarket",
  },
  {
    name: "Tunde Adebayo",
    username: "tunde.kick",
    avatar: FACE.tunde,
    bio: "Inter-hall. The run starts two passes before the shout.",
    campus: "University of Ghana",
    verified: false,
    crewId: "commonwealth",
  },
  {
    name: "Zainab Diallo",
    username: "zainab.eats",
    avatar: FACE.zainab,
    bio: "The stall behind the old bookshop. After lecture, not before.",
    campus: "University of Ghana",
    verified: false,
    crewId: "commonwealth",
  },
  {
    name: "Kwame Asante",
    username: "kwame.lab",
    avatar: FACE.kwame,
    bio: "It walked. PID dressed as a miracle.",
    campus: "University of Ghana",
    verified: true,
    crewId: "robotics",
  },
  {
    name: "Adwoa Boat",
    username: "adwoa.fm",
    avatar: FACE.adwoa,
    bio: "Campus radio, midnight slot. If it slaps, it goes out.",
    campus: "University of Ghana",
    verified: false,
    crewId: "lens",
  },
];

export function personByUsername(username: string) {
  return PEOPLE.find((p) => p.username.toLowerCase() === username.toLowerCase());
}

export function postsByUser(posts: FeedPost[], username: string) {
  return posts.filter((p) => p.author.username.toLowerCase() === username.toLowerCase());
}

export function searchDirectory(q: string, posts: FeedPost[]) {
  const n = q.trim().toLowerCase();
  if (!n) return { people: PEOPLE, crews: CREWS, posts };
  return {
    people: PEOPLE.filter(
      (p) => p.name.toLowerCase().includes(n) || p.username.toLowerCase().includes(n) || p.bio.toLowerCase().includes(n),
    ),
    crews: CREWS.filter((c) => c.name.toLowerCase().includes(n) || c.blurb.toLowerCase().includes(n)),
    posts: posts.filter((p) => {
      const bag = `${p.caption} ${p.teach.hook} ${p.teach.stamp} ${p.author.name} ${p.hashtags.join(" ")} ${studyHouse(p)}`.toLowerCase();
      return bag.includes(n);
    }),
  };
}
