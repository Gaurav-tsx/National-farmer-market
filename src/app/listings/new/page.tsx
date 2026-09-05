"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/lib/i18n/context";
import {
  Sprout,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Scale,
  Calendar,
  IndianRupee,
  MapPin,
  ArrowRight,
} from "lucide-react";

export default function NewListingPage() {
  const { t, formatCurrency } = useLanguage();
  const router = useRouter();

  const [commodity, setCommodity] = useState("");
  const [category, setCategory] = useState<"Vegetables" | "Grains" | "Fruits" | "Spices" | "Dairy">("Vegetables");
  const [quantityQuintal, setQuantityQuintal] = useState("");
  const [minOfferPrice, setMinOfferPrice] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // APMC spot rate benchmark for comparison
  const benchmarkRate = 1950;
  const currentOffer = parseFloat(minOfferPrice) || 0;
  const isCompetitive = currentOffer <= benchmarkRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: `farmer-${Date.now()}`,
          category,
          commodity,
          quantityQuintal: parseFloat(quantityQuintal),
          minOfferPrice: parseFloat(minOfferPrice),
          harvestDate,
          isOrganic,
          district,
          state,
          pincode,
          images: [
            category === "Vegetables"
              ? "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"
              : category === "Grains"
              ? "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80"
              : category === "Spices"
              ? "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
          ],
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to publish listing");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error publishing listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <Sprout className="w-3.5 h-3.5" />
            Direct Farmgate Listing
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.postProduce.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t.postProduce.subtitle}
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-10 text-center shadow-lg space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {t.postProduce.successMsg}
            </h2>
            <p className="text-sm text-slate-600">
              Your produce lot is now active and indexed across district feeds via Redis cache.
            </p>
            <div className="pt-4">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all"
              >
                Return to Marketplace
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Crop Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  {t.postProduce.categoryLabel}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(["Vegetables", "Grains", "Fruits", "Spices", "Dairy"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        category === cat
                          ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commodity Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {t.postProduce.commodityLabel}
                </label>
                <input
                  type="text"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  placeholder={t.postProduce.commodityPlaceholder}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Volume & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    {t.postProduce.quantityLabel}
                  </label>
                  <div className="relative">
                    <Scale className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="number"
                      value={quantityQuintal}
                      onChange={(e) => setQuantityQuintal(e.target.value)}
                      required
                      min={1}
                      className="w-full pl-10 pr-3 py-2.5 text-sm font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    {t.postProduce.priceLabel}
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="number"
                      value={minOfferPrice}
                      onChange={(e) => setMinOfferPrice(e.target.value)}
                      required
                      min={1}
                      className="w-full pl-10 pr-3 py-2.5 text-sm font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* APMC Benchmark Feedback */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-900 block">
                      Prevailing APMC Modal Benchmark: {formatCurrency(benchmarkRate)}/Q
                    </span>
                    <span className="text-[11px] text-amber-700">
                      {isCompetitive
                        ? "✓ Your offer price is attractive to commercial institutional buyers."
                        : "Your offer price is above prevailing wholesale modal rate (Premium Lot)."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.postProduce.districtLabel}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.postProduce.stateLabel}
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.postProduce.pincodeLabel}
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Harvest Date & Organic Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.postProduce.harvestDateLabel}
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex items-center pt-6">
                  <label className="relative flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOrganic}
                      onChange={(e) => setIsOrganic(e.target.checked)}
                      className="w-5 h-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {t.postProduce.organicLabel}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold rounded-xl text-sm transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? "Publishing Produce..." : t.postProduce.submitBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Live Preview Card */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                Live Buyer Feed Preview
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3">
                <div className="h-36 bg-emerald-800 rounded-xl flex items-center justify-center text-4xl text-white font-black relative overflow-hidden">
                  {category === "Vegetables" && "🍅"}
                  {category === "Grains" && "🌾"}
                  {category === "Fruits" && "🍎"}
                  {category === "Spices" && "🌶️"}
                  {category === "Dairy" && "🥛"}
                  <div className="absolute top-2 right-2">
                    {isOrganic && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Organic
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {category}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base mt-1">
                    {commodity || "Sample Produce"}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{district}, {state}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Ask Rate</span>
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(minOfferPrice || 0)}/Q
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Lot Volume</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {quantityQuintal || 0} Quintals
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Direct Farmer Guarantee</div>
                <p>
                  Your produce listing will be linked with your DigiLocker verified identity and made available to wholesale traders in under 50ms.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
