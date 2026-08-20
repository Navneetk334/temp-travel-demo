export const revalidate = 60;

import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Car, Users, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function FleetPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category || "";

  // Query categories for header filters (Sedan and SUV only)
  const categories = await prisma.vehicleCategory.findMany({
    where: {
      slug: { in: ["sedan", "suv"] }
    },
    orderBy: { name: "asc" },
  });

  let categoryId = "";
  if (categorySlug) {
    const matched = categories.find((c) => c.slug === categorySlug);
    if (matched) categoryId = matched.id;
  }

  // Construct query filters (show only active vehicles in Sedan or SUV category)
  const where: any = { 
    status: "AVAILABLE",
    category: { slug: { in: ["sedan", "suv"] } }
  };
  if (categoryId) where.categoryId = categoryId;

  const vehicles = await prisma.fleetVehicle.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-8 lg:px-12 xl:px-16">
      <div className="max-w-[1750px] mx-auto space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-50">
            Our Fleet Showcase
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Providing executive sedans and spacious SUVs for business commutes, airport runs, and outstation trips.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-wrap gap-2 justify-center">
          <Link
            href="/fleet"
            className={`py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
              !categorySlug
                ? "bg-primary text-primary-foreground border-accent"
                : "bg-white/5 text-slate-300 border-white/10 hover:border-slate-400"
            }`}
          >
            All Fleet
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/fleet?category=${c.slug}`}
              className={`py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                categorySlug === c.slug
                  ? "bg-primary text-primary-foreground border-accent"
                  : "bg-white/5 text-slate-300 border-white/10 hover:border-slate-400"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Fleet Grid */}
        {vehicles.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-xl space-y-4">
            <Car className="w-12 h-12 text-slate-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-300">No Vehicles Available</h2>
            <p className="text-slate-500 text-sm">All vehicles in this category are currently booked or undergoing maintenance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden shadow-lg hover:border-primary/45 transition-all group flex flex-col justify-between"
              >
                {/* Fallback Image */}
                <div className="relative h-64 bg-slate-950 flex items-center justify-center">
                  <img
                    src={v.imageUrl || v.category.imageUrl || "/images/fleet-suv.png"}
                    alt={v.model}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-[1.03] transition-all duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 border border-white/10 py-1 px-3 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                    {v.category.name}
                  </div>
                </div>

                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  {/* Vehicle Name Centered */}
                  <h2 className="text-xl font-bold text-slate-50 group-hover:text-accent transition-colors text-center leading-snug">
                    {v.make} {v.model}
                  </h2>
                  
                  {/* 2-Column Split: Left (Capacity & Availability) | Right (Rates) */}
                  <div className="grid grid-cols-2 gap-3 items-center pt-2 border-t border-white/5">
                    {/* Left Side: Seating capacity and Availability */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                        <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>{v.capacity} Seater capacity</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-extrabold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Available</span>
                      </div>
                    </div>

                    {/* Right Side: Local rate and Outstation rate */}
                    <div className="space-y-1 text-right text-xs font-medium text-slate-400">
                      <div>Local rate: <span className="text-slate-200 font-bold">₹{Number(v.category.baseKmsRate)}/km</span></div>
                      <div>Outstation: <span className="text-slate-200 font-bold">₹{Number(v.category.outstationKmRate)}/km</span></div>
                    </div>
                  </div>

                  {/* Bottom Center: Inquire Now Button */}
                  <div className="pt-4 border-t border-white/5 flex justify-center mt-auto">
                    <Link
                      href={`/fleet/${v.id}`}
                      className="bg-accent/10 hover:bg-accent text-accent hover:text-slate-950 border border-accent/30 font-bold py-2 px-6 rounded-lg text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-md group-hover:bg-accent group-hover:text-slate-950"
                    >
                      <span>Inquire Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
