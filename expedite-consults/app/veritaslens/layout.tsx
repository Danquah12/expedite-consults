import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VeritasLens | Enterprise Media Credibility & Information Intelligence Platform',
  description: 'Next-generation Information Intelligence, Fact Verification, Kafka Ingestion, BERT Claim Classification, Knowledge Graph Lineage & Brand Safety Platform.'
};

export default function VeritasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
      {children}
    </div>
  );
}
