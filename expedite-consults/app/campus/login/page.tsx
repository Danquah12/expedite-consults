"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  BookOpen,
  Building2,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Check,
} from "lucide-react";

import {
  UserProfile,
  CampusClub,
  CampusCourse,
  defaultCurrentUser,
  initialCampusClubs,
  initialCampusCourses,
} from "@/lib/campus-data";

import {
  saveCurrentUser,
  saveCampusClubs,
  saveCampusCourses,
  loadCampusClubs,
  loadCampusCourses,
} from "@/lib/campus-storage";

export default function CampusLoginPage() {
  const router = useRouter();

  // Wizard state: "login" | "verify" | "onboarding-step1" | "onboarding-step2" | "onboarding-step3"
  const [stage, setStage] = useState<"login" | "verify" | "step1" | "step2" | "step3">("login");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  // New Student Profile State
  const [newProfile, setNewProfile] = useState<UserProfile>({
    id: `usr-${Date.now()}`,
    name: "",
    email: "",
    studentId: `#${Math.floor(1000 + Math.random() * 9000)}-CS-28`,
    major: "Computer Science",
    minor: "Mathematics",
    gradYear: 2028,
    classStanding: "Freshman",
    dormBuilding: "North Quad, East Hall #204",
    bio: "Passionate about software, robotics, and campus events. Excited to meet new study partners!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    role: "STUDENT",
  });

  // Onboarding starter selections
  const [availableClubs, setAvailableClubs] = useState<CampusClub[]>(initialCampusClubs);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(["cl1"]);

  const [availableCourses, setAvailableCourses] = useState<CampusCourse[]>(initialCampusCourses);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(["crs-1", "crs-2"]);

  // Email Validation Helper
  const validateEduEmail = (val: string) => {
    if (!val) return "Please enter your university email.";
    const lower = val.toLowerCase();
    if (!lower.includes("@")) return "Invalid email address.";
    const isEdu = lower.endsWith(".edu") || lower.endsWith(".ac.uk") || lower.endsWith(".state.edu");
    if (!isEdu) return "CampusSync is restricted to institutional .edu email domains.";
    return null;
  };

  // 1. Submit Email Login
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEduEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setNewProfile((prev) => ({
        ...prev,
        email: email.toLowerCase(),
        name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      }));
      setStage("verify");
    }, 700);
  };

  // 2. Submit OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStage("step1");
    }, 600);
  };

  // 3. Quick Role Presets (For instant testing)
  const handleQuickPresetLogin = (preset: "student" | "officer" | "faculty") => {
    let user: UserProfile;

    if (preset === "student") {
      user = defaultCurrentUser;
    } else if (preset === "officer") {
      user = {
        id: "usr-jane-doe",
        name: "Jane Doe",
        email: "j.doe@state.edu",
        studentId: "#4412-CS-25",
        major: "Computer Science & Engineering",
        gradYear: 2025,
        classStanding: "Senior",
        dormBuilding: "University Apartments #4B",
        bio: "President of ACM Student Chapter. Organizing Hackathons, tech mixers, and developer workshops.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        isVerified: true,
        role: "CLUB_LEAD",
      };
    } else {
      user = {
        id: "usr-dr-hayes",
        name: "Dr. Catherine Hayes",
        email: "c.hayes@state.edu",
        studentId: "#FAC-8891",
        major: "Department of Computer Science",
        gradYear: 2012,
        classStanding: "Graduate",
        dormBuilding: "Science Complex Rm 302",
        bio: "Faculty Advisor & Professor of Algorithms (CS 301). Researching distributed systems.",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        isVerified: true,
        role: "FACULTY",
      };
    }

    saveCurrentUser(user);
    router.push("/campus");
  };

  // 4. Finish Onboarding & Save
  const handleCompleteOnboarding = () => {
    setIsLoading(true);

    // Update clubs membership state
    const updatedClubs = availableClubs.map((club) => ({
      ...club,
      isJoined: selectedClubIds.includes(club.id),
      membersCount: selectedClubIds.includes(club.id) ? club.membersCount + 1 : club.membersCount,
    }));
    saveCampusClubs(updatedClubs);

    // Update courses enrollment state
    const updatedCourses = availableCourses.map((crs) => ({
      ...crs,
      isEnrolled: selectedCourseIds.includes(crs.id),
    }));
    saveCampusCourses(updatedCourses);

    // Save user profile
    saveCurrentUser(newProfile);

    setTimeout(() => {
      setIsLoading(false);
      router.push("/campus");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/25">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">CampusSync</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
                .EDU PORTAL
              </span>
            </div>
            <span className="text-xs text-slate-400">State University Community Portal</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/campus")}
          className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
        >
          <span>Explore as Guest</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Form Center Stage */}
      <main className="max-w-xl mx-auto px-4 py-8 w-full relative z-10">
        
        {/* STAGE 1: EMAIL LOGIN */}
        {stage === "login" && (
          <div className="bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in">
            
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Single Sign-On & Verification</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Sign In with Campus Email</h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                Join student clubs, explore live campus happenings, and find study buddies for your courses.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Institutional Email (.edu)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="student@state.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    required
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-500 font-medium"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                    .EDU
                  </span>
                </div>

                {emailError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Magic Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Presets */}
            <div className="pt-6 border-t border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold uppercase tracking-wider">⚡ Instant Test Presets:</span>
                <span className="text-[11px] text-indigo-400">Skip email verification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickPresetLogin("student")}
                  className="bg-slate-900/80 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500/60 p-3 rounded-xl text-left transition group"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-indigo-300">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    <span>Undergrad</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Alex Rivera (Junior)</div>
                </button>

                <button
                  onClick={() => handleQuickPresetLogin("officer")}
                  className="bg-slate-900/80 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500/60 p-3 rounded-xl text-left transition group"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-indigo-300">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Club President</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Jane Doe (ACM Lead)</div>
                </button>

                <button
                  onClick={() => handleQuickPresetLogin("faculty")}
                  className="bg-slate-900/80 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500/60 p-3 rounded-xl text-left transition group"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-indigo-300">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Faculty Advisor</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Dr. C. Hayes (CS)</div>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STAGE 2: OTP VERIFICATION */}
        {stage === "verify" && (
          <div className="bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Check Your Inbox</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We sent a 6-digit campus verification code to <span className="font-bold text-white">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={otpCode[idx] || (idx < 4 ? `${idx + 2}` : "7")}
                    onChange={(e) => {
                      const next = [...otpCode];
                      next[idx] = e.target.value;
                      setOtpCode(next);
                    }}
                    className="w-11 h-13 text-center text-xl font-bold bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStage("login")}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Use a different email address
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ONBOARDING STEP 1: ACADEMIC PROFILE */}
        {stage === "step1" && (
          <div className="bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in">
            
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="text-indigo-400">Step 1 of 3: Academic Identity</span>
              <span>33% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-indigo-500 rounded-full" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Create Your Student Profile</h2>
              <p className="text-xs text-slate-400 mt-1">
                Help classmates find you in lecture study pods and student organizations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  placeholder="e.g. Maya Chen"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Major
                  </label>
                  <select
                    value={newProfile.major}
                    onChange={(e) => setNewProfile({ ...newProfile, major: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Biology">Biology</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Class Standing
                  </label>
                  <select
                    value={newProfile.classStanding}
                    onChange={(e) => setNewProfile({ ...newProfile, classStanding: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Freshman">Freshman (Class of 2029)</option>
                    <option value="Sophomore">Sophomore (Class of 2028)</option>
                    <option value="Junior">Junior (Class of 2027)</option>
                    <option value="Senior">Senior (Class of 2026)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Dorm Hall / Campus Housing
                </label>
                <input
                  type="text"
                  value={newProfile.dormBuilding}
                  onChange={(e) => setNewProfile({ ...newProfile, dormBuilding: e.target.value })}
                  placeholder="e.g. North Quad, West Hall #304"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  value={newProfile.bio}
                  onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
                  placeholder="What are your academic interests and hobbies?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setStage("step2")}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <span>Next: Choose Student Clubs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ONBOARDING STEP 2: CLUBS DISCOVERY */}
        {stage === "step2" && (
          <div className="bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in">
            
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="text-indigo-400">Step 2 of 3: Student Organizations</span>
              <span>66% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-indigo-500 rounded-full" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Join Campus Organizations</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select clubs to customize your private feeds, workshop alerts, and club chats.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {availableClubs.map((club) => {
                const isSelected = selectedClubIds.includes(club.id);
                return (
                  <div
                    key={club.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedClubIds(selectedClubIds.filter((id) => id !== club.id));
                      } else {
                        setSelectedClubIds([...selectedClubIds, club.id]);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-indigo-950/60 border-indigo-500 text-white"
                        : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-2xl">{club.logo}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold line-clamp-1">{club.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{club.category}</div>
                      <div className="text-[10px] text-indigo-400 mt-1 font-semibold">{club.membersCount} members</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStage("step1")}
                className="w-1/3 bg-slate-900 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3.5 rounded-xl transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStage("step3")}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <span>Next: Course Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ONBOARDING STEP 3: COURSE SCHEDULE */}
        {stage === "step3" && (
          <div className="bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in">
            
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="text-indigo-400">Step 3 of 3: Course Schedule</span>
              <span>100% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-full h-full bg-emerald-500 rounded-full" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Enroll in Your Semester Courses</h2>
              <p className="text-xs text-slate-400 mt-1">
                We will match you with classmates in the same lecture sections for midterm study pods.
              </p>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {availableCourses.map((course) => {
                const isEnrolled = selectedCourseIds.includes(course.id);
                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      if (isEnrolled) {
                        setSelectedCourseIds(selectedCourseIds.filter((id) => id !== course.id));
                      } else {
                        setSelectedCourseIds([...selectedCourseIds, course.id]);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isEnrolled
                        ? "bg-emerald-950/50 border-emerald-500 text-white"
                        : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-indigo-400">{course.code}</span>
                        <span className="text-xs font-bold">{course.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{course.schedule}</div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isEnrolled ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                      {isEnrolled ? "Enrolled ✓" : "+ Add"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStage("step2")}
                className="w-1/3 bg-slate-900 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3.5 rounded-xl transition"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCompleteOnboarding}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter CampusSync</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-4 w-full text-center text-xs text-slate-500">
        CampusSync Enterprise Platform • Verified for State University Students & Faculty
      </footer>

    </div>
  );
}
