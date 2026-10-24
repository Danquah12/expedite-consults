import { isAiClip } from "@/lib/ai-cut";

export type MusicLayer = "genres" | "world" | "gospel" | "academy" | "history";

export const MUSIC_LAYERS: { id: MusicLayer; label: string; hint: string }[] = [
  { id: "genres", label: "Genres", hint: "Listen by style. Then ask where it came from." },
  { id: "world", label: "World", hint: "Africa, Latin, Caribbean, Celtic — music as a place." },
  { id: "gospel", label: "Gospel", hint: "Hymns and the good news sung." },
  { id: "academy", label: "Academy", hint: "History, musicians, theory, then a quiz." },
  { id: "history", label: "History", hint: "Who wrote it, and why the room changed." },
];

export type MusicStyle = { id: string; label: string; tags: string[] };

export type AcademyStep = {
  id: string;
  label: string;
  line: string;
  body: string;
  prompt: string;
  ok: string;
  wrong: [string, string];
};

export type MusicFamily = {
  id: string;
  layer: "genres" | "world";
  label: string;
  hint: string;
  styles: MusicStyle[];
  posts: string[];
  academy: AcademyStep[];
};

const ACADEMY_SPINE = (name: string, origin: string, next: string, hear: string): AcademyStep[] => [
  {
    id: "history",
    label: "History",
    line: `Where ${name} started.`,
    body: origin,
    prompt: `What should you name first in ${name}?`,
    ok: "Where it started, and who carried it",
    wrong: ["The current chart position", "Only the tempo"],
  },
  {
    id: "musicians",
    label: "Musicians",
    line: "Names you can actually study.",
    body: next,
    prompt: `Why name musicians in ${name}?`,
    ok: "So the sound has a person and a place",
    wrong: ["To rank celebrity", "To skip the recordings"],
  },
  {
    id: "instruments",
    label: "Instruments",
    line: "What the room is made of.",
    body: hear,
    prompt: `What do you listen for first?`,
    ok: "The instrument that carries the argument",
    wrong: ["Only the loudest drop", "The thumbnail"],
  },
  {
    id: "theory",
    label: "Theory",
    line: "The grammar under the groove.",
    body: `${name} is not chaos. Form, repetition, and tension are the grammar. Name the form before you argue taste.`,
    prompt: "What comes before taste?",
    ok: "The form — what repeats, what answers",
    wrong: ["A louder mix", "A longer intro"],
  },
  {
    id: "improv",
    label: "Play",
    line: "How a player answers the room.",
    body: `Improvisation in ${name} is conversation, not showing off. Hear the question the band asks. Then hear the answer.`,
    prompt: "What is improvisation here?",
    ok: "An answer to what the band just asked",
    wrong: ["Random notes at speed", "Ignoring the form"],
  },
  {
    id: "recordings",
    label: "Recordings",
    line: "One cut worth a second pass.",
    body: "Official embeds only. We do not copy the file. Sit with one recording the way you sit with a paper.",
    prompt: "How should you treat a famous recording?",
    ok: "As a text you re-read, not wallpaper",
    wrong: ["As background only", "As a file to re-host"],
  },
  {
    id: "standards",
    label: "Standards",
    line: "The shared songs of the hall.",
    body: `Standards let strangers play together. In ${name}, the standard is the common language — then the player tells the truth on top.`,
    prompt: "What is a standard for?",
    ok: "A shared song the room already knows",
    wrong: ["A copyright workaround", "A random playlist"],
  },
  {
    id: "listen",
    label: "Listen",
    line: "One pass as a student.",
    body: "Listen once as a student, not a judge. Name the feeling, then the form. Then ask who wrote the first bar.",
    prompt: "How should you first hear a phrase?",
    ok: "As a student",
    wrong: ["As a critic", "As background only"],
  },
  {
    id: "appreciate",
    label: "Appreciate",
    line: "Why it still matters.",
    body: `${name} is a way people told the truth under pressure. That is why it sits next to the clinic, not instead of it.`,
    prompt: "Why keep this music on a learning platform?",
    ok: "It teaches a people, a place, and a craft",
    wrong: ["It fills silence", "It replaces study"],
  },
  {
    id: "quiz",
    label: "Quiz",
    line: "Prove you heard it.",
    body: "Pass the drill. Then play the clip again. The ear wants another pass — so does the exam.",
    prompt: "What should you do after the quiz?",
    ok: "Hear the clip again with a name for the form",
    wrong: ["Skip to a louder song", "Forget the names"],
  },
];

