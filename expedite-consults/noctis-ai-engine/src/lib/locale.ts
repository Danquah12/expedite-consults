import { create } from "zustand";
import { BASE } from "@/lib/locale-base";
import { EXTRA } from "@/lib/locale-extra";
import { PACK } from "@/lib/locale-pack";

export const LANGS = [
  { id: "en", native: "English", short: "EN", dir: "ltr" },
  { id: "es", native: "Español", short: "ES", dir: "ltr" },
  { id: "fr", native: "Français", short: "FR", dir: "ltr" },
  { id: "pt", native: "Português", short: "PT", dir: "ltr" },
  { id: "de", native: "Deutsch", short: "DE", dir: "ltr" },
  { id: "ar", native: "العربية", short: "ع", dir: "rtl" },
  { id: "zh", native: "中文", short: "中文", dir: "ltr" },
  { id: "hi", native: "हिन्दी", short: "हिं", dir: "ltr" },
  { id: "ko", native: "한국어", short: "한", dir: "ltr" },
  { id: "ja", native: "日本語", short: "日", dir: "ltr" },
  { id: "sw", native: "Kiswahili", short: "SW", dir: "ltr" },
  { id: "tw", native: "Twi", short: "TW", dir: "ltr" },
] as const;

export type LangId = (typeof LANGS)[number]["id"];

const KEY = "noctis-lang";
const KEEP = new Set(["Noctis", "XP", "University of Ghana"]);

let active: LangId = "en";

export function isLang(value: string | null | undefined): value is LangId {
  return LANGS.some((row) => row.id === value);
}

