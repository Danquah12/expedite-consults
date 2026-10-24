import { houseById } from "@/lib/cyber-week";
import type { NetworkHouse } from "@/lib/source-network";

export type SourceTier = {
  id: "official" | "university" | "conference";
  title: string;
  blurb: string;
  houseIds: string[];
};

export const CYBER_SOURCE_TIERS: SourceTier[] = [
  {
    id: "official",
    title: "Official vendor, government, standards",
    blurb: "First. Embed only what they publish. Skill Builder and paid labs stay at the vendor.",
    houseIds: [
      "aws-learn",
      "aws-iam",
      "ms-learn",
      "az-zerotrust",
      "owasp",
      "nist",
      "cisa",
      "csa",
      "cncf",
      "mitre-attack",
    ],
  },
  {
    id: "university",
    title: "Universities",
    blurb: "Campus channels we already license. We do not download lecture files.",
    houseIds: ["stanford", "mit", "harvard", "cmu", "gatech", "jhu", "umd", "purdue", "berkeley", "sans"],
  },
  {
    id: "conference",
    title: "Industry conferences",
    blurb: "Advanced talks. Only what the conference or vendor posts. No attendee rips.",
    houseIds: ["blackhat", "defcon", "rsa", "reinvent", "ignite", "cloudnext", "kubecon", "bsides", "sans-conf"],
  },
];

export function tierHouses(tier: SourceTier): NetworkHouse[] {
  return tier.houseIds.map(houseById).filter((h): h is NetworkHouse => Boolean(h));
}
