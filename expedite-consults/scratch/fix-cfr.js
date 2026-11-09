const fs = require('fs');
const path = require('path');

const enginePath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.ts');
let engineCode = fs.readFileSync(enginePath, 'utf8');

// Ensure explicit '45 CFR Part 160' and '45 CFR Part 164' are present
engineCode = engineCode.replace(
  '45 CFR Parts 160 & 164 Subparts A & C',
  '45 CFR Part 160 & 45 CFR Part 164 (Subparts A & C)'
);
engineCode = engineCode.replace(
  '45 CFR Parts 160 & 164)?',
  '45 CFR Part 160 & 45 CFR Part 164)?'
);

fs.writeFileSync(enginePath, engineCode, 'utf8');
console.log('Fixed CFR text in noctis-legal-engine.ts');
