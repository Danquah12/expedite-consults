"use client";

import { useState, useEffect } from "react";

/* ═══════════════════════════ DATA ═══════════════════════════ */

const careerTools = [
  { name: "Tracker", icon: "📊", desc: "Track applications" },
  { name: "Skill Probe", icon: "🎯", desc: "Analyze skill gaps" },
  { name: "Orbit Resume", icon: "📄", desc: "AI resume builder" },
  { name: "Path Sim", icon: "🛤️", desc: "Career path simulator" },
  { name: "Interview Forge", icon: "🔥", desc: "Mock interviews" },
  { name: "Hire Me", icon: "🚀", desc: "One-click apply" },
  { name: "Salary Intel", icon: "💰", desc: "Market salary data" },
  { name: "Network Map", icon: "🕸️", desc: "Connection graph" },
  { name: "Cover Craft", icon: "✍️", desc: "AI cover letters" },
  { name: "Portfolio+", icon: "💼", desc: "Showcase work" },
  { name: "Cert Vault", icon: "🏆", desc: "Certifications" },
  { name: "Brand Boost", icon: "⭐", desc: "Personal branding" },
  { name: "Ref Check", icon: "📋", desc: "Reference manager" },
  { name: "Pitch Deck", icon: "🎤", desc: "Elevator pitches" },
  { name: "Goal Orbit", icon: "🎯", desc: "Career goals" },
];

const jobListings = [
  { title: "Senior Full-Stack Engineer", company: "Nebula Tech", location: "Remote", type: "remote", match: 97, salary: "$160K - $200K", posted: "2h ago", skills: ["React", "Node.js", "AWS"], clearance: false },
  { title: "AI/ML Research Scientist", company: "Quantum Labs", location: "San Francisco, CA", type: "hybrid", match: 94, salary: "$180K - $240K", posted: "5h ago", skills: ["Python", "TensorFlow", "PyTorch"], clearance: false },
  { title: "Cybersecurity Analyst", company: "Aegis Defense", location: "Arlington, VA", type: "onsite", match: 91, salary: "$120K - $155K", posted: "1d ago", skills: ["SIEM", "Incident Response", "SOC"], clearance: true },
  { title: "Product Designer (UX/UI)", company: "Stellar Digital", location: "New York, NY", type: "hybrid", match: 88, salary: "$130K - $170K", posted: "3h ago", skills: ["Figma", "Design Systems", "Prototyping"], clearance: false },
  { title: "DevOps / SRE Lead", company: "Cloud Forge Inc.", location: "Remote", type: "remote", match: 85, salary: "$150K - $190K", posted: "8h ago", skills: ["Kubernetes", "Terraform", "CI/CD"], clearance: false },
  { title: "Data Engineer", company: "Orbit Analytics", location: "Austin, TX", type: "remote", match: 82, salary: "$140K - $175K", posted: "1d ago", skills: ["Spark", "Airflow", "SQL"], clearance: false },
  { title: "Information Security Officer", company: "Federal Systems", location: "Washington, DC", type: "onsite", match: 79, salary: "$135K - $165K", posted: "2d ago", skills: ["GRC", "NIST", "FedRAMP"], clearance: true },
  { title: "React Native Developer", company: "AppSphere", location: "Remote", type: "remote", match: 76, salary: "$125K - $160K", posted: "6h ago", skills: ["React Native", "TypeScript", "Redux"], clearance: false },
];

const jobBoards = [
  { name: "Indeed", color: "#2164f3" },
  { name: "Glassdoor", color: "#0caa41" },
  { name: "ZipRecruiter", color: "#5ea531" },
  { name: "Dice", color: "#eb1c26" },
  { name: "USAJOBS", color: "#112e51" },
  { name: "WeWorkRemotely", color: "#ffe400" },
  { name: "LinkedIn", color: "#0077b5" },
  { name: "AngelList", color: "#000000" },
];

