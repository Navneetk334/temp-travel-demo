import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { CITIES_DATA } from "@/lib/cities-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://temptravels.com";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/services",
    "/services/corporate-transport",
    "/services/airport-transfers",
    "/services/local-rentals",
    "/services/outstation-cabs",
    "/tours",
    "/blog",
    "/book",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic city car rental routes
  const cityRoutes = Object.keys(CITIES_DATA).map((cityKey) => ({
    url: `${baseUrl}/car-rental/${cityKey}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Fetch all tour packages from DB
  let tourRoutes: MetadataRoute.Sitemap = [];
  try {
    const tours = await prisma.tourPackage.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    });
    tourRoutes = tours.map((tour) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: tour.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Sitemap: Failed to load tours", error);
  }

  // Fetch all blog posts from DB
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap: Failed to load blogs", error);
  }

  return [...staticRoutes, ...cityRoutes, ...tourRoutes, ...blogRoutes];
}

