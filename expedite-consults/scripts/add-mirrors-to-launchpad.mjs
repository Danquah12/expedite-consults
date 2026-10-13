import fs from "fs";

let content = fs.readFileSync("lib/ecosystemData.ts", "utf8");

// 1. Add mirrors property to EcosystemApp interface
content = content.replace(
  '  mirrorVercelUrl?: string;\n',
  '  mirrorVercelUrl?: string;\n  mirrors?: string[];\n'
);

// 2. Add mirrors to platform-aegis-rmf
const aegisMirrors = `    mirrorVercelUrl: "https://aegis-rmf-1ovi.vercel.app",
    mirrors: [
      "https://aegis-rmf.vercel.app",
      "https://aegis-rmf-1ovi.vercel.app",
      "https://aegis-rmf-42q6-kwesi-asiedus-projects.vercel.app"
    ],`;
content = content.replace('    mirrorVercelUrl: "https://aegis-rmf-1ovi.vercel.app",', aegisMirrors);

// 3. Add mirrors to desk-note-workspace
const deskMirrors = `    mirrorVercelUrl: "https://desk-note-lwqq.vercel.app",
    mirrors: [
      "https://desk-note-kwesi-asiedus-projects.vercel.app",
      "https://desk-note-lwqq.vercel.app",
      "https://desk-note-24d8.vercel.app",
      "https://desk-note-tscf-kwesi-asiedus-projects.vercel.app",
      "https://desk-note-tqp2-kwesi-asiedus-projects.vercel.app",
      "https://desk-note-sl4n-kwesi-asiedus-projects.vercel.app",
      "https://desk-note-q1a7-kwesi-asiedus-projects.vercel.app",
      "https://desk-note-3lvc-kwesi-asiedus-projects.vercel.app",
      "https://desk-note-yq7s-kwesi-asiedus-projects.vercel.app"
    ],`;
content = content.replace('    mirrorVercelUrl: "https://desk-note-lwqq.vercel.app",', deskMirrors);

// 4. Add mirrors to vibe-tok-platform
const vibeMirrors = `    mirrorVercelUrl: "https://vibe-tok-6ln6-kwesi-asiedus-projects.vercel.app",
    mirrors: [
      "https://vibe-tok-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-6ln6-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-lw5c-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-x92e-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-9ajl-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-1won-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-gsr5-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-riw2-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-5gln-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-lbf3-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-hn5m-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-4myo-kwesi-asiedus-projects.vercel.app",
      "https://vibe-tok-8zgs-kwesi-asiedus-projects.vercel.app"
    ],`;
content = content.replace('    mirrorVercelUrl: "https://vibe-tok-6ln6-kwesi-asiedus-projects.vercel.app",', vibeMirrors);

fs.writeFileSync("lib/ecosystemData.ts", content, "utf8");
console.log("Successfully attached all mirror deployments to lib/ecosystemData.ts!");
