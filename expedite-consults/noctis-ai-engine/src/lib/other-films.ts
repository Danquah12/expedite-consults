import type { FeedPost } from "@/lib/feed-data";
import { FACE } from "@/lib/feed-data";

const teach = (hook: string, stamp: string): FeedPost["teach"] => ({
  hook,
  stamp,
  prompt: `What is the point of “${stamp}”?`,
  options: [
    { id: "a", label: hook, ok: true },
    { id: "b", label: "A product ad with no lesson", ok: false },
    { id: "c", label: "A clip with nothing to learn", ok: false },
  ],
});

function film(
  id: string,
  name: string,
  username: string,
  avatar: string,
  caption: string,
  mediaUrl: string,
  stamp: string,
  tags: string[],
): FeedPost {
  return {
    id: `src-${id}`,
    author: { name, username, avatar },
    caption,
    lane: "learn",
    mediaType: "video",
    mediaUrl,
    views: 12000,
    likes: 640,
    comments: 18,
    shares: 22,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    hashtags: tags,
    teach: teach(caption, stamp),
  };
}

/** Clinic films that are not YouTube. Official players and direct open-course MP4s. */
export const OTHER_FILMS: FeedPost[] = [
  film("mp4-cyber", "MITRE & NIST Lab", "cyber-lab", FACE.kwesi, "MITRE ATT&CK & NIST CSF 2.0: map adversary tactics, harden choke points, and verify detections (Direct MP4 Course).", "/media/clips/mitre_attack.mp4", "MITRE · ATT&CK Course", ["#cybersecurity", "#mitre", "#nist"]),
  film("mp4-cloud", "Cloud Native Lab", "cncf-lab", FACE.tunde, "Kubernetes & eBPF Runtime Security: container isolation, least-privilege IAM, and kernel telemetry (Direct MP4 Course).", "/media/clips/k8s_ebpf.mp4", "CNCF · Cloud Security", ["#kubernetes", "#ebpf", "#cloud"]),
  film("mp4-clinical", "Johns Hopkins & NIH Open Lab", "clinical-lab", FACE.ama, "Clinical & Biomedical Laboratory: sterile bench procedure, diagnostic assay controls, and public health evidence (Direct MP4 Course).", "/media/clips/clinical_lab.mp4", "JHU · Clinical Lab", ["#medicine", "#nih", "#science"]),
  film("mp4-nasa", "NASA & Internet Archive", "nasa-archive", FACE.yaw, "Orbital Mechanics & Deep Space Telemetry: public-domain mission reels and propulsion engineering (Direct MP4 Course).", "/media/clips/nasa_space.mp4", "NASA · Space Systems", ["#nasa", "#engineering", "#space"]),
  film("mp4-loc", "Library of Congress", "loc-screening", FACE.nia, "Library of Congress National Screening Room: archival motion picture preservation and constitutional records (Direct MP4 Course).", "/media/clips/loc_screening.mp4", "LOC · Screening Room", ["#loc", "#archives", "#history"]),
  film("ted-schools", "TED", "ted", FACE.kwesi, "Do schools kill creativity? Ken Robinson on how education and talent actually work.", "https://www.ted.com/talks/sir_ken_robinson_do_schools_kill_creativity", "TED · Creativity", ["#ted", "#learning"]),
  film("ted-stats", "TED", "ted", FACE.ama, "Hans Rosling shows why the world is less divided than the headline.", "https://www.ted.com/talks/hans_rosling_shows_the_best_stats_you_ve_ever_seen", "TED · Data", ["#ted", "#data"]),
  film("ted-story", "TED", "ted", FACE.nia, "The danger of a single story. One account is never the whole place.", "https://www.ted.com/talks/chimamanda_ngozi_adichie_the_danger_of_a_single_story", "TED · Story", ["#ted", "#story"]),
  film("ted-why", "TED", "ted", FACE.kofi, "Start with why. Simon Sinek on how people actually follow an idea.", "https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action", "TED · Why", ["#ted", "#leadership"]),
  film("ted-vuln", "TED", "ted", FACE.efua, "The power of vulnerability. Brené Brown on courage and connection.", "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability", "TED · Courage", ["#ted", "#people"]),
  film("ted-body", "TED", "ted", FACE.zainab, "Your body language may shape who you are. Amy Cuddy on presence.", "https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are", "TED · Presence", ["#ted", "#work"]),
  film("arc-apollo", "Internet Archive", "archive", FACE.yaw, "Apollo 11, from the public archive. The flight, not a copy we host.", "https://archive.org/details/gov.archives.arc.45017", "Archive · Apollo", ["#nasa", "#space"]),
  film("arc-moon", "Internet Archive", "archive", FACE.tunde, "A public-domain look at the moon landing film.", "https://archive.org/details/moonwalk_one", "Archive · Moon", ["#nasa", "#space"]),
  film("loc-screening-room", "Library of Congress", "loc", FACE.ama, "Library of Congress National Screening Room: historic motion pictures, scientific reels, and preserved American memory (https://www.loc.gov/collections/national-screening-room/?utm_source=chatgpt.com).", "https://archive.org/details/gov.archives.arc.45017", "LOC · National Screening Room", ["#loc", "#archives", "#history"]),
  film("arc-movies-hall", "Internet Archive", "archive", FACE.kwesi, "Internet Archive Moving Image Archive: open-access feature films, Prelinger educational reels, and public lectures (https://archive.org/details/movies?utm_source=chatgpt.com).", "https://archive.org/details/moonwalk_one", "Archive · Moving Image Archive", ["#archive", "#movies", "#history"]),
];