export const MUSIC_FAMILIES: MusicFamily[] = [
  {
    id: "jazz",
    layer: "genres",
    label: "Jazz",
    hint: "Ear first, then the science.",
    styles: [
      { id: "trad", label: "Traditional", tags: ["#jazz", "dixieland"] },
      { id: "swing", label: "Swing", tags: ["#jazz", "swing", "big band"] },
      { id: "bebop", label: "Bebop", tags: ["#jazz", "bebop"] },
      { id: "cool", label: "Cool", tags: ["#jazz", "cool"] },
      { id: "hardbop", label: "Hard bop", tags: ["#jazz", "hard bop"] },
      { id: "modal", label: "Modal", tags: ["#jazz", "modal"] },
      { id: "fusion", label: "Fusion", tags: ["#jazz", "fusion"] },
      { id: "smooth", label: "Smooth", tags: ["#jazz", "smooth"] },
      { id: "latin-jazz", label: "Latin jazz", tags: ["#jazz", "latin"] },
      { id: "soul-jazz", label: "Soul jazz", tags: ["#jazz", "soul"] },
      { id: "vocal", label: "Vocal jazz", tags: ["#jazz", "vocal"] },
      { id: "piano", label: "Jazz piano", tags: ["#jazz", "piano"] },
      { id: "guitar", label: "Jazz guitar", tags: ["#jazz", "guitar"] },
      { id: "bigband", label: "Big band", tags: ["#jazz", "big band"] },
      { id: "standards", label: "Standards", tags: ["#jazz", "standard"] },
    ],
    posts: ["mu-bobby", "mu-emotion", "mu-masekela"],
    academy: ACADEMY_SPINE(
      "jazz",
      "New Orleans, then the rest of the world. Jazz is African rhythm meeting European harmony in American cities — and then talking back.",
      "Armstrong, Ellington, Parker, Monk, Coltrane, Miles, McFerrin. Name the player, then the decade, then the city.",
      "Horn, piano, bass, drums — and a room that already knows the next pentatonic note.",
    ),
  },
  {
    id: "blues",
    layer: "genres",
    label: "Blues",
    hint: "A sentence of twelve bars.",
    styles: [
      { id: "delta", label: "Delta", tags: ["#blues", "delta"] },
      { id: "chicago", label: "Chicago", tags: ["#blues", "chicago"] },
      { id: "electric", label: "Electric", tags: ["#blues", "electric"] },
      { id: "country-blues", label: "Country blues", tags: ["#blues", "country"] },
      { id: "blues-rock", label: "Blues rock", tags: ["#blues", "rock"] },
    ],
    posts: ["mu-listen", "mu-mali"],
    academy: ACADEMY_SPINE(
      "blues",
      "Work songs, spirituals, and the Mississippi Delta. The blues is a form you can count — twelve bars, a question, an answer.",
      "Ma Rainey, Bessie Smith, Robert Johnson, Muddy Waters, B.B. King. The guitar speaks because the voice already did.",
      "Voice, guitar, harmonica. The bend is the grammar.",
    ),
  },
  {
    id: "soul",
    layer: "genres",
    label: "Soul & R&B",
    hint: "Church cadence, then the street.",
    styles: [
      { id: "motown", label: "Motown", tags: ["#soul", "motown"] },
      { id: "classic-soul", label: "Classic soul", tags: ["#soul"] },
      { id: "funk", label: "Funk", tags: ["#funk", "#soul"] },
      { id: "neo", label: "Neo-soul", tags: ["#soul", "neo"] },
      { id: "rnb", label: "Contemporary R&B", tags: ["#rnb", "#soul"] },
      { id: "randb", label: "Rhythm & blues", tags: ["#rnb", "#blues"] },
    ],
    posts: [],
    academy: ACADEMY_SPINE(
      "soul",
      "Gospel cadence walked into popular music. Motown, Stax, and the church taught the same room how to shout and how to keep time.",
      "Aretha, James Brown, Marvin, D'Angelo. Name the house band as carefully as the star.",
      "Voice first. Then bass, drums, and a horn that answers.",
    ),
  },
  {
    id: "classical",
    layer: "genres",
    label: "Classical",
    hint: "One phrase, then a lecture.",
    styles: [
      { id: "baroque", label: "Baroque", tags: ["#classical", "baroque"] },
      { id: "classical-period", label: "Classical period", tags: ["#classical"] },
      { id: "romantic", label: "Romantic", tags: ["#classical", "romantic"] },
      { id: "modern", label: "Modern", tags: ["#classical", "modern"] },
      { id: "opera", label: "Opera", tags: ["#classical", "opera"] },
      { id: "symphony", label: "Symphony", tags: ["#classical", "symphony"] },
      { id: "chamber", label: "Chamber", tags: ["#classical", "chamber"] },
      { id: "piano", label: "Piano", tags: ["#classical", "piano"] },
      { id: "violin", label: "Violin", tags: ["#classical", "violin"] },
      { id: "cello", label: "Cello", tags: ["#classical", "cello"] },
      { id: "orchestral", label: "Orchestral", tags: ["#classical", "orchestra"] },
    ],
    posts: ["mu-zander", "mu-dudamel", "mu-raga", "mu-sitar"],
    academy: ACADEMY_SPINE(
      "classical",
      "From court and church to the public hall. A symphony is an argument in time — exposition, development, return.",
      "Bach, Mozart, Beethoven, then the teachers who still open the score: Bernstein, Zander, Dudamel.",
      "Orchestra as a school. The chair can be a scholarship if you keep showing up.",
    ),
  },
  {
    id: "country",
    layer: "genres",
    label: "Country",
    hint: "A story with a guitar.",
    styles: [
      { id: "trad-country", label: "Traditional", tags: ["#country"] },
      { id: "bluegrass", label: "Bluegrass", tags: ["#country", "bluegrass"] },
      { id: "country-gospel", label: "Country gospel", tags: ["#country", "#gospel"] },
      { id: "outlaw", label: "Outlaw", tags: ["#country", "outlaw"] },
      { id: "americana", label: "Americana", tags: ["#country", "americana"] },
      { id: "contemporary-country", label: "Contemporary", tags: ["#country"] },
    ],
    posts: [],
    academy: ACADEMY_SPINE(
      "country",
      "Appalachia, the church, the radio, then Nashville. Country is a story you can sing after one chorus.",
      "Carter Family, Hank Williams, Cash, Parton. The writer matters as much as the voice.",
      "Guitar, fiddle, harmony. The lyric is the instrument.",
    ),
  },
  {
    id: "folk",
    layer: "genres",
    label: "Folk & roots",
    hint: "Someone else's memory, sung.",
    styles: [
      { id: "american-folk", label: "American folk", tags: ["#folk"] },
      { id: "celtic", label: "Celtic", tags: ["#folk", "celtic"] },
      { id: "appalachian", label: "Appalachian", tags: ["#folk", "appalachian"] },
      { id: "world-folk", label: "World folk", tags: ["#folk", "world"] },
      { id: "acoustic", label: "Acoustic", tags: ["#folk", "acoustic"] },
      { id: "songwriter", label: "Singer-songwriter", tags: ["#folk", "songwriter"] },
    ],
    posts: ["mu-talgam", "mu-raga", "mu-mali"],
    academy: ACADEMY_SPINE(
      "folk",
      "Folk is memory that walked. Collectors wrote it down; communities already knew it.",
      "Name the region before the star. The anonymous writer is still a writer.",
      "Voice and one instrument. The room is the arrangement.",
    ),
  },
  {
    id: "rock",
    layer: "genres",
    label: "Rock",
    hint: "Blues volume, then a band.",
    styles: [
      { id: "classic-rock", label: "Classic", tags: ["#rock"] },
      { id: "soft-rock", label: "Soft rock", tags: ["#rock", "soft"] },
      { id: "alt", label: "Alternative", tags: ["#rock", "alternative"] },
      { id: "indie", label: "Indie", tags: ["#rock", "indie"] },
      { id: "blues-rock", label: "Blues rock", tags: ["#rock", "#blues"] },
      { id: "folk-rock", label: "Folk rock", tags: ["#rock", "#folk"] },
      { id: "prog", label: "Progressive", tags: ["#rock", "prog"] },
    ],
    posts: [],
    academy: ACADEMY_SPINE(
      "rock",
      "Blues and country turned loud, then the band became a unit. Verse, chorus, bridge is still a form.",
      "Name the songwriter and the drummer. Rock is a group sport.",
      "Guitar, bass, drums. The riff is the thesis.",
    ),
  },
  {
    id: "latin",
    layer: "world",
    label: "Latin",
    hint: "Clave first.",
    styles: [
      { id: "salsa", label: "Salsa", tags: ["#latin", "salsa"] },
      { id: "bachata", label: "Bachata", tags: ["#latin", "bachata"] },
      { id: "merengue", label: "Merengue", tags: ["#latin", "merengue"] },
      { id: "reggaeton", label: "Reggaeton", tags: ["#latin", "reggaeton"] },
      { id: "latin-jazz", label: "Latin jazz", tags: ["#latin", "#jazz"] },
      { id: "bossa", label: "Bossa nova", tags: ["#latin", "bossa"] },
      { id: "mariachi", label: "Mariachi", tags: ["#latin", "mariachi"] },
      { id: "cumbia", label: "Cumbia", tags: ["#latin", "cumbia"] },
    ],
    posts: ["mu-elsistema", "mu-cuba"],
    academy: ACADEMY_SPINE(
      "Latin music",
      "Africa, Spain, and the Caribbean in one clave. The timeline is the law; the melody sits on top.",
      "Tito Puente, Celia Cruz, Jobim, Dudamel's youth orchestras. Name the island and the city.",
      "Percussion is not decoration. It is the map.",
    ),
  },
  {
    id: "african",
    layer: "world",
    label: "African",
    hint: "Highlife left the paid room.",
    styles: [
      { id: "highlife", label: "Highlife", tags: ["#highlife"] },
      { id: "afrobeat", label: "Afrobeat", tags: ["#afrobeat"] },
      { id: "afrobeats", label: "Afrobeats", tags: ["#afrobeats", "#afrobeat"] },
      { id: "african-jazz", label: "African jazz", tags: ["#jazz", "africa"] },
      { id: "soukous", label: "Soukous", tags: ["soukous"] },
      { id: "amapiano", label: "Amapiano", tags: ["amapiano"] },
      { id: "juju", label: "Juju", tags: ["juju"] },
      { id: "trad-african", label: "Traditional", tags: ["africa", "traditional"] },
      { id: "african-choral", label: "African choral", tags: ["choir", "africa"] },
    ],
    posts: ["mu-fela", "mu-highlife", "mu-masekela", "mu-mali"],
    academy: ACADEMY_SPINE(
      "African popular music",
      "Highlife was named for the room that charged at the door. The music walked out and taught the street. Fela fused highlife, jazz, and a political sermon.",
      "E.T. Mensah, Fela, Osibisa, Sinach. Ghana, Nigeria, then the diaspora.",
      "Guitar, brass, talking drum, and a groove that is the argument.",
    ),
  },
  {
    id: "caribbean",
    layer: "world",
    label: "Caribbean",
    hint: "Riddim, then the sermon.",
    styles: [
      { id: "reggae", label: "Reggae", tags: ["#reggae"] },
      { id: "dancehall", label: "Dancehall", tags: ["dancehall"] },
      { id: "ska", label: "Ska", tags: ["ska"] },
      { id: "calypso", label: "Calypso", tags: ["calypso"] },
      { id: "soca", label: "Soca", tags: ["soca"] },
      { id: "kompa", label: "Kompa", tags: ["kompa"] },
      { id: "zouk", label: "Zouk", tags: ["zouk"] },
    ],
    posts: [],
    academy: ACADEMY_SPINE(
      "Caribbean music",
      "Ska, then rocksteady, then reggae. The offbeat is the politics. Calypso was news before it was carnival.",
      "Marley, Toots, Mighty Sparrow. Name Jamaica, Trinidad, Haiti, Guadeloupe as different rooms.",
      "Bass and drum first. The guitar skanks on top.",
    ),
  },
  {
    id: "electronic",
    layer: "genres",
    label: "Electronic",
    hint: "A loop that teaches patience.",
    styles: [
      { id: "ambient", label: "Ambient", tags: ["#lofi", "ambient"] },
      { id: "house", label: "House", tags: ["house"] },
      { id: "deep-house", label: "Deep house", tags: ["house"] },
      { id: "techno", label: "Techno", tags: ["techno"] },
      { id: "trance", label: "Trance", tags: ["trance"] },
      { id: "lofi", label: "Lo-fi", tags: ["#lofi"] },
      { id: "chill", label: "Chillout", tags: ["#lofi", "chill"] },
      { id: "e-classical", label: "Electronic classical", tags: ["#classical", "electronic"] },
    ],
    posts: ["mu-brain", "mu-repeat"],
    academy: ACADEMY_SPINE(
      "electronic music",
      "Studio as instrument. Detroit, Chicago, then headphones on a desk. A loop is a drill: repetition invites you in.",
      "Name the producer the way you name a composer. The DAW is not anonymous.",
      "Repetition, filter, space. The drop is a cadence.",
    ),
  },
  {
    id: "hiphop",
    layer: "genres",
    label: "Hip-hop",
    hint: "Sampling is a citation.",
    styles: [
      { id: "oldschool", label: "Old school", tags: ["#hiphop"] },
      { id: "conscious", label: "Conscious", tags: ["#hiphop", "conscious"] },
      { id: "christian-hip", label: "Christian hip-hop", tags: ["#hiphop", "#gospel"] },
      { id: "jazz-rap", label: "Jazz rap", tags: ["#hiphop", "#jazz"] },
      { id: "boombap", label: "Boom bap", tags: ["#hiphop"] },
      { id: "alt-hip", label: "Alternative", tags: ["#hiphop"] },
    ],
    posts: ["mu-hiplife"],
    academy: ACADEMY_SPINE(
      "hip-hop",
      "Bronx block parties, then a worldwide citation practice. Sampling is how the music remembers. Hiplife is Ghana answering back.",
      "DJ Kool Herc, Grandmaster Flash, then the MCs and the producers. Name the break.",
      "Two turntables, a drum machine, a voice. The break is the sample.",
    ),
  },
];

