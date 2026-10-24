export const ME = {
  name: "Kwesi Asiedu",
  username: "kwesi",
  title: "Founder",
  avatarUrl: "/media/avatars/kwesi.jpg",
  bio: "Balme after dark. Calc clinic, leftover waakye, and a stamp to earn.",
  campus: "University of Ghana",
};

export type Actor = { name: string; username: string; avatarUrl: string };

let signed: Actor | null = null;

/** Who is actually signed in. Notes use this, not the sample profile. */
export function setActor(next: Actor | null) {
  signed = next;
}

export function actor(): Actor {
  return signed ?? ME;
}
