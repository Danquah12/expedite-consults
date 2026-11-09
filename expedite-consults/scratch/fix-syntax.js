const fs = require('fs');
const path = require('path');

const enginePath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.ts');
let engineCode = fs.readFileSync(enginePath, 'utf8');

const badBlock = `export function isLegalQuery(question: string): boolean {
  const q = question.trim();
  if (!q) return false;

  return /\\b(legal\\b|lawyer\\b|attorney\\b|jurisprudence|statut\\w*|breach|contract|litigat\\w*|pleading\\b|motion\\b|summary\\s+judgment|evidentiary|documentary\\s+evidence|burden\\s+of\\s+proof|hipaa|security\\s+rule|ephi|administrative\\s+procedure\\s+act|\\bapa\\b|negligence|gross\\s+negligence|recklessness|intentional\\s+misconduct|tort\\s+law|far\\s+part\\s*\\d+|federal\\s+procurement|irac\\b|creac\\b|legal\\s+memorandum|legal\\s+opinion|noctis\\s+legal|maryland\\s+law|choice\\s+of\\s+law|personal\\s+jurisdiction)\\b/i.test(q);
  const q = question.trim();
  if (!q) return false;

  return /\\b(legal\\b|lawyer\\b|attorney\\b|jurisprudence|statut\\w*|breach\\s+of\\s+contract|litigat\\w*|pleading\\b|motion\\s+to|summary\\s+judgment|evidentiary|burden\\s+of\\s+proof|hipaa\\s+security\\s+rule|administrative\\s+procedure\\s+act|\\bapa\\b|negligence|gross\\s+negligence|recklessness|intentional\\s+misconduct|tort\\s+law|far\\s+part\\s*\\d+|federal\\s+procurement|irac\\b|legal\\s+memorandum|legal\\s+opinion|noctis\\s+legal|maryland\\s+law|choice\\s+of\\s+law|personal\\s+jurisdiction)\\b/i.test(
    q
  );
}`;

const goodBlock = `export function isLegalQuery(question: string): boolean {
  const q = question.trim();
  if (!q) return false;

  return /\\b(legal\\b|lawyer\\b|attorney\\b|jurisprudence|statut\\w*|breach|contract|litigat\\w*|pleading\\b|motion\\b|summary\\s+judgment|evidentiary|documentary\\s+evidence|burden\\s+of\\s+proof|hipaa|security\\s+rule|ephi|administrative\\s+procedure\\s+act|\\bapa\\b|negligence|gross\\s+negligence|recklessness|intentional\\s+misconduct|tort\\s+law|far\\s+part\\s*\\d+|federal\\s+procurement|irac\\b|creac\\b|legal\\s+memorandum|legal\\s+opinion|noctis\\s+legal|maryland\\s+law|choice\\s+of\\s+law|personal\\s+jurisdiction)\\b/i.test(q);
}`;

engineCode = engineCode.replace(badBlock, goodBlock);
fs.writeFileSync(enginePath, engineCode, 'utf8');
console.log('Fixed syntax error in isLegalQuery');
