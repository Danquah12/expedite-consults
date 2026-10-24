import type { FeedPost, Teach } from "@/lib/feed-data";
import { SOURCE } from "@/lib/source";

const face = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0b1220&color=e4b86a&size=128&bold=true`;

const house = (name: string, username: string) => ({ name, username, avatar: face(name) });

const CC = house("Crash Course", "crashcourse");
const PE = house("Practical Engineering", "practicalengineering");
const EM = house("The Engineering Mindset", "engineeringmindset");
const AN = house("Animagraffs", "animagraffs");
const SABIN = house("Sabin Civil Engineering", "sabin");
const ABC = house("Science ABC", "scienceabc");

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

function clip(id: string, author: FeedPost["author"], title: string, origin: string, youtubeId: string, lesson: Teach): FeedPost {
  return {
    id,
    author,
    caption: `${title}. ${origin}. Presented by ${SOURCE}.`,
    lane: "learn",
    mediaType: "video",
    mediaUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    posterUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    youtubeId,
    views: 800000,
    likes: 16000,
    comments: 200,
    shares: 60,
    isLiked: false,
    isSaved: false,
    isFollowing: true,
    hashtags: ["#engineering", "#path"],
    musicTitle: `${origin} · ${SOURCE}`,
    teach: lesson,
  };
}

function mp4Clip(id: string, author: FeedPost["author"], title: string, origin: string, mediaUrl: string, posterUrl: string, lesson: Teach): FeedPost {
  return {
    id,
    author,
    caption: `${title}. ${origin}. Presented by ${SOURCE}.`,
    lane: "learn",
    mediaType: "video",
    mediaUrl,
    posterUrl,
    views: 840000,
    likes: 19500,
    comments: 230,
    shares: 85,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    hashtags: ["#engineering", "#path"],
    musicTitle: `${origin} · ${SOURCE}`,
    teach: lesson,
  };
}

export const ENG_STEPS = [
  "Objective — what you should be able to say after",
  "Learn — the film",
  "Investigate — the real object in the film",
  "Think — the question on the card",
  "Next — the following film in this menu",
] as const;

export const ENG_MENUS: { id: string; label: string; line: string; ids: string[] }[] = [
  {
    id: "mech",
    label: "Mechanical",
    line: "Torque, gears, an engine, a pump, and the air system.",
    ids: ["study-eng-mp4-mech", "study-eng-engine", "study-eng-gears", "study-eng-pump", "study-eng-hvac"],
  },
  {
    id: "elec",
    label: "Electrical",
    line: "Current is already on Science. Here: voltage, capacitors, induction.",
    ids: ["study-eng-mp4-elec", "study-sci-current", "study-eng-volt", "study-eng-induct"],
  },
  {
    id: "comp",
    label: "Computer",
    line: "Electricity becomes a gate, a bit, a memory, then the CPU.",
    ids: ["study-eng-mp4-comp", "study-eng-gates", "study-eng-binary", "study-eng-ram", "study-path-cpu"],
  },
  {
    id: "civil",
    label: "Civil",
    line: "Concrete, steel, a foundation, a bridge, a pipe, then the quake film on Science.",
    ids: ["study-eng-mp4-civil", "study-eng-concrete", "study-eng-rebar", "study-eng-found", "study-eng-bridge", "study-eng-pipe", "study-sci-quake"],
  },
  {
    id: "computer",
    label: "A computer",
    line: "Electricity → gate → binary → memory → CPU → a bad instruction.",
    ids: ["study-eng-mp4-comp", "study-sci-current", "study-eng-gates", "study-eng-binary", "study-eng-ram", "study-path-cpu", "study-path-sqli"],
  },
  {
    id: "rocket",
    label: "A rocket",
    line: "Gravity, then thrust. Combustion is in the engine film.",
    ids: ["study-eng-mp4-rocket", "study-sci-grav", "study-eng-rocket", "study-eng-engine"],
  },
];

export const ENG_PATH_POSTS: FeedPost[] = [
  mp4Clip("study-eng-mp4-mech", AN, "Mechanical Systems, Torque Transfer & Industrial Kinematics", "Library of Congress & Noctis Engineering Archive Film", "/media/clips/loc_screening.mp4", "/media/pics/chalkboard.jpg", teach("Gear ratios trade angular velocity for mechanical torque", "Mechanical · Direct MP4", "What happens when a small driving gear turns a larger driven gear?", "Torque increases while rotational speed decreases", ["Both speed and torque double", "Energy is created from nothing"])),
  mp4Clip("study-eng-mp4-elec", EM, "Electrical Power Distribution, Switching & Signal Integrity", "Noctis Engineering Lab · Direct Course Film", "/media/clips/k8s_ebpf.mp4", "/media/pics/ctf.jpg", teach("Voltage drives current across a load while impedance shapes high-frequency signals", "Electrical · Direct MP4", "Why do high-speed electrical and network buses require matched impedance?", "To prevent signal reflections and packet corruption", ["To make the wire heavier", "To lower the speed of light"])),
  mp4Clip("study-eng-mp4-comp", CC, "Computer Architecture: Logic Gates, State Machines & Agentic Execution", "Noctis Computer Engineering · Direct Course Film", "/media/clips/agentic_flywheel.mp4", "/media/pics/robot.jpg", teach("Deterministic state machines and instruction pipelines turn logic gates into computation", "Computer · Direct MP4", "How does a processor coordinate complex multi-step execution?", "Through clocked state transitions and instruction pipelines", ["By guessing the next voltage", "Without using memory registers"])),
  mp4Clip("study-eng-mp4-civil", PE, "Structural Loads, Foundations & Archival Engineering Standards", "Library of Congress National Screening Room · Engineering Film", "/media/clips/skill_passport.mp4", "/media/pics/hall.jpg", teach("Every structural load must trace a continuous path down into the foundation", "Civil · Direct MP4", "Where must dead load and live load in a structure ultimately transfer?", "Down through columns, beams, and footings into the supporting ground", ["Into the roof shingles", "Into the window glass"])),
  mp4Clip("study-eng-mp4-rocket", ABC, "Saturn V & Apollo Propulsion: Staging, Gimbaled Thrust & Lunar Orbit Insertion", "NASA & Internet Archive Public Domain Engineering Film", "/media/clips/nasa_space.mp4", "/media/pics/hall.jpg", teach("Multi-stage rockets shed empty structural mass so remaining propellant accelerates a lighter vehicle", "Rocket · Direct MP4", "Why do orbital launch vehicles drop stages during ascent?", "To shed dead structural weight and maximize delta-v for the payload", ["To slow the rocket down", "Because engines can only burn for 10 seconds"])),
  clip("study-eng-engine", AN, "Design it: follow one piston through four strokes", "Animagraffs · how a car engine works", "ZQvfHyfgBtA", teach("Intake, compression, power, exhaust. The crank turns the push into torque.", "Mechanical", "What does the power stroke do?", "Combustion pushes the piston, and the crank turns that into rotation", ["It only cools the radiator", "It writes a program"])),
  clip("study-eng-gears", SABIN, "Why a hill needs a different gear", "Sabin Civil Engineering · a manual transmission", "wCu9W9xNwtI", teach("A gear trades speed for torque", "Mechanical", "Why change gears on a hill?", "To get more torque at the wheels", ["To change the fuel's color", "To turn off the battery"])),
  clip("study-eng-pump", PE, "How do you lift what will not flow uphill?", "Practical Engineering · pumping sewage", "eHAsuPVBwYM", teach("A pump adds energy so fluid can rise", "Mechanical", "What is a pump for?", "Moving fluid that will not go uphill by itself", ["Storing a bit in RAM", "Signing a certificate"])),
  clip("study-eng-hvac", EM, "Cold air is a machine, not a wish", "The Engineering Mindset · chiller, tower, and air handler", "1cvFlBLo4u0", teach("A chiller, a tower, and an air handler move heat", "Mechanical", "What do these three machines do together?", "Move heat out of a building", ["Generate binary", "Pour a bridge deck"])),
  clip("study-eng-volt", CC, "Voltage, then the part that stores it", "Crash Course Physics · voltage and capacitors", "ZrMltpK6iAw", teach("Voltage is the push. A capacitor stores separated charge.", "Electrical", "What does a capacitor store?", "Separated electric charge, which is energy", ["Concrete", "A gear ratio"])),
  clip("study-eng-induct", CC, "A changing current makes a field", "Crash Course Physics · induction", "pQp6bmJPU_0", teach("A changing magnetic field pushes charge", "Electrical", "What does induction need?", "A changing magnetic field", ["A still magnet and nothing else", "A longer bridge"])),
  clip("study-eng-gates", CC, "True, false, and a switch", "Crash Course Computer Science · Boolean logic and gates", "gI-qXk7XojA", teach("AND, OR, and NOT are circuits", "Computer", "What is a logic gate made from?", "Switches that electricity turns on or off", ["Gears in a gearbox", "Bars of rebar"])),
  clip("study-eng-binary", CC, "Two symbols, every number", "Crash Course Computer Science · binary", "1GSjbWt0c9M", teach("A bit is one of two states. Bits become numbers and letters.", "Computer", "What does binary use?", "Two states, written 0 and 1", ["Ten digits only, with no 0 or 1", "Only letters"])),
  clip("study-eng-ram", CC, "Hold the answer long enough to use it", "Crash Course Computer Science · registers and RAM", "fpnE6UAfbtU", teach("A latch stores one bit. A register stores a number. RAM stores many.", "Computer", "What does RAM hold?", "Bits, so a result can be kept and read back", ["Wet concrete", "Exhaust gas"])),
  clip("study-eng-concrete", PE, "It is not drying. It is reacting.", "Practical Engineering · what is concrete?", "UOHURuAf5iY", teach("Cement, water, sand, and stone. Water stays in the reaction.", "Civil", "How does concrete harden?", "A chemical reaction with water, called hydration", ["By freezing", "By magnetism"])),
  clip("study-eng-rebar", PE, "Concrete is strong until you pull it", "Practical Engineering · why concrete needs reinforcement", "cZINeaDjisY", teach("Concrete takes compression. Steel takes tension.", "Civil", "Why put steel in concrete?", "Concrete is weak in tension. Steel carries the pull.", ["To make it lighter than air", "To store electric charge"])),
  clip("study-eng-found", PE, "The bridge is only as good as what it stands on", "Practical Engineering · why bridges don't sink", "XpTs1V2NQ24", teach("The foundation spreads the load into the ground", "Civil", "What keeps a bridge from sinking?", "A foundation that carries the load into the ground", ["A larger gear", "A logic gate"])),
  clip("study-eng-bridge", PE, "Design it: which shape carries the load?", "Practical Engineering · every kind of bridge", "DX_zkaK5PaI", teach("Beam, arch, truss, suspension. The shape decides where the force goes.", "Civil", "Why are there different bridge types?", "Each shape sends the load along a different path", ["They only change the paint", "They change the binary"])),
  clip("study-eng-pipe", PE, "Pressure is the design", "Practical Engineering · flow and pressure in pipes", "ZQKpu-obzlU", teach("Water moves when pressure pushes it", "Civil", "What moves water through a pipe?", "Pressure", ["Boolean algebra", "A CPU clock"])),
  clip("study-eng-rocket", ABC, "Throw mass down. The rocket goes up.", "Science ABC · how rockets work", "jI-HeXhsUIg", teach("Combustion throws exhaust down. The rocket is pushed up.", "Rocket", "What makes a rocket leave the pad?", "Exhaust thrown downward, so the rocket is pushed up", ["A taller foundation", "A larger capacitor"])),
];

export const ENG_PATH_OF: Record<string, "eng"> = Object.fromEntries(ENG_PATH_POSTS.map((post) => [post.id, "eng" as const]));

export const DAY_CHALLENGE: { desk: "path" | "sci" | "eng"; title: string; line: string }[] = [
  { desk: "path", title: "Find the SQL injection", line: "The query is built from what the user typed. Name the defense." },
  { desk: "sci", title: "Why does it fall?", line: "Two masses. Say what they do to each other." },
  { desk: "eng", title: "Design the bridge", line: "The load has to reach the ground. Which part carries the pull?" },
  { desk: "path", title: "Name the packet", line: "The page is not one blob. Say why it was split." },
  { desk: "sci", title: "Name the element", line: "Count the protons. That is the element." },
  { desk: "eng", title: "Two states", line: "True and false. Build one gate in your head." },
  { desk: "sci", title: "Where does the sugar come from?", line: "Light, water, carbon dioxide. Name the process." },
];