const networkPeople = [
  { name: "Zoe Laurent", title: "AI Product Lead at NovaTech", match: 97, avatar: "Z", color: "#8b5cf6" },
  { name: "David Osei", title: "Staff Engineer at CloudForge", match: 93, avatar: "D", color: "#ec4899" },
  { name: "Amira Hassan", title: "Security Architect at Aegis", match: 91, avatar: "A", color: "#10b981" },
  { name: "Marcus Chen", title: "VP Engineering at Stellar", match: 88, avatar: "M", color: "#f59e0b" },
  { name: "Priya Sharma", title: "Data Science Lead at Quantum", match: 85, avatar: "P", color: "#3b82f6" },
  { name: "James Walker", title: "DevOps Director at Scale.io", match: 82, avatar: "J", color: "#ef4444" },
];

const communities = [
  { name: "AI & Product Design", members: "12.4K", icon: "🤖", activity: "Very Active" },
  { name: "Startup Founders", members: "8.7K", icon: "🚀", activity: "Active" },
  { name: "Cybersecurity Pros", members: "15.2K", icon: "🛡️", activity: "Very Active" },
  { name: "Remote Work Hub", members: "21.5K", icon: "🌍", activity: "Trending" },
  { name: "Cloud & DevOps", members: "9.8K", icon: "☁️", activity: "Active" },
  { name: "Career Changers", members: "6.3K", icon: "🔄", activity: "Growing" },
];

const copilotActions = [
  { label: "My Hire Probability", icon: "📊" },
  { label: "Skill Gap Analysis", icon: "🎯" },
  { label: "Improve My Resume", icon: "📄" },
  { label: "What Role Fits Me?", icon: "🧭" },
  { label: "Salary Insight", icon: "💰" },
  { label: "Career Path Plan", icon: "🛤️" },
];

/* ═══════════════════════════ COMPONENTS ═══════════════════════════ */

/* — Match Ring — */
function MatchRing({ percentage, size = 48 }: { percentage: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 90 ? "#10b981" : percentage >= 80 ? "#00d4ff" : percentage >= 70 ? "#f59e0b" : "#8b5cf6";

  return (
    <div className="match-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <span className="absolute text-[11px] font-bold" style={{ color }}>{percentage}%</span>
    </div>
  );
}

/* — Floating Orb — */
function FloatingOrb({ color, size, top, left, delay }: { color: string; size: number; top: string; left: string; delay: string }) {
  return (
    <div className="absolute rounded-full blur-3xl opacity-15 animate-float pointer-events-none" style={{ background: color, width: size, height: size, top, left, animationDelay: delay }} />
  );
}

/* — Orbit Rings Decoration — */
function OrbitRings() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.07]">
      <div className="animate-orbit" style={{ width: 300, height: 300, borderRadius: "50%", border: "1px solid #8b5cf6", position: "absolute", top: -150, left: -150 }} />
      <div className="animate-orbit-reverse" style={{ width: 500, height: 500, borderRadius: "50%", border: "1px solid #00d4ff", position: "absolute", top: -250, left: -250 }} />
      <div className="animate-orbit" style={{ width: 700, height: 700, borderRadius: "50%", border: "1px solid #ec4899", position: "absolute", top: -350, left: -350, animationDuration: "30s" }} />
    </div>
  );
}

/* — Header — */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-glass)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-cyan)] flex items-center justify-center text-lg">🚀</div>
          <div>
            <h1 className="text-base font-bold leading-none">CareerOrbit</h1>
            <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-wider uppercase">by Sphera</p>
          </div>
        </div>
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search roles, skills, companies..." className="w-full bg-[var(--bg-secondary)]/60 border border-[var(--border-glass)] rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)]/50 transition-all" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span className="w-2 h-2 bg-[var(--accent-green)] rounded-full animate-pulse" />
            Signal Active
          </div>
          <a href="https://sphera.expediteconsults.com" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-purple)] transition-colors">
            ← Back to Sphera
          </a>
        </div>
      </div>
    </header>
  );
}

