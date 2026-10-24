import { useEffect, useState } from "react";
import { PEOPLE } from "@/lib/directory";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export function useCampusBeat(ms = 1000) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      setT(Math.max(0, Math.floor((performance.now() - started) / 1000)));
    }, ms);
    return () => window.clearInterval(id);
  }, [reduced, ms]);
  return { t, reduced };
}

export function liveViewers(base: number, t: number, salt: number) {
  const walk = Math.sin((t + salt * 17) / 9) * Math.max(24, base * 0.055);
  const jitter = Math.sin(t * 1.31 + salt * 4.2) * 11 + Math.cos(t * 0.47 + salt) * 6;
  return Math.max(18, Math.round(base + walk + jitter));
}

export function remainingSec(endsInMin: number, t: number, salt: number) {
  const cycle = Math.max(60, endsInMin * 60 - (salt % 11));
  return cycle - (t % cycle);
}

const HALL_BASE: Record<string, number> = {
  cyber: 44, calc: 71, robotics: 28, rhythm: 56, lens: 19, campus: 49,
};

export function hallStrand(treeId: string, t: number) {
  const base = HALL_BASE[treeId] ?? 32;
  const salt = treeId.length + treeId.charCodeAt(0);
  const wave = Math.sin((t + salt * 7) / (9 + (salt % 5))) * 16;
  const drip = Math.sin(t * 0.33 + salt) * 5;
  return Math.max(7, Math.min(94, Math.round(base + wave + drip)));
}

export function hallDrilling(treeId: string, t: number) {
  const base = 6 + (treeId.charCodeAt(0) % 18);
  return Math.max(2, Math.round(base + Math.sin(t / 5 + treeId.length) * 4.5));
}

const PLACES = ["In a drop", "On a clinic", "In the mix", "On a drill", "Hall wire", "Echo room"];

export function campusNow(t: number) {
  const pool = PEOPLE.filter((p) => p.username !== "kwesi");
  const shift = Math.floor(t / 6);
  return pool.map((person, i) => ({
    person,
    where: PLACES[(i + shift + person.name.length) % PLACES.length],
  }));
}
