import fs from 'node:fs';

const file = 'noctis-ai/src/components/noctis/NoctisDesk.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add readingTurnIndex state if not present
if (!content.includes('readingTurnIndex')) {
  const targetState = 'const [voicePersona, setVoicePersona] = useState<VoicePersona>("alloy");';
  const replaceState = 'const [voicePersona, setVoicePersona] = useState<VoicePersona>("alloy");\n  const [readingTurnIndex, setReadingTurnIndex] = useState<number | null>(null);';
  if (content.includes(targetState)) {
    content = content.replace(targetState, replaceState);
    console.log('Added readingTurnIndex state');
  } else {
    console.error('Target state not found');
  }
}

// 2. Replace the Read button
const btnRegex = /<button type="button" onClick=\{\(\) => \{ if \(!sayAloud\(\(turn\.content\.split\(\/\\n\\s\*Claim standing:\/i\)\[0\] \|\| turn\.content\)\)\) setError\("This browser cannot speak the answer\."\); \}\} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-400 hover:bg-white\/10 hover:text-zinc-100">\s*<Volume2 className="size-3\.5" \/>\s*Read\s*<\/button>/;

if (btnRegex.test(content)) {
  const replacement = `{(() => {
                            const isReadingThis = readingTurnIndex === index;
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  if (isReadingThis) {
                                    stopCurrentVoicePlayback();
                                    setReadingTurnIndex(null);
                                  } else {
                                    stopCurrentVoicePlayback();
                                    setReadingTurnIndex(index);
                                    const rawAnswer = turn.content.split(/\\n\\s*Claim standing:/i)[0] || turn.content;
                                    const brainConfig = getBrainConfig();
                                    const activeBrain = getActiveKeyAndModel(brainConfig);
                                    const userOpenAiKey = activeBrain.provider === "openai" ? activeBrain.key : "";
                                    void speakNoctisVoice(rawAnswer, voicePersona, {
                                      apiKey: userOpenAiKey,
                                      onStart: () => setReadingTurnIndex(index),
                                      onEnd: () => setReadingTurnIndex((cur) => (cur === index ? null : cur)),
                                    }).then((ok) => {
                                      if (!ok) {
                                        setReadingTurnIndex((cur) => (cur === index ? null : cur));
                                        setError("This browser cannot speak the answer.");
                                      }
                                    });
                                  }
                                }}
                                className={\`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors \${
                                  isReadingThis
                                    ? "bg-amber-500/25 text-amber-300 font-semibold ring-1 ring-amber-500/50 shadow-sm shadow-amber-500/20"
                                    : "text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
                                }\`}
                                title={isReadingThis ? "Stop reading" : "Read aloud entire answer"}
                              >
                                {isReadingThis ? (
                                  <>
                                    <span className="relative flex h-2 w-2">
                                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                    </span>
                                    <Square className="size-3 fill-current" />
                                    Stop
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="size-3.5" />
                                    Read
                                  </>
                                )}
                              </button>
                            );
                          })()}`;
  content = content.replace(btnRegex, replacement);
  console.log('Replaced Read button');
} else {
  console.error('Button regex did not match');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Finished updating NoctisDesk.tsx');
