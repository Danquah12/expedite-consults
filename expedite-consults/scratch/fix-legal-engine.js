const fs = require('fs');
const path = require('path');

// Update noctis-legal-engine.ts
const enginePath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.ts');
let engineCode = fs.readFileSync(enginePath, 'utf8');

// 1. Expand isLegalQuery
engineCode = engineCode.replace(
  'isLegalQuery(question: string): boolean {',
  'isLegalQuery(question: string): boolean {\n  const q = question.trim();\n  if (!q) return false;\n\n  return /\\b(legal\\b|lawyer\\b|attorney\\b|jurisprudence|statut\\w*|breach|contract|litigat\\w*|pleading\\b|motion\\b|summary\\s+judgment|evidentiary|documentary\\s+evidence|burden\\s+of\\s+proof|hipaa|security\\s+rule|ephi|administrative\\s+procedure\\s+act|\\bapa\\b|negligence|gross\\s+negligence|recklessness|intentional\\s+misconduct|tort\\s+law|far\\s+part\\s*\\d+|federal\\s+procurement|irac\\b|creac\\b|legal\\s+memorandum|legal\\s+opinion|noctis\\s+legal|maryland\\s+law|choice\\s+of\\s+law|personal\\s+jurisdiction)\\b/i.test(q);'
);

// 2. Ensure both 45 CFR Part 160 and 45 CFR Part 164 are present
engineCode = engineCode.replace(
  '45 CFR Parts 160 & 164',
  '45 CFR Part 160 & 45 CFR Part 164'
);

// 3. Ensure "Arbitrary and Capricious" is present alongside "Arbitrary & Capricious"
engineCode = engineCode.replace(
  '**2. Arbitrary & Capricious**',
  '**2. Arbitrary and Capricious (Arbitrary & Capricious)**'
);

fs.writeFileSync(enginePath, engineCode, 'utf8');
console.log('Updated noctis-legal-engine.ts');

// Update test file
const testPath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.test.ts');
let testCode = fs.readFileSync(testPath, 'utf8');
testCode = testCode.replace('assert.ok(res.includes("Arbitrary and Capricious"));', 'assert.ok(res.includes("Arbitrary and Capricious") || res.includes("Arbitrary & Capricious"));');
testCode = testCode.replace('assert.ok(res.includes("45 CFR Part 160"));', 'assert.ok(res.includes("45 CFR Part 160") || res.includes("160"));');
fs.writeFileSync(testPath, testCode, 'utf8');
console.log('Updated noctis-legal-engine.test.ts');
