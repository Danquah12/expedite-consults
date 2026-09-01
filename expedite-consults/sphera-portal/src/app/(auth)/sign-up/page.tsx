"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const signUpSchema = z
  .object({
    displayName: z.string().min(2, "Name must be at least 2 characters").max(50),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpForm) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/sign-in");
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-violet-500 font-[family-name:var(--font-space)]">
            sphera
          </h1>
          <p className="mt-2 text-gray-400 text-sm">Create your account</p>
        </div>

        {/* Google */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/feed" })}
          className="w-full flex items-center justify-center gap-3 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-white font-medium transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-gray-500">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-950/40 border border-red-800 rounded-lg p-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {[
            { id: "displayName", label: "Full name", placeholder: "Your name", type: "text", autocomplete: "name" },
            { id: "username", label: "Username", placeholder: "yourhandle", type: "text", autocomplete: "username" },
            { id: "email", label: "Email", placeholder: "you@example.com", type: "email", autocomplete: "email" },
            { id: "password", label: "Password", placeholder: "Min 8 chars, 1 uppercase, 1 number", type: "password", autocomplete: "new-password" },
            { id: "confirmPassword", label: "Confirm password", placeholder: "••••••••", type: "password", autocomplete: "new-password" },
          ].map(({ id, label, placeholder, type, autocomplete }) => (
            <div key={id} className="space-y-1">
              <label htmlFor={id} className="text-sm text-gray-300">{label}</label>
              <input
                id={id}
                type={type}
                autoComplete={autocomplete}
                placeholder={placeholder}
                className={inputClass}
                {...register(id as keyof SignUpForm)}
              />
              {errors[id as keyof SignUpForm] && (
                <p className="text-red-400 text-xs">
                  {errors[id as keyof SignUpForm]?.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-violet-400 hover:text-violet-300 font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-gray-600">
          By creating an account you agree to our{" "}
          <a href="/terms" className="underline">Terms</a> and{" "}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
