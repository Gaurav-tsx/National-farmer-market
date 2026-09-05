"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import en from "./en.json";
import hi from "./hi.json";
import mr from "./mr.json";
import pa from "./pa.json";
import te from "./te.json";

export type SupportedLocale = "en" | "hi" | "mr" | "pa" | "te";

export interface LanguageOption {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
];

export type Dictionary = typeof en;

const dictionaries: Record<SupportedLocale, Dictionary> = {
  en,
  hi,
  mr,
  pa,
  te,
};

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  dict: Dictionary;
  t: Dictionary;
  formatCurrency: (amount: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");

  // Load preferred language from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nam_preferred_locale") as SupportedLocale;
      if (saved && dictionaries[saved]) {
        setLocaleState(saved);
      }
    } catch {
      // LocalStorage access safe guard
    }
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("nam_preferred_locale", newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // safe guard
    }
  };

  const dict = useMemo(() => dictionaries[locale] || en, [locale]);

  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dict, t: dict, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
