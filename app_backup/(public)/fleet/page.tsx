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

  // Query categories for header filters
  const categories = await prisma.vehicleCategory.findMany({
    orderBy: { name: "asc" },
  });

  let categoryId = "";
  if (categorySlug) {
    const matched = categories.find((c) => c.slug === categorySlug);
    if (matched) categoryId = matched.id;
  }

  // Construct query filters (show only active vehicles)
  const where: any = { status: "AVAILABLE" };
  if (categoryId) where.categoryId = categoryId;

  const vehicles = await prisma.fleetVehicle.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-50">
            Our Fleet Showcase
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Providing vetted hatchbacks, comfortable sedans, premium SUVs, luxury vehicles, and spacious tempo travellers.
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
                <div className="relative h-48 bg-slate-950 flex items-center justify-center">
                  <img
                    src={v.category.imageUrl || "/images/fleet-suv.png"}
                    alt={v.model}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-[1.02] transition-all"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 border border-white/10 py-1 px-3 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                    {v.category.name}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-accent" />
                        <span>{v.capacity} Seater capacity</span>
                      </div>
                      <span className="text-[10px] bg-white/5 py-1 px-2 border border-white/5 text-slate-300">
                        {v.registrationNumber}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-50 group-hover:text-accent transition-colors leading-snug">
                      {v.make} {v.model}
                    </h2>
                    
                    {/* Rates */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-400 pt-2">
                      <div>Local rate: <span className="text-slate-200 font-bold">₹{Number(v.category.baseKmsRate)}/km</span></div>
                      <div>Outstation: <span className="text-slate-200 font-bold">₹{Number(v.category.outstationKmRate)}/km</span></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Available</span>
                    </span>
                    <Link
                      href={`/fleet/${v.id}`}
                      className="text-primary hover:text-blue-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1 group-hover:gap-1.5 transition-all"
                    >
                      <span>Inquire Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
