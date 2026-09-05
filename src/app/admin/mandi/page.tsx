"use client";

import React, { useState, useEffect } from "react";
import { useAdminSession } from "@/lib/admin-session-context";
import {
  TrendingUp,
  ShieldAlert,
  Save,
  CheckCircle2,
  RefreshCw,
  Zap,
  Building2,
  AlertCircle,
} from "lucide-react";

interface MandiTickerItem {
  id: string;
  state: string;
  marketAPMC: string;
  commodity: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  updatedAt: string;
}

export default function AdminMandiManagerPage() {
  const { currentSession, can } = useAdminSession();
  const [tickers, setTickers] = useState<MandiTickerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingRow, setEditingRow] = useState<Record<string, { min: number; max: number; modal: number; reason: string }>>({});
  const [saveStatus, setSaveStatus] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const fetchTickers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mandi");
      const json = await res.json();
      if (json.data) {
        setTickers(json.data);
        // Initialize editing state
        const initialMap: Record<string, { min: number; max: number; modal: number; reason: string }> = {};
        json.data.forEach((t: MandiTickerItem) => {
          initialMap[t.id] = {
            min: t.minPrice,
            max: t.maxPrice,
            modal: t.modalPrice,
            reason: "Daily APMC wholesale arrival bay survey calibration",
          };
        });
        setEditingRow(initialMap);
      }
    } catch (err) {
      console.error("Failed to load tickers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickers();
  }, []);

  const handlePriceChange = (id: string, field: "min" | "max" | "modal" | "reason", value: string | number) => {
    setEditingRow((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSavePrice = async (ticker: MandiTickerItem) => {
    if (!currentSession) return;
    const edits = editingRow[ticker.id];
    if (!edits) return;

    try {
      const res = await fetch("/api/admin/mandi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticker.id,
          minPrice: Number(edits.min),
          maxPrice: Number(edits.max),
          modalPrice: Number(edits.modal),
          adminRole: currentSession.role,
          adminEmail: currentSession.email,
          adminName: currentSession.name,
          reason: edits.reason,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update price");
      }

      setSaveStatus({
        id: ticker.id,
        success: true,
        msg: `Updated ${ticker.commodity} (${ticker.marketAPMC}) to ₹${edits.modal}/Q. Redis cache invalidated.`,
      });

      setTimeout(() => setSaveStatus(null), 4000);
      fetchTickers();
    } catch (err: unknown) {
      setSaveStatus({
        id: ticker.id,
        success: false,
        msg: err instanceof Error ? err.message : "Save failed",
      });
    }
  };

  if (!can("UPDATE_MANDI_PRICES")) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Auditor Privilege Required</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your current role (<span className="text-amber-400 font-mono">{currentSession?.role}</span>) does not hold the &apos;UPDATE_MANDI_PRICES&apos; permission. Switch to <span className="text-emerald-400 font-semibold">MANDI_AUDITOR</span> or <span className="text-emerald-400 font-semibold">SUPER_ADMIN</span> via the switcher above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Auditor Calibration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            APMC Mandi Spot Price Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tabular editor. Pushing updates automatically invalidates the Redis 15-minute public cache.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickers}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Reload rates"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            saveStatus.success
              ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300"
              : "bg-rose-950/80 border border-rose-800 text-rose-300"
          }`}
        >
          {saveStatus.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{saveStatus.msg}</span>
        </div>
      )}

      {/* Real-time Tabular Editor */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 sm:px-6">APMC & State</th>
                <th className="py-4 px-3">Commodity</th>
                <th className="py-4 px-3 w-28">Min (₹/Q)</th>
                <th className="py-4 px-3 w-28">Max (₹/Q)</th>
                <th className="py-4 px-3 w-32 text-amber-400">Modal Spot (₹/Q)</th>
                <th className="py-4 px-3">Survey Calibration Rationale</th>
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tickers.map((ticker) => {
                const currentEdits = editingRow[ticker.id] || {
                  min: ticker.minPrice,
                  max: ticker.maxPrice,
                  modal: ticker.modalPrice,
                  reason: "",
                };

                return (
                  <tr key={ticker.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{ticker.marketAPMC}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 ml-5">{ticker.state}</span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-200">
                      {ticker.commodity}
                    </td>

                    {/* Min Price Input */}
                    <td className="py-3.5 px-3">
                      <input
                        type="number"
                        value={currentEdits.min}
                        onChange={(e) =>
                          handlePriceChange(ticker.id, "min", parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </td>

                    {/* Max Price Input */}
                    <td className="py-3.5 px-3">
                      <input
                        type="number"
                        value={currentEdits.max}
                        onChange={(e) =>
                          handlePriceChange(ticker.id, "max", parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </td>

                    {/* Modal Price Input */}
                    <td className="py-3.5 px-3">
                      <input
                        type="number"
                        value={currentEdits.modal}
                        onChange={(e) =>
                          handlePriceChange(ticker.id, "modal", parseFloat(e.target.value) || 0)
                        }
                        className="w-28 px-2 py-1.5 rounded-lg bg-slate-950 border border-amber-600/80 text-amber-300 font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500 shadow-inner"
                      />
                    </td>

                    {/* Survey Rationale Input */}
                    <td className="py-3.5 px-3">
                      <input
                        type="text"
                        value={currentEdits.reason}
                        onChange={(e) =>
                          handlePriceChange(ticker.id, "reason", e.target.value)
                        }
                        placeholder="Reason for price revision..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </td>

                    {/* Save Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSavePrice(ticker)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs shadow-amber-900"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Push</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
