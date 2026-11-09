const fs = require('fs');
const path = require('path');

const deskPath = path.resolve('noctis-ai/src/components/noctis/NoctisDesk.tsx');
let deskCode = fs.readFileSync(deskPath, 'utf8');

// 1. Update handleOpenSovereignSuite to direct to chat and focus
const oldHandler = `  const handleOpenSovereignSuite = (systemId: string, promptText: string) => {
    setMenu(false);
    setFactoryStudioSystemId(systemId);
    setFactoryStudioTab("inspector");
    setFactoryStudioOpen(true);
    setDraft(promptText);
  };`;

const newHandler = `  const handleOpenSovereignSuite = (systemId: string, promptText: string) => {
    setMenu(false);
    setDesk("chat");
    setFactoryStudioOpen(false);
    setFactoryStudioSystemId(systemId);
    setDraft(promptText);
    setTimeout(() => {
      box.current?.focus();
    }, 80);
  };`;

if (deskCode.includes(oldHandler)) {
  deskCode = deskCode.replace(oldHandler, newHandler);
  console.log('Updated handleOpenSovereignSuite in NoctisDesk.tsx');
} else {
  console.log('oldHandler pattern not found exactly, inspecting...');
}

// 2. Wire onLaunchChat into NoctisSovereignFactoryStudio in NoctisDesk.tsx
const studioTag = `<NoctisSovereignFactoryStudio
        isOpen={factoryStudioOpen}`;

const replacementStudioTag = `<NoctisSovereignFactoryStudio
        isOpen={factoryStudioOpen}
        onLaunchChat={(prompt) => {
          setFactoryStudioOpen(false);
          setDesk("chat");
          setDraft(prompt);
          setTimeout(() => box.current?.focus(), 80);
        }}`;

if (deskCode.includes(studioTag)) {
  deskCode = deskCode.replace(studioTag, replacementStudioTag);
  console.log('Wired onLaunchChat into NoctisSovereignFactoryStudio in NoctisDesk.tsx');
}

fs.writeFileSync(deskPath, deskCode, 'utf8');
