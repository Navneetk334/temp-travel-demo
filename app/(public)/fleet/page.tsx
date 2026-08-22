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

const fallbackVehicles = [
  {
    id: "v-1",
    model: "Swift Dzire",
    make: "Maruti Suzuki",
    capacity: 4,
    category: { name: "Sedan", slug: "sedan" },
    registrationNumber: "MH 02 CZ 4421"
  },
  {
    id: "v-2",
    model: "City / Verna",
    make: "Honda",
    capacity: 4,
    category: { name: "Sedan", slug: "sedan" },
    registrationNumber: "MH 01 AB 1234"
  },
  {
    id: "v-3",
    model: "Innova Crysta",
    make: "Toyota",
    capacity: 7,
    category: { name: "SUV", slug: "suv" },
    registrationNumber: "MH 04 ER 8890"
  },
  {
    id: "v-4",
    model: "Fortuner 4x4",
    make: "Toyota",
    capacity: 7,
    category: { name: "SUV", slug: "suv" },
    registrationNumber: "MH 02 FG 9900"
  },
  {
    id: "v-5",
    model: "XUV700 AX7",
    make: "Mahindra",
    capacity: 7,
    category: { name: "SUV", slug: "suv" },
    registrationNumber: "MH 03 EY 7711"
  },
  {
    id: "v-6",
    model: "Creta / Alcazar",
    make: "Hyundai",
    capacity: 6,
    category: { name: "SUV", slug: "suv" },
    registrationNumber: "MH 02 DF 5544"
  },
  {
    id: "v-7",
    model: "E-Class Luxury",
    make: "Mercedes-Benz",
    capacity: 4,
    category: { name: "Sedan", slug: "sedan" },
    registrationNumber: "MH 01 CC 9000"
  },
  {
    id: "v-8",
    model: "5 Series Executive",
    make: "BMW",
    capacity: 4,
    category: { name: "Sedan", slug: "sedan" },
    registrationNumber: "MH 01 DD 8000"
  },
  {
    id: "v-9",
    model: "Traveller Executive 17S",
    make: "Force Motors",
    capacity: 17,
    category: { name: "SUV", slug: "suv" },
    registrationNumber: "MH 04 TT 1717"
  }
];

export default async function FleetPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category || "";

  // Query categories for header filters
  let categories: any[] = [];
  try {
    categories = await prisma.vehicleCategory.findMany({
      orderBy: { name: "asc" },
    });
  } catch (e) {
    console.error(e);
  }

  let categoryId = "";
  if (categorySlug && categories.length > 0) {
    const matched = categories.find((c) => c.slug === categorySlug);
    if (matched) categoryId = matched.id;
  }

  let dbVehicles: any[] = [];
  try {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    dbVehicles = await prisma.fleetVehicle.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error(e);
  }

  const vehicles = dbVehicles.length > 0 ? dbVehicles : fallbackVehicles;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-8 lg:px-12 xl:px-16">
      <div className="max-w-[1750px] mx-auto space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-50">
            Our Fleet Showcase
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Providing executive sedans, spacious SUVs, and luxury coaches for business commutes, airport runs, and outstation trips.
          </p>
        </div>

        {/* Fleet Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-slate-900/90 border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase">
                    {v.category?.name || v.categoryName || "Sedan"} &bull; {v.subCategory || v.vehicleClass || "Executive"}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    AVAILABLE
                  </span>
                </div>

                {/* Vehicle Image Banner */}
                <div className="relative h-44 bg-slate-950 rounded-2xl overflow-hidden border border-white/5">
                  <img
                    src={v.imageUrl || "/images/hero-car.png"}
                    alt={`${v.make} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute("src", "/images/hero-car.png");
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-50 group-hover:text-amber-400 transition-colors">
                    {v.make} {v.model}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mt-1">Reg #: {v.registrationNumber}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">Seating Capacity:</span>
                    <strong className="text-slate-100">{v.capacity || 4} Passengers</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">Fuel & Gearbox:</span>
                    <strong className="text-slate-100">{v.fuelType || "Diesel"} ({v.transmission || "Manual"})</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">Base Rate:</span>
                    <strong className="text-amber-400">₹{v.perKmRate || 15}/km &bull; ₹{v.baseDailyRate || 3000}/day</strong>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-6">
                <Link
                  href="/#booking-widget"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl text-center text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book This Vehicle</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
