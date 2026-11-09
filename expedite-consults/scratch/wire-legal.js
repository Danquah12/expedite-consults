const fs = require('fs');
const path = require('path');

const filePath = path.resolve('noctis-ai/src/lib/noctis-response-intelligence.ts');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!code.includes('handleNaturalLegalQuery')) {
  code = code.replace(
    'import { handleNaturalLexQuery } from "./noctis-lex-synthesizer.ts";',
    'import { handleNaturalLexQuery } from "./noctis-lex-synthesizer.ts";\nimport { handleNaturalLegalQuery } from "./noctis-legal-engine.ts";'
  );
}

// 2. Add dispatch
const legalDispatchBlock = `  // 00-legal. Noctis Legal Intelligence & Attorney Persona Engine (NOCTIS-LEGAL-001)
  const legalResponse = handleNaturalLegalQuery(currentQuestion);
  if (legalResponse) {
    return adaptSpecialistEngineOutput(currentQuestion, legalResponse, "NOCTIS-LEGAL-001");
  }
`;

if (!code.includes('"NOCTIS-LEGAL-001"')) {
  const marker = '  // 00-lex.';
  const idx = code.indexOf(marker);
  if (idx !== -1) {
    code = code.slice(0, idx) + legalDispatchBlock + '\n' + code.slice(idx);
  }
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully wired Noctis Legal Engine into noctis-response-intelligence.ts');
