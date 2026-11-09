const fs = require('fs');
const path = require('path');

const studioPath = path.resolve('noctis-ai/src/components/noctis/NoctisSovereignFactoryStudio.tsx');
let code = fs.readFileSync(studioPath, 'utf8');

// 1. Update interface props
const oldProps = `interface NoctisSovereignFactoryStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSystem?: (system: SovereignSystem, autoBuild?: boolean) => void;
  initialSystemId?: string;
  initialTab?: "matrix" | "inspector" | "architecture" | "lifecycle" | "bus" | "templates" | "proof";
}`;

const newProps = `interface NoctisSovereignFactoryStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSystem?: (system: SovereignSystem, autoBuild?: boolean) => void;
  onLaunchChat?: (promptText: string) => void;
  initialSystemId?: string;
  initialTab?: "matrix" | "inspector" | "architecture" | "lifecycle" | "bus" | "templates" | "proof";
}`;

const propsRegex = /interface NoctisSovereignFactoryStudioProps \{[\s\S]*?initialTab\?: "matrix"[^\}]*\}/;
if (propsRegex.test(code)) {
  code = code.replace(propsRegex, newProps);
  console.log('1. Updated NoctisSovereignFactoryStudioProps');
} else {
  console.log('1. Props regex did not match');
}

// 2. Destructure onLaunchChat and add state in component
const compRegex = /export function NoctisSovereignFactoryStudio\(\{[\s\S]*?initialTab = "matrix",\r?\n\}: NoctisSovereignFactoryStudioProps\) \{/;
const newComp = `export function NoctisSovereignFactoryStudio({
  isOpen,
  onClose,
  onSelectSystem,
  onLaunchChat,
  initialSystemId,
  initialTab = "matrix",
}: NoctisSovereignFactoryStudioProps) {
  const [inModalPrompt, setInModalPrompt] = useState("");`;

if (compRegex.test(code)) {
  code = code.replace(compRegex, newComp);
  console.log('2. Destructured onLaunchChat in component');
} else {
  console.log('2. Component signature regex did not match');
}

// 3. Add Chat with [System] button in top action bar next to Build in Forge
const forgeBtnRegex = /(<button\r?\n\s*type="button"\r?\n\s*onClick=\{\(\) => handleBuildSystem\(currentSystem\)\}[\s\S]*?<\/button>)/;
const chatButtonCode = `\n                  <button
                    type="button"
                    onClick={() => {
                      const prompt = currentSystem.identity.id === "noctis-legal"
                        ? "Execute comprehensive legal analysis under Noctis Legal (NOCTIS-LEGAL-001)"
                        : \`Engage with \${currentSystem.identity.name} sovereign intelligence\`;
                      if (onLaunchChat) {
                        onLaunchChat(prompt);
                      } else if (onSelectSystem) {
                        onSelectSystem(currentSystem, false);
                      }
                    }}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black px-4 py-1.5 text-xs font-bold transition shadow-lg cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Send className="size-3.5 fill-current" />
                    <span>Chat with {currentSystem.identity.name}</span>
                  </button>`;

if (forgeBtnRegex.test(code) && !code.includes('Chat with {currentSystem.identity.name}')) {
  code = code.replace(forgeBtnRegex, `$1${chatButtonCode}`);
  console.log('3. Added Chat button next to Build in Forge');
} else {
  console.log('3. Forge button regex not found or already added');
}

// 4. Update Card 7 Dedicated Interface to have clickable Launch Chat button
const card7Regex = /(<span className="text-\[11px\] font-bold uppercase tracking-wider text-emerald-400 group-hover:underline">7\. Dedicated Interface<\/span>[\s\S]*?<div className="flex gap-2">)[\s\S]*?(<\/div>\r?\n\s*<p className="text-xs text-zinc-300">Default View:)/;
const newCard7Inner = `$1
                    {currentSystem.interface.hasChat && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const prompt = currentSystem.identity.id === "noctis-legal"
                            ? "Execute comprehensive legal analysis under Noctis Legal (NOCTIS-LEGAL-001)"
                            : \`Engage with \${currentSystem.identity.name} sovereign intelligence\`;
                          if (onLaunchChat) onLaunchChat(prompt);
                          else if (onSelectSystem) onSelectSystem(currentSystem, false);
                        }}
                        className="px-2.5 py-1 text-[11px] rounded-lg font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Send className="size-3 fill-current" />
                        <span>Launch Chat →</span>
                      </button>
                    )}
                    <span className={cn("px-2 py-0.5 text-[10px] rounded font-semibold", currentSystem.interface.hasBoard ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-500")}>Board</span>
                    <span className={cn("px-2 py-0.5 text-[10px] rounded font-semibold", currentSystem.interface.hasCanvas ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-500")}>Canvas</span>
                  $2`;

if (card7Regex.test(code)) {
  code = code.replace(card7Regex, newCard7Inner);
  console.log('4. Updated Card 7 with Launch Chat button');
} else {
  console.log('4. Card 7 regex did not match');
}

// 5. Add In-Modal Chat Prompt bar at bottom of 11-dimension grid
const gridEndRegex = /(\{\/\* 11\. Deployment \*\/[\s\S]*?<\/div>\r?\n\s*<\/div>)/;
const promptBarCode = `\n              {/* In-Modal Chat Prompt Bar */}
              <div className="sticky bottom-2 z-20 mt-6 rounded-2xl border border-emerald-500/40 bg-[#0d0d12]/95 p-3.5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {getSystemIcon(currentSystem.identity.icon)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-none">Chat with {currentSystem.identity.name}</p>
                    <p className="text-[10px] text-emerald-400/80 leading-none mt-1">Autonomous Reasoning & Voice</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-emerald-500/60 transition">
                  <input
                    type="text"
                    placeholder={\`Ask \${currentSystem.identity.name} a legal question, dispute simulation, or statutory citation...\`}
                    value={inModalPrompt}
                    onChange={(e) => setInModalPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inModalPrompt.trim()) {
                        const p = inModalPrompt.trim();
                        setInModalPrompt("");
                        if (onLaunchChat) onLaunchChat(p);
                        else if (onSelectSystem) onSelectSystem(currentSystem, false);
                      }
                    }}
                    className="w-full bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const p = inModalPrompt.trim() || (currentSystem.identity.id === "noctis-legal"
                        ? "Execute comprehensive legal analysis under Noctis Legal (NOCTIS-LEGAL-001)"
                        : \`Engage with \${currentSystem.identity.name}\`);
                      setInModalPrompt("");
                      if (onLaunchChat) onLaunchChat(p);
                      else if (onSelectSystem) onSelectSystem(currentSystem, false);
                    }}
                    className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="size-3" />
                  </button>
                </div>
              </div>`;

if (gridEndRegex.test(code) && !code.includes('In-Modal Chat Prompt Bar')) {
  code = code.replace(gridEndRegex, `$1${promptBarCode}`);
  console.log('5. Added In-Modal Chat Prompt Bar');
} else {
  console.log('5. Grid end regex did not match or already added');
}

fs.writeFileSync(studioPath, code, 'utf8');
console.log('Finished updating NoctisSovereignFactoryStudio.tsx');
