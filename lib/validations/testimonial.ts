import { z } from "zod";

export const testimonialSchema = z.object({
  authorName: z.string().min(2, "Author name must be at least 2 characters"),
  authorRole: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  content: z.string().min(5, "Testimonial content must be at least 5 characters"),
  rating: z.number().int().min(1).max(5).default(5),
  avatarUrl: z.string().url("Invalid avatar image URL").optional().nullable().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  status: z.enum(["APPROVED", "PENDING", "REJECTED"]).default("APPROVED"),
});
