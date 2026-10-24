export type SafetySignal = { kind: string; why: string; hold: string } | null;

const RULES: { kind: string; test: RegExp; why: string }[] = [
  { kind: "Spam", test: /\b(buy now|click here now|limited offer|dm me to earn)\b/i, why: "The words match an unsolicited pitch." },
  { kind: "Scam", test: /\b(gift card|wire transfer|send bitcoin|you have won|crypto wallet)\b/i, why: "The words ask for money or a prize." },
  { kind: "Harassment", test: /\b(i will find you|you should die|kill yourself)\b/i, why: "The words target a person with a threat." },
  { kind: "Bullying", test: /\b(everyone hates you|nobody wants you here|you are worthless)\b/i, why: "The words are aimed at a person, not an idea." },
  { kind: "Dangerous misinformation", test: /\b(this cures cancer|do not take your medicine|drink bleach)\b/i, why: "The words make a medical claim that can hurt someone." },
  { kind: "Coordinated abuse", test: /\b(everyone post this at|brigade|mass report them)\b/i, why: "The words ask other people to pile on." },
  { kind: "Fake account", test: /\b(i am the real|official account of|send the code i texted)\b/i, why: "The words claim an identity or a login code." },
  { kind: "Harmful content", test: /\b(how to make a bomb|how to kill)\b/i, why: "The words ask for harm." },
];

/** A signal holds the text for a person. It does not hide, ban, or decide. */
export function safetySignal(text: string): SafetySignal {
  const hit = RULES.find((rule) => rule.test.test(text));
  if (!hit) return null;
  return {
    kind: hit.kind,
    why: hit.why,
    hold: "Hold for a person. The machine does not hide this, ban anyone, or close the case. A high-impact decision needs a person, a note, and an appeal.",
  };
}
