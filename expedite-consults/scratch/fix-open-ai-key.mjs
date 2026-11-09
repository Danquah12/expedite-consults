import fs from 'node:fs';

// 1. Update noctis-desk.server.ts
const deskFile = 'noctis-ai/src/lib/noctis-desk.server.ts';
let deskContent = fs.readFileSync(deskFile, 'utf8');

const oldKeyFunc = `function openAiKey(override = "") {
  if (override && override.trim()) return override.trim();
  if (!/^(1|true|yes)$/i.test((process.env.VIBE_ALLOW_OPENAI || "").trim())) return "";
  const baked = typeof BAKED_OPENAI_KEY === "string" ? BAKED_OPENAI_KEY.trim() : "";
  const fileKey = typeof OPENAI_KEY === "string" ? OPENAI_KEY.trim() : "";
  return fileKey || baked || serverSecret("OPENAI_API_KEY");
}`;

const newKeyFunc = `function openAiKey(override = "") {
  if (override && override.trim()) return override.trim();
  if (/^(0|false|no|off)$/i.test((process.env.VIBE_ALLOW_OPENAI || "").trim())) return "";
  const fileKey = typeof OPENAI_KEY === "string" ? OPENAI_KEY.trim() : "";
  const baked = typeof BAKED_OPENAI_KEY === "string" ? BAKED_OPENAI_KEY.trim() : "";
  return fileKey || baked || serverSecret("OPENAI_API_KEY") || "";
}`;

if (deskContent.includes(oldKeyFunc)) {
  deskContent = deskContent.replace(oldKeyFunc, newKeyFunc);
  fs.writeFileSync(deskFile, deskContent, 'utf8');
  console.log('Successfully updated openAiKey in noctis-desk.server.ts');
} else {
  // Try regex in case of line endings
  const regex = /function openAiKey\(override = ""\) \{[\s\S]*?return fileKey \|\| baked \|\| serverSecret\("OPENAI_API_KEY"\);\s*\}/;
  if (regex.test(deskContent)) {
    deskContent = deskContent.replace(regex, newKeyFunc);
    fs.writeFileSync(deskFile, deskContent, 'utf8');
    console.log('Successfully updated openAiKey in noctis-desk.server.ts via regex');
  } else {
    console.error('Could not match oldKeyFunc in noctis-desk.server.ts');
  }
}

// 2. Update noctis-api.ts to support all 6 OpenAI TTS voices
const apiFile = 'noctis-ai/src/lib/noctis-api.ts';
let apiContent = fs.readFileSync(apiFile, 'utf8');

const oldVoiceCheck = `voice: input?.voice === "onyx" || input?.voice === "nova" || input?.voice === "alloy" || input?.voice === "echo" ? input.voice : "alloy",`;
const newVoiceCheck = `voice: input?.voice === "onyx" || input?.voice === "nova" || input?.voice === "alloy" || input?.voice === "echo" || input?.voice === "fable" || input?.voice === "shimmer" ? input.voice : "alloy",`;

if (apiContent.includes(oldVoiceCheck)) {
  apiContent = apiContent.replace(oldVoiceCheck, newVoiceCheck);
  fs.writeFileSync(apiFile, apiContent, 'utf8');
  console.log('Successfully updated sayVibe validator in noctis-api.ts');
} else {
  console.log('oldVoiceCheck not found in noctis-api.ts');
}
