import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Compass, Calendar, ArrowRight, Search } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function ToursPage({ searchParams }: PageProps) {
  // Resolve search parameters in Next.js 15
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const categorySlug = resolvedParams.category || "";

  // Query categories for filter list
  const categories = await prisma.packageCategory.findMany({
    orderBy: { name: "asc" },
  });

  // Find target category ID if slug specified
  let categoryId = "";
  if (categorySlug) {
    const matchedCategory = categories.find((c) => c.slug === categorySlug);
    if (matchedCategory) {
      categoryId = matchedCategory.id;
    }
  }

  // Construct query where clauses
  const where: any = { status: "ACTIVE" };
  
  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Query tour packages
  const tours = await prisma.tourPackage.findMany({
    where,
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-50">
            Explore Tour Packages
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Handcrafted travel itineraries and customized transport options for families, couples, and corporate groups.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="glassmorphism p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
          {/* Category Badges */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <Link
              href="/tours"
              className={`py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                !categorySlug
                  ? "bg-primary text-primary-foreground border-accent"
                  : "bg-white/5 text-slate-300 border-white/10 hover:border-slate-400"
              }`}
            >
              All Packages
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/tours?category=${c.slug}${search ? `&search=${search}` : ""}`}
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

          {/* Keyword Search Form */}
          <form method="GET" action="/tours" className="relative w-full md:w-80">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              placeholder="Search tours..."
              defaultValue={search}
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary transition-all"
            />
          </form>
        </div>

        {/* Packages Grid */}
        {tours.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-xl space-y-4">
            <Compass className="w-12 h-12 text-slate-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-300">No Packages Found</h2>
            <p className="text-slate-500 text-sm">Try modifying your search keywords or categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden shadow-lg hover:border-primary/45 transition-all group flex flex-col justify-between"
              >
                {/* Visual Cover image fallback to index 0 */}
                <div className="relative h-48 bg-slate-950">
                  {tour.images && tour.images[0] ? (
                    <img
                      src={tour.images[0]}
                      alt={tour.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Compass className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-slate-950/80 border border-white/10 py-1 px-3 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                    {tour.category.name}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        <span>{tour.durationDays} Days / {tour.durationNights} Nights</span>
                      </div>
                      <span className="text-sm font-extrabold text-slate-100">
                        ₹{Number(tour.basePrice).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-50 group-hover:text-accent transition-colors leading-snug">
                      {tour.title}
                    </h2>
                    <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                      {tour.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GST extra</span>
                    <Link
                      href={`/tours/${tour.slug}`}
                      className="text-primary hover:text-blue-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1 group-hover:gap-1.5 transition-all"
                    >
                      <span>Details</span>
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
