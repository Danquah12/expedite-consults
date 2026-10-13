import { execSync } from "child_process";
import fs from "fs";

let nextCursor = null;
const allProjects = [];
let page = 1;

while (true) {
  const tempFile = "scripts/temp_vercel_page.txt";
  const psCmd = nextCursor 
    ? `npx vercel project ls --next ${nextCursor}`
    : `npx vercel project ls`;
  
  console.log(`Page ${page}: ${psCmd}`);
  
  try {
    execSync(`powershell -NoProfile -Command "${psCmd} *>&1 | Out-File -FilePath ${tempFile} -Encoding utf8"`);
  } catch (err) {
    console.error("Execution warning:", err.message);
  }

  if (!fs.existsSync(tempFile)) {
    console.log("Temp file not found, exiting.");
    break;
  }

  const content = fs.readFileSync(tempFile, "utf8");
  const lines = content.split(/\r?\n/);
  let inProjects = false;
  let foundNext = null;
  let pageFoundCount = 0;

  for (const rawLine of lines) {
    // Strip ANSI codes
    const line = rawLine.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").trim();

    if (line.includes("Project Name") && line.includes("Latest Production URL")) {
      inProjects = true;
      continue;
    }
    if (line.includes("--next")) {
      const match = line.match(/--next\s+([0-9a-zA-Z_-]+)/);
      if (match) {
        foundNext = match[1];
      }
      continue;
    }
    if (inProjects && line) {
      if (line.startsWith(">") || line.startsWith("Fetching") || line.startsWith("Project Name") || line.startsWith("---")) continue;
      
      const parts = line.split(/\s{2,}/);
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const url = parts[1].trim();
        const updated = parts[2] ? parts[2].trim() : "";
        const nodeVer = parts[3] ? parts[3].trim() : "";
        
        // Ensure url looks like a url or domain
        if (url.startsWith("http://") || url.startsWith("https://") || url.includes(".vercel.app") || url.includes(".")) {
          allProjects.push({ name, url, updated, nodeVer });
          pageFoundCount++;
          console.log(`  [${allProjects.length}] ${name} -> ${url}`);
        }
      }
    }
  }

  console.log(`Page ${page} finished, parsed ${pageFoundCount} projects. Next cursor: ${foundNext}`);

  if (foundNext && foundNext !== nextCursor) {
    nextCursor = foundNext;
    page++;
  } else {
    break;
  }
}

if (fs.existsSync("scripts/temp_vercel_page.txt")) {
  fs.unlinkSync("scripts/temp_vercel_page.txt");
}

console.log(`\n================================`);
console.log(`Total projects fetched: ${allProjects.length}`);
fs.writeFileSync("vercel-all-projects.json", JSON.stringify(allProjects, null, 2));
console.log("Saved to vercel-all-projects.json");
