import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  ExternalLink,
  FileCheck2,
  FolderKanban,
  GraduationCap,
  Hammer,
  Lock,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { NoctisMark } from "@/components/brand/NoctisMark";
import { readJourney, type JourneyStore } from "@/lib/journey-paths";
import {
  WORK_CAREERS,
  WORK_CREDENTIALS,
  WORK_PROJECTS,
  WORK_SKILLED_TRADES,
  buildCareerJourney,
  collectDemonstratedSkills,
  computeCareerReadiness,
  getWorkRecommendedNextSteps,
  matchOpportunitiesForLearner,
  readWorkStore,
  recordExternalCredentialClaim,
  startCredentialPrepInLearn,
  submitWorkProjectEvidence,
  updateDefaultPortfolioVisibility,
  updatePassportVisibility,
  writeWorkStore,
  type EvidenceVerificationTier,
  type OpportunityType,
  type PortfolioVisibility,
  type WorkArrangement,
  type WorkScreenId,
  type WorkStoreState,
} from "@/lib/work-engine";
import { cn } from "@/lib/utils";

const SCREEN_TABS: { id: WorkScreenId; label: string; shortLabel: string }[] = [
  { id: "dashboard", label: "Screen 1 · Work Dashboard", shortLabel: "Dashboard" },
  { id: "careers", label: "Screen 2 · Career Explorer", shortLabel: "Careers" },
  { id: "certifications", label: "Screen 3 · Certifications", shortLabel: "Certifications" },
  { id: "trades", label: "Screen 4 · Skilled Trades", shortLabel: "Skilled Trades" },
  { id: "projects", label: "Screen 5 · Projects", shortLabel: "Projects" },
  { id: "opportunities", label: "Screen 6 · Jobs & Opportunities", shortLabel: "Opportunities" },
  { id: "passport", label: "Screen 7 · Portfolio & Passport", shortLabel: "Skills Passport" },
];

const PROVENANCE_BADGE: Record<
  EvidenceVerificationTier,
  { label: string; tone: string; description: string }
> = {
  "self-reported": {
    label: "Self-Reported",
    tone: "border-amber-400/45 bg-amber-500/15 text-amber-200",
    description: "Submitted by learner; not yet independently verified.",
  },
  "ai-reviewed": {
    label: "AI-Reviewed (Noctis)",
    tone: "border-sky-400/45 bg-sky-500/15 text-sky-200",
    description: "Checked against project rubric by Noctis; not an official external certification.",
  },
  "instructor-verified": {
    label: "Instructor-Verified",
    tone: "border-emerald-400/45 bg-emerald-500/15 text-emerald-200",
    description: "Verified by a qualified supervisor or Vibe instructor.",
  },
  "issuer-verified": {
    label: "Issuer-Verified",
    tone: "border-[#f0c56a]/65 bg-[#e4b86a]/20 text-[#f6e3b0]",
    description: "Verified directly with the external certifying body or licensing authority.",
  },
};

const VISIBILITY_LABELS: Record<PortfolioVisibility, { label: string; detail: string }> = {
  private: {
    label: "Private (Only You)",
    detail: "Hidden from employers and public links by default.",
  },
  "shared-link": {
    label: "Shareable Link",
    detail: "Accessible only to people with your unique link.",
  },
  "employers-only": {
    label: "Employer-Visible",
    detail: "Visible to matched employers in Vibe Work.",
  },
  public: {
    label: "Public Portfolio",
    detail: "Listed on your public Vibe profile.",
  },
};

