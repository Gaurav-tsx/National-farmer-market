"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage, LANGUAGES, SupportedLocale } from "@/lib/i18n/context";
import { MandiTickerBar } from "./mandi-ticker-bar";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useAdminSession } from "@/lib/admin-session-context";
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  Globe,
  Lock,
  ChevronDown,
  Store,
  FileCheck2,
  Menu,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  Tractor,
  Truck,
  Users,
} from "lucide-react";

export function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userSession, isAdmin, logout } = useAdminSession();

  const handleSignOut = async () => {
    await logout();
    window.location.href = "/";
  };


  const currentLangObj = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Real-time Mandi Ticker */}
      <MandiTickerBar />

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & National Flag Accent */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    NAM<span className="text-emerald-700">-Core</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                    Bharat
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline truncate max-w-[220px]">
                  {t.appTagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === "/"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Store className="w-4 h-4 text-emerald-600" />
              {t.nav.home}
            </Link>

            <Link
              href="/mandi"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === "/mandi"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-600" />
              {t.nav.mandiRates}
            </Link>

            <Link
              href="/listings/new"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === "/listings/new"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              {t.nav.postProduce}
            </Link>

            <Link
              href="/kyc"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === "/kyc"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              {t.nav.kyc}
            </Link>
          </nav>

          {/* Right Action Tools: Language Switcher, User Role, Admin Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Zero-Roundtrip Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
                title="Instant Language Switching (Zero Network Roundtrip)"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentLangObj.nativeLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Zero-Roundtrip i18n
                  </div>
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLocale(item.code as SupportedLocale);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                        item.code === locale ? "font-bold text-emerald-700 bg-emerald-50/60" : "text-slate-700"
                      }`}
                    >
                      <span>{item.nativeLabel}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{item.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Session Status or Sign In Button */}
            {userSession ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {userSession.fullName?.charAt(0).toUpperCase() || userSession.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="max-w-[120px] truncate leading-tight font-bold text-[11px] text-slate-900">
                      {userSession.fullName || userSession.email}
                    </span>
                    <span className="text-[9px] text-emerald-700 uppercase font-black">
                      {userSession.role === "FARMER"
                        ? "🚜 Farmer"
                        : userSession.role === "COMMERCIAL_BUYER"
                        ? "🚚 Buyer"
                        : userSession.role === "FPO_REPRESENTATIVE"
                        ? "👥 FPO"
                        : "🛡️ Super Admin"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Sign in with Email, Google, or OTP"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Admin Portal Button - ONLY SHOWN IF USER HAS ADMIN ACCESS */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-all hover:shadow border border-amber-400/40"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t.nav.admin}</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            <Store className="w-4 h-4 text-emerald-600" />
            {t.nav.home}
          </Link>
          <Link
            href="/mandi"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            <TrendingUp className="w-4 h-4 text-amber-600" />
            {t.nav.mandiRates}
          </Link>
          <Link
            href="/listings/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            {t.nav.postProduce}
          </Link>
          <Link
            href="/kyc"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            {t.nav.kyc}
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-amber-900 bg-amber-50 border border-amber-200"
            >
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Admin Portal</span>
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100">
            {userSession ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-600 px-3">
                  Signed in as: <strong className="text-slate-900">{userSession.fullName || userSession.email}</strong>
                  <span className="block text-[10px] text-emerald-700 font-bold uppercase mt-0.5">
                    Role: {userSession.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-emerald-700 text-white shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </Link>
            )}
          </div>
        </div>
      )}


      {/* Mobile Bottom Thumb Navigation (Outdoor sunlight friendly) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-lg ${
            pathname === "/" ? "text-emerald-700 font-bold" : "text-slate-500"
          }`}
        >
          <Store className="w-5 h-5" />
          <span>{t.nav.home}</span>
        </Link>
        <Link
          href="/mandi"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-lg ${
            pathname === "/mandi" ? "text-amber-700 font-bold" : "text-slate-500"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>{t.nav.mandiRates}</span>
        </Link>
        <Link
          href="/listings/new"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-lg ${
            pathname === "/listings/new" ? "text-emerald-700 font-bold" : "text-slate-500"
          }`}
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>{t.nav.postProduce}</span>
        </Link>
        <Link
          href="/kyc"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-lg ${
            pathname === "/kyc" ? "text-blue-700 font-bold" : "text-slate-500"
          }`}
        >
          <FileCheck2 className="w-5 h-5" />
          <span>{t.nav.kyc}</span>
        </Link>
      </div>
    </header>
  );
}
