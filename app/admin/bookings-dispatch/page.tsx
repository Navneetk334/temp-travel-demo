"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarRange, 
  Search, 
  Download, 
  Car, 
  User, 
  Clock, 
  MapPin, 
  CreditCard,
  CheckCircle,
  X,
  AlertCircle,
  Truck,
  FileText,
  DollarSign
} from "lucide-react";

interface Customer {
  name: string;
  phone: string;
  email: string;
}

interface VehicleCategory {
  id: string;
  name: string;
}

interface Driver {
  name: string;
  phone: string;
}

interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  driver?: Driver | null;
}

interface Payment {
  id: string;
  status: string;
  gateway: string;
  amount: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  type: string;
  status: "PENDING" | "CONFIRMED" | "DRIVER_ASSIGNED" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
  pickupDateTime: string;
  pickupLocation: string;
  dropLocation?: string | null;
  totalAmount: string;
  taxAmount: string;
  netAmount: string;
  notes?: string | null;
  outstationType?: string | null;
  returnDateTime?: string | null;
  rentalDurationHrs?: number | null;
  rentalDurationKms?: number | null;
  customer: Customer;
  vehicleCategory: VehicleCategory;
  vehicle?: Vehicle | null;
  payments: Payment[];
  createdAt: string;
}

export default function BookingDispatchPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Modals state
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const url = `/api/bookings?search=${encodeURIComponent(search)}${
        statusFilter ? `&status=${statusFilter}` : ""
      }`;
      const bookingsRes = await fetch(url);
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data);
      }

      // Fetch vehicles to use for dispatch assignments
      const vehiclesRes = await fetch("/api/fleet");
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(bookings.map(b => b.id === id ? { ...b, status: updated.status, vehicle: updated.vehicle } : b));
        if (activeBooking && activeBooking.id === id) {
          setActiveBooking({ ...activeBooking, status: updated.status, vehicle: updated.vehicle });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVehicleAssign = async (bookingId: string, vehicleId: string | null) => {
    try {
      const newStatus = vehicleId ? "DRIVER_ASSIGNED" : "CONFIRMED";
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, vehicleId: updated.vehicleId, vehicle: updated.vehicle, status: updated.status } : b));
        setAssignModalOpen(false);
        setActiveBooking(null);
        alert("Vehicle & Chauffeur dispatched successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Client-side CSV generation
  const handleExport = () => {
    const headers = ["Booking Number,Customer Name,Phone,Email,Trip Type,Vehicle Category,Pickup Location,Drop Location,Pickup Date & Time,Assigned Vehicle,Assigned Driver,Payment Status,Booking Status,Net Amount"];
    const rows = bookings.map(b => [
      b.bookingNumber,
      b.customer.name,
      b.customer.phone,
      b.customer.email,
      b.type,
      b.vehicleCategory.name,
      `"${b.pickupLocation}"`,
      b.dropLocation ? `"${b.dropLocation}"` : "",
      new Date(b.pickupDateTime).toLocaleString(),
      b.vehicle ? b.vehicle.registrationNumber : "Unassigned",
      b.vehicle?.driver ? b.vehicle.driver.name : "Unassigned",
      b.payments?.[0]?.status || "PENDING",
      b.status,
      b.netAmount
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings_dispatch_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2.5">
            <CalendarRange className="w-8 h-8 text-accent" />
            <span>Bookings Dispatch Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Assign drivers, monitor routes, manage live trip dispatch statuses, and audit billing ledgers.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-6 rounded-lg text-sm tracking-wide transition-all border border-white/10 shadow-lg"
        >
          <Download className="w-4 h-4 text-accent" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Grid: Search controls */}
      <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search booking number, name, phone, route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950/60 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all appearance-none"
        >
          <option value="" className="bg-slate-900">All Booking Statuses</option>
          <option value="PENDING" className="bg-slate-900 text-yellow-400">PENDING</option>
          <option value="CONFIRMED" className="bg-slate-900 text-blue-400">CONFIRMED</option>
          <option value="DRIVER_ASSIGNED" className="bg-slate-900 text-cyan-400">DRIVER_ASSIGNED</option>
          <option value="IN_TRANSIT" className="bg-slate-900 text-green-400">IN_TRANSIT</option>
          <option value="COMPLETED" className="bg-slate-900 text-slate-400">COMPLETED</option>
          <option value="CANCELLED" className="bg-slate-900 text-red-400">CANCELLED</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="glassmorphism rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading booking records...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Trip details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Assigned Chauffeur</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Trip Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No booking records found matching current query filters.
                    </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-200">{booking.bookingNumber}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{booking.type}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{booking.customer.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{booking.customer.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300 text-xs truncate max-w-xs">{booking.pickupLocation}</div>
                      {booking.dropLocation && (
                        <div className="text-slate-500 text-xs truncate max-w-xs mt-0.5">to {booking.dropLocation}</div>
                      )}
                      <div className="text-[10px] text-accent mt-1">{new Date(booking.pickupDateTime).toLocaleString("en-IN")}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium text-xs">
                      {booking.vehicleCategory.name}
                    </td>
                    <td className="p-4">
                      {booking.vehicle ? (
                        <div>
                          <div className="font-bold text-slate-200 text-xs">{booking.vehicle.registrationNumber}</div>
                          <div className="text-[10px] text-slate-400">{booking.vehicle.driver?.name || "No Driver Assigned"}</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setActiveBooking(booking); setAssignModalOpen(true); }}
                          className="bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent font-bold py-1 px-2.5 rounded text-[10px] uppercase tracking-wider transition-all"
                        >
                          Assign Cab
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${
                        booking.payments?.[0]?.status === "SUCCESS"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : booking.payments?.[0]?.status === "REFUNDED"
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>
                        {booking.payments?.[0]?.status || "PENDING"}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className={`text-[10px] font-bold bg-slate-950/60 border rounded py-1 px-2 focus:outline-none ${
                          booking.status === "PENDING" ? "text-yellow-400 border-yellow-500/20" :
                          booking.status === "CONFIRMED" ? "text-blue-400 border-blue-500/20" :
                          booking.status === "DRIVER_ASSIGNED" ? "text-cyan-400 border-cyan-500/20" :
                          booking.status === "IN_TRANSIT" ? "text-green-400 border-green-500/20" :
                          booking.status === "COMPLETED" ? "text-slate-400 border-slate-500/20" :
                          "text-red-400 border-red-500/20"
                        }`}
                      >
                        <option value="PENDING" className="bg-slate-900 text-yellow-400">PENDING</option>
                        <option value="CONFIRMED" className="bg-slate-900 text-blue-400">CONFIRMED</option>
                        <option value="DRIVER_ASSIGNED" className="bg-slate-900 text-cyan-400">DRIVER_ASSIGNED</option>
                        <option value="IN_TRANSIT" className="bg-slate-900 text-green-400">IN_TRANSIT</option>
                        <option value="COMPLETED" className="bg-slate-900 text-slate-400">COMPLETED</option>
                        <option value="CANCELLED" className="bg-slate-900 text-red-400">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => { setActiveBooking(booking); setDetailsModalOpen(true); }}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-1 px-3 border border-white/5 rounded text-[10px] uppercase tracking-wider transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL 1: Assign Vehicle */}
      {assignModalOpen && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6 glassmorphism relative">
            <button 
              onClick={() => { setAssignModalOpen(false); setActiveBooking(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">Dispatch allocation</span>
              <h3 className="text-xl font-bold text-slate-50">Assign Cab for #{activeBooking.bookingNumber}</h3>
              <p className="text-xs text-slate-400">Preferred Category: <span className="font-bold text-slate-200">{activeBooking.vehicleCategory.name}</span></p>
            </div>

            {/* List category matching vehicles */}
            <div className="space-y-3 max-h-80 overflow-y-auto pt-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Available Category Fleet</div>
              {vehicles
                .filter(v => v.categoryId === activeBooking.vehicleCategory.id)
                .map(v => (
                  <div 
                    key={v.id} 
                    className="flex justify-between items-center bg-slate-950/60 p-4 border border-white/5 rounded-xl hover:border-accent/40 transition-all text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-extrabold text-slate-200 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-accent" />
                        <span>{v.registrationNumber} ({v.model})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Chauffeur: {v.driver?.name || "No Driver Assigned"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVehicleAssign(activeBooking.id, v.id)}
                      className="bg-primary hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded text-[10px] uppercase tracking-wider transition-all"
                    >
                      Assign Trip
                    </button>
                  </div>
                ))}

              {vehicles.filter(v => v.categoryId === activeBooking.vehicleCategory.id).length === 0 && (
                <div className="text-center p-8 bg-slate-950/40 rounded-xl border border-white/5 text-slate-500 text-xs italic space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto text-slate-600" />
                  <p>No active vehicles found in this category.</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {activeBooking.vehicle && (
              <button
                onClick={() => handleVehicleAssign(activeBooking.id, null)}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all"
              >
                Clear Allocated Vehicle
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Details Inspection */}
      {detailsModalOpen && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 glassmorphism relative">
            <button 
              onClick={() => { setDetailsModalOpen(false); setActiveBooking(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">Full Booking Manifest</span>
              <h3 className="text-xl font-bold text-slate-50">Booking details: #{activeBooking.bookingNumber}</h3>
              <p className="text-xs text-slate-400">Created At: {new Date(activeBooking.createdAt).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
              
              {/* Left Column: Customer and Trip details */}
              <div className="space-y-4">
                <div className="bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-2.5">
                  <h4 className="font-extrabold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-slate-400">
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span>Customer Details</span>
                  </h4>
                  <div className="space-y-1">
                    <div>Name: <span className="font-bold text-slate-200">{activeBooking.customer.name}</span></div>
                    <div>Phone: <span className="font-bold text-slate-200">{activeBooking.customer.phone}</span></div>
                    <div>Email: <span className="font-bold text-slate-200">{activeBooking.customer.email}</span></div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-2.5">
                  <h4 className="font-extrabold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>Route & Timing</span>
                  </h4>
                  <div className="space-y-1 leading-relaxed">
                    <div>Trip Type: <span className="font-bold text-slate-200">{activeBooking.type}</span></div>
                    <div>Pickup Address: <span className="font-bold text-slate-200">{activeBooking.pickupLocation}</span></div>
                    {activeBooking.dropLocation && (
                      <div>Drop Address: <span className="font-bold text-slate-200">{activeBooking.dropLocation}</span></div>
                    )}
                    <div>Pickup Date & Time: <span className="font-bold text-accent">{new Date(activeBooking.pickupDateTime).toLocaleString("en-IN")}</span></div>
                    {activeBooking.returnDateTime && (
                      <div>Return Timings: <span className="font-bold text-slate-200">{new Date(activeBooking.returnDateTime).toLocaleString()}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Dispatch */}
              <div className="space-y-4">
                <div className="bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-2.5">
                  <h4 className="font-extrabold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-slate-400">
                    <DollarSign className="w-3.5 h-3.5 text-accent" />
                    <span>Billing Summary</span>
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Base Amount:</span>
                      <span className="font-bold text-slate-200">₹{Number(activeBooking.totalAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Commercial Tax (GST):</span>
                      <span className="font-bold text-slate-200">₹{Number(activeBooking.taxAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1 mt-1 text-sm">
                      <span className="text-slate-300 font-bold">Total Net Amount:</span>
                      <span className="font-extrabold text-accent">₹{Number(activeBooking.netAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-2.5">
                  <h4 className="font-extrabold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-slate-400">
                    <Car className="w-3.5 h-3.5 text-accent" />
                    <span>Dispatch Details</span>
                  </h4>
                  {activeBooking.vehicle ? (
                    <div className="space-y-1">
                      <div>Allocated Vehicle: <span className="font-bold text-slate-200">{activeBooking.vehicle.registrationNumber} ({activeBooking.vehicle.model})</span></div>
                      <div>Driver Name: <span className="font-bold text-slate-200">{activeBooking.vehicle.driver?.name || "N/A"}</span></div>
                      <div>Driver Phone: <span className="font-bold text-slate-200">{activeBooking.vehicle.driver?.phone || "N/A"}</span></div>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic text-[11px]">No vehicle dispatched for this trip segment yet.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Outstation details or Rental details */}
            {(activeBooking.rentalDurationHrs || activeBooking.notes) && (
              <div className="bg-slate-950/60 p-4 border border-white/5 rounded-xl text-xs space-y-1.5">
                <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-slate-500">Additional Rental Manifest Notes</h4>
                {activeBooking.rentalDurationHrs && (
                  <div className="text-slate-300">Package Duration Boundaries: <span className="font-bold text-slate-200">{activeBooking.rentalDurationHrs} Hrs / {activeBooking.rentalDurationKms} Kms</span></div>
                )}
                {activeBooking.notes && (
                  <p className="text-slate-400 italic font-normal">"{activeBooking.notes}"</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { setDetailsModalOpen(false); setAssignModalOpen(true); }}
                className="flex-1 bg-primary hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Car className="w-4 h-4" />
                <span>Re-assign Dispatched Cab</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
