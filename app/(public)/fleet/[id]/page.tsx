import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Users, ShieldCheck } from "lucide-react";
import VehicleInquiryForm from "@/components/shared/vehicle-inquiry-form";

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
    <div className="bg-slate-950 min-h-screen text-slate-100 pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
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
            {/* Image display - Render uploaded vehicle image first! */}
            <div className="relative h-[300px] md:h-[450px] bg-slate-900 rounded-xl overflow-hidden border border-white/5">
              <img
                src={vehicle.imageUrl || vehicle.category.imageUrl || "/images/fleet-suv.png"}
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
                  <span className="font-bold text-slate-200 text-sm">₹{Number((vehicle as any).extraHrRate ?? vehicle.category.extraHrRate)} / Hr</span>
                </div>
                <div className="bg-slate-900/60 p-4 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Extra Distance Surcharge</span>
                  <span className="font-bold text-slate-200 text-sm">₹{Number((vehicle as any).extraKmRate ?? vehicle.category.extraKmRate)} / Km</span>
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

          {/* Booking / Inquiry Form Client Component */}
          <div className="lg:col-span-4">
            <VehicleInquiryForm
              vehicleId={vehicle.id}
              vehicleName={`${vehicle.make} ${vehicle.model}`}
              categoryId={vehicle.categoryId}
              categoryName={vehicle.category.name}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
