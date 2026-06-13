import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Car, Users, Clock, Compass, ArrowRight, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const vehicle = await prisma.fleetVehicle.findUnique({
    where: { id: resolvedParams.id },
    include: {
      category: true,
      driver: {
        select: { name: true, phone: true }
      }
    }
  });

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Breadcrumbs */}
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex gap-2">
          <Link href="/fleet" className="hover:text-accent">Fleet</Link>
          <span>/</span>
          <span className="text-slate-300">{vehicle.category.name}</span>
        </div>

        {/* Title and Badge Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-50 tracking-tight leading-tight">
              {vehicle.make} {vehicle.model}
            </h1>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="bg-white/5 py-1 px-3 rounded-full text-accent border border-white/10">{vehicle.category.name}</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-accent" />
                <span>{vehicle.capacity} Seater Capacity</span>
              </span>
              <span className="text-slate-500">Reg: {vehicle.registrationNumber}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/5 p-4 rounded-xl">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimated Base Rate</div>
            <div className="text-2xl font-extrabold text-slate-50 mt-1">
              ₹{Number(vehicle.category.baseKmsRate)}/km
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Applies to local rental packages</div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Vehicle Specifications */}
          <div className="lg:col-span-8 space-y-12">
            {/* Image display */}
            <div className="relative h-[300px] md:h-[450px] bg-slate-900 rounded-xl overflow-hidden border border-white/5">
              <img
                src={vehicle.category.imageUrl || "/images/fleet-suv.png"}
                alt={`${vehicle.make} ${vehicle.model} showcase`}
                className="w-full h-full object-cover opacity-85"
              />
            </div>

            {/* Specifications Cards */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-50 border-b border-white/5 pb-2">Vehicle Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/60 p-4 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Local Package Base</span>
                  <span className="font-bold text-slate-200 text-sm">8 Hrs / 80 Kms</span>
                </div>
                <div className="bg-slate-900/60 p-4 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Extra Hour Surcharge</span>
                  <span className="font-bold text-slate-200 text-sm">₹{Number(vehicle.category.extraHrRate)} / Hr</span>
                </div>
                <div className="bg-slate-900/60 p-4 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Extra Distance Surcharge</span>
                  <span className="font-bold text-slate-200 text-sm">₹{Number(vehicle.category.extraKmRate)} / Km</span>
                </div>
              </div>
            </div>

            {/* Driver Details */}
            {vehicle.driver && (
              <div className="bg-white/5 border border-white/5 p-6 rounded-xl space-y-4">
                <h3 className="font-bold text-slate-100 text-md flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <span>Vetted Chauffeur Allocated</span>
                </h3>
                <div className="text-slate-300 text-xs leading-relaxed space-y-1">
                  <div>Name: <span className="text-slate-100 font-bold">{vehicle.driver.name}</span></div>
                  <div>Phone: <span className="text-slate-100 font-bold">Verified and Logged</span></div>
                  <p className="text-slate-400 mt-2">Every trip includes real-time GPS tracking and driver compliance logging.</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking / Inquiry Form */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6 sticky top-24 glassmorphism">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-50">Inquire Cab Booking</h3>
                <p className="text-xs text-slate-400">Request a corporate quote or hourly local pricing details.</p>
              </div>

              <form className="space-y-4" action={async (formData) => {
                "use server";
                console.log("Rental lead captured via server actions");
              }}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    name="customerName"
                    placeholder="John Doe"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    placeholder="john@example.com"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    placeholder="+919999999999"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      name="pickupLocation"
                      placeholder="e.g. Mumbai Airport"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-9 pr-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drop Location (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      name="dropLocation"
                      placeholder="e.g. Lonavala"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-9 pr-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    name="pickupDateTime"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-accent hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase shadow-lg transition-all"
                >
                  <span>Request Rental Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex gap-2.5 text-[10px] text-slate-400 items-start border-t border-white/5 pt-4">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                <span>Our dispatch operators will check availability and verify pricing details within 15 minutes of submission.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
