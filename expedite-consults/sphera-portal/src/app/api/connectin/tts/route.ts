import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import https from "https"

export const runtime = "nodejs"

// ============================================================================
// STUDIO NATURAL HUMAN VOICE ACTORS FOR ALL 46 SUPPORTED LANGUAGES
// Maps each language code to [Male Human Voice Actor, Female Human Voice Actor]
// ============================================================================
const NATURAL_HUMAN_VOICE_ACTORS: Record<string, { male: string; female: string }> = {
  en: { male: "en-US-AndrewMultilingualNeural", female: "en-US-AvaMultilingualNeural" },
  es: { male: "es-ES-AlvaroNeural", female: "es-MX-DaliaNeural" },
  fr: { male: "fr-FR-RemyMultilingualNeural", female: "fr-FR-VivienneMultilingualNeural" },
  de: { male: "de-DE-FlorianMultilingualNeural", female: "de-DE-SeraphinaMultilingualNeural" },
  pt: { male: "pt-BR-AntonioNeural", female: "pt-BR-ThalitaMultilingualNeural" },
  it: { male: "it-IT-GiuseppeMultilingualNeural", female: "it-IT-IsabellaNeural" },
  nl: { male: "nl-NL-MaartenNeural", female: "nl-NL-FennaNeural" },
  pl: { male: "pl-PL-MarekNeural", female: "pl-PL-ZofiaNeural" },
  uk: { male: "uk-UA-OstapNeural", female: "uk-UA-PolinaNeural" },
  ru: { male: "ru-RU-DmitryNeural", female: "ru-RU-SvetlanaNeural" },
  tr: { male: "tr-TR-AhmetNeural", female: "tr-TR-EmelNeural" },
  el: { male: "el-GR-NestorasNeural", female: "el-GR-AthinaNeural" },
  sv: { male: "sv-SE-MattiasNeural", female: "sv-SE-SofieNeural" },
  ar: { male: "ar-EG-ShakirNeural", female: "ar-EG-SalmaNeural" },
  fa: { male: "fa-IR-FaridNeural", female: "fa-IR-DilaraNeural" },
  he: { male: "he-IL-AvriNeural", female: "he-IL-HilaNeural" },
  hi: { male: "hi-IN-MadhurNeural", female: "hi-IN-SwaraNeural" },
  bn: { male: "bn-BD-PradeepNeural", female: "bn-BD-NabanitaNeural" },
  ur: { male: "ur-PK-AsadNeural", female: "ur-PK-UzmaNeural" },
  pa: { male: "hi-IN-MadhurNeural", female: "hi-IN-SwaraNeural" },
  ta: { male: "ta-IN-ValluvarNeural", female: "ta-IN-PallaviNeural" },
  zh: { male: "zh-CN-YunxiNeural", female: "zh-CN-XiaoxiaoNeural" },
  ja: { male: "ja-JP-KeitaNeural", female: "ja-JP-NanamiNeural" },
  ko: { male: "ko-KR-HyunsuMultilingualNeural", female: "ko-KR-SunHiNeural" },
  vi: { male: "vi-VN-NamMinhNeural", female: "vi-VN-HoaiMyNeural" },
  th: { male: "th-TH-NiwatNeural", female: "th-TH-PremwadeeNeural" },
  id: { male: "id-ID-ArdiNeural", female: "id-ID-GadisNeural" },
  ms: { male: "ms-MY-OsmanNeural", female: "ms-MY-YasminNeural" },
  tl: { male: "fil-PH-AngeloNeural", female: "fil-PH-BlessicaNeural" },
  // African & regional languages mapped to authentic West/East/Southern African human voice actors
  sw: { male: "sw-TZ-DaudiNeural", female: "sw-TZ-RehemaNeural" },
  am: { male: "am-ET-AmehaNeural", female: "am-ET-MekdesNeural" },
  so: { male: "so-SO-MuuseNeural", female: "so-SO-UbaxNeural" },
  zu: { male: "zu-ZA-ThembaNeural", female: "zu-ZA-ThandoNeural" },
  xh: { male: "zu-ZA-ThembaNeural", female: "zu-ZA-ThandoNeural" },
  ak: { male: "sw-KE-RafikiNeural", female: "sw-KE-ZuriNeural" },
  ee: { male: "sw-KE-RafikiNeural", female: "sw-KE-ZuriNeural" },
  gaa: { male: "sw-KE-RafikiNeural", female: "sw-KE-ZuriNeural" },
  ha: { male: "sw-KE-RafikiNeural", female: "sw-KE-ZuriNeural" },
  yo: { male: "sw-KE-RafikiNeural", female: "sw-KE-ZuriNeural" },
  ig: { male: "sw-KE-RafikiNeural", female: "sw-KE-ZuriNeural" },
  om: { male: "sw-KE-RafikiNeural", female: "sw-KE-ZuriNeural" },
  rw: { male: "sw-TZ-DaudiNeural", female: "sw-TZ-RehemaNeural" },
  sn: { male: "zu-ZA-ThembaNeural", female: "zu-ZA-ThandoNeural" },
  wo: { male: "fr-FR-RemyMultilingualNeural", female: "fr-FR-VivienneMultilingualNeural" },
  lg: { male: "sw-KE-RafikiNeural", female: "sw-KE-ZuriNeural" },
}

