"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/lib/i18n/context";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Zap,
  RefreshCw,
  WifiOff,
  Building2,
  Lock,
} from "lucide-react";

interface TickerItem {
  id: string;
  state: string;
  marketAPMC: string;
  commodity: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  updatedAt: string;
  trend?: "up" | "down" | "stable";
}

export default function MandiRatesPage() {
  const { t, formatCurrency } = useLanguage();
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedState, setSelectedState] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cacheSource, setCacheSource] = useState<string>("redis-cache");
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mandi");
      const json = await res.json();
      if (json.data) {
        setTickers(json.data);
        setCacheSource(json.source || "redis-cache");
        setIsOffline(json.source === "offline-pwa-cache");
      }
    } catch (err) {
      console.error("Failed to load rates", err);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const states = ["all", "Maharashtra", "Delhi", "Punjab", "Andhra Pradesh", "Madhya Pradesh", "Haryana", "Gujarat"];

  const filteredTickers = tickers.filter((item) => {
    const matchesState = selectedState === "all" || item.state.toLowerCase() === selectedState.toLowerCase();
    const matchesQuery =
      !searchQuery.trim() ||
      item.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.marketAPMC.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesQuery;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              National APMC Spot Ticker
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t.nav.mandiRates}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Live wholesale spot prices calibrated daily across designated state APMC yards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Cache Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 shadow-2xs">
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-rose-700">Offline PWA Rate Card</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-slate-700">
                    {cacheSource === "redis-cache" ? "Redis 15m Cache (Sub-20ms)" : "Live Primary Sync"}
                  </span>
                </>
              )}
            </div>

            <button
              onClick={fetchRates}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="Refresh APMC rates"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            <Link
              href="/admin/mandi"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Auditor Calibration</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by commodity (e.g. Onion, Basmati, Chilli) or APMC market..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {states.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedState === st
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {st === "all" ? "All States" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Rates Table / Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Market APMC & State</th>
                  <th className="py-3.5 px-4">Commodity</th>
                  <th className="py-3.5 px-4 text-right">Min Rate</th>
                  <th className="py-3.5 px-4 text-right">Max Rate</th>
                  <th className="py-3.5 px-4 text-right font-black text-slate-900">Modal Spot Price</th>
                  <th className="py-3.5 px-4 text-center">Trend (24h)</th>
                  <th className="py-3.5 px-4 text-right">Last Calibrated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{item.marketAPMC}</span>
                      </div>
                      <div className="text-xs text-slate-500 ml-5">{item.state}</div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {item.commodity}
                    </td>

                    <td className="py-4 px-4 text-right font-medium text-slate-600">
                      {formatCurrency(item.minPrice)}
                    </td>

                    <td className="py-4 px-4 text-right font-medium text-slate-600">
                      {formatCurrency(item.maxPrice)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="text-base font-black text-emerald-800">
                        {formatCurrency(item.modalPrice)}
                      </div>
                      <div className="text-[10px] text-slate-400">per Quintal</div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {item.trend === "up" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Bullish
                        </span>
                      )}
                      {item.trend === "down" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Bearish
                        </span>
                      )}
                      {(!item.trend || item.trend === "stable") && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Minus className="w-3.5 h-3.5" />
                          Stable
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right text-xs text-slate-500">
                      {new Date(item.updatedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
