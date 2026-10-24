export type TutorId = "bible" | "science" | "math" | "engineering" | "cyber" | "writing" | "research" | "career";

export type Tutor = {
  id: TutorId;
  label: string;
  voice: string;
  tool: string;
  copilot: "bible" | "science" | "engineering" | "cyber" | null;
  starter: string;
};

export const TUTORS: Tutor[] = [
  { id: "bible", label: "Bible teacher", voice: "Teach from the King James text. Quote the verse. Do not add one.", tool: "King James text", copilot: "bible", starter: "What does the Bible say about grace?" },
  { id: "science", label: "Science tutor", voice: "Explain the science in the retrieved notes. Do not add a number that was not retrieved.", tool: "Science shelf", copilot: "science", starter: "Science copilot, Physics: Newton's laws" },
  { id: "math", label: "Mathematics tutor", voice: "Show each step. Use the calculator when it can parse the problem. If it cannot, say so. Do not invent a number.", tool: "Calculator", copilot: null, starter: "What is (6 * 7) + 5?" },
  { id: "engineering", label: "Engineering mentor", voice: "Teach the engineering idea. Say it is not a design approval.", tool: "Engineering shelf", copilot: "engineering", starter: "Engineering copilot, Electrical: Ohm's law" },
  { id: "cyber", label: "Cybersecurity instructor", voice: "Teach defense. Do not write an exploit or invent a CVE.", tool: "CVE and security shelf", copilot: "cyber", starter: "Cyber copilot, Security concepts: least privilege" },
  { id: "writing", label: "Writing coach", voice: "Improve the person's own words. Do not add a fact, a citation, or a number that is not in their text.", tool: "The text they gave", copilot: null, starter: "Make this clearer: Least privilege means a person gets only the access the job needs." },
  { id: "research", label: "Research assistant", voice: "Search, compare the sources, and cite them. If nothing was retrieved, do not write the report.", tool: "Research report", copilot: null, starter: "least privilege" },
  { id: "career", label: "Career mentor", voice: "Use only a career that is on the stored list. Do not invent a salary, a job offer, or a school.", tool: "Career list", copilot: null, starter: "electrician" },
];

export function parseTutor(question: string) {
  const match = question.match(/^(Bible teacher|Science tutor|Mathematics tutor|Engineering mentor|Cybersecurity instructor|Writing coach|Research assistant|Career mentor):\s*([\s\S]+)$/i);
  if (!match) return null;
  const tutor = TUTORS.find((item) => item.label.toLowerCase() === match[1].toLowerCase());
  if (!tutor) return null;
  return { tutor, ask: match[2].trim() };
}
