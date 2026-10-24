import { PEOPLE, type Person } from "@/lib/directory";
import type { FeedPost } from "@/lib/feed-data";

export type ReactionKind = "gotit" | "fire" | "pin";

export const PULSE = [
  { id: "u1", kind: "echo", text: "14 in Ama's integration drill — pass it for Calc clinic" },
  { id: "u2", kind: "drop", text: "Cyber office hours in 27m. Bring exiftool." },
  { id: "u3", kind: "stamp", text: "Kwame passed the PID drill — stamp It walked" },
  { id: "u4", kind: "echo", text: "Nia's CTF Echo: the flag is never in the PDF body" },
  { id: "u5", kind: "crew", text: "Clinic diet is on — 70% Learn tonight" },
  { id: "u6", kind: "echo", text: "Yaw's harmattan clinic: expose for the stone" },
];

export const ONLINE: { person: Person; where: string }[] = PEOPLE.filter((p) => p.username !== "kwesi")
  .slice(0, 6)
  .map((person, i) => ({
    person,
    where: i % 3 === 0 ? "In a drop" : i % 3 === 1 ? "On a clinic" : "In the mix",
  }));

export function seedReactions(postId: string): Record<ReactionKind, number> {
  const n = postId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return { gotit: 18 + (n % 40), fire: 12 + (n % 28), pin: 7 + (n % 16) };
}
