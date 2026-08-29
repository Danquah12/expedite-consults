"use client";

import { useEffect } from "react";

export default function VeritasLensRedirectPage() {
  useEffect(() => {
    window.location.replace("https://expedite-consults.vercel.app/veritaslens");
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-mono p-6">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <h2 className="text-base font-bold text-cyan-300">Connecting to VeritasLens Intelligence Platform...</h2>
      <p className="text-xs text-slate-400 mt-2">Redirecting to secure VeritasLens portal...</p>
    </div>
  );
}
