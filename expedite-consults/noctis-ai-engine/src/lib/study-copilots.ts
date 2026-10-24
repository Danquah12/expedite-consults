export type CopilotMode = { id: string; label: string; ask: string; job: string };

export type StudyCopilotSpec = {
  id: "bible" | "cyber" | "science" | "engineering";
  label: string;
  line: string;
  modes: CopilotMode[];
};

export const STUDY_COPILOTS: StudyCopilotSpec[] = [
  {
    id: "bible",
    label: "Bible",
    line: "Verses come from the King James text. A chain or a sermon is not scripture.",
    modes: [
      { id: "questions", label: "Bible questions", ask: "What does the Bible say about grace?", job: "Answer from the retrieved verses only. Quote them. Do not add a verse." },
      { id: "context", label: "Context", ask: "Bible copilot, Context: grace and faith", job: "Give only the context that is in the retrieved verses or the relationship chain. If a setting is not written there, say it was not retrieved." },
      { id: "cross", label: "Cross references", ask: "Bible copilot, Cross references: grace and faith", job: "List only verses that were retrieved. Do not invent a cross reference. If one verse came back, say no other verse was retrieved." },
      { id: "history", label: "Historical background", ask: "Bible copilot, Historical background: Ephesians", job: "State historical background only when a retrieved note contains it. Otherwise say the stored text has no history attached." },
      { id: "book", label: "Book summaries", ask: "Overview of the book of Ephesians", job: "Summarize only the stored book facts that were retrieved." },
      { id: "character", label: "Character studies", ask: "Bible copilot, Character studies: Paul", job: "Describe the person only from retrieved verses and the relationship chain. Do not add a story that is not there." },
      { id: "word", label: "Word studies", ask: "Bible copilot, Word studies: grace", job: "Show the word inside the retrieved verses. Do not invent a Greek or Hebrew root." },
      { id: "plan", label: "Study plans", ask: "Bible copilot, Study plans: Ephesians", job: "A short plan that uses only the retrieved book or verses. Do not assign a reading that was not named." },
      { id: "sermon", label: "Sermon preparation", ask: "Write a sermon from Ephesians 2:8", job: "A sermon is a note from the quoted verse. It is not scripture." },
    ],
  },
  {
    id: "cyber",
    label: "Cyber",
    line: "Defensive teaching. Exploit code is not stored. A CVE id is read from its record.",
    modes: [
      { id: "cve", label: "CVE explanations", ask: "Cyber copilot, CVE explanations: what a CVE points at", job: "Explain a CVE as an identifier. Point at the NVD. Do not invent a CVE id or an exploit." },
      { id: "vuln", label: "Vulnerability education", ask: "Cyber copilot, Vulnerability education: what a vulnerability is", job: "Teach what a vulnerability is. Do not give steps to attack a system." },
      { id: "concepts", label: "Security concepts", ask: "Cyber copilot, Security concepts: least privilege", job: "Explain the concept from the retrieved card or chain. Do not add a control that was not named." },
      { id: "defense", label: "Defensive security", ask: "Cyber copilot, Defensive security: mitigation", job: "Stay on defense: patch, least privilege, disable unused access. No attack procedure." },
      { id: "coding", label: "Secure coding", ask: "Cyber copilot, Secure coding: least privilege in code", job: "Explain a defensive coding idea. Do not write exploit code or a payload." },
      { id: "lab", label: "Lab explanations", ask: "Cyber copilot, Lab explanations: disable a departed contractor key", job: "Explain the defensive lab step. The first move is to remove access that no longer has a job." },
      { id: "intel", label: "Threat intelligence", ask: "Cyber copilot, Threat intelligence: what a CVE record must include", job: "Use only a retrieved record or the CVE chain. If no report was retrieved, say so. Do not invent a campaign." },
    ],
  },
  {
    id: "science",
    label: "Science",
    line: "An explanation from the shelf or a retrieved page. A number that was not retrieved is not added.",
    modes: [
      { id: "physics", label: "Physics", ask: "Science copilot, Physics: Newton's laws", job: "Explain the physics from the retrieved notes. Do not add a constant or a result that is not written there." },
      { id: "chemistry", label: "Chemistry", ask: "Science copilot, Chemistry: what a molecule is", job: "Explain only what the retrieved page supports. Do not invent a formula." },
      { id: "biology", label: "Biology", ask: "Science copilot, Biology: DNA", job: "Use the retrieved biology note. Do not identify a person or diagnose anything." },
      { id: "astronomy", label: "Astronomy", ask: "Science copilot, Astronomy: what orbits the Sun", job: "Explain from the retrieved page. Do not add a distance that was not retrieved." },
      { id: "earth", label: "Earth science", ask: "Science copilot, Earth science: the water cycle", job: "Explain the cycle from the retrieved note. Do not turn it into a weather forecast." },
      { id: "explain", label: "Scientific explanations", ask: "Science copilot, Scientific explanations: the scientific method", job: "State the method from the retrieved card. Say what a test would need. Do not claim a new result." },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    line: "Study definitions. Not a design approval and not a built system.",
    modes: [
      { id: "mechanical", label: "Mechanical", ask: "Engineering copilot, Mechanical: factor of safety", job: "Explain the mechanical idea from the notes. Say it does not approve a machine." },
      { id: "electrical", label: "Electrical", ask: "Engineering copilot, Electrical: Ohm's law", job: "Explain V = IR and the units. Say it is not every circuit and not an approval." },
      { id: "civil", label: "Civil", ask: "Engineering copilot, Civil: what a structural load is", job: "Define the idea from the retrieved notes. Do not size a beam or approve a structure." },
      { id: "chemical", label: "Chemical", ask: "Engineering copilot, Chemical: what a process stream is", job: "Define it from the retrieved notes. Do not give a plant procedure." },
      { id: "software", label: "Software", ask: "Engineering copilot, Software: least privilege in a program", job: "Explain the defensive software idea. Do not write an exploit." },
      { id: "systems", label: "Systems engineering", ask: "Engineering copilot, Systems engineering: a system and its boundary", job: "Explain the system idea from the notes. Do not invent a requirement the notes do not contain." },
    ],
  },
];

export function parseCopilot(question: string) {
  const match = question.match(/^(Bible|Cyber|Science|Engineering) copilot,\s*([^:]+):\s*([\s\S]+)$/i);
  if (!match) return null;
  const label = match[1].toLowerCase();
  const id = label.startsWith("bible") ? "bible" : label.startsWith("cyber") ? "cyber" : label.startsWith("science") ? "science" : "engineering";
  const copilot = STUDY_COPILOTS.find((row) => row.id === id);
  const modeName = match[2].trim().toLowerCase();
  const mode = copilot?.modes.find((row) => row.label.toLowerCase() === modeName);
  return { copilot: copilot ?? STUDY_COPILOTS[0], mode, ask: match[3].trim(), job: mode?.job ?? "Use only the retrieved notes." };
}
