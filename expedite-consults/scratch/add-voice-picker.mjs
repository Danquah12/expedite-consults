import fs from 'node:fs';

const file = 'noctis-ai/src/components/noctis/NoctisDesk.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import NoctisVoiceSelectorModal & getVoicePersona
if (!content.includes('NoctisVoiceSelectorModal')) {
  content = content.replace(
    'import { NoctisVoiceVisualizer } from "@/components/noctis/NoctisVoiceVisualizer";',
    'import { NoctisVoiceVisualizer } from "@/components/noctis/NoctisVoiceVisualizer";\nimport { NoctisVoiceSelectorModal } from "@/components/noctis/NoctisVoiceSelectorModal";'
  );
}

if (!content.includes('getVoicePersona,')) {
  content = content.replace(
    'type VoicePersona,',
    'getVoicePersona,\n  type VoicePersona,'
  );
}

// 2. Update voicePersona state with localStorage persistence and voiceModalOpen
const stateTarget = `const [voicePersona, setVoicePersona] = useState<VoicePersona>("alloy");
  const [readingTurnIndex, setReadingTurnIndex] = useState<number | null>(null);`;

const stateReplacement = `const [voicePersona, setVoicePersona] = useState<VoicePersona>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noctis_preferred_voice");
        if (saved) return saved as VoicePersona;
      } catch {}
    }
    return "alloy";
  });
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [readingTurnIndex, setReadingTurnIndex] = useState<number | null>(null);

  const handleSelectVoicePersona = (newPersona: VoicePersona) => {
    setVoicePersona(newPersona);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noctis_preferred_voice", newPersona);
      } catch {}
    }
  };`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
  console.log('Replaced voicePersona state and added handleSelectVoicePersona');
} else {
  console.error('State target not found');
}

// 3. Connect onPersonaChange in NoctisVoiceVisualizer to handleSelectVoicePersona
content = content.replace(
  'onPersonaChange={setVoicePersona}',
  'onPersonaChange={handleSelectVoicePersona}'
);

// 4. Add Voice Selector Pill next to Read button
const readBtnEnd = `                                  <>
                                    <Volume2 className="size-3.5" />
                                    Read
                                  </>
                                )}
                              </button>
                            );
                          })()}`;

const readBtnWithVoicePill = `${readBtnEnd}
                          <button
                            type="button"
                            onClick={() => setVoiceModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition border border-white/10 hover:border-white/20 group shadow-sm"
                            title={\`Reading Voice: \${getVoicePersona(voicePersona).label} (\${getVoicePersona(voicePersona).tone}). Click to choose voice.\`}
                          >
                            <Mic className="size-3 text-[#e4b86a] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white">
                              {getVoicePersona(voicePersona).label}
                            </span>
                            <ChevronDown className="size-3 text-zinc-500 group-hover:text-zinc-300" />
                          </button>`;

if (content.includes(readBtnEnd) && !content.includes('title={`Reading Voice:')) {
  content = content.replace(readBtnEnd, readBtnWithVoicePill);
  console.log('Added Voice Selector Pill beside Read button');
} else {
  console.log('Read button target check:', content.includes(readBtnEnd));
}

// 5. Render NoctisVoiceSelectorModal at the bottom of the component
if (!content.includes('<NoctisVoiceSelectorModal')) {
  const modalTarget = `<NoctisBrainModal
        isOpen={brainModalOpen}
        onClose={() => setBrainModalOpen(false)}
      />`;
  const modalReplacement = `<NoctisBrainModal
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
  if (content.includes(modalTarget)) {
    content = content.replace(modalTarget, modalReplacement);
    console.log('Rendered NoctisVoiceSelectorModal');
  } else {
    console.error('Modal target not found');
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('Finished updating NoctisDesk.tsx');
