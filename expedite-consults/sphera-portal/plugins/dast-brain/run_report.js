const fs = require('fs');
const { execSync } = require('child_process');

// Path to agy CLI – adjust if installed elsewhere
const agyPath = 'C:/Users/asied/AppData/Local/agy/bin/agy.exe';

const reportPath = process.env.REPORT_PATH;
if (!reportPath) {
  console.error('REPORT_PATH environment variable not set');
  process.exit(1);
}
let report;
try {
  report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch (e) {
  console.error('Failed to read/parse report:', e);
  process.exit(1);
}

for (const finding of report) {
  console.log('Processing finding:', finding);
  const payload = JSON.stringify(finding).replace(/'/g, "'\\''"); // escape single quotes
  try {
    // Invoke the applyVulnScript skill via the agy CLI
    execSync(`${agyPath} skill applyVulnScript '${payload}'`, { stdio: 'inherit' });
  } catch (err) {
    console.error('Skill invocation failed for', finding, err.message);
  }
}
