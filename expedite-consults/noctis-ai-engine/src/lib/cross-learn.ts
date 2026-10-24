export type Bridge = { from: string; to: string; via: string; when: RegExp };

export const BRIDGES: Bridge[] = [
  { from: "Bible", to: "History", via: "The world the text was written in", when: /bible|scripture|gospel|testament/i },
  { from: "Science", to: "Engineering", via: "How a finding becomes a device", when: /science|physics|chemist|biolog/i },
  { from: "Cybersecurity", to: "Mathematics", via: "Cryptography", when: /cyber|encrypt|security|cipher/i },
  { from: "Biology", to: "Engineering", via: "Devices that work with living systems", when: /biolog|\bcell\b|\bdna\b/i },
  { from: "Cybersecurity", to: "Law", via: "Privacy and computer crime", when: /cyber|privacy|phish|security/i },
  { from: "Engineering", to: "Physics", via: "Forces, energy, and materials", when: /engine|circuit|mechanical|voltage/i },
  { from: "Science", to: "Ethics", via: "What a result does not decide for you", when: /science|climate|biolog|experiment/i },
  { from: "Cybersecurity", to: "Computer science", via: "Algorithms", when: /cyber|security|algorithm/i },
  { from: "Cybersecurity", to: "Networking", via: "Protocols", when: /cyber|network|\btcp\b|\bdns\b/i },
  { from: "Cybersecurity", to: "Psychology", via: "Social engineering", when: /phish|social engineer|cyber/i },
  { from: "Cybersecurity", to: "Ethics", via: "Responsible security research", when: /cyber|pentest|security/i },
];

export function bridgesFor(text: string) {
  const hits = BRIDGES.filter((bridge) => bridge.when.test(text));
  const seen = new Set<string>();
  const out: Bridge[] = [];
  for (const bridge of hits) {
    const key = `${bridge.to}:${bridge.via}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(bridge);
    if (out.length === 6) break;
  }
  return out;
}