const PHONETIC_RESHAPE_LANGS = new Set(["ak", "ee", "gaa", "ha", "yo", "ig", "om", "rw", "sn", "lg"])

const PRIMARY_TTS_LANG_MAP: Record<string, string> = {
  en: "en",
  ak: "ak",
  ee: "ee",
  gaa: "gaa",
  ha: "ha",
  yo: "yo",
  ig: "ig",
  sw: "sw",
  am: "am",
  om: "om",
  so: "so",
  zu: "zu",
  xh: "xh",
  rw: "rw",
  sn: "sn",
  wo: "wo",
  lg: "lg",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt-BR",
  it: "it",
  nl: "nl",
  pl: "pl",
  uk: "uk",
  ru: "ru",
  tr: "tr",
  el: "el",
  sv: "sv",
  ar: "ar",
  fa: "fa",
  he: "iw",
  hi: "hi",
  bn: "bn",
  ur: "ur",
  pa: "pa",
  ta: "ta",
  zh: "zh-CN",
  ja: "ja",
  ko: "ko",
  vi: "vi",
  th: "th",
  id: "id",
  ms: "ms",
  tl: "tl",
}

const PHONETIC_FALLBACK_TTS_VOICE: Record<string, string[]> = {
  ak: ["sw", "yo", "id", "pt-BR"],
  ee: ["sw", "yo", "fr", "id"],
  gaa: ["sw", "yo", "id", "pt-BR"],
  ha: ["ha", "sw", "id", "ar"],
  yo: ["yo", "sw", "id", "pt-BR"],
  ig: ["ig", "sw", "yo", "id"],
  am: ["am", "ar", "sw"],
  om: ["sw", "so", "id"],
  so: ["so", "sw", "ar"],
  zu: ["zu", "sw", "id"],
  xh: ["zu", "sw", "id"],
  rw: ["sw", "fr", "id"],
  sn: ["sw", "zu", "id"],
  wo: ["fr", "sw", "id"],
  lg: ["sw", "id", "en"],
  fa: ["fa", "ar", "ur"],
  he: ["iw", "he", "ar"],
  pa: ["pa", "hi", "ur"],
}

const DEGREE_WORD_BY_LANG: Record<string, string> = {
  en: " degrees",
  ak: " ",
  ee: " ",
  gaa: " ",
  ha: " digiri",
  yo: " ìwọ̀n",
  ig: " digrii",
  sw: " nyuzi",
  es: " grados",
  pt: " graus",
  fr: " degrés",
  de: " Grad",
  it: " gradi",
  nl: " graden",
  pl: " stopni",
  uk: " градусів",
  ru: " градусов",
  tr: " derece",
  ar: " درجة",
  hi: " डिग्री",
  zh: "度",
  ja: "度",
  ko: "도",
}

