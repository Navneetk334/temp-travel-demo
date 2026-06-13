import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/api/",
        "/login",
        "/register",
        "/forgot-password",
      ],
    },
    sitemap: "https://temptravels.com/sitemap.xml",
  };
}
