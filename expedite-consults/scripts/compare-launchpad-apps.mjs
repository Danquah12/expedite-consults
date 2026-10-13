import fs from "fs";

const vercelProjects = JSON.parse(fs.readFileSync("vercel-all-projects.json", "utf8"));
const ecosystemContent = fs.readFileSync("lib/ecosystemData.ts", "utf8");

console.log("=== VERCEL PROJECTS VS ECOSYSTEM DATA ===");

const missingProjects = [];
const existingProjects = [];

for (const proj of vercelProjects) {
  // Check if project name or url exists in lib/ecosystemData.ts
  const nameClean = proj.name.toLowerCase();
  const urlDomain = proj.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  
  const hasName = ecosystemContent.toLowerCase().includes(`"${nameClean}"`) || 
                  ecosystemContent.toLowerCase().includes(`'${nameClean}'`) ||
                  ecosystemContent.toLowerCase().includes(nameClean);
  
  const hasUrl = ecosystemContent.includes(urlDomain) || 
                 ecosystemContent.includes(proj.url);

  if (hasUrl || hasName) {
    existingProjects.push(proj);
  } else {
    missingProjects.push(proj);
  }
}

console.log(`\nExisting / Mentioned: ${existingProjects.length}`);
existingProjects.forEach(p => console.log(`  ✓ ${p.name} (${p.url})`));

console.log(`\nMissing from Launchpad: ${missingProjects.length}`);
missingProjects.forEach(p => console.log(`  + [MISSING] ${p.name} (${p.url})`));

fs.writeFileSync("scripts/missing-apps.json", JSON.stringify(missingProjects, null, 2));