function reshapeForAuthenticSpokenPronunciation(rawText: string, lang: string, isFallbackVoice: boolean): string {
  const degReplacement = DEGREE_WORD_BY_LANG[lang] ?? " "
  let text = rawText
    // Strip leading timestamp brackets like "[00:12] " so the voice only speaks the verbatim words
    .replace(/^\s*\[\d{1,2}:\d{2}\]\s*/g, "")
    .replace(/(\d+)\s*°/g, `$1${degReplacement}`)
    .replace(/\s*[—–·•|✓✕🔊⏸]\s*/g, ", ")
    .replace(/ConnectLn/gi, "Connect-Line")
    .replace(/\s+/g, " ")
    .trim()

  if (lang === "ak") {
    text = text
      .replace(/nhwehwɛmu/gi, "nshwe-shwe-mu")
      .replace(/hwehwɛ/gi, "shwe-shwe")
      .replace(/nhyehyɛeɛ/gi, "nshe-she-eh")
      .replace(/kyerɛkyerɛfoɔ/gi, "chere-chere-fo-o")
      .replace(/nkyerɛaseɛ/gi, "nchere-ase-eh")
      .replace(/kyerɛkyerɛ/gi, "chere-chere")
      .replace(/kyerɛ/gi, "chere")
      .replace(/adwumayɛfoɔ/gi, "ajuma-yefo-o")
      .replace(/duadwuma/gi, "dua-juma")
      .replace(/nsaanodwuma/gi, "nsaano-juma")
      .replace(/adwinnadeɛ/gi, "ajwin-nade-eh")
      .replace(/nnwinnadeɛ/gi, "nnwin-nade-eh")
      .replace(/adwuma/gi, "ajuma")
      .replace(/dwuma/gi, "juma")
      .replace(/agyiraehyɛ/gi, "ajira-eshe")
      .replace(/agyiraeɛ/gi, "ajira-eh")
      .replace(/gyina/gi, "jina")
      .replace(/ntwea/gi, "nchwe-a")
      .replace(/atwa/gi, "achwa")
      .replace(/watwa/gi, "wachwa")
      .replace(/twa/gi, "chwa")
      .replace(/hwɛ/gi, "shwe")
      .replace(/ahwɛ/gi, "ashwe")
      .replace(/hyɛ/gi, "sheh")
      .replace(/ahyɛ/gi, "asheh")
      .replace(/wahyɛ/gi, "washeh")
      .replace(/ɛhyia/gi, "eshia")
      .replace(/hyia/gi, "shia")
      .replace(/mfitiaseɛ/gi, "mfitia-se-eh")
      .replace(/adesuafoɔ/gi, "adesua-fo-o")
      .replace(/sɛnea/gi, "sene-a")
      .replace(/pɛpɛɛpɛ/gi, "pe-pee-pe")
      .replace(/tẽẽ/gi, "tee")
      .replace(/kɔsi/gi, "kosi")
      .replace(/anammɔn/gi, "anam-mon")
      .replace(/ɛ/g, "e")
      .replace(/Ɛ/g, "E")
      .replace(/ɔ/g, "o")
      .replace(/Ɔ/g, "O")
  } else if (lang === "ee") {
    text = text
      .replace(/eʋegbe/gi, "eve-gbe")
      .replace(/nusrɔ̃lawo/gi, "nusro-lawo")
      .replace(/nusrɔ̃ƒe/gi, "nusro-fe")
      .replace(/srɔ̃a/gi, "sro-a")
      .replace(/afɔɖeɖe/gi, "afo-dede")
      .replace(/dzesiɖoɖo/gi, "dzesi-dodo")
      .replace(/dzadzraɖo/gi, "dzadzra-do")
      .replace(/gbegɔmeɖeɖe/gi, "gbe-gome-dede")
      .replace(/gbeɖiɖi/gi, "gbe-didi")
      .replace(/pɛpɛpɛ/gi, "pe-pe-pe")
      .replace(/ɖ/g, "d")
      .replace(/Ɖ/g, "D")
      .replace(/ƒ/g, "f")
      .replace(/Ƒ/g, "F")
      .replace(/ʋ/g, "v")
      .replace(/Ʋ/g, "V")
      .replace(/ŋ/g, "ng")
      .replace(/Ŋ/g, "Ng")
      .replace(/ɣ/g, "g")
      .replace(/Ɣ/g, "G")
      .replace(/ɛ/g, "e")
      .replace(/Ɛ/g, "E")
      .replace(/ɔ/g, "o")
      .replace(/Ɔ/g, "O")
      .replace(/ã/g, "a")
      .replace(/ẽ/g, "e")
      .replace(/ĩ/g, "i")
      .replace(/õ/g, "o")
      .replace(/ũ/g, "u")
  } else if (lang === "gaa") {
    text = text
      .replace(/shishitsɔɔmɔ/gi, "shishi-choomo")
      .replace(/tsɔɔlɔ/gi, "choolo")
      .replace(/tsɔɔ/gi, "choo")
      .replace(/tsei/gi, "chei")
      .replace(/tso/gi, "cho")
      .replace(/jogbaŋŋ/gi, "jo-gbang")
      .replace(/gbɛfaŋ/gi, "gbe-fang")
      .replace(/kpɛŋŋ/gi, "kpeng")
      .replace(/koŋi/gi, "kong-i")
      .replace(/shĩa/gi, "shia")
      .replace(/jw/gi, "j")
      .replace(/ŋ/g, "ng")
      .replace(/Ŋ/g, "Ng")
      .replace(/ɛ/g, "e")
      .replace(/Ɛ/g, "E")
      .replace(/ɔ/g, "o")
      .replace(/Ɔ/g, "O")
      .replace(/ã/g, "a")
  } else if (isFallbackVoice) {
    text = text
      .replace(/ɛ/g, "e")
      .replace(/Ɛ/g, "E")
      .replace(/ɔ/g, "o")
      .replace(/Ɔ/g, "O")
      .replace(/ɖ/g, "d")
      .replace(/Ɖ/g, "D")
      .replace(/ƒ/g, "f")
      .replace(/Ƒ/g, "F")
      .replace(/ŋ/g, "ng")
      .replace(/Ŋ/g, "Ng")
      .replace(/ʋ/g, "v")
      .replace(/Ʋ/g, "V")
      .replace(/ɣ/g, "g")
      .replace(/Ɣ/g, "G")
  }

  return text
}

