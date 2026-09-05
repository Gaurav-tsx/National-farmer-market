"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";
import { BidModal } from "./bid-modal";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  Scale,
  Handshake,
  CheckCircle,
} from "lucide-react";

export interface ListingItem {
  id: string;
  farmerId: string;
  category: "Vegetables" | "Grains" | "Fruits" | "Spices" | "Dairy";
  commodity: string;
  quantityQuintal: number;
  minOfferPrice: number;
  harvestDate: string;
  images: string[];
  isOrganic: boolean;
  isActive: boolean;
  pincode: string;
  district: string;
  state: string;
  bidsCount?: number;
  farmer?: {
    fullName: string;
    kycStatus: "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  };
}

interface ListingCardProps {
  listing: ListingItem;
  apmcBenchmarkPrice?: number;
}

export function ListingCard({ listing, apmcBenchmarkPrice }: ListingCardProps) {
  const { t, formatCurrency } = useLanguage();
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  // Formatted harvest date
  const harvestFormatted = new Date(listing.harvestDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isVerifiedFarmer = listing.farmer?.kycStatus === "VERIFIED";
  const benchmark = apmcBenchmarkPrice || listing.minOfferPrice * 1.05;
  const isBelowApmc = listing.minOfferPrice <= benchmark;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col overflow-hidden group">
        {/* Crop Media Frame */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          {listing.images && listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.commodity}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-100">
              🌾
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            {/* Category Pill */}
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
              {listing.category}
            </span>

            {/* Organic Badge */}
            {listing.isOrganic && (
              <span className="bg-emerald-600/95 backdrop-blur-xs text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {t.listings.organicBadge}
              </span>
            )}
          </div>

          {/* District Banner */}
          <div className="absolute bottom-2 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{listing.district}, {listing.state}</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Farmer Verification Status */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-slate-700 truncate">
                {listing.farmer?.fullName || "Verified Producer"}
              </span>

              {isVerifiedFarmer ? (
                <span
                  className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0"
                  title="Aadhaar XML & Land Record Verified via DigiLocker"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {t.listings.verifiedBadge}
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0">
                  {t.listings.unverifiedBadge}
                </span>
              )}
            </div>

            {/* Commodity Name */}
            <h4 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
              {listing.commodity}
            </h4>

            {/* Meta tags: Harvest date & Pincode */}
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {harvestFormatted}
              </span>
              <span>•</span>
              <span>PIN: {listing.pincode}</span>
            </div>
          </div>

          {/* Pricing & Volume Metrics */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-medium">
                  {t.listings.minPrice}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900">
                    {formatCurrency(listing.minOfferPrice)}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    /{t.listings.quintal}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block uppercase font-medium">
                  {t.listings.quantity}
                </span>
                <span className="text-base font-bold text-emerald-700 flex items-center gap-1 justify-end">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  {listing.quantityQuintal} {t.listings.quintal}
                </span>
              </div>
            </div>

            {/* APMC Benchmark Comparison pill */}
            <div
              className={`p-2 rounded-xl text-[11px] flex items-center justify-between font-medium ${
                isBelowApmc
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200/60"
                  : "bg-amber-50 text-amber-900 border border-amber-200/60"
              }`}
            >
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                {t.listings.apmcBenchmark}:
              </span>
              <span className="font-bold">
                {formatCurrency(benchmark)}
                <span className="text-[9px] font-normal text-slate-600 ml-1">
                  ({isBelowApmc ? "Competitive" : "Premium"})
                </span>
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBidModalOpen(true)}
              className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Handshake className="w-4 h-4 text-emerald-200" />
              <span>{t.listings.placeBid}</span>
              {listing.bidsCount !== undefined && listing.bidsCount > 0 && (
                <span className="bg-emerald-900 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {listing.bidsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        listing={listing}
      />
    </>
  );
}
