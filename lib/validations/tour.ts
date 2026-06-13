import { z } from "zod";

// Validates Package Categories
export const packageCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Invalid slug format (lowercase, numbers, hyphens only)"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

// Validates individual itinerary days
export const itineraryDaySchema = z.object({
  day: z.number().int().min(1, "Day must be 1 or greater"),
  title: z.string().min(3, "Itinerary title must be at least 3 characters"),
  description: z.string().min(5, "Itinerary description must be at least 5 characters"),
});

// Validates Tour Packages
export const tourPackageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Invalid slug format (lowercase, numbers, hyphens only)"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  itinerary: z.array(itineraryDaySchema).min(1, "At least one day of itinerary is required"),
  durationDays: z.number().int().min(1, "Duration days must be at least 1"),
  durationNights: z.number().int().min(0, "Duration nights must be 0 or greater"),
  basePrice: z.number().positive("Base price must be greater than 0"),
  inclusions: z.array(z.string().min(2, "Inclusion item must be at least 2 characters")),
  exclusions: z.array(z.string().min(2, "Exclusion item must be at least 2 characters")),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image URL is required"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  categoryId: z.string().uuid("Invalid category ID"),
  seoTitle: z.string().max(60, "SEO Title must be under 60 characters").optional().nullable(),
  seoDescription: z.string().max(160, "SEO Description must be under 160 characters").optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
});

// Validates Tour Booking Inquiry submissions
export const tourInquirySchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  travelDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  numPassengers: z.number().int().positive("Must specify at least 1 passenger"),
  additionalDetails: z.string().optional(),
  tourPackageId: z.string().uuid("Invalid tour package ID"),
});
