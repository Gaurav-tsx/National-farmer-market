"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminSession } from "@/lib/admin-session-context";
import { ROLE_PERMISSIONS } from "@/lib/auth";
import {
  ShieldCheck,
  TrendingUp,
  History,
  AlertTriangle,
  Scale,
  Users,
  Building2,
  CheckCircle2,
  ArrowUpRight,
  Shield,
} from "lucide-react";

export default function AdminDashboardOverview() {
  const { currentSession, can } = useAdminSession();
  const [stats, setStats] = useState({
    pendingKycCount: 2,
    activeMandiCount: 8,
    totalVolume24h: "₹14.82 Cr",
    auditLogsCount: 3,
  });

  const activePermissions = currentSession ? ROLE_PERMISSIONS[currentSession.role] : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">
            <Shield className="w-3.5 h-3.5" />
            Active Role: {currentSession?.role}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome, {currentSession?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            National Agricultural Marketplace Governance Console. Authenticated via Google Workspace SSO ({currentSession?.email}).
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs font-mono space-y-1.5 shrink-0">
          <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-1">
            Active RBAC Privileges ({activePermissions.length})
          </div>
          <div className="flex flex-wrap gap-1 max-w-xs">
            {activePermissions.map((perm) => (
              <span key={perm} className="text-[10px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-sm">
                {perm}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending KYC */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              KYC Queue
            </span>
            <div className="p-2 rounded-xl bg-blue-950 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.pendingKycCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Awaiting DigiLocker Audit</span>
            {can("REVIEW_KYC") && (
              <Link href="/admin/kyc" className="text-emerald-400 hover:underline font-bold flex items-center gap-0.5">
                Inspect <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* APMC Mandis Calibrated */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Active APMCs
            </span>
            <div className="p-2 rounded-xl bg-amber-950 text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.activeMandiCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Daily Spot Calibrated</span>
            {can("UPDATE_MANDI_PRICES") && (
              <Link href="/admin/mandi" className="text-amber-400 hover:underline font-bold flex items-center gap-0.5">
                Calibrate <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* 24h Escrow Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              24h Clearing Vol
            </span>
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.totalVolume24h}</div>
          <div className="text-[11px] text-slate-400">
            Across 14 State Gateways
          </div>
        </div>

        {/* Audit Log Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Audit Events
            </span>
            <div className="p-2 rounded-xl bg-purple-950 text-purple-400">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.auditLogsCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Immutable Trail</span>
            <Link href="/admin/audit" className="text-purple-400 hover:underline font-bold flex items-center gap-0.5">
              Explorer <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Role-Specific Action Centers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compliance Officer Action Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>KYC Compliance Verification Hub</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">
              COMPLIANCE_OFFICER
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verify submitted farmer land records (7/12 Jamabandi) against DigiLocker authenticated Aadhaar XML hashes.
          </p>
          <div className="pt-2">
            {can("REVIEW_KYC") ? (
              <Link
                href="/admin/kyc"
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                <span>Launch KYC Review Queue (2 Pending)</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="text-xs text-slate-500 italic">
                Restricted to Compliance Officers and Super Admins.
              </div>
            )}
          </div>
        </div>

        {/* Mandi Auditor Action Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>APMC Spot Price Calibration</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
              MANDI_AUDITOR
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Push real-time spot price calibrations across Lasalgaon, Azadpur, Vashi, and Khanna mandis with Redis cache invalidation.
          </p>
          <div className="pt-2">
            {can("UPDATE_MANDI_PRICES") ? (
              <Link
                href="/admin/mandi"
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                <span>Open APMC Spot Price Editor</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="text-xs text-slate-500 italic">
                Restricted to Mandi Auditors and Super Admins.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
