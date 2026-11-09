const fs = require('fs');
const path = require('path');

const enginePath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.ts');
let code = fs.readFileSync(enginePath, 'utf8');

code = code.replace(
  'if (textLower.includes("non-compete") || textLower.includes("covenant not to compete") || textLower.includes("restrictive covenant"))',
  'if (textLower.includes("non-compete") || textLower.includes("not to compete") || textLower.includes("restrictive covenant"))'
);

fs.writeFileSync(enginePath, code, 'utf8');
console.log('Fixed non-compete detection regex in noctis-legal-engine.ts');
