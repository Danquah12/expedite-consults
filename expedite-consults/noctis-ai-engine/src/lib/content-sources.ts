export type SourceLane = "video" | "learn" | "audio";

export type ContentSource = {
  id: string;
  name: string;
  lane: SourceLane;
  how: "Embed" | "Open at source";
  href: string;
  line: string;
};

export const CONTENT_SOURCES: ContentSource[] = [
  { id: "youtube", name: "YouTube", lane: "video", how: "Embed", href: "https://www.youtube.com/", line: "Public films with embedding on. We do not download them." },
  { id: "vimeo", name: "Vimeo", lane: "video", how: "Embed", href: "https://vimeo.com/", line: "Public or unlisted films set to embed anywhere." },
  { id: "ted", name: "TED", lane: "video", how: "Embed", href: "https://www.ted.com/talks", line: "Talks for learning and careers. Played in TED’s player." },
  { id: "dailymotion", name: "Dailymotion", lane: "video", how: "Embed", href: "https://www.dailymotion.com/", line: "Embeddable public films." },
  { id: "rumble", name: "Rumble", lane: "video", how: "Embed", href: "https://rumble.com/", line: "Creator films when an embed link is provided." },
  { id: "twitch", name: "Twitch", lane: "video", how: "Embed", href: "https://www.twitch.tv/", line: "Live channels and saved broadcasts." },
  { id: "wistia", name: "Wistia", lane: "video", how: "Embed", href: "https://wistia.com/", line: "Training and webinar films from partners." },
  { id: "mit", name: "MIT OpenCourseWare", lane: "learn", how: "Open at source", href: "https://ocw.mit.edu/", line: "Full courses. We link. We do not copy the files." },
  { id: "khan", name: "Khan Academy", lane: "learn", how: "Open at source", href: "https://www.khanacademy.org/", line: "Lessons and practice." },
  { id: "edx", name: "edX", lane: "learn", how: "Open at source", href: "https://www.edx.org/", line: "University courses. Open the course, don’t copy it." },
  { id: "coursera", name: "Coursera", lane: "learn", how: "Open at source", href: "https://www.coursera.org/", line: "Professional certificates. Link only." },
  { id: "mslearn", name: "Microsoft Learn", lane: "learn", how: "Open at source", href: "https://learn.microsoft.com/", line: "Role paths for cloud, security, and data." },
  { id: "aws", name: "AWS Skill Builder", lane: "learn", how: "Open at source", href: "https://skillbuilder.aws/", line: "Cloud training. Official AWS." },
  { id: "cisco", name: "Cisco Networking Academy", lane: "learn", how: "Open at source", href: "https://www.netacad.com/", line: "Networking and cyber courses." },
  { id: "google", name: "Google Career Certificates", lane: "learn", how: "Open at source", href: "https://grow.google/certificates/", line: "Career certificates. Open at Google." },
  { id: "gnews", name: "Google News", lane: "learn", how: "Open at source", href: "https://news.google.com/", line: "Current headlines. Vibe cites the story Google News returns." },
  { id: "spotify", name: "Spotify", lane: "audio", how: "Embed", href: "https://open.spotify.com/", line: "Podcast episodes when a public link is shared." },
  { id: "apple", name: "Apple Podcasts", lane: "audio", how: "Open at source", href: "https://podcasts.apple.com/", line: "Leadership, technology, and finance shows. Open on Apple." },
  { id: "soundcloud", name: "SoundCloud", lane: "audio", how: "Embed", href: "https://soundcloud.com/", line: "Audio lessons and talks." },
  { id: "onet", name: "O*NET", lane: "learn", how: "Open at source", href: "https://www.onetonline.org/", line: "Job titles, tasks, and skills. Official occupational data." },
  { id: "bls", name: "Bureau of Labor Statistics", lane: "learn", how: "Open at source", href: "https://www.bls.gov/ooh/", line: "Wages and outlook. We link the page. We do not invent a salary." },
];