const THEME: Record<string, Record<string, string>> = {
  es: {
    "Deep atmospheric slate": "Pizarra profunda",
    "Pure crisp high-contrast light": "Luz nítida de alto contraste",
    "Finnish Arctic marine tone": "Azul ártico",
    "Sustainable cooling deep green": "Verde profundo",
    "Diplomatic warm parchment": "Pergamino cálido",
    "Academic clinics first.": "Primero las clínicas de estudio.",
    "Career skills and labs.": "Habilidades y laboratorios de carrera.",
    "Tutorials and drills.": "Tutoriales y prácticas.",
    "Ideas, then a clinic.": "Ideas, y después una clínica.",
    "News with a teach-back.": "Noticias con una explicación.",
    "Creative with a drill.": "Crear, y luego practicar.",
  },
  fr: {
    "Deep atmospheric slate": "Ardoise profonde",
    "Pure crisp high-contrast light": "Lumière nette",
    "Finnish Arctic marine tone": "Bleu arctique",
    "Sustainable cooling deep green": "Vert profond",
    "Diplomatic warm parchment": "Parchemin chaud",
    "Academic clinics first.": "D’abord les cliniques d’étude.",
    "Career skills and labs.": "Compétences et ateliers de carrière.",
    "Tutorials and drills.": "Tutoriels et exercices.",
    "Ideas, then a clinic.": "Des idées, puis une clinique.",
    "News with a teach-back.": "L’actualité, puis on la redit.",
    "Creative with a drill.": "Créer, puis s’exercer.",
  },
  pt: {
    "Deep atmospheric slate": "Ardósia profunda",
    "Pure crisp high-contrast light": "Luz nítida",
    "Finnish Arctic marine tone": "Azul ártico",
    "Sustainable cooling deep green": "Verde profundo",
    "Diplomatic warm parchment": "Pergaminho quente",
    "Academic clinics first.": "Primeiro as clínicas de estudo.",
    "Career skills and labs.": "Habilidades e laboratórios.",
    "Tutorials and drills.": "Tutoriais e treinos.",
    "Ideas, then a clinic.": "Ideias, depois uma clínica.",
    "News with a teach-back.": "Notícias com uma explicação.",
    "Creative with a drill.": "Criar e depois treinar.",
  },
  de: {
    "Deep atmospheric slate": "Tiefer Schiefer",
    "Pure crisp high-contrast light": "Klares helles Licht",
    "Finnish Arctic marine tone": "Arktisches Blau",
    "Sustainable cooling deep green": "Tiefes Grün",
    "Diplomatic warm parchment": "Warmes Pergament",
    "Academic clinics first.": "Zuerst die Lernkliniken.",
    "Career skills and labs.": "Beruf und Labore.",
    "Tutorials and drills.": "Anleitungen und Übungen.",
    "Ideas, then a clinic.": "Ideen, dann eine Klinik.",
    "News with a teach-back.": "Nachrichten, dann nacherzählt.",
    "Creative with a drill.": "Kreativ, dann üben.",
  },
  ar: {
    "Deep atmospheric slate": "أردواز عميق",
    "Pure crisp high-contrast light": "ضوء واضح",
    "Finnish Arctic marine tone": "أزرق قطبي",
    "Sustainable cooling deep green": "أخضر عميق",
    "Diplomatic warm parchment": "رقّ دافئ",
    "Academic clinics first.": "عيادات الدراسة أولاً.",
    "Career skills and labs.": "مهارات المهنة والمختبرات.",
    "Tutorials and drills.": "شروح وتدريبات.",
    "Ideas, then a clinic.": "أفكار، ثم عيادة.",
    "News with a teach-back.": "أخبار ثم إعادة شرح.",
    "Creative with a drill.": "إبداع ثم تدريب.",
  },
  zh: {
    "Deep atmospheric slate": "深色石板",
    "Pure crisp high-contrast light": "干净的亮色",
    "Finnish Arctic marine tone": "北极蓝",
    "Sustainable cooling deep green": "深绿色",
    "Diplomatic warm parchment": "暖羊皮纸",
    "Academic clinics first.": "先上课。",
    "Career skills and labs.": "职业技能和实验。",
    "Tutorials and drills.": "教程和练习。",
    "Ideas, then a clinic.": "先有想法，再上课。",
    "News with a teach-back.": "新闻，然后讲一遍。",
    "Creative with a drill.": "创作，然后练习。",
  },
  hi: {
    "Deep atmospheric slate": "गहरी स्लेट",
    "Pure crisp high-contrast light": "साफ़ उजली रोशनी",
    "Finnish Arctic marine tone": "आर्कटिक नीला",
    "Sustainable cooling deep green": "गहरा हरा",
    "Diplomatic warm parchment": "गर्म चर्मपत्र",
    "Academic clinics first.": "पहले पढ़ाई की क्लिनिक।",
    "Career skills and labs.": "करियर कौशल और प्रयोग।",
    "Tutorials and drills.": "ट्यूटोरियल और अभ्यास।",
    "Ideas, then a clinic.": "विचार, फिर क्लिनिक।",
    "News with a teach-back.": "समाचार, फिर समझाएँ।",
    "Creative with a drill.": "रचना, फिर अभ्यास।",
  },
  ko: {
    "Deep atmospheric slate": "깊은 슬레이트",
    "Pure crisp high-contrast light": "또렷한 밝은 화면",
    "Finnish Arctic marine tone": "북극 파랑",
    "Sustainable cooling deep green": "깊은 초록",
    "Diplomatic warm parchment": "따뜻한 양피지",
    "Academic clinics first.": "공부 클리닉부터.",
    "Career skills and labs.": "커리어와 실습.",
    "Tutorials and drills.": "튜토리얼과 연습.",
    "Ideas, then a clinic.": "아이디어, 그다음 클리닉.",
    "News with a teach-back.": "뉴스, 그리고 다시 말하기.",
    "Creative with a drill.": "만들고 연습.",
  },
  ja: {
    "Deep atmospheric slate": "深いスレート",
    "Pure crisp high-contrast light": "くっきりした明色",
    "Finnish Arctic marine tone": "北極の青",
    "Sustainable cooling deep green": "深い緑",
    "Diplomatic warm parchment": "暖かい羊皮紙",
    "Academic clinics first.": "まず学習クリニック。",
    "Career skills and labs.": "キャリアと実習。",
    "Tutorials and drills.": "解説と練習。",
    "Ideas, then a clinic.": "アイデア、それからクリニック。",
    "News with a teach-back.": "ニュースを、自分の言葉で。",
    "Creative with a drill.": "作って、それから練習。",
  },
  sw: {
    "Deep atmospheric slate": "Kibao kirefu",
    "Pure crisp high-contrast light": "Mwanga safi",
    "Finnish Arctic marine tone": "Samawati ya aktiki",
    "Sustainable cooling deep green": "Kijani kirefu",
    "Diplomatic warm parchment": "Ngozi ya joto",
    "Academic clinics first.": "Kliniki za kusoma kwanza.",
    "Career skills and labs.": "Ujuzi wa kazi na maabara.",
    "Tutorials and drills.": "Mafunzo na mazoezi.",
    "Ideas, then a clinic.": "Mawazo, kisha kliniki.",
    "News with a teach-back.": "Habari, kisha eleza.",
    "Creative with a drill.": "Tengeneza, kisha fanya mazoezi.",
  },
  tw: {
    "Deep atmospheric slate": "Tuntum a emu dɔ",
    "Pure crisp high-contrast light": "Hann a emu da hɔ",
    "Finnish Arctic marine tone": "Bruu a ɛyɛ nwini",
    "Sustainable cooling deep green": "Ahabammono a emu dɔ",
    "Diplomatic warm parchment": "Krataa a ɛyɛ hye",
    "Academic clinics first.": "Adesua dan kan.",
    "Career skills and labs.": "Adwuma nimdeɛ ne lab.",
    "Tutorials and drills.": "Nkyerɛkyerɛ ne ntetee.",
    "Ideas, then a clinic.": "Adwene, na afei dan.",
    "News with a teach-back.": "Amanneɛ, na san ka.",
    "Creative with a drill.": "Yɛ biribi, na afei tetee.",
  },
};

export function vt(text: string) {
  if (!text || active === "en") return text;
  if (KEEP.has(text)) return text;
  return BASE[active]?.[text] || THEME[active]?.[text] || EXTRA[active]?.[text] || PACK[active]?.[text] || text;
}

export function readLang(): LangId {
  if (typeof localStorage === "undefined") return "en";
  try {
    const raw = localStorage.getItem(KEY);
    if (isLang(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "en";
}

export function applyLang(lang: LangId) {
  active = lang;
  if (typeof document === "undefined") return;
  const row = LANGS.find((item) => item.id === lang);
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
  document.documentElement.dir = row?.dir ?? "ltr";
}

export const useLocale = create<{ lang: LangId; setLang: (lang: LangId) => void }>((set) => ({
  lang: "en",
  setLang: (lang) => {
    applyLang(lang);
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* ignore */
    }
    set({ lang });
  },
}));
