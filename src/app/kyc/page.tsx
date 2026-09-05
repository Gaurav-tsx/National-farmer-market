"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/lib/i18n/context";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  ArrowRight,
  LandPlot,
  Building2,
} from "lucide-react";

export default function FarmerKYCPage() {
  const { t } = useLanguage();

  const [documentType, setDocumentType] = useState<"AADHAAR_XML" | "PAN" | "UDYAM">("AADHAAR_XML");
  const [rawId, setRawId] = useState("918273644819");
  const [holderName, setHolderName] = useState("Ramesh Tukaram Patil");
  const [district, setDistrict] = useState("Nashik");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("422003");
  const [cropDeclaration, setCropDeclaration] = useState("Cultivating 6.5 Acres of export-grade Red Onion and Tomatoes.");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    maskedId: string;
    verificationRef: string;
    status: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr-farmer-101",
          documentType,
          rawId,
          holderName,
          state,
          district,
          pincode,
          cropDeclaration,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to submit KYC");
      }

      setSubmittedData({
        maskedId: json.data.maskedId,
        verificationRef: json.data.verificationRef,
        status: json.data.status,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting KYC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            DigiLocker Integration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.kyc.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t.kyc.subtitle}
          </p>
        </div>

        {/* Regulatory Privacy Notice */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 rounded-2xl border border-emerald-800 shadow-md mb-8 flex items-start gap-3.5">
          <Lock className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-emerald-200">
              Government Regulatory Privacy & Zero-Cleartext Guarantee
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.kyc.aadhaarNotice}
            </p>
          </div>
        </div>

        {submittedData ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg space-y-6 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Status: {submittedData.status}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-3">
                {t.kyc.pendingStatus}
              </h3>
            </div>

            {/* Verification Credentials Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Sanitized Masked ID:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {submittedData.maskedId}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">DigiLocker Transaction Ref:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {submittedData.verificationRef}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cryptographic Storage:</span>
                <span className="font-bold text-slate-700">SHA-256 + Pepper (Irreversible)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              A Compliance Officer will review your crop declaration and land records within the admin queue.
            </p>

            <button
              onClick={() => setSubmittedData(null)}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
            >
              Submit Another Verification
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Document Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                {t.kyc.selectDoc}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDocumentType("AADHAAR_XML");
                    setRawId("918273644819");
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    documentType === "AADHAAR_XML"
                      ? "bg-blue-50/70 border-blue-600 text-blue-900 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="w-5 h-5 mb-1 text-blue-600" />
                  <div className="font-bold text-xs">{t.kyc.aadhaar}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">UIDAI e-KYC Offline XML</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDocumentType("PAN");
                    setRawId("ABCDE4819F");
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    documentType === "PAN"
                      ? "bg-blue-50/70 border-blue-600 text-blue-900 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <KeyRound className="w-5 h-5 mb-1 text-amber-600" />
                  <div className="font-bold text-xs">{t.kyc.pan}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Income Tax Department</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDocumentType("UDYAM");
                    setRawId("UDYAM-MH-26-0019281");
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    documentType === "UDYAM"
                      ? "bg-blue-50/70 border-blue-600 text-blue-900 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="w-5 h-5 mb-1 text-emerald-600" />
                  <div className="font-bold text-xs">{t.kyc.udyam}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Farmer Producer Org (FPO)</div>
                </button>
              </div>
            </div>

            {/* Document Number & Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {t.kyc.enterNumber}
                </label>
                <input
                  type="text"
                  value={rawId}
                  onChange={(e) => setRawId(e.target.value)}
                  placeholder={documentType === "AADHAAR_XML" ? "12-digit Aadhaar" : "10-char PAN"}
                  required
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Will be masked to <span className="font-mono font-bold text-slate-700">XXXX-XXXX-{rawId.slice(-4)}</span> before storage.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {t.kyc.holderName}
                </label>
                <input
                  type="text"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.kyc.state}</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.kyc.district}</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.kyc.pincode}</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Crop & Land Self-Declaration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <LandPlot className="w-4 h-4 text-emerald-600" />
                Farmer Land & Crop Self-Declaration
              </label>
              <textarea
                value={cropDeclaration}
                onChange={(e) => setCropDeclaration(e.target.value)}
                rows={3}
                placeholder="State your land parcel size, cultivation season, and primary crops..."
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-extrabold rounded-xl text-sm transition-all shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Transmitting via DigiLocker..." : t.kyc.submitKyc}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