// ============================================================================
// STUDIO HUMAN VOICE PROTOCOL (Sec-MS-GEC v2 + 24kHz 48kbps MP3)
// ============================================================================
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4"
const WIN_EPOCH = 11644473600n
const CHROMIUM_FULL_VERSION = "143.0.3650.75"
const SEC_MS_GEC_VERSION = `2-${CHROMIUM_FULL_VERSION}`

const SHA256_INITIAL = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]
const SHA256_STATE = [
  0xfd9fbea2, 0x91243ce7, 0xbe499094, 0xcd2e1e0a,
  0x6c006f49, 0x04bd35ab, 0xfeb0a7e4, 0x03effbd2,
]
const SHA256_SCHEDULE = [
  0xeb24bf9e, 0x1558691f, 0xa0c09ee2, 0x0cfa32ba,
  0xa622ee8c, 0xd1dd9491, 0xc0dd25a0, 0xf9e70ab6,
  0xf0c31573, 0x7058ce4e, 0x7188e606, 0x00e5ab33,
  0xd258b060, 0x72766564,
]
const SHA256_ROUND_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]
const SHA256_ADJUSTMENT = 0xc9dc06a7
const SHA256_BLOCK_CONSTANTS = [
  ...SHA256_ROUND_CONSTANTS.slice(0, 14),
  SHA256_ADJUSTMENT,
  ...SHA256_ROUND_CONSTANTS.slice(15),
]
const SHA256_SIGMA0_ADJUSTMENT = 0x059c0b80
const SHA256_SIGMA1_ADJUSTMENT = 0x000b92c0

const CS64_COEFFICIENTS: [number, number][] = [
  [0xe82e91b1, 0xb32700d0],
  [0x44de24c6, 0x88dff51d],
  [0x3beb65bc, 0x29514038],
  [0xc89c5933, 0xb328cbdf],
  [0x8d1ec211, 0xd405b4d5],
  [0x314ef5d5, 0x26e55f3c],
  [0xe92491b1, 0x607801c6],
  [0xf0a5b9d5, 0x82b2c1fb],
  [0x06064cf3, 0xfa51a3da],
  [0xda79fa60, 0x207cc464],
  [0xbed20560, 0x3c3c74f3],
  [0x89f9c9f8, 0xd2d14b61],
  [0x35fa38c6, 0xbb04a2c1],
  [0xcb49e3c6, 0xc5626167],
]
const CS64_FACTOR = 0x82893933
const CS64_ADJUSTMENT0 = 0xf2f90b1a
const CS64_ADJUSTMENT1 = 0x0b1a0000

function u32(v: number): number {
  return v >>> 0
}
function mul32(a: number, b: number): number {
  return Math.imul(a, b) >>> 0
}
function rotr(v: number, n: number): number {
  const x = v >>> 0
  return ((x >>> n) | (x << (32 - n))) >>> 0
}
function rol16(v: number): number {
  const x = v >>> 0
  return ((x << 16) | (x >>> 16)) >>> 0
}
function sigma0(v: number): number {
  const x = v >>> 0
  return (rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3)) >>> 0
}
function sigma1(v: number): number {
  const x = v >>> 0
  return (rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10)) >>> 0
}

