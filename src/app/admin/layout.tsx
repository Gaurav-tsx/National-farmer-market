"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession } from "@/lib/admin-session-context";
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

  // If no active authenticated session, show the Strict Google Admin Gate
  if (!currentSession) {
    const handleGoogleSignIn = async () => {
      setGoogleLoading(true);
      setAuthError(null);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          },
        });
        if (error) throw error;
      } catch (err: unknown) {
        setAuthError(
          err instanceof Error ? err.message : "Failed to initiate Google sign-in."
        );
        setGoogleLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          {/* Emblem Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-amber-900/40">
            🏛️
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[11px] font-mono font-bold tracking-wide uppercase mb-2">
              <Lock className="w-3.5 h-3.5" />
              Restricted Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              NAM Administrative Core
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Access is strictly restricted to allowlisted government personnel and certified APMC auditors.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs">
              {authError}
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? "Connecting to Google..." : "Sign In with Google Workspace"}</span>
            </button>

            <Link
              href="/login?next=/admin"
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In with Allowlisted Staff Email</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <Link href="/" className="hover:text-slate-300 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Marketplace</span>
            </Link>
            <span>IT Act 2000 Enforced</span>
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
