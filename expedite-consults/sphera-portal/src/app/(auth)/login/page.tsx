"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: call NextAuth signIn or custom auth endpoint
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative">
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#6366f1] shadow-[0_0_30px_rgba(0,212,255,0.4)]">
              <Zap size={22} className="text-[#0a0f1e]" />
            </div>
            <span className="text-2xl font-bold sphera-gradient-text">SpheraNet</span>
          </div>

          {/* Hero tagline */}
          <h1 className="text-5xl font-bold text-[#f9fafb] leading-tight mb-6">
            Your Sovereign
            <br />
            <span className="sphera-gradient-text">Social Graph</span>
            <br />
            Awaits.
          </h1>
          <p className="text-[#9ca3af] text-lg leading-relaxed max-w-sm">
            One account. Social feed, encrypted messenger, 4K reels, local bazaar, career passports, and gaming arena — all connected.
          </p>
        </div>

        {/* World pills */}
        <div className="relative z-10">
          <p className="text-xs text-[#6b7280] mb-4 uppercase tracking-wider">
            12 worlds. One identity.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "🏠 Social Feed",
              "💬 SpheraChat",
              "🎥 Reels",
              "🛒 Bazaar",
              "💼 Career",
              "🎓 Campus",
              "🎮 Gaming",
              "🤖 Sphera AI",
            ].map((w) => (
              <span
                key={w}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(0,212,255,0.08)] text-[#00d4ff] border border-[rgba(0,212,255,0.2)]"
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,212,255,0.03) 0%, rgba(99,102,241,0.05) 100%)",
          }}
        />
      </div>

      {/* ── Right — Login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#6366f1]">
              <Zap size={16} className="text-[#0a0f1e]" />
            </div>
            <span className="text-xl font-bold sphera-gradient-text">SpheraNet</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#f9fafb] mb-1">
              Welcome back
            </h2>
            <p className="text-[#9ca3af] text-sm">
              Sign in to your SpheraNet account
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] text-sm font-medium hover:bg-[#1f2937] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] text-sm font-medium hover:bg-[#1f2937] transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#1e2a3a]" />
            <span className="text-xs text-[#6b7280]">or continue with email</span>
            <div className="flex-1 h-px bg-[#1e2a3a]" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                Email or username
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] placeholder:text-[#6b7280] text-sm focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[rgba(0,212,255,0.2)] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#9ca3af]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#00d4ff] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#1e2a3a] bg-[#111827] text-[#f9fafb] placeholder:text-[#6b7280] text-sm focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[rgba(0,212,255,0.2)] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#00d4ff] text-[#0a0f1e] font-semibold text-sm hover:bg-[#00bce0] transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-[#0a0f1e] border-t-transparent animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b7280] mt-6">
            New to Sphera?{" "}
            <Link
              href="/register"
              className="text-[#00d4ff] font-medium hover:underline"
            >
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
