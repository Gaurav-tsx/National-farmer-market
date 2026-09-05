"use client";

import React, { useState, useEffect } from "react";
import { useAdminSession } from "@/lib/admin-session-context";
import { AdminRole } from "@/lib/auth";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Mail,
  Calendar,
} from "lucide-react";

interface StaffItem {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string;
}

export default function AdminStaffPage() {
  const { currentSession, can } = useAdminSession();
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; msg: string } | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        headers: { "x-admin-role": currentSession?.role || "SUPER_ADMIN" },
      });
      const json = await res.json();
      if (json.data) {
        setStaffList(json.data);
      }
    } catch (err) {
      console.error("Failed to load staff list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [currentSession]);

  const handleRoleChange = async (email: string, newRole: AdminRole) => {
    if (!currentSession) return;
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newRole,
          adminRole: currentSession.role,
          adminEmail: currentSession.email,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update staff role");
      }

      setStatusMsg({
        success: true,
        msg: `Staff ${email} role changed to ${newRole}. Recorded to Audit Trail.`,
      });
      setTimeout(() => setStatusMsg(null), 3500);
      fetchStaff();
    } catch (err: unknown) {
      setStatusMsg({
        success: false,
        msg: err instanceof Error ? err.message : "Error updating role",
      });
    }
  };

  if (!can("MANAGE_STAFF")) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Super Admin Access Restricted</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Only accounts with the <span className="text-red-400 font-mono font-bold">SUPER_ADMIN</span> credential can provision staff, revoke privileges, and modify RBAC permissions. Please sign in with an authorized Super Admin account.
        </p>
      </div>
    );
  }

  const allRoles: AdminRole[] = [
    "SUPER_ADMIN",
    "COMPLIANCE_OFFICER",
    "MANDI_AUDITOR",
    "DISPUTE_MANAGER",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            Super Admin Provisioning
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Staff Directory & Granular RBAC
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authorize government personnel, configure role scopes, and inspect active Google Workspace accounts.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            statusMsg.success
              ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300"
              : "bg-rose-950/80 border border-rose-800 text-rose-300"
          }`}
        >
          {statusMsg.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMsg.msg}</span>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-4 px-6">Official Name & ID</th>
                <th className="py-4 px-4">Allowlisted Google Email</th>
                <th className="py-4 px-4">Active Role Assignment</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Last Authenticated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{staff.name}</div>
                    <span className="text-[10px] font-mono text-slate-400">{staff.id}</span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{staff.email}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <select
                      value={staff.role}
                      onChange={(e) => handleRoleChange(staff.email, e.target.value as AdminRole)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {allRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        staff.isActive
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-rose-950 text-rose-400 border border-rose-800"
                      }`}
                    >
                      {staff.isActive ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(staff.lastLoginAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