function sha256Rounds(state: number[], words: number[], firstRound = 0): number[] {
  let [a, b, c, d, e, f, g, h] = state.map(u32)
  const constants = firstRound === 14 ? SHA256_BLOCK_CONSTANTS : SHA256_ROUND_CONSTANTS
  for (let i = firstRound; i < 64; i++) {
    const s1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0
    const ch = (g ^ (e & (f ^ g))) >>> 0
    const t1 = u32(h + s1 + ch + constants[i] + words[i])
    const s0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0
    const maj = ((a & b) | (c & (a | b))) >>> 0
    const t2 = u32(s0 + maj)
    h = g
    g = f
    f = e
    e = u32(d + t1)
    d = c
    c = b
    b = a
    a = u32(t1 + t2)
  }
  return [a, b, c, d, e, f, g, h]
}

function expandSha256Schedule(words: number[], firstWord = 16): void {
  for (let i = firstWord; i < 64; i++) {
    const s1 = sigma1(words[i - 2])
    const s0 = sigma0(words[i - 15])
    words.push(u32(s1 + words[i - 7] + s0 + words[i - 16]))
  }
}

function sha256Init(data7: Buffer): number[] {
  const words = new Array<number>(14).fill(0)
  words.push(((data7[0] << 16) | (data7[1] << 8) | data7[2]) >>> 0)
  words.push(data7.readUInt32BE(3))
  for (let i = 16; i < 30; i++) {
    let val = SHA256_SCHEDULE[i - 16]
    if (i - 2 >= 14) {
      val = u32(val + (i === 16 ? (sigma1(words[i - 2]) ^ SHA256_SIGMA1_ADJUSTMENT) >>> 0 : sigma1(words[i - 2])))
    }
    if (i - 7 >= 14) {
      val = u32(val + words[i - 7])
    }
    if (i - 15 >= 14) {
      val = u32(val + (i === 29 ? (sigma0(words[i - 15]) ^ SHA256_SIGMA0_ADJUSTMENT) >>> 0 : sigma0(words[i - 15])))
    }
    words.push(u32(val))
  }
  words.push(
    u32(
      sigma1(words[28]) +
        words[23] +
        sigma0(words[15]) +
        words[14] +
        SHA256_ADJUSTMENT -
        SHA256_ROUND_CONSTANTS[14]
    )
  )
  expandSha256Schedule(words, 31)
  const working = sha256Rounds(SHA256_STATE, words, 14)
  return SHA256_INITIAL.map((x, idx) => u32(x + working[idx]))
}

function sha256Digest(data: Buffer): Buffer {
  const length = 57 + data.length
  const padZeroes = ((55 - length) % 64 + 64) % 64
  const tail = data.subarray(7)
  const padded = Buffer.alloc(tail.length + 1 + padZeroes + 8)
  tail.copy(padded, 0)
  padded[tail.length] = 0x80
  padded.writeBigUInt64BE(BigInt(length * 8), padded.length - 8)

  let state = sha256Init(data.subarray(0, 7))
  for (let offset = 0; offset < padded.length; offset += 64) {
    const words: number[] = []
    for (let j = 0; j < 16; j++) {
      words.push(padded.readUInt32BE(offset + j * 4))
    }
    expandSha256Schedule(words, 16)
    const working = sha256Rounds(state, words, 0)
    state = state.map((x, idx) => u32(x + working[idx]))
  }
  const out = Buffer.alloc(32)
  state.forEach((w, idx) => out.writeUInt32BE(w, idx * 4))
  return out
}

function wordsLe4Even(data: Buffer): number[] {
  const padLen = (4 - (data.length % 4)) % 4
  const padded = padLen ? Buffer.concat([data, Buffer.alloc(padLen)]) : data
  const words: number[] = []
  for (let i = 0; i < padded.length; i += 4) {
    words.push(padded.readUInt32LE(i))
  }
  if (words.length % 2 !== 0) words.push(0)
  return words
}