/* — Onboarding Modal — */
function OnboardingModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-8 max-w-lg w-full mx-4 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="text-4xl mb-4">✦</div>
        <h2 className="text-2xl font-black mb-2">Welcome to <span className="glow-text-orbit">CareerOrbit</span></h2>
        <p className="text-sm text-[var(--text-secondary)] mb-8">Would you like to set up your professional profile? CareerOrbit can build it for you in minutes.</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={onClose} className="glass-card p-5 text-center hover:border-[var(--accent-purple)]/30 group cursor-pointer">
            <div className="text-3xl mb-2">📄</div>
            <div className="font-bold text-sm mb-1">Upload Your Resume</div>
            <p className="text-[10px] text-[var(--text-muted)]">Let CareerOrbit instantly parse your resume (PDF or TXT) and auto-fill your entire profile</p>
            <span className="inline-block mt-2 text-[9px] font-bold px-3 py-0.5 rounded-full bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20">Fastest · Recommended</span>
          </button>
          <button onClick={onClose} className="glass-card p-5 text-center hover:border-[var(--accent-orange)]/30 group cursor-pointer">
            <div className="text-3xl mb-2">✏️</div>
            <div className="font-bold text-sm mb-1">Use Guided Form</div>
            <p className="text-[10px] text-[var(--text-muted)]">Answer simple questions step-by-step and CareerOrbit builds your dossier from scratch</p>
            <span className="inline-block mt-2 text-[9px] font-bold px-3 py-0.5 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20">Guided · 5 min</span>
          </button>
        </div>
        <button onClick={onClose} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors underline underline-offset-2 cursor-pointer">
          Skip for now — I&apos;ll set up my profile later
        </button>
      </div>
    </div>
  );
}

