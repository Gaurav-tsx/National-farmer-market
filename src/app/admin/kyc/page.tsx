"use client";

import React, { useState, useEffect } from "react";
import { useAdminSession } from "@/lib/admin-session-context";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  LandPlot,
  FileText,
  Lock,
  Search,
  Check,
  X,
  AlertTriangle,
  History,
} from "lucide-react";

interface KYCQueueItem {
  id: string;
  userId: string;
  documentType: "AADHAAR_XML" | "PAN" | "UDYAM";
  docHashOrId: string;
  docHashFull: string;
  verificationRef: string;
  status: "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  metadata: {
    digiLockerName: string;
    digiLockerDob: string;
    digiLockerPincode: string;
    digiLockerState: string;
    landRecordNumber?: string;
    declaredLandAcres?: number;
    declaredCrops?: string[];
    cropSelfDeclaration: string;
    matchScore: number;
  };
  user?: {
    fullName: string;
    phoneNumber: string;
    state: string;
    district: string;
    pincode: string;
  };
}

export default function AdminKYCQueuePage() {
  const { currentSession, can } = useAdminSession();
  const [kycRecords, setKycRecords] = useState<KYCQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showReasonDialog, setShowReasonDialog] = useState<"REJECT" | "RESUBMIT" | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc", {
        headers: { "x-admin-role": currentSession?.role || "COMPLIANCE_OFFICER" },
      });
      const json = await res.json();
      if (json.data) {
        setKycRecords(json.data);
        if (json.data.length > 0 && !selectedKycId) {
          setSelectedKycId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load KYC queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [currentSession]);

  const activeRecord = kycRecords.find((k) => k.id === selectedKycId) || kycRecords[0];

  const handleReviewAction = async (action: "APPROVE" | "REJECT" | "RESUBMIT") => {
    if (!activeRecord || !currentSession) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: activeRecord.id,
          action,
          adminRole: currentSession.role,
          adminEmail: currentSession.email,
          adminName: currentSession.name,
          reason: rejectionReason || (action === "APPROVE" ? "DigiLocker parameters match verified land records." : undefined),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to process KYC action");
      }

      setActionSuccess(`KYC submission successfully processed as: ${action}`);
      setShowReasonDialog(null);
      setRejectionReason("");
      await fetchRecords();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error updating KYC");
    } finally {
      setActionLoading(false);
    }
  };

  if (!can("REVIEW_KYC")) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Access Restricted</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your current role (<span className="text-amber-400 font-mono">{currentSession?.role}</span>) does not hold the &apos;REVIEW_KYC&apos; privilege. Use the switcher in the header to switch to <span className="text-emerald-400 font-semibold">COMPLIANCE_OFFICER</span> or <span className="text-emerald-400 font-semibold">SUPER_ADMIN</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Compliance Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Farmer KYC Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Side-by-side compliance audit: Farmer Crop Declaration vs. DigiLocker Government Parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Pending Review: <strong className="text-amber-400">{kycRecords.filter((k) => k.status === "PENDING_REVIEW").length}</strong>
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center text-slate-500 text-sm">
          Loading DigiLocker KYC queue...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Applications List (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2.5 overflow-y-auto max-h-[680px]">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
              <span>Submitted Records ({kycRecords.length})</span>
            </div>

            {kycRecords.map((item) => {
              const isSelected = item.id === (activeRecord?.id || "");
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedKycId(item.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-slate-800 border-blue-500 shadow-lg"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {item.documentType}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "VERIFIED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : item.status === "REJECTED"
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-white truncate">
                    {item.user?.fullName || item.metadata.digiLockerName}
                  </div>

                  <div className="text-xs text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{item.user?.district}, {item.user?.state}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {item.metadata.matchScore}% Match
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Side-by-Side Comparison & 1-Click Action Bar (8 cols) */}
          {activeRecord && (
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Record Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      DigiLocker Reference: {activeRecord.verificationRef}
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {activeRecord.user?.fullName || activeRecord.metadata.digiLockerName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Identity Match Score:</span>
                    <span className="text-base font-black px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                      {activeRecord.metadata.matchScore}%
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Farmer Self-Declaration */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
                      <LandPlot className="w-4 h-4" />
                      <span>Farmer Self-Declaration</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Declared Name:</span>
                        <span className="text-slate-200 font-bold">{activeRecord.user?.fullName}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Mobile / Contact:</span>
                        <span className="text-slate-300 font-mono">{activeRecord.user?.phoneNumber}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Declared Land Parcel:</span>
                        <span className="text-emerald-400 font-bold">
                          {activeRecord.metadata.declaredLandAcres || 5.0} Acres (Cultivated)
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Location & Pincode:</span>
                        <span className="text-slate-300">
                          {activeRecord.user?.district}, {activeRecord.user?.state} ({activeRecord.user?.pincode})
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="text-slate-500 block text-[11px]">Crop Declaration Notes:</span>
                        <p className="text-slate-300 text-xs italic bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/60 mt-1">
                          &quot;{activeRecord.metadata.cropSelfDeclaration}&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: DigiLocker Verified Parameters */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>DigiLocker Authenticated</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Document Full Name:</span>
                        <span className="text-emerald-400 font-bold">{activeRecord.metadata.digiLockerName}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Masked Gov ID Reference:</span>
                        <span className="text-slate-200 font-mono font-bold">
                          {activeRecord.docHashOrId}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">State Land Record (RoR / 7/12):</span>
                        <span className="text-amber-400 font-mono font-bold">
                          {activeRecord.metadata.landRecordNumber || "7/12-VERIFIED-ONLINE"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px]">Registered Gov Address:</span>
                        <span className="text-slate-300">
                          {activeRecord.metadata.digiLockerState} (PIN: {activeRecord.metadata.digiLockerPincode})
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="text-slate-500 block text-[11px]">Irreversible Storage Proof:</span>
                        <span className="text-[10px] font-mono text-slate-400 break-all bg-slate-900/90 p-2 rounded-lg block border border-slate-800/60 mt-1">
                          SHA256: {activeRecord.docHashFull.slice(0, 32)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar (Single-Click Approve, Resubmit, Reject) */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Action will append immutable entry to system Audit Trail.</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {/* Single-Click Reject Button */}
                  <button
                    onClick={() => setShowReasonDialog("REJECT")}
                    disabled={actionLoading}
                    className="py-2.5 px-4 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  {/* Single-Click Request Resubmission Button */}
                  <button
                    onClick={() => setShowReasonDialog("RESUBMIT")}
                    disabled={actionLoading}
                    className="py-2.5 px-4 rounded-xl bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Request Resubmit</span>
                  </button>

                  {/* Single-Click Approve Button */}
                  <button
                    onClick={() => handleReviewAction("APPROVE")}
                    disabled={actionLoading}
                    className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoading ? "Processing..." : "Approve KYC"}</span>
                  </button>
                </div>
              </div>

              {/* Reason Modal Dialog for Reject / Resubmit */}
              {showReasonDialog && (
                <div className="p-4 bg-slate-950 border border-slate-700 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>
                      {showReasonDialog === "REJECT"
                        ? "Enter Mandatory Rejection Reason"
                        : "Enter Resubmission Guidance for Farmer"}
                    </span>
                    <button
                      onClick={() => setShowReasonDialog(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={
                      showReasonDialog === "REJECT"
                        ? "e.g. Land record number does not match district revenue records."
                        : "e.g. Please re-upload clearer 7/12 extract showing current seasonal harvest."
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowReasonDialog(null)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReviewAction(showReasonDialog)}
                      className="px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-xl"
                    >
                      Confirm {showReasonDialog}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
