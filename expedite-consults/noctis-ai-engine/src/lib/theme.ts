import { create } from "zustand";

export type ClinicTheme = "midnight" | "white" | "nordic" | "emerald" | "sand";

export const CANVASES: {
  id: ClinicTheme;
  label: string;
  chip: string;
  blurb: string;
  swatch: string;
  accent: string;
  meta: string;
  light?: boolean;
  isDefault?: boolean;
}[] = [
  {
    id: "midnight",
    label: "Dark Midnight",
    chip: "Dark",
    blurb: "Deep atmospheric slate",
    swatch: "#0b1220",
    accent: "#e4b86a",
    meta: "#0b1220",
    isDefault: true,
  },
  {
    id: "white",
    label: "Clean White",
    chip: "Clean",
    blurb: "Pure crisp high-contrast light",
    swatch: "#f7f8fa",
    accent: "#e11d48",
    meta: "#f7f8fa",
    light: true,
  },
  {
    id: "nordic",
    label: "Nordic Blue",
    chip: "Nordic",
    blurb: "Finnish Arctic marine tone",
    swatch: "#16385c",
    accent: "#5ec8f0",
    meta: "#071525",
  },
  {
    id: "emerald",
    label: "Montreal Emerald",
    chip: "Green",
    blurb: "Sustainable cooling deep green",
    swatch: "#0f3d2e",
    accent: "#34d399",
    meta: "#06140f",
  },
  {
    id: "sand",
    label: "Warm Sand",
    chip: "Sand",
    blurb: "Diplomatic warm parchment",
    swatch: "#e6d5b8",
    accent: "#b45309",
    meta: "#e9dcc8",
    light: true,
  },
];

const KEY = "vibetok-theme";
const IDS = new Set<ClinicTheme>(CANVASES.map((c) => c.id));

const ALIAS: Record<string, ClinicTheme> = {
  midnight: "midnight",
  white: "white",
  nordic: "nordic",
  emerald: "emerald",
  sand: "sand",
  black: "midnight",
  night: "midnight",
  ink: "nordic",
  ember: "sand",
  paper: "white",
  day: "midnight",
};

export function isLightCanvas(theme: ClinicTheme) {
  return CANVASES.find((c) => c.id === theme)?.light === true;
}

export function readTheme(): ClinicTheme {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return "midnight";
    const mapped = ALIAS[raw];
    if (mapped && IDS.has(mapped)) return mapped;
    return "midnight";
  } catch {
    return "midnight";
  }
}

export function applyTheme(theme: ClinicTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (isLightCanvas(theme)) root.classList.remove("dark");
  else root.classList.add("dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  const canvas = CANVASES.find((c) => c.id === theme) ?? CANVASES[0];
  if (meta) meta.setAttribute("content", canvas.meta);
}

export function writeTheme(theme: ClinicTheme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* quota */
  }
  applyTheme(theme);
}

type ThemeState = {
  theme: ClinicTheme;
  setTheme: (theme: ClinicTheme) => void;
};

export const useTheme = create<ThemeState>((set) => ({
  theme: "midnight",
  setTheme: (theme) => {
    writeTheme(theme);
    set({ theme });
  },
}));
