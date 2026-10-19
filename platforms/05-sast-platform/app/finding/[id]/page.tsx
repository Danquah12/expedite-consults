import FindingDetailClient from "@/components/finding/FindingDetailClient";
import FINDINGS from "@/data/findings";

export async function generateStaticParams() {
  return FINDINGS.map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const finding = FINDINGS.find((f) => f.id === id);
  if (!finding) {
    return {
      title: `${id} — Live Scanned Finding | XTRIKE SAST`,
      description: "Live 400-Plugin Checkmarx / IBM Code Scan / Fortify SCA Finding Analysis",
    };
  }
  return {
    title: `${finding.id} — ${finding.title}`,
    description: finding.executiveSummary,
  };
}

export default async function FindingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FindingDetailClient id={id} />;
}
