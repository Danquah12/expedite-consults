import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TruePlace — Real Homes. Real Data. Real Peace of Mind.',
  description:
    'The next-generation real estate platform. Accurate home valuations, 48-hour verified active listings, and mathematical explainability (SHAP).',
};

export default function TruePlaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 flex flex-col font-sans antialiased selection:bg-[#004D40] selection:text-white">
      {children}
    </div>
  );
}
