import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { signOut } from "@/auth";
import "../globals.css";

export const metadata: Metadata = {
	title: "IT Change Management Portal",
	description: "ITIL v4 Change Request Management System",
};

const REQUESTOR_NAV = [
	{ href: "/portal",      label: "My CRs",             icon: "📋" },
	{ href: "/portal/new",  label: "New CR",             icon: "➕" },
	{ href: "/mail",        label: "Axiom Mail & Teams", icon: "✉️" },
	{ href: "/campus",      label: "TowsonSync Campus",  icon: "🎓" },
	{ href: "/veritaslens", label: "VeritasLens AI",     icon: "🌐" },
	{ href: "/connectin",   label: "ConnectIn Network",  icon: "💼" },
	{ href: "/assessment",  label: "Cyber Assessment",   icon: "🛡️" },
];

const MANAGER_NAV = [
	{ href: "/portal",              label: "My CRs",             icon: "📋" },
	{ href: "/portal/new",          label: "New CR",             icon: "➕" },
	{ href: "/dashboard",           label: "Governance Hub",     icon: "📊" },
	{ href: "/dashboard/calendar",  label: "CAB Calendar",       icon: "📅" },
	{ href: "/mail",                label: "Axiom Mail & Teams", icon: "✉️" },
	{ href: "/campus",              label: "TowsonSync Campus",  icon: "🎓" },
	{ href: "/veritaslens",         label: "VeritasLens AI",     icon: "🌐" },
	{ href: "/connectin",           label: "ConnectIn Network",  icon: "💼" },
	{ href: "https://14-exploitability-platform.vercel.app", label: "AXIOM Exploitability", icon: "⚡" },
	{ href: "https://15-threat-modeling-platform.vercel.app", label: "AXIOM Threat Modeler", icon: "📐" },
];

export default async function CRPortalLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();
	const user = session?.user;
	const role = (user as any)?.role ?? "requestor";
	const navLinks = role === "manager" ? MANAGER_NAV : REQUESTOR_NAV;
	const initials = user?.name
		? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
		: user?.email?.slice(0, 2).toUpperCase() ?? "?";

	return (
		<div className="bg-slate-50 min-h-screen">
			<div className="flex min-h-screen">

				{/* ── Sidebar ───────────────────────────────────────────── */}
				<aside className="hidden md:flex flex-col w-64 bg-[#030c1d] text-white fixed inset-y-0 left-0 z-40">
					{/* Logo */}
					<div className="px-6 py-5 border-b border-white/10">
						<Link href="/portal" className="flex items-center gap-2">
							<span className="text-[#43bbd1] text-xl">⚙️</span>
							<div>
								<p className="text-sm font-bold text-white leading-none">IT Change Mgmt</p>
								<p className="text-[10px] text-white/40 mt-0.5">CR Portal v2.0</p>
							</div>
						</Link>
					</div>

					{/* Role badge */}
					{user && (
						<div className="px-4 pt-4">
							<span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
								role === "manager"
									? "bg-[#43bbd1]/20 text-[#43bbd1] border border-[#43bbd1]/30"
									: "bg-white/10 text-white/50 border border-white/10"
							}`}>
								{role === "manager" ? "🛡️ Change Manager" : "👤 Requestor"}
							</span>
						</div>
					)}

					{/* Navigation */}
					<nav className="flex-1 px-4 py-4 space-y-1">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
							>
								<span className="text-base">{link.icon}</span>
								{link.label}
							</Link>
						))}
					</nav>

					{/* User + Sign out */}
					<div className="px-4 py-4 border-t border-white/10 space-y-3">
						{user ? (
							<>
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-full bg-[#43bbd1]/20 border border-[#43bbd1]/30 flex items-center justify-center text-xs font-bold text-[#43bbd1] flex-shrink-0">
										{initials}
									</div>
									<div className="min-w-0">
										{user.name && <p className="text-xs font-semibold text-white truncate">{user.name}</p>}
										<p className="text-[10px] text-white/40 truncate">{user.email}</p>
									</div>
								</div>
								<form action={async () => {
									"use server";
									await signOut({ redirectTo: "/login" });
								}}>
									<button
										type="submit"
										className="w-full text-left text-xs text-white/40 hover:text-white/70 transition px-1 py-1"
									>
										← Sign out
									</button>
								</form>
							</>
						) : (
							<Link href="/login" className="text-xs text-[#43bbd1] hover:underline">
								Sign in →
							</Link>
						)}
						<p className="text-[10px] text-white/20 leading-relaxed">
							Aligned with ITIL v4 · Change Enablement
						</p>
					</div>
				</aside>

				{/* ── Main content ──────────────────────────────────────── */}
				<div className="flex-1 md:ml-64 flex flex-col min-h-screen">
					{/* Top bar */}
					<header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Link href="/portal" className="md:hidden flex items-center gap-2 text-[#030c1d]">
								<span className="text-lg">⚙️</span>
								<span className="text-sm font-bold">CR Portal</span>
							</Link>
						</div>

						<div className="flex items-center gap-3">
							{/* Session pill (desktop) */}
							{user && (
								<div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
									<div className="w-6 h-6 rounded-full bg-[#030c1d] flex items-center justify-center text-[10px] font-bold text-[#43bbd1]">
										{initials}
									</div>
									<span className="font-medium">{user.name ?? user.email}</span>
									{role === "manager" && (
										<span className="px-1.5 py-0.5 bg-[#43bbd1]/10 text-[#43bbd1] text-[10px] font-bold rounded uppercase">
											Manager
										</span>
									)}
								</div>
							)}

							<Link
								href="/portal/new"
								className="hidden sm:flex items-center gap-2 bg-[#030c1d] text-[#43bbd1] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#43bbd1] hover:text-[#030c1d] transition-colors"
							>
								<span>➕</span> New CR
							</Link>
						</div>
					</header>

					{/* Mobile nav */}
					<nav className="md:hidden bg-[#030c1d] flex items-center gap-1 px-4 py-2 overflow-x-auto">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-white/70 hover:bg-white/10 hover:text-white whitespace-nowrap transition-colors"
							>
								{link.icon} {link.label}
							</Link>
						))}
					</nav>

					{/* Page content */}
					<main className="flex-1 p-6">{children}</main>

					{/* Footer */}
					<footer className="px-6 py-3 border-t border-slate-200 bg-white">
						<p className="text-xs text-slate-400 text-center">
							IT Change Management Portal · ServiceNow + Exchange · ITIL v4
						</p>
					</footer>
				</div>
			</div>
		</div>
	);
}