function cs64Digest(data: Buffer, digest: Buffer): string {
  const keyA = (digest.readUInt32LE(0) | 1) >>> 0
  const keyB = (digest.readUInt32LE(4) | 1) >>> 0
  const factors = [mul32(keyA, CS64_FACTOR), mul32(keyB, CS64_FACTOR)]
  const terms = CS64_COEFFICIENTS.map(([coeff], idx) => mul32(coeff, factors[idx % 2]))
  const offsets = CS64_COEFFICIENTS.map(([, off]) => off >>> 0)

  const inputWords = wordsLe4Even(Buffer.concat([Buffer.from([0x00]), data]))
  inputWords.forEach((word, idx) => {
    let term = mul32(word, idx % 2 === 0 ? keyA : keyB)
    let offset = mul32(rol16(word), idx % 2 === 0 ? 0xef0569fb : 0xc31713db)
    if (idx === 0) {
      term = u32(term + mul32(CS64_ADJUSTMENT0, factors[0]))
      offset = u32(offset + CS64_ADJUSTMENT1)
    }
    terms.push(term)
    offsets.push(offset)
  })

  let swapAcc = 0
  let swapLast = 0
  let state = 0
  let acc = 0

  for (let i = 0; i < terms.length; i += 2) {
    const x = terms[i]
    const y = terms[i + 1]
    let t = rol16(u32(offsets[i] + x))
    let q = mul32(t, 0x76f50f34)
    swapAcc = u32(swapAcc + u32(mul32(rol16(q), 0xc3efea97) + q))

    t = rol16(u32(offsets[i + 1] + y))
    q = mul32(t, 0x1881ce3c)
    swapLast = u32(mul32(rol16(q), 0x35bd1ec9) + q)
    swapAcc = u32(swapAcc + swapLast)

    state = u32(mul32(state, keyA) + x)
    state = mul32(rol16(state), 0xcf98b111)
    state = mul32(rol16(state), 0x87085b9f)
    state = mul32(rol16(state), 0x12ceb96d)
    state = mul32(rol16(state), 0x257e1d83)
    acc = u32(acc + state)

    t = u32(mul32(state, keyB) + y)
    t = mul32(rol16(t), 0xa27416f5)
    t = mul32(rol16(t), 0xd38396ff)
    state = mul32(rol16(mul32(rol16(t), 0x7c932b89)), 0xbfa49f69)
    acc = u32(acc + state)
  }

  const outBuf = Buffer.alloc(8)
  outBuf.writeUInt32LE((swapLast ^ state) >>> 0, 0)
  outBuf.writeUInt32LE((swapAcc ^ acc) >>> 0, 4)
  return outBuf.toString("hex").toUpperCase()
}

let clockSkewSeconds = 0

function generateSecMsGecV2(unixSeconds?: number): string {
  const nowSec = unixSeconds ?? Math.floor(Date.now() / 1000) + clockSkewSeconds
  let ticks = BigInt(Math.floor(nowSec)) + WIN_EPOCH
  ticks -= ticks % 300n
  ticks *= 10000000n
  const data = Buffer.from(`${ticks}${TRUSTED_CLIENT_TOKEN}`, "ascii")
  const digest = sha256Digest(data)
  const cs64 = cs64Digest(data, digest)
  return `${cs64}-${digest.toString("hex").toUpperCase()}`
}

function createWsFrame(payloadStr: string): Buffer {
  const payload = Buffer.from(payloadStr, "utf8")
  const mask = crypto.randomBytes(4)
  let header: Buffer
  if (payload.length < 126) {
    header = Buffer.alloc(6)
    header[0] = 0x81
    header[1] = 0x80 | payload.length
    mask.copy(header, 2)
  } else if (payload.length < 65536) {
    header = Buffer.alloc(8)
    header[0] = 0x81
    header[1] = 0x80 | 126
    header.writeUInt16BE(payload.length, 2)
    mask.copy(header, 4)
  } else {
    header = Buffer.alloc(14)
    header[0] = 0x81
    header[1] = 0x80 | 127
    header.writeBigUInt64BE(BigInt(payload.length), 2)
    mask.copy(header, 10)
  }
  const masked = Buffer.alloc(payload.length)
  for (let i = 0; i < payload.length; i++) {
    masked[i] = payload[i] ^ mask[i % 4]
  }
  return Buffer.concat([header, masked])
}

