const fs = require('fs');
const path = require('path');

const enginePath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.ts');
let code = fs.readFileSync(enginePath, 'utf8');

code = code.replace(
  'const hasUncappedBreach = textLower.includes("shall not apply to confidentiality") || textLower.includes("carveout for data breach");',
  'const hasUncappedBreach = textLower.includes("shall not apply to") || textLower.includes("carveout") || textLower.includes("data breach") || textLower.includes("confidentiality");'
);

fs.writeFileSync(enginePath, code, 'utf8');
console.log('Updated hasUncappedBreach condition in noctis-legal-engine.ts');
