"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AdminSessionProvider,
  useAdminSession,
} from "@/lib/admin-session-context";
import { PREDEFINED_ADMIN_STAFF, AdminRole } from "@/lib/auth";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  History,
  Users,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ArrowLeft,
  Lock,
  Menu,
  X,
  UserCheck,
} from "lucide-react";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentSession, switchRoleAccount, simulateUnauthorizedLogin, logout } = useAdminSession();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If unauthorized screen is currently shown, don't show the admin sidebar
  if (pathname === "/admin/unauthorized") {
    return <>{children}</>;
  }

  // If session is null, redirect to unauthorized
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
        <h2 className="text-xl font-bold">No Active Admin Session Found</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Select an authorized staff account from the Government Allowlist to enter NAM Administrative Core.
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {PREDEFINED_ADMIN_STAFF.map((staff) => (
            <button
              key={staff.id}
              onClick={() => {
                switchRoleAccount(staff.email);
                router.push("/admin");
              }}
              className="text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl font-mono font-bold"
            >
              Login as {staff.role}
            </button>
          ))}
        </div>
      </div>
    );
  }

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
      badge: "3 Pending",
    },
    {
      href: "/admin/mandi",
      label: "Mandi Price Manager",
      icon: TrendingUp,
      allowedRoles: ["SUPER_ADMIN", "MANDI_AUDITOR"],
      badge: "Daily Spot",
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
        {/* Government NAM Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-black shadow-md shadow-amber-900/40">
            🏛️
          </div>
          <div>
            <div className="font-extrabold text-sm text-white tracking-tight">NAM Administrative</div>
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Core RBAC v2.4
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
                  className="px-3 py-2 rounded-xl text-xs text-slate-600 flex items-center justify-between opacity-50 cursor-not-allowed select-none"
                  title={`Restricted: Requires ${item.allowedRoles.join(" or ")}`}
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
        <div className="pt-4 border-t border-slate-800 space-y-2">
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
        {/* Admin Top Header */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="text-xs font-bold text-slate-400 hidden sm:block">
              Connected via <span className="text-emerald-400">Google Workspace SSO</span>
            </div>
          </div>

          {/* Active Admin Account & Interactive Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Interactive Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
                title="Switch administrative account to test RBAC permissions"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <div className="text-left">
                  <div className="font-bold text-white leading-none">{currentSession.name}</div>
                  <div className="text-[10px] text-amber-400 font-mono mt-0.5 font-bold">
                    {currentSession.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Switch Test Staff Persona (RBAC)
                  </div>
                  {PREDEFINED_ADMIN_STAFF.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => {
                        switchRoleAccount(staff.email);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between ${
                        staff.email === currentSession.email
                          ? "bg-emerald-900/60 border border-emerald-700 text-white"
                          : "hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{staff.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">
                          {staff.email}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-800 text-amber-400">
                        {staff.role}
                      </span>
                    </button>
                  ))}

                  {/* Test 403 Forbidden Screen button */}
                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        simulateUnauthorizedLogin();
                        setRoleDropdownOpen(false);
                        router.push("/admin/unauthorized");
                      }}
                      className="w-full text-left p-2 rounded-xl text-red-400 hover:bg-red-950/60 transition-colors flex items-center gap-2 font-bold text-xs"
                    >
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <span>Test 403 (Unauthorized Gmail)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                logout();
                router.push("/admin/unauthorized");
              }}
              className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              title="Revoke Admin Session"
            >
              <LogOut className="w-4 h-4" />
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
  return (
    <AdminSessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminSessionProvider>
  );
}