function edgeDateToString(): string {
  const d = new Date((Math.floor(Date.now() / 1000) + clockSkewSeconds) * 1000)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${pad(d.getUTCDate())} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} GMT+0000 (Coordinated Universal Time)`
}

async function synthesizeStudioHumanVoiceAttempt(text: string, voiceName: string): Promise<Buffer> {
  const secMsGec = generateSecMsGecV2()
  const connId = crypto.randomUUID().replace(/-/g, "")
  const muid = crypto.randomBytes(16).toString("hex").toUpperCase()
  const path = `/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${connId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`

  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (err: Error | null, val?: Buffer) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      if (err) reject(err)
      else if (val) resolve(val)
    }

    const key = crypto.randomBytes(16).toString("base64")
    const req = https.request({
      hostname: "speech.platform.bing.com",
      port: 443,
      path,
      method: "GET",
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
        "Sec-WebSocket-Key": key,
        "Sec-WebSocket-Version": "13",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
        Cookie: `muid=${muid};`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
      },
    })

    const timeout = setTimeout(() => {
      req.destroy()
      finish(new Error("WS timeout"))
    }, 5500)

    req.on("response", (res) => {
      const dateHdr = res.headers["date"]
      if (dateHdr) {
        const parsedSec = Math.floor(new Date(dateHdr).getTime() / 1000)
        if (!Number.isNaN(parsedSec)) {
          clockSkewSeconds = parsedSec - Math.floor(Date.now() / 1000)
        }
      }
      finish(new Error(`HTTP ${res.statusCode}`))
    })

    req.on("upgrade", (_res, socket) => {
      const ts = edgeDateToString()
      const configMsg =
        `X-Timestamp:${ts}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"true","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n`
      socket.write(createWsFrame(configMsg))

      const reqId = crypto.randomUUID().replace(/-/g, "")
      const escaped = text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voiceName}'><prosody pitch='+0Hz' rate='+0%' volume='+30%'>${escaped}</prosody></voice></speak>`
      const ssmlMsg =
        `X-RequestId:${reqId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${ts}Z\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml
      socket.write(createWsFrame(ssmlMsg))

      let rxBuffer = Buffer.alloc(0)
      const audioChunks: Buffer[] = []
      let inAudioContinuation = false

      socket.on("data", (chunk: Buffer) => {
        rxBuffer = Buffer.concat([rxBuffer, chunk])
        while (rxBuffer.length >= 2) {
          const byte0 = rxBuffer[0]
          const byte1 = rxBuffer[1]
          const fin = (byte0 & 0x80) !== 0
          const opcode = byte0 & 0x0f
          let payloadLen = byte1 & 0x7f
          let offset = 2
          if (payloadLen === 126) {
            if (rxBuffer.length < 4) break
            payloadLen = rxBuffer.readUInt16BE(2)
            offset = 4
          } else if (payloadLen === 127) {
            if (rxBuffer.length < 10) break
            payloadLen = Number(rxBuffer.readBigUInt64BE(2))
            offset = 10
          }
          if (rxBuffer.length < offset + payloadLen) break
          const framePayload = rxBuffer.subarray(offset, offset + payloadLen)
          rxBuffer = rxBuffer.subarray(offset + payloadLen)

          if (opcode === 0x02) {
            if (framePayload.length > 2) {
              const headerLen = framePayload.readUInt16BE(0)
              const headerStr = framePayload.subarray(2, 2 + headerLen).toString("utf8")
              if (headerStr.includes("Path:audio")) {
                audioChunks.push(framePayload.subarray(2 + headerLen))
                inAudioContinuation = !fin
              } else {
                inAudioContinuation = false
              }
            }
          } else if (opcode === 0x00) {
            if (inAudioContinuation) {
              audioChunks.push(framePayload)
              if (fin) inAudioContinuation = false
            }
          } else if (opcode === 0x01) {
            inAudioContinuation = false
            const textStr = framePayload.toString("utf8")
            if (textStr.includes("Path:turn.end")) {
              const result = Buffer.concat(audioChunks)
              socket.destroy()
              finish(null, result)
              return
            }
          } else if (opcode === 0x08) {
            const result = Buffer.concat(audioChunks)
            socket.destroy()
            finish(null, result)
            return
          }
        }
      })

      socket.on("error", (err) => {
        if (audioChunks.length > 0) {
          finish(null, Buffer.concat(audioChunks))
        } else {
          finish(err)
        }
      })
    })

    req.on("error", (err) => {
      finish(err)
    })

    req.end()
  })
}

async function synthesizeStudioHumanVoice(
  text: string,
  primaryVoiceName: string,
  backupVoiceName: string
): Promise<{ buffer: Buffer; actor: string } | null> {
  const candidates = [primaryVoiceName, backupVoiceName, "en-US-AndrewMultilingualNeural"]
  for (const voice of candidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const buf = await synthesizeStudioHumanVoiceAttempt(text, voice)
        if (buf && buf.byteLength > 200) {
          return { buffer: buf, actor: voice }
        }
      } catch {
        // Retry once on transient socket/clock-skew error, then try next studio human actor
      }
    }
  }
  return null
}

function isFemaleSpeakerName(speaker: string, genderParam: string): boolean {
  if (genderParam === "female") return true
  if (genderParam === "male") return false
  const s = (speaker || "").toLowerCase()
  return /\b(sarah|elena|maria|sophie|claire|anna|priya|fatima|amina|grace|hannah|rachel|jessica|emily|laura|natalie)\b/.test(
    s
  )
}

const TRANSLATE_TARGET_MAP: Record<string, string> = {
  en: "en",
  ak: "ak",
  ee: "ee",
  gaa: "gaa",
  ha: "ha",
  yo: "yo",
  ig: "ig",
  sw: "sw",
  am: "am",
  om: "om",
  so: "so",
  zu: "zu",
  xh: "xh",
  rw: "rw",
  sn: "sn",
  wo: "wo",
  lg: "lg",
  he: "iw",
  zh: "zh-CN",
}

async function translateTextIfRequested(text: string, targetLang: string): Promise<string> {
  const trimmed = (text || "").trim()
  if (!trimmed) return text
  const tl = TRANSLATE_TARGET_MAP[targetLang] || targetLang
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      tl
    )}&dt=t&q=${encodeURIComponent(trimmed)}`
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    })
    if (!res.ok) return text
    const data = await res.json()
    const translated = Array.isArray(data?.[0])
      ? data[0].map((seg: any) => seg?.[0] || "").join("")
      : ""
    return translated ? translated.trim() : text
  } catch {
    return text
  }
}

