export const IDENTITY_MODES = [
  { id: "personal", label: "Personal", line: "Friends and family." },
  { id: "professional", label: "Professional", line: "Work and networking." },
  { id: "learning", label: "Learning", line: "Courses, scripture, science, and cyber." },
  { id: "creator", label: "Creator", line: "Videos, followers, and live rooms." },
  { id: "community", label: "Community", line: "Groups, churches, schools, and clubs." },
] as const;

export type IdentityMode = (typeof IDENTITY_MODES)[number]["id"];

export type AiAccess = {
  chat: boolean;
  privateChats: boolean;
  study: boolean;
  publicContent: boolean;
  files: boolean;
};

export type Identity = { mode: IdentityMode; ai: AiAccess };

const KEY = "vibetok-identity";

const DEFAULT: Identity = {
  mode: "learning",
  ai: { chat: true, privateChats: false, study: true, publicContent: true, files: false },
};

export function readIdentity(): Identity {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "") as Partial<Identity>;
    return {
      mode: IDENTITY_MODES.some((mode) => mode.id === raw.mode) ? (raw.mode as IdentityMode) : DEFAULT.mode,
      ai: { ...DEFAULT.ai, ...raw.ai },
    };
  } catch {
    return DEFAULT;
  }
}

export function writeIdentity(next: Identity) {
  localStorage.setItem(KEY, JSON.stringify(next));
}
