const TAGS = /#ai\b|#llm\b|#rag\b|#mlops\b|#deeplearn\b|#nlp\b|#ml\b|#vision\b|#align\b|#aiethics\b|#agents\b/;
const WORDS =
  /\b(artificial intelligence|machine learning|deep learning|neural networks?|chatgpt|openai|generative ai|genai|large language models?|llms?|pytorch|tensorflow|prompt injection|midjourney|stable diffusion|andrew ng|cs229|cs231n|cs224n|6\.s191|statquest|two minute papers|retrieval[- ]augmented|mlops|computer vision|ai (clinic|security|workload|workloads|stack|stacks|rmf|lab|agent|agents|model|models|ethics|governance))\b/i;

/** True when a clip is about AI. Used to keep those films off every tab. */
export function isAiClip(post: {
  id?: string;
  caption?: string;
  hashtags?: string[];
  musicTitle?: string;
  teach?: { hook?: string; stamp?: string; prompt?: string };
  author?: { name?: string };
}) {
  const id = post.id ?? "";
  if (/^(ai-|aisupply|agent-ai)/.test(id) || id.includes("-ai-")) return true;
  const tags = (post.hashtags ?? []).join(" ").toLowerCase();
  if (TAGS.test(tags)) return true;
  const blob = `${id} ${post.caption ?? ""} ${post.musicTitle ?? ""} ${post.teach?.hook ?? ""} ${post.teach?.stamp ?? ""} ${post.teach?.prompt ?? ""} ${post.author?.name ?? ""}`;
  return WORDS.test(blob);
}