/* — My Orbit Tab — */
function MyOrbitTab() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Orbit Scans", value: "21", icon: "🪐", color: "#8b5cf6" },
          { label: "Signal Reach", value: "125", icon: "📡", color: "#00d4ff" },
          { label: "Match Rate", value: "14%", icon: "🎯", color: "#10b981" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Career Tools Grid */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-bold">🛠️ Career Tools</h3>
          <div className="section-divider flex-1" />
          <span className="text-[10px] text-[var(--text-muted)]">{careerTools.length} tools</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-5 gap-3">
          {careerTools.map((tool, i) => (
            <div key={tool.name} className="tool-card opacity-0 animate-fade-in-up" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="text-xl mb-1">{tool.icon}</div>
              <div className="text-[11px] font-semibold text-[var(--text-primary)]">{tool.name}</div>
              <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{tool.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-bold">🪐 Matched Roles</h3>
          <div className="section-divider flex-1" />
          <span className="text-[10px] text-[var(--text-muted)]">{jobListings.length} matches</span>
        </div>
        <div className="space-y-3">
          {jobListings.slice(0, 4).map((job, i) => (
            <JobCard key={i} job={job} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* — Job Card — */
function JobCard({ job, delay }: { job: typeof jobListings[0]; delay: number }) {
  const typeBadge = job.type === "remote" ? "badge-remote" : job.type === "hybrid" ? "badge-hybrid" : "badge-onsite";
  return (
    <div className="job-card opacity-0 animate-fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start gap-4">
        <MatchRing percentage={job.match} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm">{job.title}</h4>
            <span className={`badge ${typeBadge}`}>{job.type}</span>
            {job.clearance && <span className="badge badge-ai">TS/SCI</span>}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{job.company} · {job.location}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {job.skills.map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-purple)]/8 text-[var(--accent-purple)] border border-[var(--accent-purple)]/15">{s}</span>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-[var(--accent-green)]">{job.salary}</div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1">{job.posted}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border-glass)]">
        <button className="text-[11px] font-semibold px-4 py-1.5 rounded-lg bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-purple)]/80 transition-colors cursor-pointer">Apply Now</button>
        <button className="text-[11px] font-medium px-4 py-1.5 rounded-lg border border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-purple)]/30 transition-colors cursor-pointer">Save</button>
        <button className="text-[11px] font-medium px-4 py-1.5 rounded-lg border border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)]/30 transition-colors cursor-pointer">AI Outreach</button>
        <span className="ml-auto text-[10px] text-[var(--text-muted)]">Orbit Match: <span className="font-bold text-[var(--accent-cyan)]">{job.match}%</span></span>
      </div>
    </div>
  );
}

/* — Signals Tab — */
function SignalsTab() {
  const [workType, setWorkType] = useState("all");
  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Role, skill, or keyword..." className="w-full bg-[var(--bg-primary)]/60 border border-[var(--border-glass)] rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)]/50 transition-all" />
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <input type="text" placeholder="Location (city or remote)..." className="w-full bg-[var(--bg-primary)]/60 border border-[var(--border-glass)] rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)]/50 transition-all" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[var(--text-muted)] font-medium mr-1">Work Type:</span>
          {["all", "remote", "hybrid", "onsite"].map((t) => (
            <button key={t} onClick={() => setWorkType(t)} className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${workType === t ? "bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] border border-[var(--accent-purple)]/30" : "border border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}>{t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
          <div className="section-divider flex-1 ml-2" />
          <button className="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all cursor-pointer">⚙️ More Filters</button>
        </div>
      </div>

      {/* Job Boards */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-bold text-[var(--text-secondary)]">🔗 Job Board Integrations</h3>
          <div className="section-divider flex-1" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {jobBoards.map((b) => (
            <button key={b.name} className="board-btn" style={{ borderColor: `${b.color}30` }}>
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-bold">📡 Signal Results</h3>
          <div className="section-divider flex-1" />
          <span className="text-[10px] text-[var(--text-muted)]">{jobListings.filter(j => workType === "all" || j.type === workType).length} matches</span>
        </div>
        <div className="space-y-3">
          {jobListings.filter(j => workType === "all" || j.type === workType).map((job, i) => (
            <JobCard key={i} job={job} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* — Network Tab — */
function NetworkTab() {
  return (
    <div className="space-y-8">
      {/* Network Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Connections", value: "342", color: "#8b5cf6" },
          { label: "Followers", value: "1.2K", color: "#00d4ff" },
          { label: "Following", value: "289", color: "#ec4899" },
          { label: "Sphera Score", value: "87", color: "#10b981" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* AI Pairing */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-bold">✨ People You May Know</h3>
          <span className="badge badge-ai">AI Pairing</span>
          <div className="section-divider flex-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {networkPeople.map((person, i) => (
            <div key={person.name} className="people-card opacity-0 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${person.color}, ${person.color}80)` }}>
                {person.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{person.name}</div>
                <div className="text-[10px] text-[var(--text-muted)] truncate">{person.title}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold text-[var(--accent-cyan)]">{person.match}%</span>
                <button className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-purple)]/80 transition-colors cursor-pointer">Connect</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communities */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-bold">🌐 Suggested Communities</h3>
          <div className="section-divider flex-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {communities.map((c, i) => (
            <div key={c.name} className="glass-card p-4 opacity-0 animate-fade-in-up cursor-pointer" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{c.members} members · {c.activity}</div>
                </div>
                <button className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-[var(--accent-purple)]/30 text-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/10 transition-colors cursor-pointer">Join</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* — AI Response Generator — */
const copilotResponses: Record<string, string> = {
  "hire probability": "Based on your current profile, skills, and the market data I've analyzed, your hire probability sits at **78%** for roles matching your orbit. Here's what I recommend to push it higher:\n\n• Complete your portfolio showcase (+8%)\n• Add 2 more certifications in your domain (+5%)\n• Strengthen your network by 50 connections (+4%)\n\nYour strongest signal is in Full-Stack Engineering roles with React expertise.",
  "skill gap": "I've scanned 2,400+ job postings matching your profile. Here are the top skill gaps:\n\n🔴 **Critical:** Kubernetes & container orchestration — 73% of target roles require this\n🟡 **Important:** System design interviews — mentioned in 61% of senior roles\n🟢 **Nice-to-have:** GraphQL — growing demand, up 34% this quarter\n\nI recommend starting with Kubernetes — Elevate has a 4-week accelerated track.",
  "resume": "I've analyzed your Orbit Resume against 500+ successful applications in your field. Here's my feedback:\n\n✅ **Strong:** Technical skills section, quantified achievements\n⚠️ **Improve:** Add metrics to your last 2 roles (e.g., \"reduced deploy time by 40%\")\n❌ **Missing:** Leadership experience section — 67% of $160K+ roles look for this\n\nWant me to auto-generate an improved version?",
  "role": "Based on your skills, experience, and career trajectory, here are your best-fit roles:\n\n1. 🚀 **Senior Full-Stack Engineer** — 97% match, $160-200K\n2. 🤖 **AI/ML Platform Engineer** — 91% match, $170-220K\n3. 🏗️ **Staff Engineer** — 85% match, $190-250K\n\nYour orbit signals are strongest in companies with 200-1,000 employees in the SaaS/AI space.",
  "salary": "Here's your salary intelligence report based on current market data:\n\n📊 **Your Market Value:** $155K - $195K (based on your skills + experience)\n📈 **Trending Up:** +12% YoY for your skill set\n🌍 **Remote Premium:** +8% for remote-first companies\n\nTop-paying sectors for your profile:\n1. AI/ML Companies — $180K median\n2. FinTech — $175K median\n3. Cybersecurity — $165K median",
  "career path": "Based on your orbit data, here are two potential career paths:\n\n**Path A — Technical Leadership (3-5 years)**\nSenior Engineer → Staff Engineer → Principal Engineer\nProjected comp: $250K+ | Signal strength: 89%\n\n**Path B — Engineering Management (2-4 years)**\nSenior Engineer → Tech Lead → Engineering Manager\nProjected comp: $220K+ | Signal strength: 76%\n\nPath A aligns better with your current trajectory. Want me to build a detailed roadmap?",
  "default": "Great question! I've analyzed your orbit data and here's what I found:\n\n🪐 Your career orbit is currently in a strong position. Your signal reach has grown 23% this month, and your match rate is trending upward.\n\nI can help you with:\n• Resume optimization\n• Skill gap analysis\n• Salary benchmarking\n• Career path planning\n• Interview preparation\n\nWhat would you like to explore?",
};

function getAIResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("hire") || q.includes("probability") || q.includes("chance")) return copilotResponses["hire probability"];
  if (q.includes("skill") || q.includes("gap") || q.includes("learn")) return copilotResponses["skill gap"];
  if (q.includes("resume") || q.includes("cv") || q.includes("improve my")) return copilotResponses["resume"];
  if (q.includes("role") || q.includes("fit") || q.includes("what job") || q.includes("what role")) return copilotResponses["role"];
  if (q.includes("salary") || q.includes("pay") || q.includes("compensation") || q.includes("money") || q.includes("how much")) return copilotResponses["salary"];
  if (q.includes("path") || q.includes("plan") || q.includes("career") || q.includes("future") || q.includes("grow")) return copilotResponses["career path"];
  return copilotResponses["default"];
}

/* — Orbit Copilot with Speech-to-Text — */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function OrbitCopilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(true);

  /* — Speech Recognition — */
  const startListening = () => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  /* — Send Message — */
  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    setShowActions(false);
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse = getAIResponse(text);
      const aiMsg: ChatMessage = { role: "assistant", content: aiResponse };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  /* — Quick Action Click — */
  const handleAction = (label: string) => {
    setInput(label);
    setShowActions(false);
    const userMsg: ChatMessage = { role: "user", content: label };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = getAIResponse(label);
      const aiMsg: ChatMessage = { role: "assistant", content: aiResponse };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      setInput("");
    }, 1200 + Math.random() * 800);
  };

  return (
    <>
      <button className="copilot-btn" onClick={() => setOpen(!open)} aria-label="Orbit Copilot">
        <span className="text-xl">🤖</span>
      </button>
      {open && (
        <div className="copilot-panel animate-slide-in-right" style={{ maxHeight: 560 }}>
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-glass)]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h3 className="font-bold text-sm">Orbit Copilot</h3>
              <span className="badge badge-ai ml-1">AI</span>
              {isListening && (
                <span className="flex items-center gap-1 ml-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[9px] text-red-400 font-semibold">LISTENING</span>
                </span>
              )}
              <button onClick={() => setOpen(false)} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-lg">×</button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Your AI career partner — speak or type your question</p>
          </div>

          {/* Chat / Actions Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 350 }}>
            {/* Quick actions (shown when no messages) */}
            {showActions && messages.length === 0 && copilotActions.map((action) => (
              <button key={action.label} onClick={() => handleAction(action.label)} className="w-full text-left p-3 rounded-xl border border-[var(--border-glass)] hover:border-[var(--accent-purple)]/30 hover:bg-[var(--accent-purple)]/5 transition-all text-sm flex items-center gap-3 cursor-pointer">
                <span>{action.icon}</span>
                <span className="text-[var(--text-secondary)] font-medium">{action.label}</span>
              </button>
            ))}

            {/* Chat Messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[12px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--accent-purple)] text-white rounded-br-md"
                    : "bg-[var(--bg-primary)]/80 border border-[var(--border-glass)] text-[var(--text-secondary)] rounded-bl-md"
                }`}>
                  {msg.role === "assistant" && <div className="flex items-center gap-1.5 mb-2"><span className="text-xs">🤖</span><span className="text-[10px] font-bold text-[var(--accent-cyan)]">Orbit Copilot</span></div>}
                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-primary)]/80 border border-[var(--border-glass)] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="text-xs">🤖</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--accent-purple)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[var(--accent-purple)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[var(--accent-purple)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area with Mic + Send */}
          <div className="p-3 border-t border-[var(--border-glass)]">
            {/* Listening indicator */}
            {isListening && (
              <div className="flex items-center justify-center gap-2 mb-2 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex gap-0.5 items-end h-4">
                  {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                    <div key={i} className="w-1 bg-red-400 rounded-full animate-pulse" style={{ height: `${h * 3 + 4}px`, animationDelay: `${i * 80}ms` }} />
                  ))}
                </div>
                <span className="text-[10px] text-red-400 font-medium">Listening... speak now</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {/* Mic Button */}
              <button
                onClick={startListening}
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse"
                    : "bg-[var(--bg-primary)]/60 border border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]/30"
                }`}
                title="Click to speak"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
                </svg>
              </button>
              {/* Text Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={isListening ? "Listening..." : "Ask Orbit Copilot..."}
                  className="w-full bg-[var(--bg-primary)]/60 border border-[var(--border-glass)] rounded-xl pl-4 pr-10 py-2.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)]/50 transition-all"
                />
                {/* Send Button */}
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white cursor-pointer transition-all ${
                    input.trim()
                      ? "bg-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/80 shadow-lg shadow-[var(--accent-purple)]/30"
                      : "bg-[var(--text-muted)]/30 cursor-not-allowed"
                  }`}
                >↑</button>
              </div>
            </div>
            <p className="text-[9px] text-[var(--text-muted)]/60 text-center mt-2">🎤 Tap mic to speak · Press ↑ to send</p>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */

export default function CareerOrbitPage() {
  const [activeTab, setActiveTab] = useState("orbit");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const tabs = [
    { id: "orbit", label: "🪐 My Orbit", component: <MyOrbitTab /> },
    { id: "signals", label: "🔍 Signals", component: <SignalsTab /> },
    { id: "network", label: "🤝 Network", component: <NetworkTab /> },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <FloatingOrb color="#8b5cf6" size={400} top="5%" left="80%" delay="0s" />
        <FloatingOrb color="#00d4ff" size={350} top="40%" left="-5%" delay="2s" />
        <FloatingOrb color="#ec4899" size={300} top="70%" left="70%" delay="4s" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,212,255,0.04),transparent_50%)]" />
      </div>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <OrbitRings />
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 text-[var(--accent-purple)] text-xs font-medium mb-5">
              <span className="w-1.5 h-1.5 bg-[var(--accent-purple)] rounded-full animate-pulse" />
              Open Signal · Scanning for Matches
            </span>
          </div>
          <h2 className="opacity-0 animate-fade-in-up text-3xl sm:text-4xl lg:text-5xl font-black leading-tight" style={{ animationDelay: "0.2s" }}>
            Your Career, <span className="glow-text">In Orbit</span>
          </h2>
          <p className="opacity-0 animate-fade-in-up mt-4 text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto" style={{ animationDelay: "0.3s" }}>
            AI-powered job matching, professional networking, and career intelligence — all in one orbit.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex border-b border-[var(--border-glass)] mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-item ${activeTab === tab.id ? "active" : ""}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pb-16">
          {tabs.find((t) => t.id === activeTab)?.component}
        </div>

        {/* Footer */}
        <footer className="border-t border-[var(--border-glass)] py-8 text-center">
          <p className="text-xs text-[var(--text-muted)]">© {new Date().getFullYear()} CareerOrbit by Sphera · Expedite Consults LLC</p>
          <p className="text-[10px] text-[var(--text-muted)]/50 mt-2">Orbit Intelligence v1.0 — Signal Active</p>
        </footer>
      </div>

      <OrbitCopilot />
    </div>
  );
}
