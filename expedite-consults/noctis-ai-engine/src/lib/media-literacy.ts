import type { Evidence, StudyCard } from "@/lib/knowledge-types";

const PRIMARY = /gov|nvd|rfc|bible|king james|archives|census|congress|court|cisa|nist|wikipedia/i;

export type MediaRead = {
  claim: string;
  offered: string;
  primary: Evidence[];
  independent: Evidence[];
  established: string;
  uncertain: string;
  interpretations: string;
  original: Evidence | null;
  note: string;
};

export function readClaim(claim: string, card: StudyCard | null, offered?: string): MediaRead {
  const evidence = card?.evidence ?? [];
  const primary = evidence.filter((row) => PRIMARY.test(`${row.type} ${row.source} ${row.href}`));
  const independent = evidence.filter((row) => !primary.includes(row));
  const original = evidence[0] ?? null;
  const established =
    card?.confidence === "verified" && card.sentence
      ? `The retrieved record says: ${card.sentence}`
      : "Nothing here is marked established. A retrieved page is not proof of the whole claim.";
  const uncertain = !card || card.confidence === "insufficient"
    ? "The library did not match this claim. Treat it as unverified until you find the original."
    : "The claim may go further than the passage. What the passage does not say is still uncertain.";
  return {
    claim: claim.trim(),
    offered: offered?.trim() || "No evidence was attached to the claim.",
    primary,
    independent,
    established,
    uncertain,
    interpretations: "This tool does not pick an interpretation. Write what the passage says, then write where you still disagree.",
    original,
    note: card?.note ?? "Nothing was guessed.",
  };
}
