export const VIBE_SKILLS = [
  { id: "talk", label: "Talk", line: "Answers the question", example: "Explain this to me.", stance: "", source: "", keys: [] as string[] },
  { id: "calculate", label: "Calculate", line: "A computed number", example: "Hohmann transfer from 300 km to geostationary", stance: "Use only the calculator sheet attached below. Do not change a number, a unit, or a constant.", source: "", keys: ["hohmann", "rocket equation", "circular orbit", "orbital speed", "orbital velocity", "orbital period", "escape speed", "escape velocity", "vis-viva", "vis viva", "mass ratio", "specific impulse", "delta-v", "delta v"] },
  { id: "work", label: "Work", line: "The steps and the check", example: "Show the work for a circular orbit at 400 km", stance: "Show given, constants, formula, substitution, result, and the unit check. Use only the calculator sheet. Do not change a number.", source: "", keys: ["show the work", "show your work"] },
  { id: "reason", label: "Reason", line: "Breaks a problem into steps", example: "Analyze this step by step.", stance: "Break the problem into ordered steps, then give the answer. Do not skip the steps.", source: "", keys: ["step by step", "analyze this"] },
  { id: "library", label: "Library", line: "Bible, NVD, GitHub, papers", example: "What does John 3:16 say?", stance: "Answer from the library notes attached below. If a verse or record is in those notes, quote it and name the source. Do not say it is missing when it is written in the notes. If the notes are empty, say the library did not return a record. Do not invent a verse, a CVE, or a paper.", source: "study", keys: ["john 3:16", "john 3", "bible", "verse", "scripture", "psalm"] },
  { id: "search", label: "Search", line: "What is happening now", example: "What happened today in cybersecurity?", stance: "Answer from the headlines and pages attached below. Name the outlet and the date on each headline. Those headlines are the current public record. Do not say nothing was found when headlines are attached. Do not invent a headline.", source: "web", keys: ["what happened today", "today in", "headlines", "latest news"] },
  { id: "read", label: "Read", line: "A PDF, note, or paper", example: "Summarize what I uploaded.", stance: "A document is attached. Read that text. If the document or the person gives an instruction, a question, or a task, do that task. If it is a resume and no task was given, interpret it from the page: person, roles, dates, skills, and education. Do not invent a job, a date, or a skill that is not written there. Do not stop at a one-line summary when the document asks for more.", source: "", keys: ["what i uploaded", "this pdf", "this paper", "resume"] },
  { id: "see", label: "See", line: "A picture or diagram", example: "Explain what is in this picture.", stance: "The person attached a picture. Interpret that picture: what it is, what is visible, and what it means. Do not invent labels that are not there.", source: "", keys: ["this picture", "this image", "this photo", "this diagram"] },
  { id: "draw", label: "Draw", line: "Make a picture", example: "Draw a diagram of a volcano.", stance: "", source: "", keys: ["draw a ", "draw an ", "draw the ", "sketch a ", "sketch an "] },
  { id: "watch", label: "Watch", line: "A lesson from a video", example: "Turn this video into a lesson.", stance: "If a video page is attached, make a short lesson: what it is, the main points, and one thing to try. Do not invent scenes you were not given. If there is no video, ask for the link.", source: "", keys: ["this video", "youtube", "vimeo"] },
  { id: "film", label: "This video", line: "The film on screen", example: "What is the most important thing in this video?", stance: "A video note is attached. Answer only from that note and the question. Do not invent a scene, a quote, or an event that is not in the note. If the video does not answer the question, say so.", source: "", keys: ["this video on screen", "the film on screen"] },
  { id: "evidence", label: "Evidence", line: "Verified, partial, or conflicting", example: "What is the evidence for this?", stance: "Answer in a few sentences from the notes below. Name only sources that are written in those notes. Do not invent a source, a date, or a quote. If the notes are empty or thin, say the record is not enough. Do not write an evidence status line.", source: "both", keys: ["what is the evidence", "show the evidence", "evidence for"] },
  { id: "quiz", label: "Quiz", line: "Questions, then the answers", example: "Give me a quiz on this.", stance: "Write four short questions from the conversation and the attached notes. After the questions, list the answers. Do not quiz a fact that was not in the chat or the notes. If nothing has been discussed, say there is nothing to quiz yet.", source: "", keys: ["give me a quiz", "quiz me", "make a quiz"] },
  { id: "speak", label: "Speak", line: "Hear the answer", example: "Talk me through this.", stance: "Write the answer so it can be read aloud. Short sentences. No headings or markup.", source: "", keys: ["talk me through", "read aloud", "out loud"] },
  { id: "translate", label: "Translate", line: "Another language", example: "Teach this in French.", stance: "If they asked you to teach, instruct, or explain, do that whole lesson in the language they named. Do not answer in English and then translate. If they only asked to translate one line, show their line, then the translation. Keep names. If they did not name a language, use Spanish.", source: "", keys: ["translate", "in spanish", "in french", "in german", "in portuguese", "in arabic", "en español", "speak french", "speak german", "teach me in", "instruct in"] },
  { id: "write", label: "Write", line: "A lesson, caption, or description", example: "Write a caption for this.", stance: "Write the piece they asked for. Keep it specific and ready to use.", source: "", keys: ["write a caption", "write a lesson", "draft a"] },
  { id: "brief", label: "Brief", line: "The short version", example: "Give me the two-minute version.", stance: "Condense to a short brief. Lead with the point. Stay under 150 words unless they asked for more.", source: "", keys: ["two-minute", "short version", "tl;dr", "tldr"] },
  { id: "sort", label: "Sort", line: "A category path", example: "Classify this subject.", stance: "Classify the subject. Give a path such as Science, then Biology, then Genetics, and one sentence on why.", source: "", keys: ["classify", "what subject"] },
  { id: "extract", label: "Extract", line: "People, dates, and topics", example: "Pull the people, dates, and topics.", stance: "Pull only facts that are in the message or the attached source: people, organizations, dates, and topics. Use a short list. Do not add any.", source: "", keys: ["people, dates", "pull the people", "extract the"] },
  { id: "level", label: "Level", line: "Beginner or advanced", example: "Explain it for a beginner.", stance: "", source: "", keys: ["for a beginner", "like i'm new", "like i am new", "like i'm 10"] },
  { id: "tools", label: "Tools", line: "NVD, GitHub, and papers", example: "Look up CVE-2024-3094.", stance: "Use the tool notes attached below. Cite the source name and link. Do not invent a record.", source: "study", keys: ["cve-", "look up cve"] },
  { id: "agent", label: "Agent", line: "Research, compare, then write", example: "Compare the sources, then write a short report.", stance: "Work in three short parts: what you found, how the sources differ, then a report. Use only the attached notes and pages.", source: "both", keys: ["compare the sources", "write a short report"] },
  { id: "make", label: "Make", line: "A lesson, quiz, and cards", example: "Create a lesson about artificial intelligence for high-school students.", stance: "", source: "", keys: ["create a lesson", "make a lesson", "high-school", "flashcards"] },
  { id: "tutor", label: "Tutor", line: "Teaches, then checks you", example: "I don't understand photosynthesis.", stance: "", source: "", keys: ["i don't understand", "i do not understand", "teach me", "photosynthesis"] },
  { id: "research", label: "Research", line: "Search, compare, then cite", example: "Research this topic: least privilege.", stance: "", source: "", keys: ["research this", "research the topic", "research "] },
  { id: "check", label: "Check", line: "Unsupported claims", example: "Which claims here are not supported?", stance: "Check the claim. Mark each point as supported, unclear, or not supported. Do not smooth over a gap.", source: "", keys: ["not supported", "unsupported", "fact check", "fact-check"] },
  { id: "guard", label: "Guard", line: "Safe to post or not", example: "Should this comment be posted?", stance: "Say whether this should be posted. Flag harm, private data, and scams. Be brief. Do not lecture.", source: "", keys: ["should this comment", "safe to post", "be posted"] },
] as const;

