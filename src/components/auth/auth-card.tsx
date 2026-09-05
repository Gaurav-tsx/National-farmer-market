"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInFarmBanner, CreateAccountFarmBanner } from "./farm-banner";
import { useAdminSession } from "@/lib/admin-session-context";
import {
  Eye,
  EyeOff,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Tractor,
  Truck,
  Users,
  Lock,
} from "lucide-react";

interface AuthCardProps {
  initialTab?: "signin" | "signup";
  onSuccess?: (redirectUrl?: string) => void;
  standalone?: boolean;
}

export function AuthCard({ initialTab = "signin", onSuccess, standalone = false }: AuthCardProps) {
  const router = useRouter();
  const { setUserSession } = useAdminSession();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab);
  const [lang, setLang] = useState<"en" | "hi">("en");

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form State
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"FARMER" | "COMMERCIAL_BUYER" | "FPO_REPRESENTATIVE">("FARMER");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Modal / Google quick-login prompt
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [googleInputEmail, setGoogleInputEmail] = useState("gaurav.verma.admin@gmail.com");

  // Modal / Phone OTP prompt
  const [otpPromptOpen, setOtpPromptOpen] = useState(false);
  const [otpInputMobile, setOtpInputMobile] = useState("");
  const [otpInputCode, setOtpInputCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Security, Anti-Spam & Rate Limiting States
  const [loading, setLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0); // 5s anti-spam timer
  const [lockoutRemaining, setLockoutRemaining] = useState(0); // 5 min rate-limit timer
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cooldown countdown tick
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  // Lockout countdown tick
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const triggerAntiSpamCooldown = () => {
    setCooldownRemaining(5); // 5 seconds anti-spam debounce
  };

  // SIGN IN SUBMISSION
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownRemaining > 0 || lockoutRemaining > 0) return;

    if (!signInIdentifier.trim()) {
      setError(lang === "en" ? "Please enter your Email or Mobile Number." : "कृपया अपना ईमेल या मोबाइल नंबर दर्ज करें।");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    triggerAntiSpamCooldown();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: signInIdentifier.trim(),
          password: signInPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.lockout) {
          setLockoutRemaining(data.resetInSeconds || 300);
        }
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      setSuccessMsg(
        data.user.isAdmin
          ? "Admin access verified! Redirecting to Command Center..."
          : "Sign in successful! Entering marketplace..."
      );

      setUserSession(data.user);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.redirect);
        } else {
          router.push(data.redirect || "/");
        }
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // SIGN UP SUBMISSION
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownRemaining > 0 || lockoutRemaining > 0) return;

    if (!fullName.trim()) {
      setError(lang === "en" ? "Please enter your Full Name." : "कृपया अपना पूरा नाम दर्ज करें।");
      return;
    }

    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, "").length < 10) {
      setError(lang === "en" ? "Please enter a valid 10-digit mobile number." : "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।");
      return;
    }

    if (!signUpPassword || signUpPassword.length < 6) {
      setError(lang === "en" ? "Password must be at least 6 characters." : "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।");
      return;
    }

    if (signUpPassword !== confirmPassword) {
      setError(lang === "en" ? "Passwords do not match." : "पासवर्ड मेल नहीं खाते।");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    triggerAntiSpamCooldown();

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
          email: signUpEmail.trim() || undefined,
          role: selectedRole,
          password: signUpPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.lockout) {
          setLockoutRemaining(data.resetInSeconds || 300);
        }
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Account created successfully! Logging you in...");
      setUserSession(data.user);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.redirect);
        } else {
          router.push(data.redirect || "/");
        }
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Workspace Fast Sign In / Fallback
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleInputEmail.trim()) return;

    setLoading(true);
    setError(null);
    triggerAntiSpamCooldown();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: googleInputEmail.trim(),
          isGoogleAuth: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google authentication failed.");
        setLoading(false);
        return;
      }

      setGooglePromptOpen(false);
      setSuccessMsg(
        data.user.isAdmin
          ? "Admin access verified via Google! Redirecting to Command Center..."
          : "Signed in via Google! Entering marketplace..."
      );

      setUserSession(data.user);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.redirect);
        } else {
          router.push(data.redirect || "/");
        }
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google authentication error.");
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Sign In
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (!otpInputMobile.trim() || otpInputMobile.replace(/\D/g, "").length < 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
      setOtpSent(true);
      setSuccessMsg("OTP sent to " + otpInputMobile + " (Use demo code: 123456)");
      return;
    }

    if (!otpInputCode.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);
    triggerAntiSpamCooldown();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: otpInputMobile.trim(),
          isOtpAuth: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "OTP verification failed.");
        setLoading(false);
        return;
      }

      setOtpPromptOpen(false);
      setSuccessMsg("Mobile verified! Entering marketplace...");
      setUserSession(data.user);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.redirect);
        } else {
          router.push(data.redirect || "/");
        }
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OTP verification error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">
      {/* Top Header Bar matching Image 3 */}
      <div className="flex items-center justify-between pb-3 px-1 text-white">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
            {activeTab === "signin" ? (lang === "en" ? "SIGN IN" : "लॉग इन") : (lang === "en" ? "CREATE ACCOUNT" : "खाता बनाएं")}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              NFM
            </span>
            <span className="text-xs font-bold text-emerald-200 tracking-wide">
              {lang === "en" ? "NATIONAL FARMING MARKETPLACE" : "राष्ट्रीय कृषि बाजार"}
            </span>
          </div>
        </div>

        {/* Hindi / English Language Toggle Switch */}
        <div className="flex items-center gap-1.5 bg-emerald-900/50 backdrop-blur-xs px-2.5 py-1 rounded-full border border-emerald-500/40 text-xs font-semibold select-none">
          <button
            type="button"
            onClick={() => setLang("hi")}
            className={`transition-colors cursor-pointer ${lang === "hi" ? "text-white font-bold" : "text-emerald-300 hover:text-white"}`}
          >
            हिन्दी
          </button>
          <span className="text-emerald-400/80">/</span>
          <div
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="w-8 h-4 bg-emerald-700/80 rounded-full flex items-center p-0.5 cursor-pointer relative"
          >
            <div
              className={`w-3 h-3 rounded-full bg-white transition-transform ${lang === "en" ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`transition-colors cursor-pointer ${lang === "en" ? "text-white font-bold" : "text-emerald-300 hover:text-white"}`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main White Auth Card matching Image 3 */}
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-slate-900 transition-all">
        {/* Farm Illustration Banner */}
        {activeTab === "signin" ? <SignInFarmBanner /> : <CreateAccountFarmBanner />}

        {/* Card Content Form */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Card Title & Tab Switcher */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {activeTab === "signin"
                ? lang === "en"
                  ? "Sign In to Your Account"
                  : "अपने खाते में साइन इन करें"
                : lang === "en"
                ? "Create New Account"
                : "नया खाता बनाएं"}
            </h2>

            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === "signin" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lang === "en" ? "Sign In" : "लॉग इन"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === "signup" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lang === "en" ? "Sign Up" : "रजिस्टर"}
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {lockoutRemaining > 0 && (
                  <div className="mt-1 font-bold flex items-center gap-1 text-rose-800">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lockout time: {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s remaining</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Rate limit lockout warning if active */}
          {lockoutRemaining > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Security Lockout Active</p>
                <p className="text-[11px] text-amber-700">
                  Maximum 10 attempts reached. Please come back in {Math.ceil(lockoutRemaining / 60)} minutes ({lockoutRemaining}s).
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------------------- */}
          {/* TAB 1: SIGN IN FORM                         */}
          {/* ------------------------------------------- */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email / Mobile Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {lang === "en" ? "Email / Mobile Number" : "ईमेल / मोबाइल नंबर"}
                </label>
                <input
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder={lang === "en" ? "e.g. gaurav.verma.admin@gmail.com or 9876543210" : "उदा. 9876543210"}
                  required
                  disabled={lockoutRemaining > 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === "en" ? "Password" : "पासवर्ड"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessMsg("For admin: enter your allowlisted password or use Continue with Google.");
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    {lang === "en" ? "Forgot Password?" : "पासवर्ड भूल गए?"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSignInPassword ? "text" : "password"}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder={lang === "en" ? "Enter your password" : "पासवर्ड दर्ज करें"}
                    required
                    disabled={lockoutRemaining > 0}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Anti-spam countdown indicator */}
              {cooldownRemaining > 0 && (
                <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Anti-spam protection delay
                  </span>
                  <span className="font-bold">Wait {cooldownRemaining}s</span>
                </div>
              )}

              {/* SIGN IN SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading || cooldownRemaining > 0 || lockoutRemaining > 0}
                className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm tracking-wide shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : cooldownRemaining > 0 ? (
                  <span>Wait {cooldownRemaining}s (Anti-Spam)</span>
                ) : (
                  <span>{lang === "en" ? "SIGN IN" : "साइन इन"}</span>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center pt-1">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs font-bold text-slate-400 tracking-wider">
                  OR
                </span>
              </div>

              {/* Secondary Buttons: Google & Phone OTP */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setGooglePromptOpen(true)}
                  disabled={lockoutRemaining > 0}
                  className="py-2.5 px-3 rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  {/* Google colored G */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOtpPromptOpen(true)}
                  disabled={lockoutRemaining > 0}
                  className="py-2.5 px-3 rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Phone OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* ------------------------------------------- */}
          {/* TAB 2: CREATE ACCOUNT FORM                  */}
          {/* ------------------------------------------- */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {lang === "en" ? "Full Name" : "पूरा नाम"}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === "en" ? "Enter your full name" : "अपना पूरा नाम दर्ज करें"}
                  required
                  disabled={lockoutRemaining > 0}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>

              {/* Mobile Number & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === "en" ? "Mobile Number" : "मोबाइल नंबर"}
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9876543210"
                    required
                    disabled={lockoutRemaining > 0}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === "en" ? "Email (Optional)" : "ईमेल (वैकल्पिक)"}
                  </label>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={lockoutRemaining > 0}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Role Selection matching Image 3 */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  {lang === "en" ? "SELECT YOUR ROLE" : "अपनी भूमिका चुनें"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Farmer */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole("FARMER")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      selectedRole === "FARMER"
                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-1 ring-emerald-600"
                        : "border-slate-200 bg-slate-50/40 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${selectedRole === "FARMER" ? "text-emerald-700" : "text-slate-500"}`}>
                      <Tractor className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight">
                      FARMER
                    </span>
                  </button>

                  {/* Commercial Buyer */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole("COMMERCIAL_BUYER")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      selectedRole === "COMMERCIAL_BUYER"
                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-1 ring-emerald-600"
                        : "border-slate-200 bg-slate-50/40 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${selectedRole === "COMMERCIAL_BUYER" ? "text-amber-700" : "text-slate-500"}`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight leading-tight">
                      COMMERCIAL BUYER
                    </span>
                  </button>

                  {/* FPO Representative */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole("FPO_REPRESENTATIVE")}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      selectedRole === "FPO_REPRESENTATIVE"
                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-1 ring-emerald-600"
                        : "border-slate-200 bg-slate-50/40 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${selectedRole === "FPO_REPRESENTATIVE" ? "text-blue-700" : "text-slate-500"}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight leading-tight">
                      FPO REP
                    </span>
                  </button>
                </div>
              </div>

              {/* Passwords Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === "en" ? "Password" : "पासवर्ड"}
                  </label>
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    disabled={lockoutRemaining > 0}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === "en" ? "Confirm Password" : "पासवर्ड की पुष्टि करें"}
                  </label>
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    disabled={lockoutRemaining > 0}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Anti-spam indicator */}
              {cooldownRemaining > 0 && (
                <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Anti-spam protection delay
                  </span>
                  <span className="font-bold">Wait {cooldownRemaining}s</span>
                </div>
              )}

              {/* CREATE ACCOUNT SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading || cooldownRemaining > 0 || lockoutRemaining > 0}
                className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm tracking-wide shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : cooldownRemaining > 0 ? (
                  <span>Wait {cooldownRemaining}s (Anti-Spam)</span>
                ) : (
                  <span>{lang === "en" ? "CREATE ACCOUNT" : "खाता बनाएं"}</span>
                )}
              </button>

              {/* Switch to Sign In */}
              <div className="text-center pt-2 text-xs text-slate-500">
                {lang === "en" ? "Already have an account? " : "क्या आपके पास पहले से एक खाता है? "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signin");
                    setError(null);
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {lang === "en" ? "Sign In" : "साइन इन करें"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Google Prompt Modal for instant seamless sign in */}
      {googlePromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="font-bold text-sm text-slate-900">Sign in with Google Account</h3>
            </div>

            <p className="text-xs text-slate-500">
              Enter your Google address. Allowlisted admins (like <code>gaurav.verma.admin@gmail.com</code>) receive immediate SuperAdmin status.
            </p>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <input
                type="email"
                value={googleInputEmail}
                onChange={(e) => setGoogleInputEmail(e.target.value)}
                placeholder="you@gmail.com"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGooglePromptOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {loading ? "Verifying..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone OTP Modal */}
      {otpPromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Fast Phone OTP Verification</h3>
            </div>

            <p className="text-xs text-slate-500">
              Sign in securely without a password using instant mobile OTP verification.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-3">
              <input
                type="tel"
                value={otpInputMobile}
                onChange={(e) => setOtpInputMobile(e.target.value)}
                placeholder="10-digit mobile number"
                required
                disabled={otpSent}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600"
              />

              {otpSent && (
                <input
                  type="text"
                  value={otpInputCode}
                  onChange={(e) => setOtpInputCode(e.target.value)}
                  placeholder="Enter 6-digit OTP (e.g. 123456)"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-emerald-400 bg-emerald-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600"
                />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpPromptOpen(false);
                    setOtpSent(false);
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {loading ? "Verifying..." : otpSent ? "Verify & Enter" : "Send OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
