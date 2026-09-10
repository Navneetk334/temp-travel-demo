"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function UserPermissionsPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, profileRes] = await Promise.all([
          fetch("/api/admin/staff"),
          fetch("/api/admin/permission-profiles")
        ]);

        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaffList(staffData.staff || []);
        }
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfiles(profileData.profiles || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (staffId: string, newProfileId: string) => {
    setUpdatingId(staffId);
    try {
      const staffMember = staffList.find((s) => s.id === staffId);
      if (!staffMember) return;

      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: staffMember.name,
          email: staffMember.email,
          role: staffMember.role,
          departmentId: staffMember.departmentId,
          permissionProfileId: newProfileId || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update permissions");

      const data = await res.json();
      setStaffList(staffList.map((s) => (s.id === staffId ? data.staff : s)));
    } catch (err: any) {
      alert("Error updating permissions: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStaff = staffList.filter((stf) => {
    const safeName = stf.name || "";
    const safeEmail = stf.email || "";
    const safeRole = stf.role || "";
    return (
      safeName.toLowerCase().includes(search.toLowerCase()) ||
      safeEmail.toLowerCase().includes(search.toLowerCase()) ||
      safeRole.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>User Permissions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Assign Permission Profiles to office staff to restrict or grant access to system modules.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Staff Permissions List */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 border-b border-white/10">Staff Name</th>
                <th className="px-4 py-3 border-b border-white/10">System Role</th>
                <th className="px-4 py-3 border-b border-white/10">Permission Profile</th>
                <th className="px-4 py-3 border-b border-white/10 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Loading staff records...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No staff members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((stf) => (
                  <tr key={stf.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-100">
                      <div>{stf.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{stf.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        {stf.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={stf.permissionProfileId || ""}
                        onChange={(e) => handleUpdateProfile(stf.id, e.target.value)}
                        disabled={updatingId === stf.id || stf.role === "SUPER_ADMIN" || stf.role === "MASTER_ADMIN"}
                        className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 min-w-[200px]"
                      >
                        <option value="">-- No Profile Assigned --</option>
                        {profiles.map((prof) => (
                          <option key={prof.id} value={prof.id}>
                            {prof.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {stf.role === "SUPER_ADMIN" || stf.role === "MASTER_ADMIN" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <ShieldCheck className="w-3 h-3" /> Full Access
                        </span>
                      ) : !stf.permissionProfileId ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <ShieldAlert className="w-3 h-3" /> Restricted
                        </span>
                      ) : updatingId === stf.id ? (
                        <span className="text-amber-400 font-bold animate-pulse">Saving...</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Configured
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
