let lines: string[] = [];
const hear = new Set<() => void>();

export function setWireLines(next: string[]) {
  lines = next;
  hear.forEach((fn) => fn());
}

export function wireLines() {
  return lines;
}

export function onWire(fn: () => void) {
  hear.add(fn);
  return () => {
    hear.delete(fn);
  };
}

export type HerePerson = { id: string; name: string; username: string; avatar: string; place: string };
export type HereDrop = { id: string; title: string; listeners: number; name: string; username: string; avatar: string };

let people: HerePerson[] = [];
let drops: HereDrop[] = [];
const hearPeople = new Set<() => void>();

export function setRoster(next: { people: HerePerson[]; drops: HereDrop[] }) {
  people = next.people;
  drops = next.drops;
  hearPeople.forEach((fn) => fn());
}

export function rosterPeople() {
  return people;
}

export function rosterDrops() {
  return drops;
}

export function onRoster(fn: () => void) {
  hearPeople.add(fn);
  return () => {
    hearPeople.delete(fn);
  };
}
