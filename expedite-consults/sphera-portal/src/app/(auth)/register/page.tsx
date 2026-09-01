"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";

// ── Step config ─────────────────────────────────────────────────────────────
const steps = [
  { id: 1, label: "Account" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Interests" },
];

// ── Interest options ─────────────────────────────────────────────────────────
const interestOptions = [
  { id: "tech", label: "Technology", emoji: "💻" },
  { id: "art", label: "Art & Design", emoji: "🎨" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "books", label: "Books", emoji: "📚" },
  { id: "film", label: "Film & TV", emoji: "🎬" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "fashion", label: "Fashion", emoji: "👗" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "politics", label: "Politics", emoji: "🏛️" },
  { id: "finance", label: "Finance", emoji: "📈" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    bio: "",
  });

  /** Toggle an interest — max 8 selected */
  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 8
        ? [...prev, id]
        : prev
    );
  };

  /** Advance steps or submit on the final step */
  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      // TODO: POST to /api/auth/register with form + selectedInterests
      await new Promise((r) => setTimeout(r, 2000));
      setLoading(false);
    }
  };

  // ── Password strength (0–4) ──────────────────────────────────────────────
  const passwordStrength = Math.min(
    4,
    Math.floor(form.password.length / 2)
  );
  const strengthColor =
    form.password.length >= 8 ? "#10b981" : "#f59e0b";

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#6366f1] shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            <Zap size={18} className="text-[#0a0f1e]" />
          </div>
          <span className="text-xl font-bold sphera-gradient-text">SpheraNet</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
                  step > s.id
                    ? "bg-[#10b981] text-white"
                    : step === s.id
                    ? "bg-[#00d4ff] text-[#0a0f1e]"
                    : "bg-[#1f2937] text-[#6b7280] border border-[#1e2a3a]"
                }`}
              >
                {step > s.id ? <Check size={13} /> : s.id}
              </div>
              <span
                className={`text-xs font-medium ${
                  step >= s.id ? "text-[#f9fafb]" : "text-[#6b7280]"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-px ${
                    step > s.id ? "bg-[#10b981]" : "bg-[#1e2a3a]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Card ── */}
        <div className="sphera-surface p-6">
          {/* ── Step 1: Account credentials ── */}
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <h2 className="text-xl font-bold text-[#f9fafb]">
                  Create your account
                </h2>
                <p className="text-sm text-[#9ca3af] mt-1">
                  Join the sovereign network on SpheraNet
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] placeholder:text-[#6b7280] text-sm focus:outline-none focus:border-[#00d4ff] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Min. 8 characters"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] placeholder:text-[#6b7280] text-sm focus:outline-none focus:border-[#00d4ff] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength meter */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor:
                              i <= passwordStrength
                                ? strengthColor
                                : "#1e2a3a",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strengthColor }}>
                      {form.password.length >= 8
                        ? "Strong password"
                        : "Use 8+ characters for a stronger password"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Profile setup ── */}
          {step === 2 && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <h2 className="text-xl font-bold text-[#f9fafb]">
                  Set up your profile
                </h2>
                <p className="text-sm text-[#9ca3af] mt-1">
                  Tell the world who you are
                </p>
              </div>

              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#6366f1] flex items-center justify-center text-3xl font-bold text-[#0a0f1e] cursor-pointer hover:opacity-90 transition-opacity select-none">
                  {form.name ? form.name[0]?.toUpperCase() : "?"}
                </div>
                <button className="text-xs text-[#00d4ff] hover:underline">
                  Upload photo
                </button>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                  />
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Your full name"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] placeholder:text-[#6b7280] text-sm focus:outline-none focus:border-[#00d4ff] transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm font-medium">
                    @
                  </span>
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_.]/g, ""),
                      })
                    }
                    placeholder="your_username"
                    className="w-full h-11 pl-8 pr-4 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] placeholder:text-[#6b7280] text-sm focus:outline-none focus:border-[#00d4ff] transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Bio{" "}
                  <span className="text-[#6b7280] font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell people a little about yourself..."
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] placeholder:text-[#6b7280] text-sm focus:outline-none focus:border-[#00d4ff] transition-all resize-none"
                />
                <p className="text-right text-xs text-[#6b7280] mt-1">
                  {form.bio.length}/160
                </p>
              </div>
            </div>
          )}

          {/* ── Step 3: Interests ── */}
          {step === 3 && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <h2 className="text-xl font-bold text-[#f9fafb]">
                  What are you into?
                </h2>
                <p className="text-sm text-[#9ca3af] mt-1">
                  Pick up to 8 interests to personalise your feed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {interestOptions.map((interest) => {
                  const selected = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all text-sm font-medium ${
                        selected
                          ? "border-[#00d4ff] bg-[rgba(0,212,255,0.1)] text-[#00d4ff]"
                          : "border-[#1e2a3a] bg-[#111827] text-[#9ca3af] hover:border-[#374151] hover:text-[#f9fafb]"
                      }`}
                    >
                      <span className="text-lg leading-none">
                        {interest.emoji}
                      </span>
                      <span className="truncate">{interest.label}</span>
                      {selected && (
                        <Check size={13} className="ml-auto flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[#6b7280] text-center">
                {selectedInterests.length}/8 selected
              </p>
            </div>
          )}

          {/* ── Primary CTA ── */}
          <button
            onClick={handleNext}
            disabled={loading}
            className="mt-6 w-full h-11 rounded-xl bg-[#00d4ff] text-[#0a0f1e] font-semibold text-sm hover:bg-[#00bce0] transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 rounded-full border-2 border-[#0a0f1e] border-t-transparent animate-spin" />
            ) : (
              <>
                {step === 3 ? "Join SpheraNet" : "Continue"}
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Sign-in link (step 1 only) */}
          {step === 1 && (
            <p className="text-center text-xs text-[#6b7280] mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-[#00d4ff] hover:underline">
                Sign in
              </Link>
            </p>
          )}

          {/* Back button (steps 2–3) */}
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="mt-3 w-full text-sm text-[#6b7280] hover:text-[#9ca3af] transition-colors"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Legal footer */}
        <p className="text-center text-xs text-[#6b7280] mt-4">
          By joining, you agree to SpheraNet&apos;s{" "}
          <Link
            href="/legal/terms"
            className="text-[#00d4ff] hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="text-[#00d4ff] hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
