'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function TruePlaceErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('TruePlace Portal encountered an error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-7 h-7 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 font-sans tracking-tight">
            TruePlace Portal Refresh Needed
          </h2>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            A temporary connection issue occurred while syncing real-time property cadastre and listing assets.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0C382E] text-white text-xs font-bold hover:bg-[#07241D] transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-300" />
            <span>Reload TruePlace</span>
          </button>
          <button
            onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4 text-gray-500" />
            <span>Reset View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
