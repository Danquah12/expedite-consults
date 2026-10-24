import { useSyncExternalStore } from "react";
import { moreToStudy, type StudyMaterial } from "@/lib/further-study-api";

export type FurtherOffer = {
  id: number;
  subject: string;
  status: "loading" | "ready";
  materials: StudyMaterial[];
};

let offer: FurtherOffer | null = null;
let ticket = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listen of listeners) listen();
}

export function studyLine(text: string) {
  return text
    .replace(/#\w+/g, " ")
    .replace(/\s+/g, " ")
    .split(/[.?!]/)[0]
    .trim()
    .slice(0, 140);
}

export function offerFurtherStudy(raw: string) {
  const subject = studyLine(raw);
  if (subject.length < 8) return;
  if (offer?.subject === subject && offer.status === "ready") return;
  const id = ++ticket;
  offer = {
    id,
    subject,
    status: "loading",
    materials: [
      {
        title: "Search this subject",
        href: `https://www.google.com/search?q=${encodeURIComponent(`${subject} explained`)}`,
        note: "Lectures, articles, and courses on the open web.",
      },
    ],
  };
  emit();
  void moreToStudy({ data: { subject } })
    .then((next) => {
      if (ticket !== id) return;
      offer = { id, subject: next.subject, status: "ready", materials: next.materials };
      emit();
    })
    .catch(() => {
      if (ticket !== id || !offer) return;
      offer = { ...offer, status: "ready" };
      emit();
    });
}

export function dismissFurtherStudy() {
  ticket += 1;
  offer = null;
  emit();
}

export function useFurtherStudy() {
  return useSyncExternalStore(
    (listen) => {
      listeners.add(listen);
      return () => listeners.delete(listen);
    },
    () => offer,
    () => null,
  );
}
