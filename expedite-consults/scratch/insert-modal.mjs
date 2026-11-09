import fs from 'node:fs';

const file = 'noctis-ai/src/components/noctis/NoctisDesk.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<NoctisBrainModal\s+isOpen=\{brainModalOpen\}\s+onClose=\{\(\) => setBrainModalOpen\(false\)\}\s*\/>/;
if (regex.test(content)) {
  const replacement = `<NoctisBrainModal
        isOpen={brainModalOpen}
        onClose={() => setBrainModalOpen(false)}
      />
      <NoctisVoiceSelectorModal
        isOpen={voiceModalOpen}
        currentPersona={voicePersona}
        onSelectPersona={handleSelectVoicePersona}
        onClose={() => setVoiceModalOpen(false)}
        title="Choose Reading & Speaking Voice"
        actionLabel="Set Reading Voice"
      />`;
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully inserted NoctisVoiceSelectorModal');
} else {
  console.log('Regex did not match');
}
