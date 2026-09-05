"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession } from "@/lib/admin-session-context";
import { AuthCard } from "@/components/auth/auth-card";
import { createClient } from "@/utils/supabase/client";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  History,
  Users,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  Lock,
  Menu,
  X,
  LogIn,
  Sprout,
} from "lucide-react";


function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentSession, loading, logout } = useAdminSession();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // If unauthorized screen is currently shown, display it without sidebar
  if (pathname === "/admin/unauthorized") {
    return <>{children}</>;
  }

  // If session is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Administrative Credentials...</span>
        </div>
      </div>
    );
  }

  // If no active authenticated session, show the Admin Gate with AuthCard
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[11px] font-mono font-bold tracking-wide uppercase mb-2">
              <Lock className="w-3.5 h-3.5" />
              Restricted Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              NAM Administrative Core
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in with your allowlisted administrator account (e.g. <code>gaurav.verma.admin@gmail.com</code>).
            </p>
          </div>

          <AuthCard
            initialTab="signin"
            standalone={false}
            onSuccess={() => {
              router.push("/admin");
            }}
          />

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }


  // Authenticated Admin Shell
  const navItems = [
    {
      href: "/admin",
      label: "Dashboard Overview",
      icon: LayoutDashboard,
      allowedRoles: ["SUPER_ADMIN", "COMPLIANCE_OFFICER", "MANDI_AUDITOR", "DISPUTE_MANAGER"],
    },
    {
      href: "/admin/kyc",
      label: "KYC Verification Queue",
      icon: ShieldCheck,
      allowedRoles: ["SUPER_ADMIN", "COMPLIANCE_OFFICER"],
      badge: "Compliance",
    },
    {
      href: "/admin/mandi",
      label: "Mandi Price Manager",
      icon: TrendingUp,
      allowedRoles: ["SUPER_ADMIN", "MANDI_AUDITOR"],
      badge: "Spot Rate",
    },
    {
      href: "/admin/audit",
      label: "Audit Log Explorer",
      icon: History,
      allowedRoles: ["SUPER_ADMIN", "COMPLIANCE_OFFICER", "MANDI_AUDITOR", "DISPUTE_MANAGER"],
    },
    {
      href: "/admin/staff",
      label: "Staff Directory & RBAC",
      icon: Users,
      allowedRoles: ["SUPER_ADMIN"],
      badge: "SuperAdmin",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 shrink-0">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-black shadow-md shadow-amber-900/40">
            🏛️
          </div>
          <div>
            <div className="font-extrabold text-sm text-white tracking-tight">NAM Administrative</div>
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Core RBAC
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isAccessible = item.allowedRoles.includes(currentSession.role);
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (!isAccessible) {
              return (
                <div
                  key={item.href}
                  className="px-3 py-2 rounded-xl text-xs text-slate-600 flex items-center justify-between opacity-40 cursor-not-allowed select-none"
                  title={`Restricted to ${item.allowedRoles.join(" or ")}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <Lock className="w-3 h-3 text-slate-600" />
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? "bg-emerald-900/80 text-emerald-200" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Public Marketplace Quick Return */}
        <div className="pt-4 border-t border-slate-800">
          <Link
            href="/"
            className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Public Marketplace</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              Authenticated Account: <span className="text-emerald-400 font-bold">{currentSession.email}</span>
            </div>
          </div>

          {/* Active Admin Identity & Real Sign Out Button */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-bold text-white text-xs leading-none">{currentSession.name}</div>
              <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">
                {currentSession.role}
              </span>
            </div>

            <button
              onClick={async () => {
                await logout();
                router.push("/login?next=/admin");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              title="Sign Out of Administrative Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  pathname === item.href ? "bg-emerald-700 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && <span className="text-[10px] text-amber-300">{item.badge}</span>}
              </Link>
            ))}
          </div>
        )}

        {/* Content Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
