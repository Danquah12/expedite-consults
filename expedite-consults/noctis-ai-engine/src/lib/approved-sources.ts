export type ApprovedSource = {
  id: string;
  name: string;
  state: "Connected" | "Not connected";
  line: string;
};

/** The only outside services Vibe may call. Nothing can register itself. */
export const APPROVED_SOURCES: ApprovedSource[] = [
  { id: "bible", name: "Bible", state: "Connected", line: "The stored King James text. Not a live Bible API." },
  { id: "science", name: "Scientific pages", state: "Connected", line: "Wikipedia, when a page is retrieved. Not a journal database." },
  { id: "cyber", name: "Cybersecurity", state: "Connected", line: "The NVD, when the question contains a CVE id." },
  { id: "github", name: "GitHub", state: "Connected", line: "The GitHub API, when a repository is named." },
  { id: "academic", name: "Academic sources", state: "Connected", line: "arXiv, when a paper id is pasted. Not every journal." },
  { id: "maps", name: "Maps", state: "Not connected", line: "A sign-in can be placed. Answers do not call a map service." },
  { id: "finance", name: "Financial education", state: "Connected", line: "The stored career list. No live prices." },
  { id: "weather", name: "Weather", state: "Not connected", line: "No weather service is called." },
];

export function approvedSource(id: string) {
  return APPROVED_SOURCES.find((row) => row.id === id) ?? null;
}
