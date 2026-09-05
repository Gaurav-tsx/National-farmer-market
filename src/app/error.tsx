"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, Sprout } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
          <Sprout className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-xs font-mono font-bold uppercase">
            <AlertCircle className="w-3.5 h-3.5" />
            Temporary Client Refresh
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            NAM-Core Gateway Active
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The national exchange encountered a temporary client sync refresh. Click retry to reconnect to the live APMC feed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>

          <Link
            href="/"
            onClick={() => {
              window.location.href = "/";
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
          Digest: {error.digest || "CLIENT_HYDRATION_OK"}
        </div>
      </div>
    </div>
  );
}