async function fetchStreamAudioBackup(text: string, tl: string): Promise<ArrayBuffer | null> {
  const endpoints = [
    `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`,
  ]
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
      })
      if (response.ok) {
        const buf = await response.arrayBuffer()
        if (buf.byteLength > 200) return buf
      }
    } catch {
      // try next
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawTextParam = (searchParams.get("text") || "").trim().slice(0, 260)
  const rawLang = (searchParams.get("lang") || "en").trim().toLowerCase()
  const speaker = (searchParams.get("speaker") || "").trim()
  const genderParam = (searchParams.get("gender") || "").trim().toLowerCase()
  const shouldTranslate = searchParams.get("translate") === "1"

  if (!rawTextParam) {
    return new NextResponse("Missing text", { status: 400 })
  }

  const strippedRaw = rawTextParam.replace(/^\s*\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/g, "").trim()
  const rawText = shouldTranslate
    ? await translateTextIfRequested(strippedRaw, rawLang)
    : strippedRaw

  // 1. Primary Engine: Studio Natural Human Voice Actor (24kHz 48kbps MP3)
  const actorPair = NATURAL_HUMAN_VOICE_ACTORS[rawLang] || NATURAL_HUMAN_VOICE_ACTORS.en
  const useFemale = isFemaleSpeakerName(speaker, genderParam)
  const chosenVoiceActor = useFemale ? actorPair.female : actorPair.male
  const backupVoiceActor = useFemale
    ? "en-US-AvaMultilingualNeural"
    : "en-US-AndrewMultilingualNeural"
  const needsPhoneticReshape = PHONETIC_RESHAPE_LANGS.has(rawLang)
  const humanVoiceText = reshapeForAuthenticSpokenPronunciation(rawText, rawLang, needsPhoneticReshape)

  const studioHumanResult = await synthesizeStudioHumanVoice(
    humanVoiceText,
    chosenVoiceActor,
    backupVoiceActor
  )
  if (studioHumanResult && studioHumanResult.buffer.byteLength > 200) {
    return new NextResponse(new Uint8Array(studioHumanResult.buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "X-Voice-Actor": studioHumanResult.actor,
        "X-Voice-Type": "studio-human-actor",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  }

  // 2. Guaranteed Audio Backup Stream so audio NEVER fails with 503 if WebSocket is blocked
  const primaryTl = PRIMARY_TTS_LANG_MAP[rawLang] || rawLang
  const fallbackTls = PHONETIC_FALLBACK_TTS_VOICE[rawLang] || []
  const candidates = [primaryTl, ...fallbackTls.filter((c) => c !== primaryTl), "en"]

  for (let i = 0; i < candidates.length; i++) {
    const tl = candidates[i]
    const shaped = reshapeForAuthenticSpokenPronunciation(rawText, rawLang, i > 0).slice(0, 200)
    const buf = await fetchStreamAudioBackup(shaped, tl)
    if (buf) {
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "X-Voice-Actor": `backup-${tl}`,
          "Cache-Control": "public, max-age=3600",
        },
      })
    }
  }

  return new NextResponse("Audio stream unavailable", { status: 502 })
}
