import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Expedite Consults & VeritasLens Media Intelligence",
	description: "Enterprise Information Intelligence, Media Bias Clustering & AI Fact-Checking Platform",
	openGraph: {
		title: "VeritasLens: AI Media Bias & Claim Verification Platform",
		description: "Real-time clustering across 14 newsrooms, blindspot detection, and statutory fact verification.",
		url: "https://expedite-consults.vercel.app/veritaslens",
		siteName: "VeritasLens by Expedite Consults",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "VeritasLens: AI Media Bias & Claim Verification Platform",
		description: "Real-time clustering across 14 newsrooms, blindspot detection, and statutory fact verification.",
	}
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	// Also supported by less commonly used
	// interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				suppressHydrationWarning
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
