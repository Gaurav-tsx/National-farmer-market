"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TickerItem {
  id: string;
  marketAPMC: string;
  commodity: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  trend?: "up" | "down" | "stable";
}

export function MandiTickerBar() {
  const { t, formatCurrency } = useLanguage();
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [cacheStatus, setCacheStatus] = useState<string>("Redis 15m Cache");

  useEffect(() => {
    async function loadTickers() {
      try {
        const res = await fetch("/api/mandi");
        const json = await res.json();
        if (json.data) {
          setTickers(json.data);
          setCacheStatus(json.source === "redis-cache" ? "⚡ Redis Cached (<15ms)" : "🟢 APMC Synced");
        }
      } catch (err) {
        console.error("Failed to load tickers", err);
      }
    }
    loadTickers();
    // Poll every 30s
    const interval = setInterval(loadTickers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (tickers.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 text-slate-100 text-xs py-2 px-3 border-b border-slate-800 flex items-center overflow-hidden shadow-inner select-none">
      {/* Left Badge */}
      <div className="flex items-center gap-1.5 bg-emerald-600/90 text-white font-semibold px-2.5 py-0.5 rounded-full mr-3 text-[11px] shrink-0 tracking-wide uppercase shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping mr-0.5" />
        {t.ticker.liveBadge}
      </div>

      {/* Marquee Content */}
      <div className="overflow-hidden whitespace-nowrap flex-1 relative">
        <div className="animate-marquee flex items-center gap-8">
          {tickers.concat(tickers).map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <span className="font-semibold text-slate-100">{item.marketAPMC}</span>
              <span className="text-slate-400">({item.commodity}):</span>
              <span className="font-bold text-amber-400">
                {formatCurrency(item.modalPrice)}
                <span className="text-[10px] text-slate-400 font-normal">/Q</span>
              </span>
              {item.trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-400 inline" />}
              {item.trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-rose-400 inline" />}
              {(!item.trend || item.trend === "stable") && <Minus className="w-3.5 h-3.5 text-slate-500 inline" />}
              <span className="text-slate-700">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latency / Cache Badge */}
      <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full ml-3 shrink-0">
        <Zap className="w-3 h-3" />
        <span>{cacheStatus}</span>
      </div>
    </div>
  );
}
