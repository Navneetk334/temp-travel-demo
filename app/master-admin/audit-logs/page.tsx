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
  Clock
} from "lucide-react";

export default function MasterAuditLogsPage() {
  const auditLogs = [
    {
      id: "LOG-9941",
      timestamp: "2026-08-21 14:45:12",
      user: "Master Super Admin",
      role: "SUPER_ADMIN",
      action: "RECONCILED_DRIVER_CASH",
      details: "Reconciled ₹49,000 driver cash collection against duty roster MH 02 CZ 4421.",
      ipAddress: "103.21.124.89",
      severity: "INFO"
    },
    {
      id: "LOG-9940",
      timestamp: "2026-08-21 13:30:05",
      user: "Navneet Kumar",
      role: "OPERATIONS_DISPATCH",
      action: "ASSIGNED_DRIVER_DUTY",
      details: "Assigned Chauffeur Rajesh Kumar to Airport Transfer Booking #BK-8841.",
      ipAddress: "103.21.124.90",
      severity: "INFO"
    },
    {
      id: "LOG-9939",
      timestamp: "2026-08-21 12:15:30",
      user: "Master Super Admin",
      role: "SUPER_ADMIN",
      action: "UPDATED_VEHICLE_TARIFF",
      details: "Updated per-km rate for Sedan Category from ₹12/km to ₹14/km.",
      ipAddress: "103.21.124.89",
      severity: "IMPORTANT"
    },
    {
      id: "LOG-9938",
      timestamp: "2026-08-21 11:00:00",
      user: "System Automated Webhook",
      role: "RAZORPAY_WEBHOOK",
      action: "VERIFIED_PAYMENT_HMAC",
      details: "Razorpay payment ID pay_Qx8812 verified with HMAC SHA-256 signature.",
      ipAddress: "52.66.12.18",
      severity: "INFO"
    }
  ];

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
          <button className="flex items-center gap-2 bg-slate-900 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>SSL / TLS 1.3 Active</span>
          </button>
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
              {auditLogs.map((log) => (
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
