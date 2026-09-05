"use client";

import React, { useState, useEffect } from "react";
import { useAdminSession } from "@/lib/admin-session-context";
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Code2,
  Calendar,
  User,
  Shield,
  Activity,
  Globe,
} from "lucide-react";

interface AuditLogRecord {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  timestamp: string;
  ipAddress: string;
  metadata?: Record<string, unknown>;
}

export default function AdminAuditExplorerPage() {
  const { currentSession } = useAdminSession();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit", {
        headers: { "x-admin-role": currentSession?.role || "SUPER_ADMIN" },
      });
      const json = await res.json();
      if (json.data) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentSession]);

  const actionsList = [
    "all",
    "KYC_APPROVE",
    "KYC_REJECT",
    "UPDATE_MANDI_SPOT_PRICE",
    "ADMIN_SSO_LOGIN",
    "UNAUTHORIZED_LOGIN_ATTEMPT",
    "MODIFY_STAFF_ROLE",
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === "all" || log.action.includes(filterAction);
    const matchesSearch =
      !searchQuery.trim() ||
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 text-purple-400 border border-purple-800 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            Immutable Audit Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Audit Log Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Read-only, tamper-evident regulatory tracking of every administrative action, verified account, and spot rate change.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Total Recorded Operations: <strong className="text-emerald-400">{logs.length}</strong>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by staff name, email, target entity, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {actionsList.map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                filterAction === act
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              {act === "all" ? "All Actions" : act}
            </button>
          ))}
        </div>
      </div>

      {/* Table & Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List (8 cols or 12 cols if no inspector) */}
        <div className={`${selectedLog ? "lg:col-span-7" : "lg:col-span-12"} bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Timestamp & IP</th>
                  <th className="py-3.5 px-3">Actor / Staff</th>
                  <th className="py-3.5 px-3">Action Event</th>
                  <th className="py-3.5 px-3">Target Entity</th>
                  <th className="py-3.5 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  const isNegative = log.action.includes("REJECT") || log.action.includes("UNAUTHORIZED");

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-purple-950/40 border-l-2 border-purple-500" : "hover:bg-slate-800/40"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-bold">
                          {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">{log.ipAddress}</div>
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <div className="font-bold text-white text-xs">{log.adminName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.adminRole}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isNegative
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300">
                        <span className="text-slate-400">{log.targetEntity}:</span>{" "}
                        <span className="text-white font-bold">{log.targetId}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 font-mono text-[10px] inline-flex items-center gap-1"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>JSON</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON Inspector Card */}
        {selectedLog && (
          <div className="lg:col-span-5 bg-slate-900 border border-purple-800/60 rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Audit Record Diff Payload
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                <div><strong className="text-slate-500">Record ID:</strong> {selectedLog.id}</div>
                <div><strong className="text-slate-500">Actor Email:</strong> {selectedLog.adminId}</div>
                <div><strong className="text-slate-500">Actor Name:</strong> {selectedLog.adminName}</div>
                <div><strong className="text-slate-500">Client IP:</strong> {selectedLog.ipAddress}</div>
                <div><strong className="text-slate-500">Timestamp:</strong> {selectedLog.timestamp}</div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  Event Metadata JSON:
                </span>
                <pre className="mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-[11px] overflow-x-auto max-h-72">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