export function familiesOn(layer: MusicLayer) {
  if (layer === "world") return MUSIC_FAMILIES.filter((f) => f.layer === "world");
  if (layer === "genres") return MUSIC_FAMILIES.filter((f) => f.layer === "genres");
  return MUSIC_FAMILIES;
}

export function familyOf(id: string) {
  return MUSIC_FAMILIES.find((f) => f.id === id) ?? MUSIC_FAMILIES[0]!;
}

export function stepOf(family: MusicFamily, id: string) {
  return family.academy.find((s) => s.id === id) ?? family.academy[0]!;
}

const HALL_SEATS: { id: string; test: RegExp }[] = [
  { id: "gospel", test: /#gospel|#hymn|#worship|#choir/ },
  { id: "jazz", test: /#jazz/ },
  { id: "blues", test: /#blues|mali|farka|desert blues/ },
  { id: "soul", test: /#soul|#funk|#rnb/ },
  { id: "classical", test: /#classical|raga|sitar|gamelan|orchestra/ },
  { id: "country", test: /#country|#bluegrass/ },
  { id: "folk", test: /#folk|celtic|flamenco|sean-nós|raga|gamelan/ },
  { id: "rock", test: /#rock/ },
  { id: "latin", test: /#latin|#salsa|#bossa|cuba|cumbia|mariachi|tango|bachata|son / },
  { id: "african", test: /#highlife|#afrobeat|#afrobeats|masekela|soukous|amapiano|mbalax|ethio|township/ },
  { id: "caribbean", test: /#reggae|#caribbean|#dancehall|#calypso|#soca|marley|kompa|zouk/ },
  { id: "electronic", test: /#electronic|#lofi|#techno|amapiano|berlin techno/ },
  { id: "hiphop", test: /#hiphop|#hiplife|grime|uk rap/ },
];

/** Ledger pulls (`in-`) fill empty academy desks. Each film is seated once. */
export function ledgerSeats<T extends { id: string; youtubeId?: string; hashtags: string[]; caption: string; musicTitle?: string }>(posts: T[]) {
  const taken = new Set<string>();
  const bags = new Map<string, T[]>();
  for (const post of posts) {
    if ((post.id.startsWith("mu-") || post.id.startsWith("hymn-")) && post.youtubeId) taken.add(post.youtubeId);
  }
  for (const post of posts) {
    if (!post.id.startsWith("in-") || !post.youtubeId || taken.has(post.youtubeId) || isAiClip(post)) continue;
    const hay = `${post.hashtags.join(" ")} ${post.caption} ${post.musicTitle ?? ""}`.toLowerCase();
    const seat = HALL_SEATS.find((row) => row.test.test(hay));
    if (!seat) continue;
    const list = bags.get(seat.id) ?? [];
    if (list.length >= 16) continue;
    list.push(post);
    bags.set(seat.id, list);
    taken.add(post.youtubeId);
  }
  return bags;
}

export function postMatchesStyle(caption: string, tags: string[], style: MusicStyle) {
  const hay = `${caption} ${tags.join(" ")}`.toLowerCase();
  return style.tags.some((t) => hay.includes(t.replace(/^#/, "").toLowerCase()) || hay.includes(t.toLowerCase()));
}
