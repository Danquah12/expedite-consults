import type { FeedPost, Teach } from "@/lib/feed-data";
import { SOURCE } from "@/lib/source";

const face = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0b1220&color=e4b86a&size=128&bold=true`;

const CC = { name: "Crash Course", username: "crashcourse", avatar: face("Crash Course") };

function teach(hook: string, stamp: string, prompt: string, ok: string, wrong: [string, string]): Teach {
  return {
    hook,
    stamp,
    prompt,
    options: [
      { id: "a", label: ok, ok: true },
      { id: "b", label: wrong[0], ok: false },
      { id: "c", label: wrong[1], ok: false },
    ],
  };
}

function clip(id: string, title: string, origin: string, youtubeId: string, lesson: Teach): FeedPost {
  return {
    id,
    author: CC,
    caption: `${title}. ${origin}. Presented by ${SOURCE}.`,
    lane: "learn",
    mediaType: "video",
    mediaUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    posterUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    youtubeId,
    views: 900000,
    likes: 18000,
    comments: 240,
    shares: 80,
    isLiked: false,
    isSaved: false,
    isFollowing: true,
    hashtags: ["#science", "#path"],
    musicTitle: `${origin} · ${SOURCE}`,
    teach: lesson,
  };
}

function mp4Clip(id: string, title: string, origin: string, mediaUrl: string, posterUrl: string, lesson: Teach): FeedPost {
  return {
    id,
    author: CC,
    caption: `${title}. ${origin}. Presented by ${SOURCE}.`,
    lane: "learn",
    mediaType: "video",
    mediaUrl,
    posterUrl,
    views: 920000,
    likes: 21000,
    comments: 290,
    shares: 110,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    hashtags: ["#science", "#path"],
    musicTitle: `${origin} · ${SOURCE}`,
    teach: lesson,
  };
}

export const SCIENCE_LENS = [
  "Question — what are you trying to see?",
  "Evidence — what does the film actually show?",
  "Model — what explanation fits that evidence?",
  "Test — what would prove the model wrong?",
  "Limit — what the film does not claim",
] as const;

export const SCIENCE_MENUS: { id: string; label: string; line: string; ids: string[] }[] = [
  {
    id: "physics",
    label: "Physics",
    line: "Forces, fields, light, then the quantum lecture already on Study.",
    ids: ["study-sci-mp4-physics", "study-sci-grav", "study-sci-current", "study-sci-field", "study-sci-mag", "study-sci-light", "study-oxford-qm"],
  },
  {
    id: "bio",
    label: "Biology",
    line: "Cell, gene, energy, defense. Animal behavior stays on the Animals desk.",
    ids: ["study-sci-mp4-bio", "study-sci-cell", "study-sci-dna", "study-sci-gene", "study-sci-evo", "study-sci-immune", "study-sci-photo", "study-sci-resp", "study-sci-muscle"],
  },
  {
    id: "chem",
    label: "Chemistry",
    line: "Atom, table, bond, reaction, then water and a battery.",
    ids: ["study-sci-mp4-chem", "study-sci-atom", "study-sci-table", "study-sci-bond", "study-sci-acid", "study-sci-react", "study-sci-organic", "study-sci-water", "study-sci-batt"],
  },
  {
    id: "earth",
    label: "Earth & space",
    line: "The planet, then the sky.",
    ids: ["study-sci-mp4-earth", "study-sci-earth", "study-sci-plates", "study-sci-volcano", "study-sci-quake", "study-sci-solar", "study-sci-stars", "study-sci-galaxy", "study-sci-hole", "study-sci-bang"],
  },
];

export const SCIENCE_PATH_POSTS: FeedPost[] = [
  mp4Clip("study-sci-mp4-physics", "Orbital Mechanics, Gravity & Thruster Impulse in Vacuum", "NASA & Internet Archive Public Domain Science Film", "/media/clips/nasa_space.mp4", "/media/pics/hall.jpg", teach("In vacuum, thrust equals exhaust mass flow multiplied by exhaust velocity", "Physics · Direct MP4", "How does a spacecraft change velocity in the vacuum of space?", "By expelling mass in the opposite direction (conservation of momentum)", ["By pushing against surrounding air", "By turning off gravity"])),
  mp4Clip("study-sci-mp4-bio", "Cellular Microscopy, Immune Response & Clinical Diagnostics", "Noctis Biomedical Lab · Direct Course Film", "/media/clips/clinical_lab.mp4", "/media/pics/hall.jpg", teach("Cells maintain homeostasis and signal immune defenses when tissue is stressed", "Biology · Direct MP4", "What does cellular microscopy allow clinicians and biologists to verify directly?", "Cell morphology, pathogen presence, and immune cell response", ["Planetary orbits", "Network router tables"])),
  mp4Clip("study-sci-mp4-chem", "Molecular Structure, Solutions & Laboratory Titration Discipline", "Library of Congress & Noctis Chemistry Archive Film", "/media/clips/loc_screening.mp4", "/media/pics/chalkboard.jpg", teach("Stoichiometry and bond polarity govern how reactants combine in solution", "Chemistry · Direct MP4", "Why must laboratory measurements track molar ratios rather than raw volume alone?", "Because chemical reactions occur between discrete numbers of molecules", ["Because flasks are all the same size", "Because temperature never changes"])),
  mp4Clip("study-sci-mp4-earth", "Apollo Earthrise & Planetary Observation from Lunar Orbit", "NASA & Internet Archive Moving Image Archive", "https://archive.org/download/gov.archives.arc.45017/gov.archives.arc.45017_512kb.mp4", "/media/pics/hall.jpg", teach("Observing Earth as a single system links atmosphere, ocean, and lithosphere", "Earth & Space · Direct MP4", "What did orbital observation from Apollo reveal about Earth's atmosphere?", "It is a thin, continuous boundary layer shared by the whole planet", ["It extends halfway to the Moon", "It is separate over each ocean"])),
  clip("study-sci-grav", "Why things fall", "Crash Course Physics · Newtonian gravity", "7gf6YpdvtE0", teach("Masses attract. That is gravity.", "Physics", "What does Newtonian gravity say masses do?", "They attract each other", ["They only repel", "They need air to fall"])),
  clip("study-sci-current", "How electricity works", "Crash Course Physics · electric current", "HXOok3mfMLM", teach("Current is charge moving because of a voltage", "Physics", "What makes charge flow as a current?", "A voltage, from high to low", ["Gravity alone", "A magnetic north pole only"])),
  clip("study-sci-field", "What is an electric field?", "Crash Course Physics · electric fields", "mdulzEfQXDE", teach("A charge changes the space around it", "Physics", "What is an electric field?", "The effect a charge has on the space around it", ["A wire color", "A chemical bond"])),
  clip("study-sci-mag", "Magnetism explained", "Crash Course Physics · magnetism", "s94suB5uLWw", teach("Moving charge is the source of magnetism", "Physics", "What is magnetism tied to in this film?", "Moving electric charge", ["Only iron paint", "Sound waves"])),
  clip("study-sci-light", "How light works", "Crash Course Physics · light is waves", "IRBfpBPELmE", teach("Light behaves as a wave", "Physics", "What does this film treat light as?", "A wave", ["A solid rod", "A chemical"])),
  clip("study-sci-cell", "How cells work", "Crash Course Biology · the animal cell", "cj8dDTHGJBY", teach("A cell is an organized city of parts", "Biology", "What is this film walking through?", "The parts of an animal cell", ["Only the periodic table", "Only plate boundaries"])),
  clip("study-sci-dna", "DNA explained", "Crash Course Biology · DNA structure and replication", "8kK2zwjRV0M", teach("DNA copies itself with a paired structure", "Biology", "What is DNA's job in this film?", "To store instructions and be copied", ["To make gravity", "To form a hurricane"])),
  clip("study-sci-gene", "How genes work", "Crash Course Biology · heredity", "CBezq1fFUEA", teach("Genes are inherited, not blended into one paint", "Biology", "What does heredity pass on?", "Genes from parent to offspring", ["Electric charge", "Plate boundaries"])),
  clip("study-sci-evo", "Evolution explained", "Crash Course Biology · evolution", "P3GagfbA2vo", teach("Populations change. That is evolution.", "Biology", "What evolves?", "Populations over time", ["A single rock", "One person's muscles in a day"])),
  clip("study-sci-immune", "How the immune system works", "Crash Course Biology · the immune system", "CeVtPDjJBPU", teach("The body has layers of defense", "Biology", "What system is this film about?", "The immune system", ["Plate tectonics", "The periodic table"])),
  clip("study-sci-photo", "Photosynthesis", "Crash Course Biology · photosynthesis", "sQK3Yr4Sc_k", teach("Light, water, and carbon dioxide become sugar and oxygen", "Biology", "What do plants take in for photosynthesis?", "Light, water, and carbon dioxide", ["Only iron", "Only magma"])),
  clip("study-sci-resp", "Cellular respiration", "Crash Course Biology · ATP and respiration", "00jbG_cfGuQ", teach("Cells release energy from food as ATP", "Biology", "What does cellular respiration make that the cell can spend?", "ATP", ["A new planet", "A magnet"])),
  clip("study-sci-muscle", "Human anatomy: muscle", "Crash Course Biology · the muscular system", "jqy0i1KXUO4", teach("Muscle is how the body pulls", "Biology", "What does this anatomy film cover?", "The muscular system", ["Only galaxies", "Only acids"])),
  clip("study-sci-atom", "Atoms and molecules", "Crash Course Chemistry · the nucleus", "FSyAehMdpyI", teach("The number of protons names the element", "Chemistry", "What decides which element an atom is?", "The number of protons", ["The color of the flask", "The planet it is on"])),
  clip("study-sci-table", "The periodic table", "Crash Course Chemistry · the periodic table", "0RRVV4Diomg", teach("The table groups elements by repeating properties", "Chemistry", "What is the periodic table?", "A catalog of the elements arranged by pattern", ["A map of galaxies", "A list of muscles"])),
  clip("study-sci-bond", "Chemical bonds", "Crash Course Chemistry · types of chemical bonds", "QXT4OVM4vXI", teach("Atoms stick by sharing or transferring electrons", "Chemistry", "What is a chemical bond?", "A way atoms hold together by their electrons", ["A tectonic plate", "A black hole"])),
  clip("study-sci-acid", "Acids and bases", "Crash Course Chemistry · acid-base reactions", "ANi709MYnWg", teach("Acids and bases react in solution", "Chemistry", "What kind of reaction is this film about?", "Acid-base reactions", ["Nuclear fusion in a star", "DNA replication"])),
  clip("study-sci-react", "Chemical reactions", "Crash Course Chemistry · precipitation", "IIu16dy3ThI", teach("A reaction can make a solid fall out of solution", "Chemistry", "What is a precipitation reaction?", "A reaction that forms a solid from solution", ["A star exploding", "A muscle contracting"])),
  clip("study-sci-organic", "Organic chemistry fundamentals", "Crash Course Biology · biological molecules", "H8WJ2KENlK0", teach("Life is built from a few families of molecules", "Chemistry", "What is this film organizing?", "The molecules you are made of", ["Only volcano types", "Only IP addresses"])),
  clip("study-sci-water", "Chemistry of water", "Crash Course Biology · water", "HVT3Y3_gHGg", teach("Water's polarity is why it behaves as it does", "Chemistry", "Why is water unusual in this film?", "Its polarity and the bonds between molecules", ["It is a metal", "It has no molecules"])),
  clip("study-sci-batt", "How batteries work", "Crash Course Physics · resistors and batteries", "g-wjP1otQWI", teach("A battery keeps a voltage so current can flow", "Chemistry", "What does a battery provide in a circuit?", "A voltage that drives current", ["A gravitational field", "A new element"])),
  clip("study-sci-earth", "How Earth formed", "Crash Course Geology · how Earth formed", "3JdpD3X2Md8", teach("Earth formed from a disk of gas and dust", "Earth", "What does this film say Earth formed from?", "A collapsing cloud that became a spinning disk", ["A laboratory flask", "A single comet only"])),
  clip("study-sci-plates", "Plate tectonics", "Crash Course Geology · plate tectonics", "krXXSCb_P9Y", teach("The crust is broken into plates that move", "Earth", "What moves in plate tectonics?", "Pieces of Earth's outer shell", ["The periodic table", "DNA strands"])),
  clip("study-sci-volcano", "Volcanoes", "Crash Course Geology · volcanoes", "BMZbbewOLvU", teach("Volcanoes are how melt reaches the surface", "Earth", "What is this film explaining?", "Volcanoes", ["How a battery is wired", "How a gene is copied"])),
  clip("study-sci-quake", "Earthquakes", "Crash Course Geology · earthquakes", "WNvAic8KLb0", teach("Stress on a fault releases as a quake", "Earth", "What does this film explain?", "Earthquakes", ["Photosynthesis", "Electric fields only"])),
  clip("study-sci-solar", "The solar system", "Crash Course Astronomy · the solar system", "TKM0P3XlMNA", teach("The planets share one star", "Earth", "What is this introduction about?", "The solar system", ["Only human muscles", "Only acids"])),
  clip("study-sci-stars", "Stars", "Crash Course Astronomy · stars", "ld75W1dz-h0", teach("A star is a ball of gas shining by fusion", "Earth", "What is a star, in this film?", "A glowing ball of gas", ["A planet with people", "A cell"])),
  clip("study-sci-galaxy", "Galaxies", "Crash Course Astronomy · galaxies, part 1", "I82ADyJC7wE", teach("A galaxy is a vast collection of stars", "Earth", "What is a galaxy?", "A huge system of stars, gas, and dust", ["One planet", "One atom"])),
  clip("study-sci-hole", "What is a black hole?", "Crash Course Astronomy · black holes", "qZWPBKULkdQ", teach("Nothing, not even light, leaves past the edge", "Earth", "What cannot escape a black hole?", "Light, once it is past the edge", ["Only sound", "Only water"])),
  clip("study-sci-bang", "How the universe began", "Crash Course Astronomy · the Big Bang", "9B7Ix2VQEGo", teach("The Big Bang is the start of expanding space", "Earth", "What is the Big Bang in this film?", "The hot, dense beginning of the expanding universe", ["A volcano on Earth", "A chemical reaction in a beaker"])),
];

export const SCIENCE_PATH_OF: Record<string, "sci"> = Object.fromEntries(SCIENCE_PATH_POSTS.map((post) => [post.id, "sci" as const]));
