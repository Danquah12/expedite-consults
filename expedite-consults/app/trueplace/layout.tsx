import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TruePlace: Real Estate Intelligence & Home Ownership Operating System',
  description:
    'The Next-Generation Real Estate Platform. HomeTruth™ Carfax for Homes, TreeSHAP mathematical valuations, HomeOS™ appliance lifecycles, and TrueCost™ affordability.',
  metadataBase: new URL('https://expedite-consults.vercel.app'),
  alternates: {
    canonical: '/trueplace',
  },
  openGraph: {
    title: 'TruePlace: Real Estate Intelligence & Home Ownership Operating System',
    description:
      'The Next-Generation Real Estate Platform. HomeTruth™ Carfax for Homes, TreeSHAP mathematical valuations, HomeOS™ appliance lifecycles, and TrueCost™ affordability.',
    url: 'https://expedite-consults.vercel.app/trueplace',
    siteName: 'TruePlace Real Estate Intelligence',
    type: 'website',
    images: [
      {
        url: 'https://ssl.cdn-redfin.com/photo/235/bigphoto/464/1002955464_1.jpg',
        width: 1200,
        height: 630,
        alt: 'TruePlace Real Estate Intelligence & HomeOS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TruePlace: Real Estate Intelligence & Home Ownership Operating System',
    description:
      'The Next-Generation Real Estate Platform. HomeTruth™ Carfax for Homes, TreeSHAP mathematical valuations, HomeOS™ appliance lifecycles, and TrueCost™ affordability.',
    images: [
      'https://ssl.cdn-redfin.com/photo/235/bigphoto/464/1002955464_1.jpg',
    ],
  },
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
