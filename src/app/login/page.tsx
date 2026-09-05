"use client";

import React, { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";

function LoginPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-800 via-emerald-700 to-green-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <AuthCard standalone={true} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-emerald-800 flex items-center justify-center text-white text-xs font-mono">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