export function WorkDesk({
  initialScreen = "dashboard",
  onOpenJourney,
  onOpenLearn,
}: {
  initialScreen?: WorkScreenId;
  onOpenJourney?: () => void;
  onOpenLearn?: () => void;
}) {
  const navigate = useNavigate();
  const [journeyStore, setJourneyStore] = useState<JourneyStore>(() => readJourney());
  const [store, setStore] = useState<WorkStoreState>(() => readWorkStore());
  const [screen, setScreen] = useState<WorkScreenId>(initialScreen);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [oppTypeFilter, setOppTypeFilter] = useState<OpportunityType | "all">("all");
  const [workArrangementFilter, setWorkArrangementFilter] = useState<WorkArrangement | "all">(
    "all",
  );
  const [showExpiredOpportunities, setShowExpiredOpportunities] = useState(true);

  // Screen-specific selections
  const [selectedCareerId, setSelectedCareerId] = useState<string>(store.selectedCareerId);
  const [providerFilter, setProviderFilter] = useState<string>("All");
  const [selectedTradeId, setSelectedTradeId] = useState<string>(WORK_SKILLED_TRADES[0]!.id);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(WORK_PROJECTS[0]!.id);

  // Project submission form state
  const [completedTasksByProject, setCompletedTasksByProject] = useState<Record<string, string[]>>(
    () => ({
      "proj-cloud-sec-webapp": ["task-1", "task-2", "task-3", "task-4"],
    }),
  );
  const [submissionText, setSubmissionText] = useState(
    "Configured least-privilege IAM roles, parameterized SQL queries with strict input validation, enabled CloudTrail and SIEM log alerts, and documented VPC security group rules.",
  );

  // External credential form state
  const [extCredTitle, setExtCredTitle] = useState("");
  const [extCredIssuer, setExtCredIssuer] = useState("AWS / CompTIA / State Board");
  const [extCredUrl, setExtCredUrl] = useState("");

  // Noctis Career Guide banner & feedback notice
  const [noctisPromptOpen, setNoctisPromptOpen] = useState(false);
  const [noctisQuestion, setNoctisQuestion] = useState("");
  const [noctisReply, setNoctisReply] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setStore(readWorkStore());
      setJourneyStore(readJourney());
    };
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 5500);
  };

  const activeCareer = useMemo(
    () => WORK_CAREERS.find((c) => c.id === store.selectedCareerId) ?? WORK_CAREERS[0]!,
    [store.selectedCareerId],
  );

  const explorerCareer = useMemo(
    () => WORK_CAREERS.find((c) => c.id === selectedCareerId) ?? activeCareer,
    [selectedCareerId, activeCareer],
  );

  const readiness = useMemo(
    () => computeCareerReadiness(activeCareer.id, journeyStore, store),
    [activeCareer.id, journeyStore, store],
  );

  const demonstratedSkills = useMemo(
    () => collectDemonstratedSkills(journeyStore, store),
    [journeyStore, store],
  );

  const recommendedSteps = useMemo(
    () => getWorkRecommendedNextSteps(journeyStore, store),
    [journeyStore, store],
  );

  const matchedOpportunities = useMemo(
    () =>
      matchOpportunitiesForLearner(journeyStore, store, {
        includeExpired: showExpiredOpportunities,
        type: oppTypeFilter,
        workArrangement: workArrangementFilter,
        query: searchQuery,
      }),
    [journeyStore, store, showExpiredOpportunities, oppTypeFilter, workArrangementFilter, searchQuery],
  );

  const topOpportunities = useMemo(
    () => matchOpportunitiesForLearner(journeyStore, store, { includeExpired: false }).slice(0, 3),
    [journeyStore, store],
  );

  const selectedTrade = useMemo(
    () => WORK_SKILLED_TRADES.find((t) => t.id === selectedTradeId) ?? WORK_SKILLED_TRADES[0]!,
    [selectedTradeId],
  );

  const selectedProject = useMemo(
    () => WORK_PROJECTS.find((p) => p.id === selectedProjectId) ?? WORK_PROJECTS[0]!,
    [selectedProjectId],
  );

  const filteredCareers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return WORK_CAREERS.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, categoryFilter]);

  const filteredCredentials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return WORK_CREDENTIALS.filter((cred) => {
      if (providerFilter !== "All" && cred.provider !== providerFilter) return false;
      if (!q) return true;
      return (
        cred.officialName.toLowerCase().includes(q) ||
        cred.provider.toLowerCase().includes(q) ||
        cred.examObjectives.some((o) => o.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, providerFilter]);

  const handleSelectTargetCareer = (careerId: string) => {
    const next: WorkStoreState = { ...store, selectedCareerId: careerId };
    writeWorkStore(next);
    setStore(next);
    setSelectedCareerId(careerId);
  };

  const handleBuildCareerJourney = (careerId: string, goToJourneyAfter = false) => {
    const res = buildCareerJourney(careerId, journeyStore, store);
    setStore(res.workStore);
    setJourneyStore(res.journeyStore);
    setSelectedCareerId(careerId);
    showToast(
      `Built "${res.career.title}" roadmap in Journey (${res.journey.modules.length} modules linked to Learn).`,
    );
    if (goToJourneyAfter) {
      if (onOpenJourney) {
        onOpenJourney();
      } else {
        void navigate({ to: "/start" });
      }
    }
  };

  const handleStartCertPrep = (credentialId: string) => {
    const res = startCredentialPrepInLearn(credentialId, journeyStore);
    setJourneyStore(res.journeyStore);
    showToast(
      `Started exam preparation for ${res.credential.officialName}. Opening lesson in Learn...`,
    );
    if (onOpenLearn) {
      onOpenLearn();
    } else {
      void navigate({
        to: "/learn/lessons/$lessonId",
        params: { lessonId: res.record.lessonId },
      });
    }
  };

  const handleToggleProjectTask = (projectId: string, taskId: string) => {
    setCompletedTasksByProject((prev) => {
      const current = prev[projectId] ?? [];
      const exists = current.includes(taskId);
      return {
        ...prev,
        [projectId]: exists ? current.filter((id) => id !== taskId) : [...current, taskId],
      };
    });
  };

  const handleSubmitProjectEvidence = (projectId: string) => {
    const checkedTasks =
      completedTasksByProject[projectId] ??
      selectedProject.taskChecklist.map((t) => t.id);
    const res = submitWorkProjectEvidence(store, {
      projectId,
      completedTaskIds: checkedTasks,
      submissionText,
      attachToPassport: true,
    });
    setStore(res.workStore);
    showToast(res.submission.feedback);
  };

  const handleAddExternalCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extCredTitle.trim()) return;
    const next = recordExternalCredentialClaim(store, {
      credentialId: `ext-${Date.now()}`,
      title: extCredTitle.trim(),
      issuer: extCredIssuer.trim() || "External Authority",
      credentialNumberOrUrl: extCredUrl.trim() || undefined,
      skillsDemonstrated: activeCareer.requiredSkills.slice(0, 2),
    });
    setStore(next);
    setExtCredTitle("");
    setExtCredUrl("");
    showToast(
      "Added external credential record to your Skills Passport (marked Self-Reported until verified).",
    );
  };

  const handleAskNoctis = (e: React.FormEvent) => {
    e.preventDefault();
    const q = noctisQuestion.trim();
    const missing =
      readiness.outstandingSkills.slice(0, 3).join(", ") ||
      "none — all core skills demonstrated";
    setNoctisReply(
      `Noctis Career Analysis for ${activeCareer.title} (${readiness.readinessPct}% weighted readiness): ` +
        `You have demonstrated ${readiness.completedSkills.length} of ${activeCareer.requiredSkills.length} required skills (${readiness.completedSkills.join(", ") || "none yet"}). ` +
        `Priority skill gaps to close next: ${missing}. ` +
        `Recommended immediate action: complete the "${WORK_PROJECTS.find((p) => activeCareer.relatedProjectIds.includes(p.id))?.title ?? "Secure Web Application & IAM Hardening"}" project to convert theory into portfolio evidence.` +
        (q
          ? ` Regarding "${q}": focus on verifiable project artifacts and official vendor exam objectives rather than course completion alone.`
          : ""),
    );
  };

  const verifiedSkillsCount = demonstratedSkills.length;
  const completedProjectsCount = Math.max(
    1,
    Object.values(store.projectSubmissions).filter((s) => s.status === "verified").length,
  );
  const credentialsInProgressCount = Object.keys(store.externalCredentialClaims).length;
  const practicalTasksCompletedCount =
    Object.values(completedTasksByProject).reduce((acc, arr) => acc + arr.length, 0) || 3;

  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-x-hidden text-[#f6f1e8] sm:space-y-6">
      {/* Screen Switcher Bar (All 7 Specification Screens — touch-scrollable on mobile phones) */}
      <nav
        aria-label="Noctis Work Screens"
        className="flex flex-col gap-2.5 rounded-2xl border border-[#e4b86a]/35 bg-[#12192b]/95 p-2.5 shadow-lg sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-2"
      >
        <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {SCREEN_TABS.map((tab) => {
            const active = screen === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setScreen(tab.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition",
                  active
                    ? "bg-gradient-to-r from-[#e4b86a] to-[#c9973e] text-[#111625] shadow-sm"
                    : "text-[#d7c4a2] hover:bg-[#1e2942] hover:text-[#f6f1e8]",
                )}
              >
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="flex w-full items-center justify-between gap-2 border-t border-[#e4b86a]/20 px-1 pt-2 text-[11px] text-[#d7c4a2] sm:w-auto sm:border-t-0 sm:px-2 sm:pt-0">
          <span className="shrink-0">Target Career:</span>
          <select
            aria-label="Target career goal"
            value={activeCareer.id}
            onChange={(e) => handleSelectTargetCareer(e.target.value)}
            className="min-w-0 flex-1 truncate rounded-lg border border-[#e4b86a]/45 bg-[#0d1322] px-2.5 py-1.5 text-xs font-semibold text-[#f6e3b0] sm:flex-initial"
          >
            {WORK_CAREERS.map((career) => (
              <option key={career.id} value={career.id}>
                {career.title}
              </option>
            ))}
          </select>
        </div>
      </nav>

      {/* Toast Notification */}
      {toastMessage ? (
        <div
          role="status"
          className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#e4b86a] bg-[#19233c] px-4 py-3 text-xs font-medium text-[#f6e3b0] shadow-lg sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-2 sm:items-center">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400 sm:mt-0" />
            <span className="leading-relaxed">{toastMessage}</span>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => {
                if (onOpenJourney) onOpenJourney();
                else void navigate({ to: "/start" });
              }}
              className="flex-1 rounded-lg border border-[#e4b86a]/50 bg-[#0d1322] px-2.5 py-1.5 text-center text-[11px] font-semibold text-[#f0c56a] hover:bg-[#241910] sm:flex-initial"
            >
              Open Journey
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenLearn) onOpenLearn();
                else void navigate({ to: "/learn" });
              }}
              className="flex-1 rounded-lg border border-[#e4b86a]/50 bg-[#0d1322] px-2.5 py-1.5 text-center text-[11px] font-semibold text-[#f0c56a] hover:bg-[#241910] sm:flex-initial"
            >
              Open Learn
            </button>
          </div>
        </div>
      ) : null}

      {/* Top Hero Banner + Search + "Your Work with Noctis" (Matches Mockup Screen 1) */}
      <section className="relative overflow-hidden rounded-2xl border border-[#e4b86a]/45 bg-[linear-gradient(135deg,#151f38_0%,#1c2540_52%,#2a221b_100%)] p-4 shadow-[0_16px_40px_rgba(6,10,22,0.55)] sm:rounded-[1.75rem] sm:p-5 md:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,1fr)] lg:items-center lg:gap-6">
          <div className="min-w-0 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e4b86a]/50 bg-[#e4b86a]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f6e3b0]">
              WORK
            </span>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#f6f1e8] sm:text-3xl md:text-4xl">
              Turn what you learn into real opportunities.
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-[#d7c4a2] sm:text-sm">
              Explore careers, prepare for certifications, learn skilled trades, build practical
              projects, and showcase your abilities.
            </p>

            {/* Unified Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (screen === "dashboard" && searchQuery.trim()) {
                  setScreen("opportunities");
                }
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#d7c4a2]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search careers, skills, certifications, apprenticeships, or jobs..."
                  aria-label="Search careers, skills, certifications, apprenticeships, or jobs"
                  className="w-full rounded-xl border border-[#e4b86a]/40 bg-[#0d1322]/90 py-3 pl-10 pr-4 text-sm text-[#f6f1e8] placeholder:text-[#9aa4bf] focus:border-[#f0c56a] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e4b86a] to-[#c89238] px-5 py-3 text-sm font-bold text-[#121829] shadow-md transition hover:brightness-110 sm:w-auto"
              >
                <span>Search</span>
                <ChevronRight className="size-4" />
              </button>
            </form>

            {/* Filter Row — full-width stacked selects on small phones, inline wrap on tablet/desktop */}
            <div className="grid grid-cols-1 gap-2 pt-1 text-xs sm:flex sm:flex-wrap sm:items-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d7c4a2]">
                Filters:
              </span>
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-[#e4b86a]/35 bg-[#0d1322]/90 px-2.5 py-2 text-xs text-[#f6f1e8] sm:w-auto sm:py-1.5"
              >
                <option value="all">All Categories</option>
                <option value="Cybersecurity & Cloud">Cybersecurity &amp; Cloud</option>
                <option value="Software & Data">Software &amp; Data</option>
                <option value="Skilled Trades">Skilled Trades</option>
                <option value="Engineering & Operations">Engineering &amp; Operations</option>
              </select>

              <select
                aria-label="Filter by opportunity type"
                value={oppTypeFilter}
                onChange={(e) => setOppTypeFilter(e.target.value as OpportunityType | "all")}
                className="w-full rounded-lg border border-[#e4b86a]/35 bg-[#0d1322]/90 px-2.5 py-2 text-xs text-[#f6f1e8] sm:w-auto sm:py-1.5"
              >
                <option value="all">All Opportunity Types</option>
                <option value="Job">Jobs</option>
                <option value="Internship">Paid Internships</option>
                <option value="Apprenticeship">Apprenticeships</option>
                <option value="Training Programme">Training Programmes</option>
              </select>

              <select
                aria-label="Filter by work arrangement"
                value={workArrangementFilter}
                onChange={(e) =>
                  setWorkArrangementFilter(e.target.value as WorkArrangement | "all")
                }
                className="w-full rounded-lg border border-[#e4b86a]/35 bg-[#0d1322]/90 px-2.5 py-2 text-xs text-[#f6f1e8] sm:w-auto sm:py-1.5"
              >
                <option value="all">All Locations</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          {/* Right Card: "Your Work with Noctis" */}
          <div className="min-w-0 rounded-2xl border border-[#e4b86a]/55 bg-[linear-gradient(160deg,#1a243d_0%,#131a2e_100%)] p-4 shadow-xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f0c56a]">
                  Your Work with Noctis
                </p>
                <div className="mt-2 flex items-center gap-2.5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[#e4b86a]/60 bg-[#241910]">
                    <NoctisMark className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#f6f1e8]">
                      Noctis · Career Guide
                    </p>
                    <p className="truncate text-[11px] text-[#d7c4a2]">
                      Goal: {activeCareer.title} ({readiness.readinessPct}% ready)
                    </p>
                  </div>
                </div>
              </div>
              <Sparkles className="size-5 shrink-0 text-[#f0c56a]" />
            </div>

            <p className="mt-3.5 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/75 p-3 text-xs leading-relaxed text-[#e7d9be]">
              &ldquo;You&apos;re building strong skills in{" "}
              <strong className="text-[#f6e3b0]">Cloud Security &amp; Web Development</strong>. Ready
              to explore careers, certifications, or real-world projects?&rdquo;
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => setNoctisPromptOpen((prev) => !prev)}
                className="w-full rounded-xl bg-gradient-to-r from-[#e4b86a] to-[#c89238] px-4 py-2.5 text-xs font-bold text-[#121829] shadow transition hover:brightness-110 sm:flex-1"
              >
                Ask Noctis
              </button>
              <button
                type="button"
                onClick={() => handleBuildCareerJourney(activeCareer.id, false)}
                className="w-full rounded-xl border border-[#e4b86a]/50 bg-[#0d1322] px-3 py-2.5 text-xs font-semibold text-[#f6e3b0] transition hover:bg-[#1e2942] sm:w-auto"
              >
                Sync Career Plan
              </button>
            </div>

            {noctisPromptOpen ? (
              <form
                onSubmit={handleAskNoctis}
                className="mt-3 space-y-2 border-t border-[#e4b86a]/25 pt-3"
              >
                <input
                  type="text"
                  value={noctisQuestion}
                  onChange={(e) => setNoctisQuestion(e.target.value)}
                  placeholder="Ask Noctis about skill gaps, certs, trades, or projects..."
                  className="w-full rounded-lg border border-[#e4b86a]/40 bg-[#0d1322] px-3 py-2 text-xs text-[#f6f1e8]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#e4b86a] px-3 py-2 text-xs font-bold text-[#121829] sm:w-auto sm:py-1.5"
                  >
                    Analyze My Readiness
                  </button>
                </div>
                {noctisReply ? (
                  <p className="rounded-lg border border-sky-400/35 bg-sky-950/50 p-2.5 text-[11px] leading-relaxed text-sky-100">
                    {noctisReply}
                  </p>
                ) : null}
              </form>
            ) : null}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SCREEN 1 — WORK DASHBOARD                                             */}
      {/* ===================================================================== */}
      {screen === "dashboard" ? (
        <div className="space-y-6">
          {/* 6 Main Category Cards (1 col on phone, 2 on tablet, 3 on desktop) */}
          <section
            aria-label="Main Work Categories"
            className="grid gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
          >
            {/* 1. Careers */}
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[linear-gradient(160deg,#1a233a_0%,#121829_100%)] p-4 shadow-md transition hover:border-[#f0c56a] sm:p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#e4b86a]/45 bg-[#e4b86a]/15 text-[#f0c56a]">
                    <Briefcase className="size-5" />
                  </span>
                  <h2 className="font-display text-lg font-bold text-[#f6f1e8]">Careers</h2>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#d7c4a2]">
                  Explore occupations, required skills, salary ranges, and career paths.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScreen("careers")}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e4b86a]/45 bg-[#241910]/90 px-3.5 py-2.5 text-xs font-semibold text-[#f6e3b0] transition hover:bg-[#e4b86a] hover:text-[#121829] sm:w-fit sm:py-2"
              >
                <span>Explore Careers</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* 2. Certifications */}
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[linear-gradient(160deg,#1a233a_0%,#121829_100%)] p-4 shadow-md transition hover:border-[#f0c56a] sm:p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#e4b86a]/45 bg-[#e4b86a]/15 text-[#f0c56a]">
                    <Award className="size-5" />
                  </span>
                  <h2 className="font-display text-lg font-bold text-[#f6f1e8]">Certifications</h2>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#d7c4a2]">
                  Prepare for AWS, Microsoft, CompTIA, Splunk, and other credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScreen("certifications")}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e4b86a]/45 bg-[#241910]/90 px-3.5 py-2.5 text-xs font-semibold text-[#f6e3b0] transition hover:bg-[#e4b86a] hover:text-[#121829] sm:w-fit sm:py-2"
              >
                <span>Browse Certifications</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* 3. Skilled Trades */}
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[linear-gradient(160deg,#1a233a_0%,#121829_100%)] p-4 shadow-md transition hover:border-[#f0c56a] sm:p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#e4b86a]/45 bg-[#e4b86a]/15 text-[#f0c56a]">
                    <Hammer className="size-5" />
                  </span>
                  <h2 className="font-display text-lg font-bold text-[#f6f1e8]">Skilled Trades</h2>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#d7c4a2]">
                  Learn carpentry, masonry, construction, plumbing, electrical, and automotive
                  skills.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScreen("trades")}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e4b86a]/45 bg-[#241910]/90 px-3.5 py-2.5 text-xs font-semibold text-[#f6e3b0] transition hover:bg-[#e4b86a] hover:text-[#121829] sm:w-fit sm:py-2"
              >
                <span>Explore Trades</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* 4. Projects */}
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[linear-gradient(160deg,#1a233a_0%,#121829_100%)] p-4 shadow-md transition hover:border-[#f0c56a] sm:p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#e4b86a]/45 bg-[#e4b86a]/15 text-[#f0c56a]">
                    <FolderKanban className="size-5" />
                  </span>
                  <h2 className="font-display text-lg font-bold text-[#f6f1e8]">Projects</h2>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#d7c4a2]">
                  Build real-world projects and practical proof of what you can do.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScreen("projects")}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e4b86a]/45 bg-[#241910]/90 px-3.5 py-2.5 text-xs font-semibold text-[#f6e3b0] transition hover:bg-[#e4b86a] hover:text-[#121829] sm:w-fit sm:py-2"
              >
                <span>Start a Project</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* 5. Jobs & Opportunities */}
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[linear-gradient(160deg,#1a233a_0%,#121829_100%)] p-4 shadow-md transition hover:border-[#f0c56a] sm:p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#e4b86a]/45 bg-[#e4b86a]/15 text-[#f0c56a]">
                    <Compass className="size-5" />
                  </span>
                  <h2 className="font-display text-lg font-bold text-[#f6f1e8]">
                    Jobs &amp; Opportunities
                  </h2>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#d7c4a2]">
                  Find jobs, internships, apprenticeships, and career openings matched to your
                  skills.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScreen("opportunities")}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e4b86a]/45 bg-[#241910]/90 px-3.5 py-2.5 text-xs font-semibold text-[#f6e3b0] transition hover:bg-[#e4b86a] hover:text-[#121829] sm:w-fit sm:py-2"
              >
                <span>Browse Opportunities</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* 6. Your Portfolio */}
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[linear-gradient(160deg,#1a233a_0%,#121829_100%)] p-4 shadow-md transition hover:border-[#f0c56a] sm:p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#e4b86a]/45 bg-[#e4b86a]/15 text-[#f0c56a]">
                    <FileCheck2 className="size-5" />
                  </span>
                  <h2 className="font-display text-lg font-bold text-[#f6f1e8]">Your Portfolio</h2>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#d7c4a2]">
                  Showcase your projects, certifications, and verified skills to employers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScreen("passport")}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e4b86a]/45 bg-[#241910]/90 px-3.5 py-2.5 text-xs font-semibold text-[#f6e3b0] transition hover:bg-[#e4b86a] hover:text-[#121829] sm:w-fit sm:py-2"
              >
                <span>View Portfolio</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </section>

          {/* Middle Band: Your Career Journey + Career Readiness + Skills Passport */}
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(15rem,0.9fr)]">
            {/* Left/Center Card: Your Career Journey + Your Progress (Readiness Ring) */}
            <div className="min-w-0 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 shadow-lg sm:p-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.85fr)] xl:items-center xl:gap-6">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold text-[#f6f1e8]">
                    Your Career Journey
                  </h2>
                  <p className="mt-0.5 text-xs text-[#d7c4a2]">
                    How your learning connects to real-world outcomes:
                  </p>

                  {/* 5 Connected Journey Stages (balanced 2-col grid on phones, 5-col on sm+) */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-5">
                    {[
                      {
                        label: "Learn Skills",
                        sub: "Learn Tab",
                        icon: BookOpen,
                        onClick: () => {
                          if (onOpenLearn) onOpenLearn();
                          else void navigate({ to: "/learn" });
                        },
                      },
                      {
                        label: "Earn Credentials",
                        sub: "Certifications",
                        icon: Award,
                        onClick: () => setScreen("certifications"),
                      },
                      {
                        label: "Build Experience",
                        sub: "Projects & Trades",
                        icon: Wrench,
                        onClick: () => setScreen("projects"),
                      },
                      {
                        label: "Show Proof",
                        sub: "Skills Passport",
                        icon: ClipboardCheck,
                        onClick: () => setScreen("passport"),
                      },
                      {
                        label: "Get Opportunities",
                        sub: "Matched Roles",
                        icon: Briefcase,
                        onClick: () => setScreen("opportunities"),
                      },
                    ].map((stage, idx) => {
                      const StageIcon = stage.icon;
                      return (
                        <button
                          key={stage.label}
                          type="button"
                          onClick={stage.onClick}
                          className={cn(
                            "group flex flex-col items-center rounded-xl border border-[#e4b86a]/30 bg-[#0d1322]/85 p-3 text-center transition hover:border-[#f0c56a] hover:bg-[#1b2540]",
                            idx === 4 && "col-span-2 sm:col-span-1",
                          )}
                        >
                          <span className="grid size-10 place-items-center rounded-full border border-[#e4b86a]/50 bg-[#e4b86a]/15 text-[#f0c56a] group-hover:scale-105">
                            <StageIcon className="size-4" />
                          </span>
                          <span className="mt-2 text-xs font-bold text-[#f6f1e8]">
                            {stage.label}
                          </span>
                          <span className="mt-0.5 text-[10px] text-[#9aa4bf]">{stage.sub}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Outstanding Skills Callout */}
                  <div className="mt-4 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/75 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#f6e3b0]">
                        Selected Goal: {activeCareer.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleBuildCareerJourney(activeCareer.id, false)}
                        className="text-[11px] font-bold text-[#f0c56a] underline hover:text-[#f6e3b0]"
                      >
                        Build My Career Journey →
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#d7c4a2]">
                      <strong>Completed skills:</strong>{" "}
                      {readiness.completedSkills.join(", ") || "None yet"} ·{" "}
                      <strong>Outstanding skills:</strong>{" "}
                      {readiness.outstandingSkills.join(", ") ||
                        "All required skills demonstrated"}
                    </p>
                  </div>
                </div>

                {/* Career Readiness Ring */}
                <div className="min-w-0 rounded-2xl border border-[#e4b86a]/35 bg-[#0d1322]/90 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#d7c4a2]">
                    Your Progress
                  </p>
                  <div className="mt-3 flex flex-col items-start gap-3.5 sm:flex-row sm:items-center sm:gap-4">
                    <div className="relative grid size-20 shrink-0 place-items-center rounded-full border-4 border-[#e4b86a] bg-[#162038] shadow-inner">
                      <span className="font-display text-xl font-extrabold text-[#f6e3b0]">
                        {readiness.readinessPct}%
                      </span>
                    </div>
                    <div className="min-w-0 space-y-1 text-xs">
                      <p className="font-bold text-[#f6f1e8]">
                        Career Readiness: {readiness.readinessPct}%
                      </p>
                      <p className="text-[#d7c4a2]">
                        • {readiness.completedSkills.length}/{activeCareer.requiredSkills.length}{" "}
                        Skills · {completedProjectsCount} Projects · {credentialsInProgressCount}{" "}
                        Cert in Progress
                      </p>
                      <p className="text-[10px] leading-snug text-[#9aa4bf]">
                        {readiness.scoringFormulaExplanation} {readiness.disclaimer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Skills Passport Summary */}
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 shadow-lg sm:p-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-[#f6f1e8]">Skills Passport</h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#e4b86a]/40 bg-[#0d1322] px-2.5 py-0.5 text-[10px] font-semibold text-[#f6e3b0]">
                    <Lock className="size-3" />
                    {VISIBILITY_LABELS[store.defaultPortfolioVisibility].label}
                  </span>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs">
                  <li className="flex items-center justify-between gap-2 rounded-xl border border-[#e4b86a]/20 bg-[#0d1322]/75 px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2 text-[#d7c4a2]">
                      <CheckCircle2 className="size-4 shrink-0 text-[#f0c56a]" />
                      <span className="truncate">Verified &amp; Demonstrated Skills</span>
                    </span>
                    <strong className="shrink-0 text-sm text-[#f6f1e8]">{verifiedSkillsCount}</strong>
                  </li>
                  <li className="flex items-center justify-between gap-2 rounded-xl border border-[#e4b86a]/20 bg-[#0d1322]/75 px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2 text-[#d7c4a2]">
                      <CheckCircle2 className="size-4 shrink-0 text-[#f0c56a]" />
                      <span className="truncate">Projects Completed</span>
                    </span>
                    <strong className="shrink-0 text-sm text-[#f6f1e8]">{completedProjectsCount}</strong>
                  </li>
                  <li className="flex items-center justify-between gap-2 rounded-xl border border-[#e4b86a]/20 bg-[#0d1322]/75 px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2 text-[#d7c4a2]">
                      <CheckCircle2 className="size-4 shrink-0 text-[#f0c56a]" />
                      <span className="truncate">Credentials in Progress</span>
                    </span>
                    <strong className="shrink-0 text-sm text-[#f6f1e8]">{credentialsInProgressCount}</strong>
                  </li>
                  <li className="flex items-center justify-between gap-2 rounded-xl border border-[#e4b86a]/20 bg-[#0d1322]/75 px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2 text-[#d7c4a2]">
                      <CheckCircle2 className="size-4 shrink-0 text-[#f0c56a]" />
                      <span className="truncate">Practical Experience</span>
                    </span>
                    <strong className="shrink-0 text-sm text-[#f6f1e8]">
                      {practicalTasksCompletedCount} Tasks
                    </strong>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setScreen("passport")}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e4b86a] to-[#c89238] px-4 py-2.5 text-xs font-bold text-[#121829] shadow transition hover:brightness-110"
              >
                <span>View My Passport</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </section>

          {/* Bottom Band: Recommended Next Steps + Opportunities for You */}
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,1fr)]">
            {/* Recommended Next Steps (2x2 Grid matching mockup) */}
            <div className="min-w-0 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 shadow-lg sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-[#f6f1e8]">
                  Recommended Next Steps
                </h2>
                <span className="text-[11px] text-[#d7c4a2]">
                  Coordinated by Noctis for {activeCareer.title}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {recommendedSteps.slice(0, 4).map((step) => (
                  <div
                    key={step.id}
                    className="flex min-w-0 flex-col justify-between rounded-xl border border-[#e4b86a]/30 bg-[#0d1322]/90 p-4"
                  >
                    <div>
                      <span className="inline-block rounded-md border border-[#e4b86a]/45 bg-[#e4b86a]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#f0c56a]">
                        {step.badge}
                      </span>
                      <h3 className="mt-2 text-sm font-bold text-[#f6f1e8]">{step.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#d7c4a2]">{step.subtitle}</p>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (step.targetScreen === "learn") {
                            if (onOpenLearn) onOpenLearn();
                            else void navigate({ to: "/learn" });
                            return;
                          }
                          if (step.targetScreen === "journey") {
                            if (onOpenJourney) onOpenJourney();
                            else void navigate({ to: "/start" });
                            return;
                          }
                          if (step.targetScreen === "projects" && step.targetId) {
                            setSelectedProjectId(step.targetId);
                          }
                          setScreen(step.targetScreen);
                        }}
                        className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-[#e4b86a]/50 bg-[#241910] px-3 py-2 text-xs font-semibold text-[#f6e3b0] transition hover:bg-[#e4b86a] hover:text-[#121829] sm:w-auto sm:py-1.5"
                      >
                        <span>Open</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities for You (Right Column matching mockup) */}
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 shadow-lg sm:p-5">
              <div>
                <h2 className="font-display text-lg font-bold text-[#f6f1e8]">
                  Opportunities for You
                </h2>
                <p className="mt-0.5 text-xs text-[#d7c4a2]">
                  Skill-matched openings with transparent gap analysis
                </p>

                <ul className="mt-4 space-y-2.5">
                  {topOpportunities.map((item) => (
                    <li
                      key={item.opportunity.id}
                      className="rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/90 p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-[#f6f1e8]">
                            {item.opportunity.title}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-[#d7c4a2]">
                            {item.opportunity.location} · {item.opportunity.type}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-lg border border-emerald-400/45 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                          Match {item.matchPct}%
                        </span>
                      </div>
                      {item.missingSkills.length > 0 ? (
                        <p className="mt-2 text-[10px] text-amber-200/90">
                          Missing skills: {item.missingSkills.join(", ")}
                        </p>
                      ) : (
                        <p className="mt-2 text-[10px] text-emerald-300">
                          All required core skills demonstrated in Passport
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setScreen("opportunities")}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e4b86a]/45 bg-[#0d1322] px-4 py-2.5 text-xs font-semibold text-[#f6e3b0] transition hover:bg-[#1e2942]"
              >
                <span>View All Opportunities</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {/* ===================================================================== */}
      {/* SCREEN 2 — CAREER EXPLORER                                            */}
      {/* ===================================================================== */}
      {screen === "careers" ? (
        <section
          aria-label="Career Explorer"
          className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-6"
        >
          {/* Career List Sidebar */}
          <div className="min-w-0 space-y-3 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4">
            <h2 className="font-display text-base font-bold text-[#f6f1e8]">
              Screen 2 · Career Explorer
            </h2>
            <p className="text-xs text-[#d7c4a2]">
              Select an occupation to inspect responsibilities, entry pathways, salaries, and build
              your Journey.
            </p>
            <div className="space-y-2">
              {filteredCareers.map((career) => {
                const active = career.id === explorerCareer.id;
                const careerReadiness = computeCareerReadiness(career.id, journeyStore, store);
                return (
                  <button
                    key={career.id}
                    type="button"
                    onClick={() => setSelectedCareerId(career.id)}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition",
                      active
                        ? "border-[#f0c56a] bg-[#241910]"
                        : "border-[#e4b86a]/25 bg-[#0d1322]/85 hover:border-[#e4b86a]/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-xs font-bold text-[#f6f1e8]">
                        {career.title}
                      </span>
                      <span className="shrink-0 rounded-md bg-[#e4b86a]/20 px-2 py-0.5 text-[10px] font-bold text-[#f6e3b0]">
                        {careerReadiness.readinessPct}% Ready
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#d7c4a2]">
                      {career.salaryRange.rangeText}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Career Detail Panel (All 11 Spec B Fields) */}
          <div className="min-w-0 space-y-5 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e4b86a]/25 pb-4">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#f0c56a]">
                  Career ID: {explorerCareer.id} · {explorerCareer.category}
                </span>
                <h2 className="mt-1 font-display text-xl font-bold text-[#f6f1e8] sm:text-2xl">
                  {explorerCareer.title}
                </h2>
                <p className="mt-2 max-w-3xl text-xs leading-relaxed text-[#d7c4a2] sm:text-sm">
                  {explorerCareer.description}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => handleBuildCareerJourney(explorerCareer.id, false)}
                  className="w-full rounded-xl bg-gradient-to-r from-[#e4b86a] to-[#c89238] px-4 py-2.5 text-xs font-bold text-[#121829] shadow transition hover:brightness-110 sm:w-auto"
                >
                  Build My Career Journey
                </button>
                <button
                  type="button"
                  onClick={() => handleBuildCareerJourney(explorerCareer.id, true)}
                  className="w-full rounded-xl border border-[#e4b86a]/50 bg-[#0d1322] px-4 py-2.5 text-xs font-semibold text-[#f6e3b0] hover:bg-[#1e2942] sm:w-auto"
                >
                  Build &amp; Open in Journey →
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/85 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                  Core Responsibilities
                </h3>
                <ul className="mt-2.5 space-y-1.5 text-xs text-[#e7d9be]">
                  {explorerCareer.responsibilities.map((resp) => (
                    <li key={resp} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#f0c56a]" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/85 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                  Required &amp; Preferred Skills
                </h3>
                <p className="mt-2 text-[11px] font-semibold text-[#d7c4a2]">Required Skills:</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {explorerCareer.requiredSkills.map((skill) => {
                    const hasSkill = demonstratedSkills.some(
                      (s) => s.toLowerCase() === skill.toLowerCase(),
                    );
                    return (
                      <span
                        key={skill}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-[11px] font-medium",
                          hasSkill
                            ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                            : "border-[#e4b86a]/35 bg-[#162038] text-[#f6e3b0]",
                        )}
                      >
                        {hasSkill ? "✓ " : ""}
                        {skill}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11px] font-semibold text-[#d7c4a2]">Preferred Skills:</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {explorerCareer.preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-[#d7c4a2]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="min-w-0 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/85 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                  Typical Entry Pathways &amp; Practical Experience
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-[#e7d9be]">
                  {explorerCareer.entryPathways.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-white/10 pt-2 text-xs text-[#d7c4a2]">
                  <strong>Practical Experience Requirement:</strong>{" "}
                  {explorerCareer.practicalExperienceRequirements}
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/85 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                  Salary Range, Market Context &amp; Provenance
                </h3>
                <p className="mt-2 text-sm font-bold text-[#f6e3b0]">
                  {explorerCareer.salaryRange.rangeText} ({explorerCareer.salaryRange.region})
                </p>
                <p className="mt-0.5 text-[11px] text-[#9aa4bf]">
                  Source: {explorerCareer.salaryRange.source} ({explorerCareer.salaryRange.sourceDate})
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#e7d9be]">
                  {explorerCareer.jobMarketContext}
                </p>
                <p className="mt-2 text-[11px] text-[#9aa4bf]">
                  Refs:{" "}
                  {explorerCareer.sources
                    .map((s) => `${s.name} (Verified ${s.lastVerifiedDate})`)
                    .join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===================================================================== */}
      {/* SCREEN 3 — CERTIFICATIONS AND QUALIFICATIONS                          */}
      {/* ===================================================================== */}
      {screen === "certifications" ? (
        <section aria-label="Certifications and Qualifications" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-[#f6f1e8] sm:text-xl">
                Screen 3 · Certifications &amp; Qualifications
              </h2>
              <p className="mt-1 text-xs text-[#d7c4a2]">
                Official vendor catalogues are the source of truth. Completing a Vibe prep course
                prepares you for the exam — it does not grant the external vendor certification.
              </p>
            </div>
            <div className="-mx-1 flex w-full items-center gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {["All", "AWS", "Microsoft", "CompTIA", "Splunk", "Cisco", "ISC2", "NCCER / ASE"].map(
                (prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setProviderFilter(prov)}
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      providerFilter === prov
                        ? "bg-[#e4b86a] text-[#121829]"
                        : "border border-[#e4b86a]/30 bg-[#0d1322] text-[#d7c4a2] hover:text-[#f6f1e8]",
                    )}
                  >
                    {prov}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredCredentials.map((cred) => {
              const inProgress = Boolean(store.externalCredentialClaims[cred.id]);
              return (
                <div
                  key={cred.id}
                  className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 shadow-md sm:p-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="rounded-md bg-[#e4b86a]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#f0c56a]">
                          {cred.provider} · {cred.code}
                        </span>
                        <h3 className="mt-1.5 font-display text-base font-bold text-[#f6f1e8] sm:text-lg">
                          {cred.officialName}
                        </h3>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase",
                          cred.status === "active"
                            ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                            : "border-amber-400/50 bg-amber-500/15 text-amber-200",
                        )}
                      >
                        {cred.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#d7c4a2]">
                      <strong>Exam Version:</strong> {cred.examVersion} ·{" "}
                      <strong>Prerequisites:</strong> {cred.prerequisitesAndEligibility.join("; ")}
                    </p>

                    <div className="rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/80 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#f0c56a]">
                        Official Exam Objectives
                      </p>
                      <ul className="mt-1.5 space-y-1 text-xs text-[#e7d9be]">
                        {cred.examObjectives.map((obj) => (
                          <li key={obj}>• {obj}</li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-[11px] text-amber-200/90">{cred.issuerDistinctionNote}</p>

                    <p className="text-[11px] text-[#9aa4bf]">
                      <strong>Renewal &amp; Policy:</strong> {cred.examAndRenewalInfo} ·{" "}
                      <strong>Last Verified:</strong> {cred.lastVerifiedDate}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-2.5 border-t border-[#e4b86a]/20 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <a
                      href={cred.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#f0c56a] underline hover:text-[#f6e3b0]"
                    >
                      <span>Official {cred.provider} Exam Page</span>
                      <ExternalLink className="size-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleStartCertPrep(cred.id)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e4b86a] to-[#c89238] px-4 py-2.5 text-xs font-bold text-[#121829] shadow transition hover:brightness-110 sm:w-auto sm:py-2"
                    >
                      <GraduationCap className="size-4" />
                      <span>
                        {inProgress ? "Continue Prep in Learn" : "Start Preparation in Learn"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ===================================================================== */}
      {/* SCREEN 4 — SKILLED TRADES                                             */}
      {/* ===================================================================== */}
      {screen === "trades" ? (
        <section aria-label="Skilled Trades Pathways" className="space-y-5">
          {/* Mandatory Safety & Licensing Notice (Spec Section D) */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/55 bg-amber-500/10 p-4 text-xs text-amber-100">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-300" />
            <div className="min-w-0">
              <p className="font-bold text-amber-200">
                Trade Safety &amp; Supervised Qualification Notice
              </p>
              <p className="mt-0.5 leading-relaxed">
                Online lessons, videos, and simulations in Vibe support theoretical preparation and
                task planning. They{" "}
                <strong>do not replace physical safety training, licensed supervision,</strong> or
                state/provincial trade licensing exams.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6">
            {/* All 8 Trade Occupation Pathways */}
            <div className="min-w-0 space-y-2 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4">
              <h2 className="font-display text-base font-bold text-[#f6f1e8]">
                Screen 4 · 8 Skilled Trades
              </h2>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
                {WORK_SKILLED_TRADES.map((trade) => {
                  const active = trade.id === selectedTrade.id;
                  return (
                    <button
                      key={trade.id}
                      type="button"
                      onClick={() => setSelectedTradeId(trade.id)}
                      className={cn(
                        "w-full rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition",
                        active
                          ? "border-[#f0c56a] bg-[#241910] text-[#f6e3b0]"
                          : "border-[#e4b86a]/25 bg-[#0d1322]/80 text-[#d7c4a2] hover:text-[#f6f1e8]",
                      )}
                    >
                      {trade.tradeName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Trade Detail */}
            <div className="min-w-0 space-y-4 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e4b86a]/25 pb-4">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#f0c56a]">
                    Skilled Trade Pathway · {selectedTrade.category}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-[#f6f1e8] sm:text-2xl">
                    {selectedTrade.tradeName}
                  </h3>
                  <p className="mt-1 text-xs text-[#d7c4a2] sm:text-sm">{selectedTrade.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenLearn) onOpenLearn();
                    else void navigate({ to: "/learn" });
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#e4b86a] to-[#c89238] px-4 py-2.5 text-xs font-bold text-[#121829] sm:w-auto"
                >
                  Open Trade Module in Learn →
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="min-w-0 rounded-xl border border-amber-400/35 bg-[#0d1322]/90 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    1. Foundational Safety Instructions
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-[#e7d9be]">
                    {selectedTrade.safetyInstructions.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="min-w-0 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/90 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                    2. Tools, Materials &amp; Demonstrations
                  </h4>
                  <p className="mt-2 text-xs text-[#e7d9be]">
                    <strong>Tools &amp; Materials:</strong>{" "}
                    {selectedTrade.toolsAndMaterials.join(", ")}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-[#d7c4a2]">
                    {selectedTrade.illustratedDemonstrations.map((demo) => (
                      <li key={demo.title}>
                        ▶ <strong>{demo.title}</strong> ({demo.duration}) — {demo.summary}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="min-w-0 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/90 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                    3. Simulated Exercise &amp; Rubric
                  </h4>
                  <p className="mt-2 text-xs font-semibold text-[#f6f1e8]">
                    {selectedTrade.simulatedPracticalExercise.title}
                  </p>
                  <p className="mt-1 text-xs text-[#e7d9be]">
                    {selectedTrade.simulatedPracticalExercise.scenario}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-300">
                    Tolerance: {selectedTrade.simulatedPracticalExercise.expectedTolerances}
                  </p>
                  <p className="mt-2 text-xs text-[#d7c4a2]">
                    <strong>Assessment Rubric:</strong>{" "}
                    {selectedTrade.projectBriefAndRubric.rubricCriteria.join(" · ")}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/90 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                    4. Supervised Practice, Apprenticeships &amp; Licensing
                  </h4>
                  <p className="mt-2 text-xs text-[#e7d9be]">
                    <strong>Supervised Hours:</strong>{" "}
                    {selectedTrade.supervisedPracticeRequirements}
                  </p>
                  <p className="mt-1.5 text-xs text-[#d7c4a2]">
                    <strong>Apprenticeship Providers:</strong>{" "}
                    {selectedTrade.apprenticeshipAndProviderLinks
                      .map((a) => `${a.name} (${a.region})`)
                      .join(", ")}
                  </p>
                  <p className="mt-1.5 text-[11px] text-[#9aa4bf]">
                    <strong>Local Licensing:</strong>{" "}
                    {selectedTrade.localLicensingAndRegulatoryNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===================================================================== */}
      {/* SCREEN 5 — PROJECTS AND PRACTICAL EXPERIENCE                          */}
      {/* ===================================================================== */}
      {screen === "projects" ? (
        <section
          aria-label="Projects and Practical Experience"
          className="grid gap-4 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-6"
        >
          {/* Project Selector */}
          <div className="min-w-0 space-y-2.5 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4">
            <h2 className="font-display text-base font-bold text-[#f6f1e8]">
              Screen 5 · Practical Projects
            </h2>
            <p className="text-xs text-[#d7c4a2]">
              Complete real-world tasks, submit artifacts, and add verified proof to your Skills
              Passport.
            </p>
            {WORK_PROJECTS.map((proj) => {
              const sub = store.projectSubmissions[proj.id];
              const active = proj.id === selectedProject.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition",
                    active
                      ? "border-[#f0c56a] bg-[#241910]"
                      : "border-[#e4b86a]/25 bg-[#0d1322]/85 hover:border-[#e4b86a]/60",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs font-bold text-[#f6f1e8]">
                      {proj.title}
                    </span>
                    <span className="shrink-0 rounded bg-[#e4b86a]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#f6e3b0]">
                      {sub?.status ?? "not-started"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#d7c4a2]">
                    {proj.category} · {proj.owner}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Project Workspace (All 10 Spec E Fields) */}
          <div className="min-w-0 space-y-5 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e4b86a]/25 pb-4">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#f0c56a]">
                  Project Brief · {selectedProject.category} · Owner: {selectedProject.owner}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-[#f6f1e8] sm:text-2xl">
                  {selectedProject.title}
                </h3>
                <p className="mt-1 text-xs text-[#d7c4a2] sm:text-sm">
                  {selectedProject.learningObjectives.join(" ")}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-bold",
                  PROVENANCE_BADGE["ai-reviewed"].tone,
                )}
              >
                {PROVENANCE_BADGE["ai-reviewed"].label}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Interactive Task Checklist */}
              <div className="min-w-0 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/90 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                  Required Tasks &amp; Deliverables
                </h4>
                <ul className="mt-3 space-y-2">
                  {selectedProject.taskChecklist.map((task) => {
                    const checked = (
                      completedTasksByProject[selectedProject.id] ?? []
                    ).includes(task.id);
                    return (
                      <li key={task.id}>
                        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-white/10 bg-[#141c30]/75 p-2.5 text-xs hover:border-[#e4b86a]/45">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              handleToggleProjectTask(selectedProject.id, task.id)
                            }
                            className="mt-0.5 size-4 shrink-0 accent-[#e4b86a]"
                          />
                          <span className="font-semibold text-[#f6f1e8]">{task.label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-[11px] text-[#9aa4bf]">
                  <strong>Deliverables:</strong> {selectedProject.requiredDeliverables.join(" · ")}
                </p>
              </div>

              {/* Evaluation Rubric & Skills Demonstrated */}
              <div className="min-w-0 space-y-4 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/90 p-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                    Skills Demonstrated
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedProject.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-[#e4b86a]/40 bg-[#e4b86a]/15 px-2.5 py-1 text-[11px] font-semibold text-[#f6e3b0]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                    Evaluation Rubric
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-[#e7d9be]">
                    {selectedProject.assessmentRubric.map((r) => (
                      <li key={r.id}>
                        • {r.criterion} ({r.weightPct}%)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Evidence & Add to Skills Passport */}
            <div className="rounded-xl border border-[#e4b86a]/40 bg-[#0d1322] p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0c56a]">
                Submit Project Evidence &amp; Add to Skills Passport
              </h4>
              <textarea
                rows={3}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Describe your implementation, architecture decisions, and how it satisfies the rubric..."
                className="mt-2.5 w-full rounded-lg border border-[#e4b86a]/35 bg-[#141c30] p-2.5 text-xs text-[#f6f1e8]"
              />
              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <span className="text-[11px] text-[#d7c4a2]">
                  {store.projectSubmissions[selectedProject.id]?.feedback ??
                    "Submit your evidence to verify skills and attach to your Skills Passport."}
                </span>
                <button
                  type="button"
                  onClick={() => handleSubmitProjectEvidence(selectedProject.id)}
                  className="w-full rounded-xl bg-gradient-to-r from-[#e4b86a] to-[#c89238] px-4 py-2.5 text-xs font-bold text-[#121829] shadow hover:brightness-110 sm:w-auto sm:py-2"
                >
                  Submit Evidence &amp; Add to Skills Passport
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===================================================================== */}
      {/* SCREEN 6 — JOBS AND OPPORTUNITIES                                     */}
      {/* ===================================================================== */}
      {screen === "opportunities" ? (
        <section aria-label="Jobs and Opportunities" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 sm:p-5">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-[#f6f1e8] sm:text-xl">
                Screen 6 · Jobs, Internships &amp; Apprenticeships
              </h2>
              <p className="mt-1 text-xs text-[#d7c4a2]">
                Explainable skill matching compares your demonstrated Skills Passport against each
                role&apos;s requirements. Match scores are readiness estimates, never hiring
                guarantees.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[#d7c4a2]">
              <input
                type="checkbox"
                checked={showExpiredOpportunities}
                onChange={(e) => setShowExpiredOpportunities(e.target.checked)}
                className="size-4 accent-[#e4b86a]"
              />
              <span>Show expired / archived listings</span>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {matchedOpportunities.map(
              ({
                opportunity,
                matchPct,
                matchingSkills,
                missingSkills,
                missingQualifications,
                isOutdatedOrExpired,
                statusBanner,
                matchExplanation,
                disclaimer,
              }) => {
                return (
                  <div
                    key={opportunity.id}
                    className={cn(
                      "flex min-w-0 flex-col justify-between rounded-2xl border p-4 shadow-md sm:p-5",
                      isOutdatedOrExpired
                        ? "border-rose-400/40 bg-[#141824]/80 opacity-85"
                        : "border-[#e4b86a]/40 bg-[#141c30]",
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md bg-[#e4b86a]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#f0c56a]">
                              {opportunity.type}
                            </span>
                            <span className="truncate text-xs font-semibold text-[#d7c4a2]">
                              {opportunity.employerOrProvider}
                            </span>
                          </div>
                          <h3 className="mt-1 font-display text-base font-bold text-[#f6f1e8] sm:text-lg">
                            {opportunity.title}
                          </h3>
                        </div>

                        <div className="shrink-0 text-right">
                          <span
                            className={cn(
                              "inline-block rounded-lg border px-2.5 py-1 text-xs font-bold",
                              isOutdatedOrExpired
                                ? "border-rose-400/50 bg-rose-500/15 text-rose-200"
                                : "border-emerald-400/50 bg-emerald-500/15 text-emerald-300",
                            )}
                          >
                            {isOutdatedOrExpired ? "EXPIRED LISTING" : `Match ${matchPct}%`}
                          </span>
                        </div>
                      </div>

                      {isOutdatedOrExpired ? (
                        <div className="flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-[11px] text-rose-200">
                          <AlertTriangle className="size-4 shrink-0 text-rose-300" />
                          <span>{statusBanner}</span>
                        </div>
                      ) : null}

                      <p className="flex flex-wrap items-center gap-3 text-xs text-[#d7c4a2]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5 shrink-0 text-[#f0c56a]" />
                          {opportunity.location} ({opportunity.workArrangement})
                        </span>
                        <span>• {opportunity.experienceLevel}</span>
                      </p>

                      <div className="space-y-1.5 rounded-xl border border-[#e4b86a]/25 bg-[#0d1322]/85 p-3 text-xs">
                        <p className="text-[#e7d9be]">{matchExplanation}</p>
                        <p className="text-emerald-300">
                          <strong>Matching Skills ({matchingSkills.length}):</strong>{" "}
                          {matchingSkills.join(", ") || "None yet"}
                        </p>
                        <p className="text-amber-200">
                          <strong>Missing Skills / Gaps ({missingSkills.length}):</strong>{" "}
                          {missingSkills.join(", ") ||
                            "None — all required skills demonstrated!"}
                        </p>
                        {missingQualifications.length > 0 ? (
                          <p className="text-sky-200">
                            <strong>Preferred Qualifications:</strong>{" "}
                            {missingQualifications.join(", ")}
                          </p>
                        ) : null}
                        <p className="text-[10px] text-[#9aa4bf]">{disclaimer}</p>
                      </div>

                      <p className="text-[11px] text-[#9aa4bf]">
                        Source: {opportunity.sourceName} · Checked {opportunity.lastCheckedDate} ·
                        Deadline {opportunity.applicationDeadline}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 border-t border-[#e4b86a]/20 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      {missingSkills.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenLearn) onOpenLearn();
                            else void navigate({ to: "/learn" });
                          }}
                          className="w-full rounded-xl border border-[#e4b86a]/50 bg-[#0d1322] px-3.5 py-2 text-xs font-semibold text-[#f6e3b0] hover:bg-[#1e2942] sm:w-auto"
                        >
                          Close Skill Gaps in Learn →
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-300">
                          ✓ Ready to share Skills Passport
                        </span>
                      )}

                      <a
                        href={opportunity.originalListingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold sm:w-auto sm:py-2",
                          isOutdatedOrExpired
                            ? "pointer-events-none border border-white/15 bg-white/5 text-white/40"
                            : "bg-gradient-to-r from-[#e4b86a] to-[#c89238] text-[#121829]",
                        )}
                      >
                        <span>
                          {isOutdatedOrExpired ? "Application Closed" : "View Employer Listing"}
                        </span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>
      ) : null}

      {/* ===================================================================== */}
      {/* SCREEN 7 — PORTFOLIO AND SKILLS PASSPORT                              */}
      {/* ===================================================================== */}
      {screen === "passport" ? (
        <section aria-label="Portfolio and Skills Passport" className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:p-5">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-[#f6f1e8] sm:text-xl">
                Screen 7 · Portfolio &amp; Skills Passport
              </h2>
              <p className="mt-1 max-w-2xl text-xs text-[#d7c4a2]">
                Every record carries explicit provenance (
                <strong>
                  Self-Reported, AI-Reviewed, Instructor-Verified, or Issuer-Verified
                </strong>
                ). Portfolio records are <strong>Private by default</strong> until you choose to
                share them.
              </p>
            </div>

            <div className="flex w-full flex-col items-stretch gap-1.5 sm:w-auto sm:items-end">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#f0c56a]">
                Default Passport Visibility
              </label>
              <select
                aria-label="Default Passport Visibility"
                value={store.defaultPortfolioVisibility}
                onChange={(e) => {
                  const vis = e.target.value as PortfolioVisibility;
                  const next = updateDefaultPortfolioVisibility(store, vis);
                  setStore(next);
                  showToast(
                    `Updated Skills Passport default visibility to "${VISIBILITY_LABELS[vis].label}".`,
                  );
                }}
                className="w-full rounded-xl border border-[#e4b86a]/50 bg-[#0d1322] px-3 py-2 text-xs font-semibold text-[#f6e3b0] sm:w-auto"
              >
                {(Object.keys(VISIBILITY_LABELS) as PortfolioVisibility[]).map((vis) => (
                  <option key={vis} value={vis}>
                    {VISIBILITY_LABELS[vis].label}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-[#9aa4bf]">
                {VISIBILITY_LABELS[store.defaultPortfolioVisibility].detail}
              </span>
            </div>
          </div>

          {/* Evidence Records List */}
          <div className="grid gap-4 md:grid-cols-2">
            {store.passportItems.map((record) => {
              const badge = PROVENANCE_BADGE[record.verificationTier];
              return (
                <div
                  key={record.id}
                  className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#e4b86a]/40 bg-[#141c30] p-4 shadow-md sm:p-5"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#f0c56a]">
                          {record.category.replace("-", " ")} · {record.issuerOrReviewer}
                        </span>
                        <h3 className="mt-1 font-display text-base font-bold text-[#f6f1e8]">
                          {record.title}
                        </h3>
                      </div>
                      <span
                        title={badge.description}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                          badge.tone,
                        )}
                      >
                        <ShieldCheck className="size-3" />
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-[#e7d9be]">{record.summary}</p>
                    <p className="text-[11px] text-[#9aa4bf]">{record.provenanceNote}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {record.skillsDemonstrated.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-[#e4b86a]/30 bg-[#0d1322] px-2 py-0.5 text-[10px] text-[#f6e3b0]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 border-t border-[#e4b86a]/20 pt-3 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <span className="text-[11px] text-[#9aa4bf]">
                      Recorded {record.dateRecorded}
                    </span>
                    <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                      <span className="text-[11px] text-[#d7c4a2]">Visibility:</span>
                      <select
                        aria-label={`Visibility for ${record.title}`}
                        value={record.visibility}
                        onChange={(e) => {
                          const next = updatePassportVisibility(
                            store,
                            record.id,
                            e.target.value as PortfolioVisibility,
                          );
                          setStore(next);
                        }}
                        className="min-w-0 flex-1 rounded-lg border border-[#e4b86a]/40 bg-[#0d1322] px-2 py-1.5 text-[11px] text-[#f6e3b0] sm:flex-initial sm:py-1"
                      >
                        {(Object.keys(VISIBILITY_LABELS) as PortfolioVisibility[]).map((vis) => (
                          <option key={vis} value={vis}>
                            {VISIBILITY_LABELS[vis].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Self-Reported External Credential / Experience */}
          <form
            onSubmit={handleAddExternalCredential}
            className="rounded-2xl border border-[#e4b86a]/35 bg-[#141c30] p-4 sm:p-5"
          >
            <h3 className="text-sm font-bold text-[#f6f1e8]">
              Add External Certification or Supervised Work Experience
            </h3>
            <p className="mt-0.5 text-xs text-[#d7c4a2]">
              External entries are labeled <strong>Self-Reported</strong> until verified with the
              issuing authority.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                value={extCredTitle}
                onChange={(e) => setExtCredTitle(e.target.value)}
                placeholder="Credential or Experience Title (e.g., CompTIA Security+)"
                className="w-full rounded-xl border border-[#e4b86a]/35 bg-[#0d1322] px-3 py-2 text-xs text-[#f6f1e8]"
              />
              <input
                type="text"
                value={extCredIssuer}
                onChange={(e) => setExtCredIssuer(e.target.value)}
                placeholder="Issuing Body (e.g., CompTIA, AWS, NCCER)"
                className="w-full rounded-xl border border-[#e4b86a]/35 bg-[#0d1322] px-3 py-2 text-xs text-[#f6f1e8]"
              />
              <input
                type="url"
                value={extCredUrl}
                onChange={(e) => setExtCredUrl(e.target.value)}
                placeholder="Verification URL (optional)"
                className="w-full rounded-xl border border-[#e4b86a]/35 bg-[#0d1322] px-3 py-2 text-xs text-[#f6f1e8]"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#e4b86a] to-[#c89238] px-4 py-2.5 text-xs font-bold text-[#121829] sm:w-auto sm:py-2"
              >
                Add to Skills Passport
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
