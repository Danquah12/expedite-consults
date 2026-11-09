const fs = require('fs');
const path = require('path');

const deskPath = path.resolve('noctis-ai/src/components/noctis/NoctisDesk.tsx');
let deskCode = fs.readFileSync(deskPath, 'utf8');

// Normalize to check matching
const targetFragment = `  const handleOpenSovereignSuite = (systemId: string, promptText: string) => {
    setMenu(false);
    setFactoryStudioSystemId(systemId);
    setFactoryStudioTab("inspector");
    setFactoryStudioOpen(true);
    setDraft(promptText);
  };`;

// Use regex that ignores \r
const regex = /const handleOpenSovereignSuite = \(systemId: string, promptText: string\) => \{\r?\n\s*setMenu\(false\);\r?\n\s*setFactoryStudioSystemId\(systemId\);\r?\n\s*setFactoryStudioTab\("inspector"\);\r?\n\s*setFactoryStudioOpen\(true\);\r?\n\s*setDraft\(promptText\);\r?\n\s*\};/;

const newHandler = `const handleOpenSovereignSuite = (systemId: string, promptText: string) => {
    setMenu(false);
    setDesk("chat");
    setFactoryStudioOpen(false);
    setFactoryStudioSystemId(systemId);
    setDraft(promptText);
    setTimeout(() => {
      box.current?.focus();
    }, 80);
  };`;

if (regex.test(deskCode)) {
  deskCode = deskCode.replace(regex, newHandler);
  console.log('Successfully replaced handleOpenSovereignSuite!');
} else {
  console.log('Regex did not match handleOpenSovereignSuite');
}

// 2. Wire onLaunchChat into NoctisSovereignFactoryStudio in NoctisDesk.tsx
const studioRegex = /<NoctisSovereignFactoryStudio\r?\n\s*isOpen=\{factoryStudioOpen\}/;
const replacementStudio = `<NoctisSovereignFactoryStudio
        isOpen={factoryStudioOpen}
        onLaunchChat={(prompt) => {
          setFactoryStudioOpen(false);
          setDesk("chat");
          setDraft(prompt);
          setTimeout(() => box.current?.focus(), 80);
        }}`;

if (studioRegex.test(deskCode)) {
  deskCode = deskCode.replace(studioRegex, replacementStudio);
  console.log('Successfully wired onLaunchChat into NoctisSovereignFactoryStudio!');
} else {
  console.log('Regex did not match studio tag');
}

fs.writeFileSync(deskPath, deskCode, 'utf8');
