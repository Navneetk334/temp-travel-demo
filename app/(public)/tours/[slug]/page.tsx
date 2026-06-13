import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { JsonLd } from "@/components/shared/json-ld";
import { Compass, CheckCircle2, XCircle, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { Metadata } from "next";

import TourInquiryForm from "@/components/shared/tour-inquiry-form";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tour = await prisma.tourPackage.findUnique({
    where: { slug: resolvedParams.slug },
    select: { seoTitle: true, seoDescription: true, title: true },
  });

  if (!tour) return {};

  return {
    title: tour.seoTitle || `${tour.title} Tour Package`,
    description: tour.seoDescription || `Book premium tour packages starting with Temp Travel.`,
    alternates: {
      canonical: `/tours/${resolvedParams.slug}`,
    },
  };
}

export default async function TourDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const tour = await prisma.tourPackage.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      category: true,
    },
  });

  if (!tour) {
    notFound();
  }

  // Parse itinerary array
  const itinerary = Array.isArray(tour.itinerary)
    ? (tour.itinerary as Array<{ day: number; title: string; description: string }>)
    : [];

  // JSON-LD TravelAgency / Product Schema for SEO
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tour.title,
    "image": tour.images && tour.images[0] ? tour.images[0] : "",
    "description": tour.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": tour.basePrice.toString(),
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "TravelAgency",
        "name": "TEMP TRAVEL CAR RENTALS PVT LTD",
        "url": "https://temptravels.com"
      }
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <JsonLd data={productSchema} />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Breadcrumb */}
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex gap-2">
          <Link href="/tours" className="hover:text-accent">Tours</Link>
          <span>/</span>
          <span className="text-slate-300">{tour.category.name}</span>
        </div>

        {/* Title & Price Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-50 tracking-tight leading-tight">
              {tour.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="bg-white/5 py-1 px-3 rounded-full text-accent border border-white/10">{tour.category.name}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-accent" />
                <span>{tour.durationDays} Days / {tour.durationNights} Nights</span>
              </span>
            </div>
          </div>
          <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-right">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Base Package Price</div>
            <div className="text-3xl font-extrabold text-slate-50 mt-1">
              ₹{Number(tour.basePrice).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Starting price per passenger</div>
          </div>
        </div>

        {/* Gallery Grid */}
        {tour.images && tour.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[300px] md:h-[450px]">
            <div className="md:col-span-2 relative bg-slate-900 rounded-xl overflow-hidden border border-white/5">
              <img
                src={tour.images[0]}
                alt={`${tour.title} primary`}
                className="w-full h-full object-cover opacity-85"
              />
            </div>
            <div className="grid grid-rows-2 gap-6">
              {tour.images.slice(1, 3).map((img, idx) => (
                <div key={idx} className="relative bg-slate-900 rounded-xl overflow-hidden border border-white/5">
                  <img
                    src={img}
                    alt={`${tour.title} detail ${idx + 1}`}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layout split: Details vs Sidebar Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-50 border-b border-white/5 pb-2">Overview</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {tour.description}
              </p>
            </div>

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-50 border-b border-white/5 pb-2">Day-by-Day Itinerary</h2>
                <div className="space-y-6">
                  {itinerary.map((day) => (
                    <div key={day.day} className="flex gap-6 items-start">
                      <div className="bg-primary/10 border border-primary/20 w-12 h-12 rounded-lg flex items-center justify-center text-accent font-extrabold text-sm shrink-0">
                        D{day.day}
                      </div>
                      <div className="space-y-1 mt-1">
                        <h3 className="text-lg font-bold text-slate-100">{day.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inclusions */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2 border-b border-white/5 pb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>Inclusions</span>
                </h3>
                <ul className="space-y-2.5">
                  {tour.inclusions.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-slate-300 items-start">
                      <CheckCircle2 className="w-4.5 h-4.5 text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2 border-b border-white/5 pb-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span>Exclusions</span>
                </h3>
                <ul className="space-y-2.5">
                  {tour.exclusions.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-slate-300 items-start">
                      <XCircle className="w-4.5 h-4.5 text-destructive shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Sidebar Booking Form */}
          <div className="lg:col-span-4 scroll-mt-24">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6 sticky top-24 glassmorphism">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-50">Inquire Tour Booking</h3>
                <p className="text-xs text-slate-400">Fill in details and our tour coordinators will contact you.</p>
              </div>

              <TourInquiryForm tourId={tour.id} />

              <div className="flex gap-2.5 text-[10px] text-slate-400 items-start border-t border-white/5 pt-4">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                <span>By submitting, you agree to connect with our verified coordinators. No pre-payments required at this stage.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
