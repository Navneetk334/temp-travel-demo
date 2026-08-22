"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download
} from "lucide-react";

export default function MasterAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const exportAuditCSV = () => {
    const headers = ["Event ID", "Timestamp", "User", "Role", "Action", "Details", "IP Address"];
    const rows = filteredLogs.map(l => [l.id, l.timestamp, l.user, l.role, l.action, `"${l.details}"`, l.ipAddress]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Master_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-50">
              System Audit Logs & Security Center
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              100% Immutable Audit Trail
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete system audit trail tracking all master admin actions, RBAC updates, and financial overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportAuditCSV}
            className="flex items-center gap-2 bg-slate-900 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:text-white transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Search & Severity Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit action, user or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-bold uppercase">Severity:</span>
          {["ALL", "INFO", "IMPORTANT"].map((st) => (
            <button
              key={st}
              onClick={() => setSeverityFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                severityFilter === st
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Live Security Event Log</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Retention: 365 Days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Event ID & Timestamp</th>
                <th className="py-3 px-4">Admin User & Role</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Activity Description</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-mono">
                    <div className="font-bold text-amber-400">{log.id}</div>
                    <div className="text-[10px] text-slate-500">{log.timestamp}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-100">{log.user}</div>
                    <div className="text-[10px] font-mono text-amber-400">{log.role}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{log.details}</td>
                  <td className="py-4 px-4 text-right font-mono text-slate-500">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
