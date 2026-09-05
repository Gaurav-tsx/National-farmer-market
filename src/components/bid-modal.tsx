"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { X, ShieldCheck, CheckCircle2, AlertCircle, IndianRupee } from "lucide-react";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    commodity: string;
    quantityQuintal: number;
    minOfferPrice: number;
    district: string;
    state: string;
    farmer?: {
      fullName: string;
      kycStatus: string;
    };
  } | null;
  onSuccess?: () => void;
}

export function BidModal({ isOpen, onClose, listing, onSuccess }: BidModalProps) {
  const { t, formatCurrency } = useLanguage();
  const [bidAmount, setBidAmount] = useState<string>("");
  const [buyerName, setBuyerName] = useState<string>("Bharat Agro Commodities Ltd.");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const numericAmount = parseFloat(bidAmount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid bid amount per quintal.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          buyerName,
          bidAmount: numericAmount,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to submit bid");
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error placing bid");
    } finally {
      setLoading(false);
    }
  };

  const totalContractValue = (parseFloat(bidAmount) || listing.minOfferPrice) * listing.quantityQuintal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Direct Kisan Escrow Bid
            </div>
            <h3 className="text-lg font-bold mt-0.5 text-white">{listing.commodity}</h3>
            <p className="text-xs text-emerald-100">
              {listing.district}, {listing.state} • {listing.quantityQuintal} Quintals
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Bid Submitted Successfully!</h4>
            <p className="text-sm text-slate-600">
              The farmer has been notified via SMS & portal. Escrow reservation initiated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Price reference */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Farmer Ask Price</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCurrency(listing.minOfferPrice)} / Q
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Produce Volume</span>
                <span className="font-bold text-slate-900 text-sm">
                  {listing.quantityQuintal} Quintals
                </span>
              </div>
            </div>

            {/* Buyer identity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Commercial Buyer Organization
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white"
              />
            </div>

            {/* Bid Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Offer Price (₹ per Quintal)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="number"
                  placeholder={`Min: ${listing.minOfferPrice}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required
                  min={1}
                  className="w-full pl-9 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>
            </div>

            {/* Projected Escrow Settlement */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-emerald-900">Total Lot Settlement Value:</span>
                <span className="text-[11px] text-emerald-700 block">
                  (Includes GST & APMC cess exemption)
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-emerald-800">
                  {formatCurrency(totalContractValue)}
                </span>
              </div>
            </div>

            {/* Logistics & Delivery Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Logistics & Farmgate Dispatch Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g., Farmgate self-pickup with insulated refrigerated container within 48 hours."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50"
              >
                {loading ? "Transmitting Bid..." : t.listings.placeBid}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
