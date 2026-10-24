import type { FeedPost, Teach } from "@/lib/feed-data";
import { SOURCE } from "@/lib/source";

const face = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0b1220&color=e4b86a&size=128&bold=true`;

const house = (name: string, username: string) => ({ name, username, avatar: face(name) });

const CC = house("Crash Course", "crashcourse");
const KHAN = house("Khan Academy", "khanacademy");
const PHILE = house("Computerphile", "computerphile");
const CISA = house("CISA", "cisa.gov");
const TRAIN = house("ComputerSecurity.us", "computersecurity.us");
const KUBU = house("kubucation", "kubucation");

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

function clip(
  id: string,
  author: FeedPost["author"],
  title: string,
  origin: string,
  youtubeId: string,
  lesson: Teach,
): FeedPost {
  return {
    id,
    author,
    caption: `${title}. ${origin}. Presented by ${SOURCE}.`,
    lane: "learn",
    mediaType: "video",
    mediaUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    posterUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    youtubeId,
    views: 400000,
    likes: 8000,
    comments: 120,
    shares: 40,
    isLiked: false,
    isSaved: false,
    isFollowing: true,
    hashtags: ["#cyber", "#path"],
    musicTitle: `${origin} · ${SOURCE}`,
    teach: lesson,
  };
}

function mp4Clip(
  id: string,
  author: FeedPost["author"],
  title: string,
  origin: string,
  mediaUrl: string,
  posterUrl: string,
  lesson: Teach,
): FeedPost {
  return {
    id,
    author,
    caption: `${title}. ${origin}. Presented by ${SOURCE}.`,
    lane: "learn",
    mediaType: "video",
    mediaUrl,
    posterUrl,
    views: 520000,
    likes: 14200,
    comments: 210,
    shares: 95,
    isLiked: false,
    isSaved: true,
    isFollowing: true,
    hashtags: ["#cyber", "#path"],
    musicTitle: `${origin} · ${SOURCE}`,
    teach: lesson,
  };
}

export const CYBER_DRILL = [
  "Scenario — what just broke",
  "Evidence — what the film shows",
  "Investigation — what you look for",
  "Challenge — answer the question on the card",
  "Solution — the fix named in the film",
  "Defense — what you change so it does not happen again",
] as const;

export const CYBER_MENUS: { id: string; label: string; line: string; ids: string[] }[] = [
  {
    id: "l1",
    label: "1 · Foundations",
    line: "The machine, then the network, then the page.",
    ids: ["study-path-mp4-foundations", "study-path-cpu", "study-path-os", "study-path-net", "study-path-tcp", "study-path-ip", "study-path-dns", "study-path-http", "study-path-https"],
  },
  {
    id: "l2",
    label: "2 · Fundamentals",
    line: "What you protect, then keys, hashes, and certificates.",
    ids: ["study-path-mp4-fundamentals", "study-path-cia", "study-path-auth", "study-path-enc", "study-path-hash", "study-path-pk", "study-path-cert"],
  },
  {
    id: "l3",
    label: "3 · Attack",
    line: "You have the film. Find the weakness, then name the defense.",
    ids: ["study-path-mp4-attack", "study-path-phish", "study-path-crack", "study-path-pass", "study-path-sqli", "study-path-xss", "study-path-malware"],
  },
  {
    id: "l4",
    label: "4 · Operations",
    line: "Detect, name the technique, and answer with a framework.",
    ids: ["study-path-mp4-ops", "study-aws-guardduty", "study-mitre-attack", "study-nist-csf", "study-cisa-aware", "study-cisa-mfa"],
  },
];

export const CYBER_PATH_POSTS: FeedPost[] = [
  mp4Clip("study-path-mp4-foundations", KUBU, "Linux Kernel & Packet Pipeline: how bits move from NIC ring buffers to user space", "Noctis Direct Course Film · Linux & eBPF Networking", "/media/clips/k8s_ebpf.mp4", "/media/pics/ctf.jpg", teach("eBPF inspects packets in kernel space before iptables traversal", "Foundations · Direct MP4", "Where does eBPF run packet filters?", "Directly inside the Linux kernel at the socket/XDP layer", ["Inside a browser extension", "Only on external paper logs"])),
  mp4Clip("study-path-mp4-fundamentals", CISA, "Immutable Audit & Cryptographic WORM Retention in Cloud Storage", "Noctis Direct Course Film · Cloud Security & Compliance", "/media/clips/scenario_drill.mp4", "/media/pics/hall.jpg", teach("Time-based WORM immutability prevents even root admins from altering audit logs", "Fundamentals · Direct MP4", "What protects compliance logs from ransomware or admin deletion?", "Write-Once-Read-Many (WORM) time-based immutability policies", ["Renaming the folder", "Disabling TLS"])),
  mp4Clip("study-path-mp4-attack", TRAIN, "MITRE ATT&CK T1003.003: Volume Shadow Copy Credential Extraction & Defense", "Noctis Direct Course Film · Offensive & Defensive Lab", "/media/clips/mitre_attack.mp4", "/media/pics/ctf.jpg", teach("Attackers abuse vssadmin to read locked NTDS.dit domain hashes", "Attack · Direct MP4", "Why do adversaries create a Volume Shadow Copy on a domain controller?", "To copy NTDS.dit while the operating system has it locked", ["To speed up video rendering", "To update DNS records"])),
  mp4Clip("study-path-mp4-ops", CISA, "Autonomous SOC Triage & FastMCP Schema Guardrails", "Noctis Direct Course Film · Security Operations", "/media/clips/agentic_flywheel.mp4", "/media/pics/robot.jpg", teach("Strict schema validation and human-in-the-loop gates keep SOC automation safe", "Operations · Direct MP4", "How should SOC automation validate tool actions before execution?", "Enforce strict schema validation and human approval for high-impact actions", ["Let the model run arbitrary shell commands", "Turn off all logging"])),
  clip("study-path-cpu", CC, "You have 12 minutes: follow one instruction through the CPU", "Crash Course Computer Science · CPU, RAM, fetch, decode, execute", "FZGugFqdr60", teach("The CPU fetches, decodes, and executes", "Foundations", "What does the CPU do with an instruction?", "Fetch it, decode it, then execute it", ["Store it as a password", "Send it to DNS"])),
  clip("study-path-os", CC, "Who runs the other programs?", "Crash Course Computer Science · operating systems", "26QPDBe-NB8", teach("The OS is the program that runs the others", "Foundations", "What is an operating system?", "A privileged program that manages other programs and hardware", ["A brand of CPU", "A website certificate"])),
  clip("study-path-net", KHAN, "How does a bit leave the building?", "Khan Academy · wires, cables, and Wi-Fi", "iV-YqG70wbQ", teach("The internet is a network of networks", "Foundations", "What carries internet traffic in this film?", "Wires, cables, and Wi-Fi", ["Only paper mail", "Only a single computer"])),
  clip("study-path-tcp", KHAN, "A page is not one blob. It is packets.", "Khan Academy · packets, routers, and reliability", "aD_yi5VjF78", teach("Packets can take different paths and still be reassembled", "Foundations", "Why split a message into packets?", "So routers can move pieces and the receiver can reassemble them", ["So DNS can hide the site", "So the CPU can skip RAM"])),
  clip("study-path-ip", KHAN, "Every machine needs a number", "Khan Academy · IP addresses and DNS", "MwxMsaFFycg", teach("An IP address is how a machine is found", "Foundations", "What is an IP address?", "The numeric address of a device on the internet", ["A password", "A hash of a file"])),
  clip("study-path-dns", PHILE, "The name is not the address", "Computerphile · how DNS works", "uOfonONtIuk", teach("DNS turns a name into an IP address", "Foundations", "What does DNS resolve?", "A domain name to an IP address", ["A password to a hash", "HTTP to a certificate"])),
  clip("study-path-http", KHAN, "The browser asks. The server answers.", "Khan Academy · HTTP and HTML", "1K64fWX5z4U", teach("HTTP is the request and response of the web", "Foundations", "What is HTTP for?", "Asking a server for a page and receiving the response", ["Encrypting a disk", "Blocking a port"])),
  clip("study-path-https", PHILE, "HTTP versus the locked version", "Computerphile · Transport Layer Security", "0TLDTodL7Lc", teach("TLS is what turns HTTP into HTTPS", "Foundations", "What does TLS add to HTTP?", "A protected channel so the request is not read on the path", ["A faster CPU", "A new IP address"])),
  clip("study-path-cia", TRAIN, "Name what you are protecting", "ComputerSecurity.us · the CIA triad", "jweEZ4JryQ8", teach("Confidentiality, integrity, availability", "Fundamentals", "What are the three letters of the triad?", "Confidentiality, integrity, and availability", ["CPU, RAM, and disk", "HTTP, HTML, and CSS"])),
  clip("study-path-auth", PHILE, "Proving you are you is not the same as being allowed", "Computerphile · two-factor authentication", "ZXFYT-BG2So", teach("Authentication checks identity. Authorization checks permission.", "Fundamentals", "What does a second factor prove?", "That the person holds something besides the password", ["That the firewall is off", "That the packet arrived"])),
  clip("study-path-enc", KHAN, "Hide the message, not the fact that you sent it", "Khan Academy · encryption and public keys", "6-JjHa-qLPk", teach("Encryption keeps a message unreadable without the key", "Fundamentals", "What does encryption protect?", "The contents of a message from someone without the key", ["The CPU clock speed", "The color of the browser"])),
  clip("study-path-hash", PHILE, "Same input, same fingerprint. You cannot rewind it.", "Computerphile · hashing algorithms", "b4b8ktEV4Bg", teach("A hash is a one-way fingerprint", "Fundamentals", "What is a cryptographic hash used for?", "A fingerprint you can check without storing the original secret in the clear", ["Reversible encryption of a disk", "A DNS lookup"])),
  clip("study-path-pk", PHILE, "One key locks. The other key opens.", "Computerphile · public key cryptography", "GSIDS_lvRv4", teach("A public key can be shared. The private key cannot.", "Fundamentals", "Which key can you publish?", "The public key", ["The private key", "The password hash and the private key"])),
  clip("study-path-cert", KUBU, "Who signed this site?", "kubucation · certificates and certificate authorities", "T4Df5_cojAs", teach("A certificate binds a public key to a name", "Fundamentals", "What does a certificate authority do?", "Signs a certificate that ties a public key to a site", ["Chooses your password", "Routes packets"])),
  clip("study-path-phish", CISA, "You have one minute: is this message a lure?", "CISA · recognize and report phishing", "2AfOY33953g", teach("Recognize, report, delete", "Attack", "What does CISA tell you to do with a phishing message?", "Recognize it, report it, and delete it", ["Forward it to the whole company", "Click the link to check"])),
  clip("study-path-crack", PHILE, "You have 20 minutes: how does a password fall?", "Computerphile · password cracking", "7U-RbOKanYs", teach("Guessing is fast when the password is short or common", "Attack", "Why do short passwords fall?", "An attacker can try huge numbers of guesses", ["Because DNS is slow", "Because HTTPS hides them from the owner"])),
  clip("study-path-pass", PHILE, "Reuse is the attack. Length is the defense.", "Computerphile · how to choose a password", "3NjQ9b3pgIg", teach("One password, one site", "Attack", "What should you stop doing with passwords?", "Reusing the same password on many sites", ["Using a long passphrase", "Turning on a second factor"])),
  clip("study-path-sqli", PHILE, "You have 9 minutes: find the SQL injection", "Computerphile · Tom Scott on SQL injection", "_jKylhJtPmI", teach("User input must not become the query", "Attack", "What stops SQL injection?", "Prepared statements, so input is data, not SQL", ["A longer password", "Turning off DNS"])),
  clip("study-path-xss", PHILE, "The page runs the attacker's script", "Computerphile · cross-site scripting", "L5l9lSnNMxg", teach("XSS is script the site did not mean to run", "Attack", "What is cross-site scripting?", "An attacker gets the browser to run their script in the site", ["A broken CPU", "A stolen IP address only"])),
  clip("study-path-malware", PHILE, "The file encrypts what it can reach", "Computerphile · how WannaCry encrypts files", "pLluFxHrc30", teach("Ransomware encrypts files and demands a key", "Attack", "What does this malware do to files?", "It encrypts them", ["It only changes the wallpaper color", "It upgrades the operating system"])),
];

export const CYBER_PATH_OF: Record<string, "path"> = Object.fromEntries(CYBER_PATH_POSTS.map((post) => [post.id, "path" as const]));