export type NoctisSkillId = (typeof VIBE_SKILLS)[number]["id"];

const KEY_ORDER: NoctisSkillId[] = [
  "calculate",
  "work",
  "library",
  "research",
  "tools",
  "search",
  "make",
  "tutor",
  "agent",
  "translate",
  "watch",
  "film",
  "evidence",
  "quiz",
  "brief",
  "speak",
  "draw",
  "write",
  "sort",
  "extract",
  "check",
  "guard",
  "see",
  "read",
  "reason",
  "level",
];

export function noctisSkill(id: string) {
  return VIBE_SKILLS.find((skill) => skill.id === id) ?? VIBE_SKILLS[0];
}

export function skillFromWords(text: string): NoctisSkillId | "" {
  const q = text.trim().toLowerCase();
  if (!q) return "";
  if (
    q.length > 260 ||
    /\b(audit|recompute|megawatt|gigawatt|gwh|mwh|twh|kcal|capacity\s+factor|population|capital\s+budget|mitigation\s+package|sensitivity\s+analysis)\b/i.test(q) ||
    /\b(python|java|c\+\+|c#|javascript|typescript|golang|rust|sql\s+injection|sqli|owasp|bola|bopla|bfla|ssrf|csrf|clickjacking|cors|xxe|ssti|smuggling|deserialization|websockets|cswsh|prototype\s+pollution|graphql|nosql|portswigger|etc\/passwd|win\.ini|php:\/\/filter|unit\s*test|unittest|pytest|junit|risk\s+management\s+lifecycle|risk\s+management\s+engine|risk\s+intelligence|domain\s+certification\s+engine|800-37|800-30|iso\s*31000)\b/i.test(q) ||
    /\b(write|create|generate|build|implement|train)\b[\s\S]{0,60}\b(code|script|program|function|class|test|tasks?|c\s+code|c\s+program|c\s+script)\b/i.test(q)
  ) {
    return "";
  }
  const first = q.split(/\s+/)[0]?.replace(/[^a-z]/g, "") ?? "";
  const named = VIBE_SKILLS.find((skill) => skill.id !== "talk" && (skill.id === first || skill.label.toLowerCase() === first));
  if (named) {
    if (named.id === "draw" && /\b(conclusion|inference|comparison|line\s+between|from|on|upon|down|out|architecture|flowchart|attack\s+graph|attack\s+tree|sequence\s+diagram|topology|system|lifecycle|zero\s+trust|microgrid|ransomware)\b/i.test(q)) {
      return "";
    }
    return named.id;
  }
  for (const id of KEY_ORDER) {
    if (id === "draw") {
      if (
        /^(?:please\s+|can\s+you\s+|could\s+you\s+)?(?:draw|sketch)\s+(?:a|an|the|me)\b/i.test(q) &&
        !/\b(conclusion|architecture|flowchart|attack\s+graph|attack\s+tree|sequence\s+diagram|topology|system|lifecycle|zero\s+trust|microgrid|ransomware)\b/i.test(q)
      ) {
        return "draw";
      }
      continue;
    }
    const skill = noctisSkill(id);
    if (skill.keys.some((key) => q.includes(key))) return skill.id;
  }
  return "";
}