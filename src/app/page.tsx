"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Navbar } from "@/components/navbar";
import { CategoryGrid } from "@/components/category-grid";
import { ListingCard, ListingItem } from "@/components/listing-card";
import {
  Search,
  Filter,
  Zap,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function MarketplaceHomePage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cacheMeta, setCacheMeta] = useState<{ source: string; ttl?: string }>({
    source: "initial",
  });

  // Fetch listings whenever district or category changes
  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedDistrict !== "all") queryParams.set("district", selectedDistrict);
        if (selectedCategory !== "all") queryParams.set("category", selectedCategory);

        const res = await fetch(`/api/listings?${queryParams.toString()}`);
        const json = await res.json();
        if (json.data) {
          setListings(json.data);
          setCacheMeta({ source: json.source || "api", ttl: json.ttl });
        }
      } catch (err) {
        console.error("Failed to load listings", err);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [selectedCategory, selectedDistrict]);

  // Client-side search filtering
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    const q = searchQuery.toLowerCase();
    return listings.filter(
      (l) =>
        l.commodity.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        (l.farmer?.fullName && l.farmer.fullName.toLowerCase().includes(q))
    );
  }, [listings, searchQuery]);

  const districts = [
    { id: "all", label: t.hero.allDistricts },
    { id: "Nashik", label: "Nashik (Maharashtra)" },
    { id: "Ludhiana", label: "Ludhiana (Punjab)" },
    { id: "Guntur", label: "Guntur (Andhra Pradesh)" },
    { id: "Karnal", label: "Karnal (Haryana)" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero Section with National Agricultural Mission Theme */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/40">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold tracking-wide text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Government of India • e-NAM Certified Technology Core</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t.hero.title}
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
              {t.hero.subtitle}
            </p>

            {/* Quick KPI stats pill bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-emerald-950/60 backdrop-blur-xs border border-emerald-700/50 p-2.5 rounded-xl">
                <span className="text-emerald-300 block text-[10px] uppercase font-bold">Connected Mandis</span>
                <span className="text-lg font-black text-white">128 APMCs</span>
              </div>
              <div className="bg-emerald-950/60 backdrop-blur-xs border border-emerald-700/50 p-2.5 rounded-xl">
                <span className="text-emerald-300 block text-[10px] uppercase font-bold">Redis Feed Speed</span>
                <span className="text-lg font-black text-amber-300">&lt; 50ms</span>
              </div>
              <div className="bg-emerald-950/60 backdrop-blur-xs border border-emerald-700/50 p-2.5 rounded-xl">
                <span className="text-emerald-300 block text-[10px] uppercase font-bold">Identity Safety</span>
                <span className="text-lg font-black text-white">DigiLocker</span>
              </div>
              <div className="bg-emerald-950/60 backdrop-blur-xs border border-emerald-700/50 p-2.5 rounded-xl">
                <span className="text-emerald-300 block text-[10px] uppercase font-bold">Today&#39;s Volume</span>
                <span className="text-lg font-black text-emerald-200">₹14.8 Cr</span>
              </div>
            </div>

            {/* Search and District Filter Controls */}
            <div className="pt-4 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.hero.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-hidden focus:ring-3 focus:ring-emerald-400 shadow-md"
                />
              </div>

              <div className="relative shrink-0">
                <Filter className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-8 py-2.5 rounded-2xl bg-white text-slate-800 text-sm font-semibold focus:outline-hidden focus:ring-3 focus:ring-emerald-400 shadow-md appearance-none cursor-pointer"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Visual High-Contrast Tap Category Grid (Mobile-First) */}
        <section>
          <CategoryGrid
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        </section>

        {/* Listings Discovery Header with Redis Cache Status */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>{t.listings.title}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {filteredListings.length} Active Lots
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.listings.cachedNotice}
              </p>
            </div>

            {/* Performance & Cache Telemetry badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                {cacheMeta.source === "redis-cache"
                  ? `Redis Cache HIT (${cacheMeta.ttl})`
                  : "Postgres / Store Active"}
              </span>

              <Link
                href="/listings/new"
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 rounded-full transition-colors shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.nav.postProduce}</span>
              </Link>
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse p-4 space-y-3">
                  <div className="h-44 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700 text-2xl border border-emerald-200 shadow-2xs">
                🌾
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">Verified Exchange Feed Active</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Only DigiLocker KYC-approved farmer lots appear on the national marketplace. Unverified or pending lots are held in escrow queue until certified.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/listings/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Harvest Produce</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  <span>Sign In with Google</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedDistrict("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </section>

        {/* Farmer & Trader Trust & Security Guarantee Banner */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">DigiLocker Identity</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Zero cleartext Aadhaar storage. Verified with irreversible cryptographic salted hashes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">APMC Daily Spot Pricing</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Live rate calibration from major APMCs with 15-minute invalidation TTL.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Direct Farmgate Escrow</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Direct trade between farmers and bulk buyers with escrow dispute protection.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-8 px-4 sm:px-6 text-center text-xs text-slate-500 space-y-2 mb-16 md:mb-0">
        <p className="font-semibold text-slate-700">
          National Agricultural Marketplace (NAM-Core) • An Autonomous Digital Initiative
        </p>
        <p>
          Governed under electronic National Agriculture Market regulations • Encrypted via 256-bit TLS & DigiLocker Gateway
        </p>
      </footer>
    </div>
  );
}
