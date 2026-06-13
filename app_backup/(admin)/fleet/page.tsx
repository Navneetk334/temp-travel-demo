"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Car, 
  Users, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Compass
} from "lucide-react";

interface Vehicle {
  id: string;
  model: string;
  make: string;
  registrationNumber: string;
  capacity: number;
  status: "AVAILABLE" | "ON_TRIP" | "MAINTENANCE" | "INACTIVE";
  categoryId: string;
  driverId?: string | null;
  driver?: {
    name: string;
    phone: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Driver {
  id: string;
  name: string;
  role: string;
}

export default function AdminFleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    model: "",
    make: "",
    registrationNumber: "",
    capacity: 4,
    status: "AVAILABLE" as "AVAILABLE" | "ON_TRIP" | "MAINTENANCE" | "INACTIVE",
    categoryId: "",
    driverId: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [vehiclesRes, catsRes, driversRes] = await Promise.all([
          fetch("/api/fleet"),
          fetch("/api/fleet/categories"),
          // Mock fetch or custom endpoint for drivers (Users with role='DRIVER')
          fetch("/api/auth/drivers").then(res => res.ok ? res.json() : [])
        ]);

        if (vehiclesRes.ok && catsRes.ok) {
          const vData = await vehiclesRes.json();
          const cData = await catsRes.json();
          setVehicles(vData);
          setCategories(cData);
          setDrivers(driversRes || []);
          if (cData.length > 0 && !formData.categoryId) {
            setFormData(prev => ({ ...prev, categoryId: cData[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load admin fleet data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openModal = (vehicle: Vehicle | null = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        model: vehicle.model,
        make: vehicle.make,
        registrationNumber: vehicle.registrationNumber,
        capacity: vehicle.capacity,
        status: vehicle.status,
        categoryId: vehicle.categoryId,
        driverId: vehicle.driverId || "",
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        model: "",
        make: "",
        registrationNumber: "",
        capacity: 4,
        status: "AVAILABLE",
        categoryId: categories[0]?.id || "",
        driverId: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle from the fleet?")) return;
    try {
      const res = await fetch(`/api/fleet/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVehicles(vehicles.filter(v => v.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete vehicle");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      model: formData.model,
      make: formData.make,
      registrationNumber: formData.registrationNumber,
      capacity: Number(formData.capacity),
      status: formData.status,
      categoryId: formData.categoryId,
      driverId: formData.driverId || null,
    };

    try {
      const url = editingVehicle ? `/api/fleet/${editingVehicle.id}` : "/api/fleet";
      const method = editingVehicle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        // Reload dispatch lists to get fully joined driver profiles
        const reloadRes = await fetch("/api/fleet");
        if (reloadRes.ok) {
          const reloaded = await reloadRes.json();
          setVehicles(reloaded);
        }
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save vehicle details");
      }
    } catch (err) {
      console.error("Save Vehicle Error:", err);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Car className="w-8 h-8 text-accent" />
            <span>Fleet Management Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Add vehicles, audit status codes, and manage default driver allocations.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide transition-all shadow-lg border border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fleet Vehicle</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading fleet list...</div>
      ) : (
        <div className="glassmorphism rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Vehicle Model</th>
                <th className="p-4">Reg Number</th>
                <th className="p-4">Category</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Allocated Driver</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No fleet vehicles found. Click "Add Fleet Vehicle" to begin.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{v.make} {v.model}</div>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-300">
                      {v.registrationNumber}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-400">
                      {categories.find(c => c.id === v.categoryId)?.name || "Uncategorized"}
                    </td>
                    <td className="p-4 text-slate-300">
                      {v.capacity} Seats
                    </td>
                    <td className="p-4 text-slate-300 text-xs">
                      {v.driver ? (
                        <div>
                          <div className="font-bold text-slate-200">{v.driver.name}</div>
                          <div className="text-slate-500 mt-0.5">{v.driver.phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No Driver Allocated</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold py-1 px-2.5 rounded-full border ${
                        v.status === "AVAILABLE" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : v.status === "ON_TRIP"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : v.status === "MAINTENANCE"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openModal(v)}
                        className="inline-flex p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-accent transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="inline-flex p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add/Edit Vehicle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
              <Car className="w-5 h-5 text-accent" />
              <span>{editingVehicle ? "Edit Fleet Vehicle" : "Add Fleet Vehicle"}</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Manufacturer / Make</label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="e.g. Maruti Suzuki, Toyota"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Dzire, Innova Crysta"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="e.g. MH-12-PQ-9999"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="AVAILABLE" className="bg-slate-900 font-bold text-green-400">AVAILABLE</option>
                    <option value="ON_TRIP" className="bg-slate-900">ON_TRIP</option>
                    <option value="MAINTENANCE" className="bg-slate-900">MAINTENANCE</option>
                    <option value="INACTIVE" className="bg-slate-900">INACTIVE</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Allocate Driver (Optional)</label>
                  <select
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="" className="bg-slate-900">No Driver Allocated</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-900 border border-white/10 text-slate-300 font-semibold py-2 px-6 rounded-lg text-sm tracking-wide transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-accent hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-8 rounded-lg text-sm tracking-wider uppercase transition-all shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Vehicle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
