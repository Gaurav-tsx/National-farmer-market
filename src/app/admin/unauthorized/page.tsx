"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Lock, ArrowLeft, RefreshCcw, MailWarning } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-lg bg-slate-900 border border-red-900/60 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        {/* Warning Icon Badge */}
        <div className="w-20 h-20 rounded-2xl bg-red-950/80 border border-red-800/80 flex items-center justify-center mx-auto text-red-500 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-xs font-mono font-bold tracking-widest uppercase mb-3">
            HTTP 403 • ACCESS_FORBIDDEN
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Administrative Access Denied
          </h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Your Google Workspace account is not allowlisted in the National Agricultural Marketplace administrative staff directory.
          </p>
        </div>

        {/* Security Audit Details Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Security Gate:</span>
            <span className="text-red-400 font-bold">Google SSO Allowlist</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Permitted Domains:</span>
            <span className="text-emerald-400">@agri.gov.in, @nam.gov.in</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Attempted Account:</span>
            <span className="text-amber-400 truncate max-w-[200px]">stranger@gmail.com</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Audit Trail Event:</span>
            <span className="text-slate-300">LOGGED_TO_AUDIT_LOGS</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin"
            className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Switch to Allowlisted Account</span>
          </Link>

          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Marketplace</span>
          </Link>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          <span>Section 66F of IT Act 2000: Unauthorized access to National infrastructure is penalized.</span>
        </div>
      </div>
    </div>
  );
}
